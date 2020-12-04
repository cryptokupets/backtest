import { BacktestBase } from "./BacktestBase";
import { IAdvice } from "./IAdvice";
import { ICandle } from "./ICandle";
import { IIndicator } from "./IIndicator";
import { IIndicatorInput } from "./IIndicatorInput";
import { IndicatorService } from "./IndicatorService";
import { Strategy } from "./Strategy";

export class Backtest extends BacktestBase {
    public readonly strategyCode: string;
    public readonly indicatorInputs?: Record<string, IIndicatorInput>;
    public indicatorOutputs?: Record<string, IIndicator[]>;

    constructor(options: {
        candles: ICandle[];
        strategyCode: string;
        indicatorInputs?: Record<string, IIndicatorInput>;
        initialBalance?: number;
        stoplossLevel?: number;
        fee?: number;
    }) {
        super(options);

        const { strategyCode, indicatorInputs } = options;

        this.strategyCode = strategyCode;
        this.indicatorInputs = indicatorInputs;
    }

    private async calculateIndicators(): Promise<
        Record<string, IIndicator[]> | undefined
    > {
        this.indicatorOutputs = {};

        const { indicatorInputs } = this;

        if (indicatorInputs !== undefined) {
            const { candles, indicatorOutputs } = this;
            const keys = Object.keys(indicatorInputs);

            (
                await Promise.all(
                    keys.map((e) => {
                        const { name, options } = indicatorInputs[e];
                        return IndicatorService.execute({
                            candles,
                            name,
                            options,
                        });
                    })
                )
            ).forEach((e, i) => {
                indicatorOutputs[keys[i]] = e;
            });
        }

        return this.indicatorOutputs;
    }

    private calculateAdvices(): IAdvice[] {
        if (this.indicatorOutputs === undefined) {
            throw new Error("this.indicatorOutputs не должен быть undefined");
        }

        this.advices = [];

        const { advices, indicatorInputs, indicatorOutputs } = this;

        if (indicatorInputs !== undefined) {
            const { strategyCode, candles } = this;
            const strategy = new Strategy(strategyCode);
            const keys = Object.keys(indicatorInputs);

            candles.forEach((c) => {
                const { time } = c;
                const indicators: Record<string, number[]> = {};

                if (keys.length) {
                    keys.forEach((k) => {
                        const i = indicatorOutputs[k].find(
                            (e) => e.time === time
                        );

                        if (i !== undefined) {
                            indicators[k] = i.values;
                        }
                    });
                }

                const side = strategy.execute(c, indicators); // готовность индикаторов необходимо проверять внутри стратегии, т.к. у стратегии уже есть и свеча и буффер для оценки ситуации

                if (side) {
                    advices.push({
                        time,
                        side,
                    });
                }
            });
        }

        return advices;
    }

    public async execute(): Promise<Backtest> {
        await this.calculateIndicators();
        this.calculateAdvices();
        const trades = this.calculateTrades();
        this.calculateRountrips();
        if (trades.length) {
            const { amount, fee } = trades[trades.length - 1];
            this.finalBalance = amount - fee;
        } else {
            this.finalBalance = this.initialBalance;
        }

        return this;
    }
}
