import { describe, expect, it } from "vitest";
import { simulate } from "../src/simulator";

// Hand-computed cases from the 74181 datasheet function tables.
describe("simulator datasheet spot-checks", () => {
  // Arithmetic, no carry in (Cn=H=1)
  it("A plus B (S=1001, Cn=1)", () => {
    const r = simulate({ a: 5, b: 3, s: 0b1001, m: 0, cn: 1 });
    expect(r.f).toBe(8);
    expect(r.cout).toBe(0);
  });

  it("A plus B + 1 (S=1001, Cn=0)", () => {
    const r = simulate({ a: 5, b: 3, s: 0b1001, m: 0, cn: 0 });
    expect(r.f).toBe(9);
    expect(r.cout).toBe(0);
  });

  it("A minus B (S=0110, Cn=0)", () => {
    const r = simulate({ a: 10, b: 3, s: 0b0110, m: 0, cn: 0 });
    expect(r.f).toBe(7);
    expect(r.cout).toBe(1); // no borrow
  });

  it("A minus B minus 1 (S=0110, Cn=1)", () => {
    const r = simulate({ a: 10, b: 3, s: 0b0110, m: 0, cn: 1 });
    expect(r.f).toBe(6);
  });

  it("A = B flag when F = 1111 (subtract with A==B, Cn=1)", () => {
    const r = simulate({ a: 7, b: 7, s: 0b0110, m: 0, cn: 1 });
    expect(r.f).toBe(0b1111);
    expect(r.aeqb).toBe(1);
  });

  it("A minus 1 (S=1111, Cn=1)", () => {
    const r = simulate({ a: 5, b: 0, s: 0b1111, m: 0, cn: 1 });
    expect(r.f).toBe(4);
  });

  it("A (S=1111 logic, M=1)", () => {
    const r = simulate({ a: 0b1010, b: 0, s: 0b1111, m: 1, cn: 1 });
    expect(r.f).toBe(0b1010);
  });

  it("all-ones (S=1100 logic)", () => {
    const r = simulate({ a: 0, b: 0, s: 0b1100, m: 1, cn: 1 });
    expect(r.f).toBe(0b1111);
  });

  it("zero (S=0011 logic)", () => {
    const r = simulate({ a: 0b1111, b: 0b1111, s: 0b0011, m: 1, cn: 1 });
    expect(r.f).toBe(0);
  });

  it("A shift left (double) via S=1100 arithmetic", () => {
    // S=1100 M=0 Cn=1 → F = A + A
    const r = simulate({ a: 5, b: 0, s: 0b1100, m: 0, cn: 1 });
    expect(r.f).toBe(10);
  });
});
