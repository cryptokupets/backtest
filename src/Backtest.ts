import { Advisor } from "./Advisor";
import { IAdvice } from "./IAdvice";
import { ICandle } from "./ICandle";
import { ITrade } from "./ITrade";
import { Strategy } from "./Strategy";

export class Backtest {
    public candles!: ICandle[];
    public strategy!: Strategy;
    public initialBalance: number = 0;
    public trades: ITrade[] = [];
    public stoplossLevel: number = 0; // доля от цены открытия, на которую рыночная цена может упасть
    public fee: number = 0; // доля

    private currencyBalance: number = 0;
    private assetBalance: number = 0;
    private advices!: IAdvice[];
    private stoplossPrice: number = 0;

    constructor(options?: {
        candles?: ICandle[];
        strategy?: Strategy;
        initialBalance?: number;
        stoplossLevel?: number;
        fee?: number;
    }) {
        Object.assign(this, options);
    }

    public async execute(): Promise<void> {
        const { candles, strategy, initialBalance } = this;
        this.currencyBalance = initialBalance;
        this.advices = await Advisor.execute(candles, strategy);
        candles.forEach(this.candleHandler.bind(this));
    }

    private candleHandler(candle: ICandle, index: number, candles: ICandle[]) {
        const { time, close: price } = candle;

        // всегда закрывается трейдом или стоп-лосс
        if (
            (index === candles.length - 1 || price < this.stoplossPrice) &&
            this.assetBalance > 0
        ) {
            this.sell(time, price);
        } else {
            const advice = this.advices.find((a) => a.time === time);
            if (advice) {
                const { side } = advice;
                if (side === "buy" && this.currencyBalance > 0) {
                    this.buy(time, price);
                } else if (side === "sell" && this.assetBalance > 0) {
                    this.sell(time, price);
                }
            }
        }
    }

    private buy(time: string, price: number) {
        this.stoplossPrice = price * this.stoplossLevel;
        const fee = this.currencyBalance * this.fee;
        const amount = this.currencyBalance - fee;
        const quantity = amount / price;
        const trade: ITrade = {
            time,
            side: "buy",
            quantity,
            price,
            amount,
            fee,
        };
        this.currencyBalance = 0;
        this.assetBalance = quantity;
        this.trades.push(trade);
    }

    private sell(time: string, price: number) {
        const quantity = this.assetBalance;
        const amount = quantity * price;
        const fee = amount * this.fee;
        const trade: ITrade = {
            time,
            side: "sell",
            quantity,
            price,
            amount,
            fee,
        };
        this.assetBalance = 0;
        this.currencyBalance = amount - fee;
        this.trades.push(trade);
    }
}
