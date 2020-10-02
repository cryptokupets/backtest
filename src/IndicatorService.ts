import * as tulind from "tulind";
import { ICandle } from "./ICandle";
import { IIndicator } from "./IIndicator";

export class IndicatorService {
    public static getStart(name: string, options: number[]): number {
        return tulind.indicators[name].start(options) as number;
    }

    public static async execute(options: {
        candles: ICandle[];
        name: string;
        options: number[];
    }): Promise<IIndicator[]> {
        const { candles, name, options: indicatorOptions } = options;
        const indicatorOutputs = await (tulind.indicators[name].indicator(
            (tulind.indicators[name].input_names as string[]).map((e) =>
                candles.map((c) => (c as any)[e === "real" ? "close" : e])
            ),
            indicatorOptions
        ) as Promise<number[][]>); // некоторые индикаторы возвращают несколько рядов данных, например, MACD

        const length = indicatorOutputs[0].length;
        const indicators: IIndicator[] = [];

        // перебирать начиная с последнего элемента
        for (let i = 1; i <= length; i++) {
            indicators.push({
                time: candles[candles.length - i].time,
                values: indicatorOutputs.map((e) => e[length - i]),
            });
        }

        return indicators.reverse();
    }
}
