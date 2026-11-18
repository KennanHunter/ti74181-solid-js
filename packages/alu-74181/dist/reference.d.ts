import type { Inputs, Outputs } from "./simulator";
import type { SignalMap } from "./signals";
export declare function referenceModel(inputs: Inputs): Omit<Outputs, "signals"> & {
    signals?: SignalMap;
};
//# sourceMappingURL=reference.d.ts.map