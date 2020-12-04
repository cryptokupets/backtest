import { IAdvice } from "./IAdvice";
import { ICandle } from "./ICandle";

export class IdealAdvisor {
    public static execute(candles: ICandle[], fee: number): IAdvice[] {
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
