import { IAdvice } from "./IAdvice";
import { ICandle } from "./ICandle";
import { IndicatorService } from "./IndicatorService";
import { Strategy } from "./Strategy";
import { StrategyExecuteData } from "./StrategyExecuteData";

export class Advisor {
    public static async execute(
        candles: ICandle[],
        strategy: Strategy
    ): Promise<IAdvice[]> {
        const { indicatorInputs, warmup: strategyWarmup, execute } = strategy;
        const indicatorKeys = indicatorInputs.map((e) => e.key);

        // советник заработает только когда наберется необходимое количество вычисленных индикаторов для стратегии
        const warmup =
            strategyWarmup +
            indicatorInputs
                .map((e) => IndicatorService.getStart(e.name, e.options))
                .reduce((a, e) => Math.max(a, e));

        return Promise.all(
            indicatorInputs.map((e) =>
                IndicatorService.execute({
                    candles,
                    name: e.name,
                    options: e.options,
                })
            )
        ).then((results) => {
            // для каждой свечи попробовать найти вычисленный индикатор
            const data: StrategyExecuteData[] = candles.map((candle) => {
                const { time } = candle;
                const indicators: Array<{
                    key: string;
                    outputs: number[];
                }> = indicatorKeys.map((key, index) => {
                    const indicator = results[index].find(
                        (e) => e.time === time
                    );
                    return {
                        key,
                        outputs: indicator ? indicator.values : [],
                    };
                });

                const dataItem: StrategyExecuteData = new StrategyExecuteData({
                    time: candle.time,
                    candle,
                    indicators,
                });

                return dataItem;
            });

            const advices: IAdvice[] = [];
            for (let i = warmup; i < data.length; i++) {
                const side = execute(data.slice(i - warmup, i + 1));
                advices.push({
                    time: data[i].time,
                    side,
                });
            }

            return Promise.resolve(advices);
        });
    }

    public static idealExecute(candles: ICandle[], fee: number): IAdvice[] {
        const advices: IAdvice[] = [];
        const lastIndex = candles.length - 1;

        let min = candles[0];
        let max: ICandle | null = null;

        // max по времени всегда позднее open
        // max появляется только если current первысил порог fee
        // если current упал ниже max больше чем на fee, то пара фиксируется и начинается заново
        // порог = min * fee + max * fee + min

        candles.forEach((curr, i) => {
            if (
                curr.close > (min.close * (1 + fee)) / (1 - fee) &&
                (!max || curr.close > max.close)
            ) {
                // если рост и преодолен порог, то фиксируется новый пик
                max = curr;
            }

            if (
                max &&
                (max.close > (curr.close * (1 + fee)) / (1 - fee) ||
                    i === lastIndex)
            ) {
                // если падение ниже порога и после пика, то фиксируется пара
                advices.push({
                    time: min.time,
                    side: "buy",
                });
                advices.push({
                    time: max.time,
                    side: "sell",
                });

                min = curr; // считается новой впадиной
                max = null; // пик сбрасывается
            }
            if (!max && curr.close < min.close) {
                // если пика нет, и понижение, то фиксируется новая отметка впадина
                min = curr;
            }
        });

        return advices;
    }
}
