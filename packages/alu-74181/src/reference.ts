// Behavioural reference model for the 74181 (active-high operands).
// This is the "oracle" used in the exhaustive test — a direct implementation
// of the datasheet function table, independent of the gate-level simulator.

import type { Bit } from "./signals";
import type { Inputs, Outputs } from "./simulator";
import type { SignalMap } from "./signals";

const b4 = (n: number): number => n & 0xf;

// Per-bit logic-mode function (datasheet M=H column).
function logicBit(s: number, a: Bit, b: Bit): Bit {
  switch (s) {
    case 0x0: return (1 - a) as Bit;                                // ~A
    case 0x1: return (1 - (a | b)) as Bit;                          // NOR
    case 0x2: return (((1 - a) & b) & 1) as Bit;                    // ~A & B
    case 0x3: return 0;
    case 0x4: return (1 - (a & b)) as Bit;                          // NAND
    case 0x5: return (1 - b) as Bit;                                // ~B
    case 0x6: return (a ^ b) as Bit;                                // XOR
    case 0x7: return ((a & (1 - b)) & 1) as Bit;                    // A & ~B
    case 0x8: return (((1 - a) | b) & 1) as Bit;                    // ~A | B
    case 0x9: return (1 - (a ^ b)) as Bit;                          // XNOR
    case 0xa: return b;
    case 0xb: return (a & b) as Bit;
    case 0xc: return 1;
    case 0xd: return ((a | (1 - b)) & 1) as Bit;                    // A | ~B
    case 0xe: return (a | b) as Bit;
    case 0xf: return a;
  }
  throw new Error(`invalid s=${s}`);
}

// Arithmetic-mode base value (before adding effective carry-in).
// Expresses each datasheet operation as an unsigned sum ≥ 0.
function arithBase(s: number, a: number, b: number): number {
  const nb = b4(~b);
  switch (s) {
    case 0x0: return a;
    case 0x1: return a | b;
    case 0x2: return a | nb;
    case 0x3: return 0xf;                 // minus 1
    case 0x4: return a + (a & nb);
    case 0x5: return (a | b) + (a & nb);
    case 0x6: return a + nb;              // A minus B minus 1
    case 0x7: return (a & nb) + 0xf;      // (A & ~B) minus 1
    case 0x8: return a + (a & b);
    case 0x9: return a + b;
    case 0xa: return (a | nb) + (a & b);
    case 0xb: return (a & b) + 0xf;       // (A & B) minus 1
    case 0xc: return a + a;
    case 0xd: return (a | b) + a;
    case 0xe: return (a | nb) + a;
    case 0xf: return a + 0xf;             // A minus 1
  }
  throw new Error(`invalid s=${s}`);
}

// Oracle: computes the datasheet-correct outputs with no internal signals.
export function referenceModel(inputs: Inputs): Omit<Outputs, "signals"> & { signals?: SignalMap } {
  const a = b4(inputs.a);
  const b = b4(inputs.b);
  const s = b4(inputs.s);
  const m = inputs.m;
  const cn = inputs.cn;
  const ncn = (1 - cn) as Bit; // datasheet: Cn=H means no carry in (ncn = 0)

  let f = 0;
  let cout: Bit = 0;

  if (m === 1) {
    // Logic mode: per-bit function, no carry.
    const A: Bit[] = [((a >> 0) & 1) as Bit, ((a >> 1) & 1) as Bit, ((a >> 2) & 1) as Bit, ((a >> 3) & 1) as Bit];
    const B: Bit[] = [((b >> 0) & 1) as Bit, ((b >> 1) & 1) as Bit, ((b >> 2) & 1) as Bit, ((b >> 3) & 1) as Bit];
    f = 0;
    for (let i = 0; i < 4; i++) f |= logicBit(s, A[i], B[i]) << i;
    cout = 0;
  } else {
    // Arithmetic mode: unsigned-sum formula + effective carry in.
    const base = arithBase(s, a, b);
    const sum = base + ncn;
    f = sum & 0xf;
    cout = ((sum >> 4) & 1) as Bit;
  }

  // Group P and G depend only on A, B, S (not on M or Cn).
  // P_i = A_i + S0·B_i + S1·!B_i;  G_i = A_i · (S3·B_i + S2·!B_i)
  const S: Bit[] = [((s >> 0) & 1) as Bit, ((s >> 1) & 1) as Bit, ((s >> 2) & 1) as Bit, ((s >> 3) & 1) as Bit];
  const nb = b4(~b);
  const Pbits: Bit[] = [];
  const Gbits: Bit[] = [];
  for (let i = 0; i < 4; i++) {
    const Ai = ((a >> i) & 1) as Bit;
    const Bi = ((b >> i) & 1) as Bit;
    const nBi = ((nb >> i) & 1) as Bit;
    Pbits.push(((Ai | (S[0] & Bi) | (S[1] & nBi)) & 1) as Bit);
    Gbits.push(((Ai & ((S[3] & Bi) | (S[2] & nBi))) & 1) as Bit);
  }
  const pOut: Bit = ((Pbits[0] & Pbits[1] & Pbits[2] & Pbits[3]) & 1) as Bit;
  const gOut: Bit = ((
    Gbits[3] |
    (Pbits[3] & Gbits[2]) |
    (Pbits[3] & Pbits[2] & Gbits[1]) |
    (Pbits[3] & Pbits[2] & Pbits[1] & Gbits[0])
  ) & 1) as Bit;

  const aeqb: Bit = f === 0xf ? 1 : 0;

  return { f, cout, pOut, gOut, aeqb };
}
