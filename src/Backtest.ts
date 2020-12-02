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

    public async calculateIndicators(): Promise<
        Record<string, IIndicator[]> | undefined
    > {
        const { indicatorInputs } = this;
        if (indicatorInputs !== undefined) {
            this.indicatorOutputs = {};
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

    public calculateAdvices(): IAdvice[] {
        const { advices, indicatorInputs, indicatorOutputs } = this;

        if (indicatorInputs !== undefined && indicatorOutputs !== undefined) {
            // FIXME необязательное условие
            const { strategyCode, candles } = this;
            const strategy = new Strategy(strategyCode);
            const keys = Object.keys(indicatorInputs);

            candles.forEach((c) => {
                const { time } = c;
                const indicators: Record<string, number | number[]> = {};

                keys.forEach((k) => {
                    const i = indicatorOutputs[k].find((e) => e.time === time);

                    if (i !== undefined) {
                        indicators[k] = i.values;
                    }
                });

                const side = strategy.execute(indicators);
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
        const { candles, initialBalance } = this;

        await this.calculateIndicators();
        this.calculateAdvices();
        this.currencyBalance = initialBalance; // FIXME почему здесь?
        candles.forEach(this.candleHandler.bind(this));
        this.calculateRountrips();

        return Promise.resolve(this);
    }
}
