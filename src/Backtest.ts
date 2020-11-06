import { Advisor } from "./Advisor";
import { BacktestBase } from "./BacktestBase";
import { ICandle } from "./ICandle";
import { Strategy } from "./Strategy";

export class Backtest extends BacktestBase {
    public strategy!: Strategy;

    constructor(options?: {
        candles?: ICandle[];
        strategy?: Strategy;
        initialBalance?: number;
        stoplossLevel?: number;
        fee?: number;
    }) {
        super(options);
        Object.assign(this, options);
    }

    public async execute(): Promise<void> {
        const { candles, strategy, initialBalance } = this;
        this.currencyBalance = initialBalance;
        this.advices = await Advisor.execute(candles, strategy);
        candles.forEach(this.candleHandler.bind(this));
        this.calculateRountrips();
    }
}
