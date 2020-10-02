import { ICandle } from "./ICandle";
import { Strategy } from "./Strategy";

export class Backtest {
    public candles!: ICandle[];
    public strategy!: Strategy;

    constructor(options: any) {
        Object.assign(this, options);
    }

    public async execute(): Promise<void> {
        // теперь взять всё то, что сделано в тестах и преобразовать в трейды
        console.log("ok");
        return Promise.reject("Not implemented.");
    }
}
