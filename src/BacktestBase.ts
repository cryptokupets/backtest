import { IAdvice } from "./IAdvice";
import { ICandle } from "./ICandle";
import { IRoundtrip } from "./IRoundtrip";
import { ITrade } from "./ITrade";

export abstract class BacktestBase {
    public readonly candles: ICandle[];
    public readonly initialBalance: number;
    public readonly stoplossLevel: number; // доля от цены открытия, на которую рыночная цена может упасть
    public readonly fee: number; // доля комиссии

    public trades?: ITrade[];
    public roundtrips?: IRoundtrip[];
    public advices?: IAdvice[];
    public maxLosingSeriesLength: number = 0;
    public maxDrawDown: number = 0;
    public finalBalance?: number;

    private currencyBalance: number = 0;
    private assetBalance: number = 0;
    private stoplossPrice: number = 0;

    constructor(options: {
        candles: ICandle[];
        initialBalance?: number;
        stoplossLevel?: number; // TODO убрать отсюда
        fee?: number;
    }) {
        const {
            candles,
            initialBalance = 1,
            stoplossLevel = 0,
            fee = 0,
        } = options;

        this.candles = candles;
        this.initialBalance = initialBalance;
        this.currencyBalance = initialBalance;
        this.stoplossLevel = stoplossLevel;
        this.fee = fee;
    }

    protected calculateTrades(): ITrade[] {
        if (this.advices === undefined) {
            throw new Error("this.advices уже должны быть посчитаны");
        }

        this.trades = [];

        const { advices } = this;

        this.candles.forEach(
            (candle: ICandle, index: number, candles: ICandle[]) => {
                const { time, close: price } = candle;

                // всегда закрывается трейдом или стоп-лосс
                if (
                    (index === candles.length - 1 ||
                        price < this.stoplossPrice) &&
                    this.assetBalance > 0
                ) {
                    this.sell(time, price);
                } else {
                    const advice = advices.find((a) => a.time === time);
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
        );

        return this.trades;
    }

    protected calculateRountrips(): IRoundtrip[] {
        if (this.trades === undefined) {
            throw new Error("this.trades уже должны быть посчитаны");
        }

        const roundtrips: IRoundtrip[] = [];

        let roundtrip: IRoundtrip | null = null;
        let peak = this.initialBalance;
        let losingLength = 0;

        this.trades.forEach((trade) => {
            // если открытого нет, тогда сначала создать
            // предполагается что трейды чередуются, открывающий и закрывающий
            if (!roundtrip) {
                roundtrip = {
                    begin: trade.time,
                    openPrice: trade.price,
                    openAmount: trade.amount + trade.fee,
                    fee: trade.fee,
                };
            } else {
                roundtrip.end = trade.time;
                roundtrip.closePrice = trade.price;
                roundtrip.closeAmount = trade.amount - trade.fee;
                roundtrip.fee = roundtrip.fee + trade.fee;
                roundtrip.profit = roundtrip.closeAmount - roundtrip.openAmount;

                peak = Math.max(peak, roundtrip.closeAmount);

                if (roundtrip.profit > 0) {
                    losingLength = 0;
                } else {
                    this.maxLosingSeriesLength = Math.max(
                        this.maxLosingSeriesLength,
                        ++losingLength
                    );
                    this.maxDrawDown = Math.max(
                        this.maxDrawDown,
                        1 - roundtrip.closeAmount / peak
                    );
                }

                roundtrips.push(roundtrip);
                roundtrip = null;
            }
        });

        this.roundtrips = roundtrips;

        return roundtrips;
    }

    private buy(time: string, price: number) {
        if (this.trades === undefined) {
            throw new Error("this.trades не должен быть undefined");
        }

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
        if (this.trades === undefined) {
            throw new Error("this.trades не должен быть undefined");
        }

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
