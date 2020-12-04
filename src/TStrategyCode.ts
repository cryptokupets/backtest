import { ICandle } from "./ICandle";

export type TStrategyCode = (
    candle: ICandle,
    indicator: Record<string, number[]>,
    buffer: any
) => string;
