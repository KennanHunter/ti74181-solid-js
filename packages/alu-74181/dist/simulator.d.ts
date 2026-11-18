import type { Bit, SignalMap } from "./signals";
export interface Inputs {
    a: number;
    b: number;
    s: number;
    m: Bit;
    cn: Bit;
}
export interface Outputs {
    f: number;
    cout: Bit;
    pOut: Bit;
    gOut: Bit;
    aeqb: Bit;
    signals: SignalMap;
}
export declare function simulate(inputs: Inputs): Outputs;
//# sourceMappingURL=simulator.d.ts.map