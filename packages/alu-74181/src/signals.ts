// Canonical signal names for the 74181 ALU gate-level simulator.
// All values are Bit (0 | 1). Internal carries use the "active-high" convention
// (c = 1 means there is a carry). The external Cn / Cout pins follow the
// datasheet "complement" convention: Cn = 1 means NO carry in, Cout = 1 means
// NO carry out (both active low). The simulator translates between them.

export type Bit = 0 | 1;

export const BIT_SIGNALS = ["0", "1", "2", "3"] as const;
export type BitIndex = (typeof BIT_SIGNALS)[number];

const perBit = <T extends string>(prefix: T): `${T}${BitIndex}`[] =>
  BIT_SIGNALS.map((i) => `${prefix}${i}` as `${T}${BitIndex}`);

// Primary inputs
export const INPUT_SIGNALS = [
  ...perBit("a"),
  ...perBit("b"),
  ...perBit("s"),
  "m",
  "cn",
] as const;

// Primary outputs (pins)
export const OUTPUT_SIGNALS = [
  ...perBit("f"),
  "cout",
  "pOut",
  "gOut",
  "aeqb",
] as const;

// Internal nets
export const INTERNAL_SIGNALS = [
  ...perBit("nb"),      // NOT B_i
  ...perBit("na"),      // NOT A_i
  ...perBit("p"),       // bit propagate
  ...perBit("g"),       // bit generate
  "c0", "c1", "c2", "c3", "c4", // internal carry chain (active-high)
  ...perBit("pxg"),     // P_i XOR G_i
  "pGroup",             // group P = P0·P1·P2·P3
  "gGroup",             // group G (CLA formula)
  "ncn",                // NOT Cn (internal active-high c0)
] as const;

export const ALL_SIGNALS = [
  ...INPUT_SIGNALS,
  ...OUTPUT_SIGNALS,
  ...INTERNAL_SIGNALS,
] as const;

export type SignalName = (typeof ALL_SIGNALS)[number];
export type SignalMap = Record<SignalName, Bit>;
