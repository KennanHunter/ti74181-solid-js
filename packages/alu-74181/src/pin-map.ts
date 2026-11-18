// Mapping from Wikimedia schematic text-label IDs → our canonical signal names.
// Derived by reading the <text> elements in schematic.svg (layer4) and matching
// their tspan content to the 74181 pin names.
import type { SignalName } from "./signals";

export interface PinMeta {
  signal: SignalName;
  // Whether this pin is a user-settable input (gets a click handler) or an output.
  kind: "input" | "output";
  // Human label (what the schematic prints — kept so the overlay can echo it).
  label: string;
}

// Keyed by the <text> element's id attribute in the Wikimedia SVG.
export const PIN_MAP: Record<string, PinMeta> = {
  text96614: { signal: "cn",   kind: "input",  label: "Cn" },
  text96620: { signal: "m",    kind: "input",  label: "M" },
  text96624: { signal: "a0",   kind: "input",  label: "A0" },
  text96636: { signal: "b0",   kind: "input",  label: "B0" },
  text96642: { signal: "a1",   kind: "input",  label: "A1" },
  text96648: { signal: "b1",   kind: "input",  label: "B1" },
  text96654: { signal: "a2",   kind: "input",  label: "A2" },
  text96660: { signal: "b2",   kind: "input",  label: "B2" },
  text96666: { signal: "a3",   kind: "input",  label: "A3" },
  text96672: { signal: "b3",   kind: "input",  label: "B3" },
  text96678: { signal: "s0",   kind: "input",  label: "S0" },
  text96684: { signal: "s1",   kind: "input",  label: "S1" },
  text96690: { signal: "s2",   kind: "input",  label: "S2" },
  text96696: { signal: "s3",   kind: "input",  label: "S3" },
  text96702: { signal: "f0",   kind: "output", label: "F0" },
  text96708: { signal: "f1",   kind: "output", label: "F1" },
  text96714: { signal: "aeqb", kind: "output", label: "A=B" },
  text96718: { signal: "f2",   kind: "output", label: "F2" },
  text96724: { signal: "f3",   kind: "output", label: "F3" },
  text96730: { signal: "pOut", kind: "output", label: "P" },
  text96734: { signal: "cout", kind: "output", label: "Cn+4" },
  text96740: { signal: "gOut", kind: "output", label: "G" },
};

// Datasheet function names for the selector readout.
// M = 1 (logic) and M = 0 arithmetic with Cn high and Cn low.
export interface FunctionInfo { logic: string; arithNoCarry: string; arithCarry: string; }

export const FUNCTIONS: Record<number, FunctionInfo> = {
  0x0: { logic: "~A",           arithNoCarry: "A",                   arithCarry: "A + 1" },
  0x1: { logic: "~(A | B)",     arithNoCarry: "A | B",               arithCarry: "(A | B) + 1" },
  0x2: { logic: "~A & B",       arithNoCarry: "A | ~B",              arithCarry: "(A | ~B) + 1" },
  0x3: { logic: "0",            arithNoCarry: "-1",                  arithCarry: "0" },
  0x4: { logic: "~(A & B)",     arithNoCarry: "A + (A & ~B)",        arithCarry: "A + (A & ~B) + 1" },
  0x5: { logic: "~B",           arithNoCarry: "(A | B) + (A & ~B)",  arithCarry: "(A | B) + (A & ~B) + 1" },
  0x6: { logic: "A ^ B",        arithNoCarry: "A - B - 1",           arithCarry: "A - B" },
  0x7: { logic: "A & ~B",       arithNoCarry: "(A & ~B) - 1",        arithCarry: "A & ~B" },
  0x8: { logic: "~A | B",       arithNoCarry: "A + (A & B)",         arithCarry: "A + (A & B) + 1" },
  0x9: { logic: "~(A ^ B)",     arithNoCarry: "A + B",               arithCarry: "A + B + 1" },
  0xa: { logic: "B",            arithNoCarry: "(A | ~B) + (A & B)",  arithCarry: "(A | ~B) + (A & B) + 1" },
  0xb: { logic: "A & B",        arithNoCarry: "(A & B) - 1",         arithCarry: "A & B" },
  0xc: { logic: "1",            arithNoCarry: "A + A",               arithCarry: "A + A + 1" },
  0xd: { logic: "A | ~B",       arithNoCarry: "(A | B) + A",         arithCarry: "(A | B) + A + 1" },
  0xe: { logic: "A | B",        arithNoCarry: "(A | ~B) + A",        arithCarry: "(A | ~B) + A + 1" },
  0xf: { logic: "A",            arithNoCarry: "A - 1",               arithCarry: "A" },
};

export function functionLabel(s: number, m: 0 | 1, cn: 0 | 1): string {
  const f = FUNCTIONS[s & 0xf];
  if (m === 1) return f.logic;
  return cn === 1 ? f.arithNoCarry : f.arithCarry;
}
