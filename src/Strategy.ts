import { ICandle } from "./ICandle";
import { TStrategyCode } from "./TStrategyCode";

export class Strategy {
    public readonly buffer: any = {};
    public readonly code: string;

    constructor(code: string = 'return "";') {
        this.code = code;
        let executeCode: TStrategyCode;

        try {
            executeCode = new Function(
                "candle",
                "indicators",
                "buffer",
                code
            ) as TStrategyCode;
        } catch (error) {
            executeCode = () => "";
        }

        this.executeCode = executeCode;
    }

    private executeCode: TStrategyCode;

    public execute(
        candle: ICandle,
        indicators: Record<string, number[]> // key valueIndex
    ): string {
        let side;

        try {
            side = this.executeCode(candle, indicators, this.buffer);
        } catch (error) {
            side = "";
        }

        return side;
    }
}
