import { describe, expect, it } from "vitest";
import { simulate } from "../src/simulator";
import { referenceModel } from "../src/reference";
import type { Bit } from "../src/signals";

// Full input space is 2^4 × 2^4 × 2^4 × 2 × 2 = 16 384 combinations.
// Exhaustive test is both the exhaustive check and a superset of any fuzz.

describe("exhaustive gate-level ↔ reference agreement", () => {
  it("matches the datasheet oracle on all 16384 inputs", () => {
    const mismatches: string[] = [];
    let checked = 0;
    for (let a = 0; a < 16; a++) {
      for (let b = 0; b < 16; b++) {
        for (let s = 0; s < 16; s++) {
          for (const m of [0, 1] as Bit[]) {
            for (const cn of [0, 1] as Bit[]) {
              const sim = simulate({ a, b, s, m, cn });
              const ref = referenceModel({ a, b, s, m, cn });
              checked++;
              if (
                sim.f !== ref.f ||
                sim.cout !== ref.cout ||
                sim.pOut !== ref.pOut ||
                sim.gOut !== ref.gOut ||
                sim.aeqb !== ref.aeqb
              ) {
                mismatches.push(
                  `a=${a} b=${b} s=${s.toString(2).padStart(4, "0")} m=${m} cn=${cn}: ` +
                    `sim(f=${sim.f} cout=${sim.cout} p=${sim.pOut} g=${sim.gOut} aeqb=${sim.aeqb}) ` +
                    `ref(f=${ref.f} cout=${ref.cout} p=${ref.pOut} g=${ref.gOut} aeqb=${ref.aeqb})`,
                );
              }
            }
          }
        }
      }
    }
    expect(checked).toBe(16384);
    expect(mismatches.slice(0, 5)).toEqual([]);
    expect(mismatches.length).toBe(0);
  });
});

describe("seeded fuzz", () => {
  // Cheap mulberry32 — deterministic.
  function makeRng(seed: number) {
    let t = seed >>> 0;
    return () => {
      t = (t + 0x6d2b79f5) >>> 0;
      let r = t;
      r = Math.imul(r ^ (r >>> 15), r | 1);
      r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
  it("1000 seeded random inputs agree", () => {
    const rng = makeRng(0xdeadbeef);
    for (let i = 0; i < 1000; i++) {
      const a = Math.floor(rng() * 16);
      const b = Math.floor(rng() * 16);
      const s = Math.floor(rng() * 16);
      const m = Math.floor(rng() * 2) as Bit;
      const cn = Math.floor(rng() * 2) as Bit;
      const sim = simulate({ a, b, s, m, cn });
      const ref = referenceModel({ a, b, s, m, cn });
      expect({ f: sim.f, cout: sim.cout, p: sim.pOut, g: sim.gOut, aeqb: sim.aeqb }).toEqual({
        f: ref.f,
        cout: ref.cout,
        p: ref.pOut,
        g: ref.gOut,
        aeqb: ref.aeqb,
      });
    }
  });
});
