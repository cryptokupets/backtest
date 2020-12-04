import { IdealAdvisor } from "./IdealAdvisor";
import { BacktestBase } from "./BacktestBase";
import { ICandle } from "./ICandle";
import { IAdvice } from "./IAdvice";

export class IdealBacktest extends BacktestBase {
    constructor(options: {
        candles: ICandle[];
        initialBalance?: number;
        fee?: number;
    }) {
        super(options);
        Object.assign(this, options);
    }

    private calculateAdvices(): IAdvice[] {
        const { candles, fee } = this;
        const advices = IdealAdvisor.execute(candles, fee);
        this.advices = advices;

        return advices;
    }

    public execute(): IdealBacktest {
        this.calculateAdvices();
        this.calculateTrades();
        this.calculateRountrips();

        return this;
    }
}
