import { Advisor } from "./Advisor";
import { ICandle } from "./ICandle";
import { ITrade } from "./ITrade";
import { Strategy } from "./Strategy";

export class Backtest {
    public candles!: ICandle[];
    public strategy!: Strategy;
    public initialBalance: number = 0;
    public finalBalance: number = 0;
    public trades: any[] = [];

    constructor(options: {
        candles: ICandle[];
        strategy: Strategy;
        initialBalance: number;
    }) {
        Object.assign(this, options);
    }

    public async execute(): Promise<void> {
        // теперь взять всё то, что сделано в тестах и преобразовать в трейды
        // получить советы
        const { candles, strategy, initialBalance, trades } = this;
        const advices = await Advisor.execute(candles, strategy);
        let currencyBalance = initialBalance;
        let assetBalance = 0;

        advices.forEach((a) => {
            const { advice, time } = a;
            let trade: ITrade;
            if (advice === "buy" && currencyBalance > 0) {
                const candle = candles.find((c) => c.time === time);
                if (candle) {
                    const { close: price } = candle;
                    const amount = currencyBalance;
                    const quantity = amount / price;
                    trade = {
                        time,
                        side: "buy",
                        quantity,
                        price,
                        amount,
                    };
                    currencyBalance = 0;
                    assetBalance = quantity;
                    trades.push(trade);
                }
            } else if (advice === "sell" && assetBalance > 0) {
                const candle = candles.find((c) => c.time === time);
                if (candle) {
                    const { close: price } = candle;
                    const quantity = assetBalance;
                    const amount = quantity * price;
                    trade = {
                        time,
                        side: "sell",
                        quantity,
                        price,
                        amount,
                    };
                    assetBalance = 0;
                    currencyBalance = amount;
                    trades.push(trade);
                }
            }
        });

        this.finalBalance = currencyBalance
            ? currencyBalance
            : assetBalance / candles[candles.length - 1].close;
    }
}
