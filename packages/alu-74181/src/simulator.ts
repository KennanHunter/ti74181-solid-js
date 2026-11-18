// Gate-level simulator of the real TI 74181 ALU (active-high operands).
// Uses the datasheet-level propagate/generate formulation. See:
//   P_i = A_i OR (S0·B_i) OR (S1·!B_i)
//   G_i = A_i · ((S3·B_i) OR (S2·!B_i))
// F_i = (P_i XOR G_i) XOR (C_i OR M)   // M forces carry-in high so logic mode collapses to NOT(P XOR G)
// Carry chain: C_{i+1} = G_i OR (P_i AND C_i),  C_0 = NOT(Cn).

import type { Bit, SignalMap } from "./signals";

export interface Inputs {
  a: number; // 0..15
  b: number; // 0..15
  s: number; // 0..15
  m: Bit;    // 0 = arithmetic, 1 = logic
  cn: Bit;   // datasheet convention: 1 = no carry in, 0 = carry in
}

export interface Outputs {
  f: number;       // 0..15
  cout: Bit;       // active-high carry out (1 = carry)
  pOut: Bit;       // group propagate (active-high)
  gOut: Bit;       // group generate  (active-high)
  aeqb: Bit;       // 1 when F == 1111
  signals: SignalMap;
}

const AND = (a: Bit, b: Bit): Bit => ((a & b) as Bit);
const OR  = (a: Bit, b: Bit): Bit => ((a | b) as Bit);
const XOR = (a: Bit, b: Bit): Bit => ((a ^ b) as Bit);
const NOT = (a: Bit): Bit => ((1 - a) as Bit);

const bit = (v: number, i: number): Bit => (((v >> i) & 1) as Bit);

export function simulate(inputs: Inputs): Outputs {
  const { a, b, s, m, cn } = inputs;

  const sig = {} as SignalMap;

  // Fan out primary inputs
  const A: Bit[] = [bit(a, 0), bit(a, 1), bit(a, 2), bit(a, 3)];
  const B: Bit[] = [bit(b, 0), bit(b, 1), bit(b, 2), bit(b, 3)];
  const S: Bit[] = [bit(s, 0), bit(s, 1), bit(s, 2), bit(s, 3)];
  sig.a0 = A[0]; sig.a1 = A[1]; sig.a2 = A[2]; sig.a3 = A[3];
  sig.b0 = B[0]; sig.b1 = B[1]; sig.b2 = B[2]; sig.b3 = B[3];
  sig.s0 = S[0]; sig.s1 = S[1]; sig.s2 = S[2]; sig.s3 = S[3];
  sig.m = m;
  sig.cn = cn;

  // NOT B_i, NOT A_i (useful internal signals)
  const nA: Bit[] = A.map(NOT) as Bit[];
  const nB: Bit[] = B.map(NOT) as Bit[];
  sig.na0 = nA[0]; sig.na1 = nA[1]; sig.na2 = nA[2]; sig.na3 = nA[3];
  sig.nb0 = nB[0]; sig.nb1 = nB[1]; sig.nb2 = nB[2]; sig.nb3 = nB[3];

  // Per-bit propagate / generate
  const P: Bit[] = [0, 0, 0, 0] as Bit[];
  const G: Bit[] = [0, 0, 0, 0] as Bit[];
  for (let i = 0; i < 4; i++) {
    // P_i = A_i + S0·B_i + S1·!B_i
    const s0b = AND(S[0], B[i]);
    const s1nb = AND(S[1], nB[i]);
    P[i] = OR(A[i], OR(s0b, s1nb));
    // G_i = A_i · (S3·B_i + S2·!B_i)
    const s3b = AND(S[3], B[i]);
    const s2nb = AND(S[2], nB[i]);
    G[i] = AND(A[i], OR(s3b, s2nb));
  }
  sig.p0 = P[0]; sig.p1 = P[1]; sig.p2 = P[2]; sig.p3 = P[3];
  sig.g0 = G[0]; sig.g1 = G[1]; sig.g2 = G[2]; sig.g3 = G[3];

  // Carry chain (ripple formulation is logically equivalent to the
  // chip's lookahead carry; we expose both the ripple nets and the
  // CLA group signals).
  const nCn: Bit = NOT(cn);
  sig.ncn = nCn;
  const C: Bit[] = [0, 0, 0, 0, 0] as Bit[];
  C[0] = nCn;
  for (let i = 0; i < 4; i++) {
    C[i + 1] = OR(G[i], AND(P[i], C[i]));
  }
  sig.c0 = C[0]; sig.c1 = C[1]; sig.c2 = C[2]; sig.c3 = C[3]; sig.c4 = C[4];

  // Group P and G (CLA)
  sig.pGroup = AND(AND(P[0], P[1]), AND(P[2], P[3]));
  // Group G = G3 + P3·G2 + P3·P2·G1 + P3·P2·P1·G0
  sig.gGroup = OR(
    G[3],
    OR(
      AND(P[3], G[2]),
      OR(
        AND(AND(P[3], P[2]), G[1]),
        AND(AND(AND(P[3], P[2]), P[1]), G[0]),
      ),
    ),
  );

  // F_i = (P_i XOR G_i) XOR (C_i OR M)
  const F: Bit[] = [0, 0, 0, 0] as Bit[];
  for (let i = 0; i < 4; i++) {
    const pxg = XOR(P[i], G[i]);
    (sig as any)[`pxg${i}`] = pxg;
    F[i] = XOR(pxg, OR(C[i], m));
  }
  sig.f0 = F[0]; sig.f1 = F[1]; sig.f2 = F[2]; sig.f3 = F[3];

  // Chip outputs
  const f = F[0] | (F[1] << 1) | (F[2] << 2) | (F[3] << 3);
  const cout: Bit = m === 1 ? 0 : C[4]; // carries disabled in logic mode
  const aeqb: Bit = AND(AND(F[0], F[1]), AND(F[2], F[3]));
  const pOut: Bit = sig.pGroup;
  const gOut: Bit = sig.gGroup;

  sig.cout = cout;
  sig.pOut = pOut;
  sig.gOut = gOut;
  sig.aeqb = aeqb;

  return { f, cout, pOut, gOut, aeqb, signals: sig };
}
