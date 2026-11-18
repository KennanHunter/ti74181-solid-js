import type { SignalName } from "./signals";
export interface PinMeta {
    signal: SignalName;
    kind: "input" | "output";
    label: string;
}
export declare const PIN_MAP: Record<string, PinMeta>;
export interface FunctionInfo {
    logic: string;
    arithNoCarry: string;
    arithCarry: string;
}
export declare const FUNCTIONS: Record<number, FunctionInfo>;
export declare function functionLabel(s: number, m: 0 | 1, cn: 0 | 1): string;
//# sourceMappingURL=pin-map.d.ts.map