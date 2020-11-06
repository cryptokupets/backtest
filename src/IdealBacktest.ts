import { Advisor } from "./Advisor";
import { BacktestBase } from "./BacktestBase";
import { ICandle } from "./ICandle";

export class IdealBacktest extends BacktestBase {
    constructor(options?: {
        candles?: ICandle[];
        initialBalance?: number;
        fee?: number;
    }) {
        super(options);
        Object.assign(this, options);
    }

    public execute() {
        const { candles, fee, initialBalance } = this;
        this.currencyBalance = initialBalance;
        this.advices = Advisor.idealExecute(candles, fee);
        candles.forEach(this.candleHandler.bind(this));
        this.calculateRountrips();
    }
}
