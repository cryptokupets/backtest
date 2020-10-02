import { StrategyCodeData } from "./StrategyCodeData";

export class Strategy {
    public warmup!: number;
    public strategyFunction!: (data: StrategyCodeData[]) => string; // buy || sell
    public indicatorInputs!: Array<{
        key: string;
        name: string;
        options: number[];
    }>;

    constructor(options: {
        warmup: number;
        execute: (data: StrategyCodeData[]) => string;
        indicatorInputs: Array<{
            key: string;
            name: string;
            options: number[];
        }>;
    }) {
        Object.assign(this, options);
    }
}
