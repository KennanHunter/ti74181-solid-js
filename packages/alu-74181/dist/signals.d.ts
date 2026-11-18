export type Bit = 0 | 1;
export declare const BIT_SIGNALS: readonly ["0", "1", "2", "3"];
export type BitIndex = (typeof BIT_SIGNALS)[number];
export declare const INPUT_SIGNALS: readonly [...("a0" | "a1" | "a2" | "a3" | "b0" | "b1" | "b2" | "b3" | "s0" | "s1" | "s2" | "s3")[], "m", "cn"];
export declare const OUTPUT_SIGNALS: readonly [...("f0" | "f1" | "f2" | "f3")[], "cout", "pOut", "gOut", "aeqb"];
export declare const INTERNAL_SIGNALS: readonly [...("nb0" | "nb1" | "nb2" | "nb3" | "na0" | "na1" | "na2" | "na3" | "p0" | "p1" | "p2" | "p3" | "g0" | "g1" | "g2" | "g3" | "c0" | "c1" | "c2" | "c3" | "c4" | "pxg0" | "pxg1" | "pxg2" | "pxg3")[], "pGroup", "gGroup", "ncn"];
export declare const ALL_SIGNALS: readonly [...("a0" | "a1" | "a2" | "a3" | "b0" | "b1" | "b2" | "b3" | "s0" | "s1" | "s2" | "s3" | "m" | "cn" | "f0" | "f1" | "f2" | "f3" | "cout" | "pOut" | "gOut" | "aeqb" | "nb0" | "nb1" | "nb2" | "nb3" | "na0" | "na1" | "na2" | "na3" | "p0" | "p1" | "p2" | "p3" | "g0" | "g1" | "g2" | "g3" | "c0" | "c1" | "c2" | "c3" | "c4" | "pxg0" | "pxg1" | "pxg2" | "pxg3")[], "pGroup", "gGroup", "ncn"];
export type SignalName = (typeof ALL_SIGNALS)[number];
export type SignalMap = Record<SignalName, Bit>;
//# sourceMappingURL=signals.d.ts.map