import { IIndicatorInput } from "./IIndicatorInput";
import { StrategyExecuteData } from "./StrategyExecuteData";

export class Strategy {
    public warmup!: number;
    public execute!: (data: StrategyExecuteData[]) => string; // buy || sell
    public indicatorInputs!: IIndicatorInput[];

    constructor(options: {
        warmup: number;
        execute: (data: StrategyExecuteData[]) => string;
        indicatorInputs: IIndicatorInput[];
    }) {
        Object.assign(this, options);
    }
}
