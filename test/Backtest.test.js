require("mocha");
const { assert } = require("chai");
const { Backtest } = require("../lib/BacktestService");
const fs = require("fs");

describe.skip("BacktestService", () => {
    it("execute", function (done) {
        // загрузить данные из файла
        // передать в бэктест
        // передать начальный баланс
        const candles = JSON.parse(fs.readFileSync("./test/data/data.json"));
        // module.exports = (data: Array<{ candle: ICandle; indicators: Array<{ key: string; outputs: number[]; }>; indicator: (key: string) => nuber[]; }>) => number
        const strategy = {
            warmup: 1,
            indicatorInputs: [
                {
                    key: "max",
                    name: "max",
                    options: [2],
                },
            ],
            code:
                '{ const max0 = data[0].indicator("max")[0]; const max1 = data[1].indicator("max")[0]; return max0 > max1 ? 1 : -1; }',
        };

        const options = {
            candles,
            initialBalance: 100,
            strategy,
        };

        const backtest = new Backtest(options);
        backtest.execute().then(() => {
            // проверить что все в порядке
            // результат можно выгрузить в файл
            const { trades } = backtestService;
            console.log(trades);

            assert.isArray(trades, "массив данных");
            assert.isObject(trades[0], "первый элемент является объектом");
            assert.isAtLeast(trades.length, 1, "длина больше 1");

            done();
        });
    });
});
