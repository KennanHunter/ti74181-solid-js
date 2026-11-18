import { describe, expect, it } from "vitest";
import { simulate } from "../src/simulator";
import type { Bit } from "../src/signals";

// These tests exercise individual gate primitives by driving the simulator
// with configurations that expose a single primitive's behaviour.

describe("gate primitives via simulator", () => {
  // S = 1011, M = 1 → F = A AND B (per datasheet)
  it("logic AND (S=1011, M=1)", () => {
    const cases: [number, number, number][] = [
      [0b0000, 0b0000, 0b0000],
      [0b1111, 0b0000, 0b0000],
      [0b1010, 0b0101, 0b0000],
      [0b1100, 0b1010, 0b1000],
      [0b1111, 0b1111, 0b1111],
    ];
    for (const [a, b, want] of cases) {
      const r = simulate({ a, b, s: 0b1011, m: 1, cn: 1 });
      expect(r.f).toBe(want);
    }
  });

  // S = 1110, M = 1 → F = A OR B
  it("logic OR (S=1110, M=1)", () => {
    const r = simulate({ a: 0b1010, b: 0b0101, s: 0b1110, m: 1, cn: 1 });
    expect(r.f).toBe(0b1111);
  });

  // S = 0110, M = 1 → F = A XOR B
  it("logic XOR (S=0110, M=1)", () => {
    const r = simulate({ a: 0b1100, b: 0b1010, s: 0b0110, m: 1, cn: 1 });
    expect(r.f).toBe(0b0110);
  });

  // S = 0100, M = 1 → F = NAND
  it("logic NAND (S=0100, M=1)", () => {
    const r = simulate({ a: 0b1111, b: 0b1111, s: 0b0100, m: 1, cn: 1 });
    expect(r.f).toBe(0b0000);
    const r2 = simulate({ a: 0b1010, b: 0b0101, s: 0b0100, m: 1, cn: 1 });
    expect(r2.f).toBe(0b1111);
  });

  it("full-adder behaviour via S=1001 M=0 arithmetic", () => {
    // Cn=1 means no carry in. Verify a few sums with and without carry in.
    const addNoCarry = (a: number, b: number) => simulate({ a, b, s: 0b1001, m: 0, cn: 1 });
    const addCarry   = (a: number, b: number) => simulate({ a, b, s: 0b1001, m: 0, cn: 0 });
    expect(addNoCarry(5, 3).f).toBe(8);
    expect(addNoCarry(15, 1).f).toBe(0);
    expect(addNoCarry(15, 1).cout).toBe(1);
    expect(addCarry(0, 0).f).toBe(1);
    expect(addCarry(7, 8).f).toBe(0);
    expect(addCarry(7, 8).cout).toBe(1);
  });
});
