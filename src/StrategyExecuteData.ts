import { ICandle } from "./ICandle";

export class StrategyExecuteData {
    public time!: string;
    public candle!: ICandle;
    public indicators!: Array<{
        key: string;
        outputs: number[];
    }>;

    constructor(options: {
        time: string;
        candle: ICandle;
        indicators: Array<{
            key: string;
            outputs: number[];
        }>;
    }) {
        Object.assign(this, options);
    }

    public indicator(key: string): number[] {
        const indicator = this.indicators.find((e) => e.key === key);
        return indicator ? indicator.outputs : [];
    }
}
