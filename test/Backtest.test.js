require("mocha");
const { assert } = require("chai");
const { Backtest } = require("../lib/Backtest");
const { Strategy } = require("../lib/Strategy");
const fs = require("fs");

describe("Backtest", () => {
    it("execute", function (done) {
        const candles = JSON.parse(fs.readFileSync("./test/data/data.json"));
        const execute = (data) => {
            const max0 = data[0].indicator("max")[0];
            const max1 = data[1].indicator("max")[0];
            return max0 > max1 ? "buy" : "sell";
        };
        const strategy = new Strategy({
            warmup: 1,
            execute,
            indicatorInputs: [
                {
                    key: "max",
                    name: "max",
                    options: [2],
                },
            ],
        });

        const options = {
            candles,
            strategy,
            initialBalance: 100,
            stoplossLevel: 0.999,
            fee: 0.001,
        };
        const backtest = new Backtest(options);

        backtest.execute().then(() => {
            console.log(backtest.finalBalance);
            console.log(backtest.trades);
            done();
        });
    });

    it("stoploss", function () {
        const candles = JSON.parse(fs.readFileSync("./test/data/data.json"));
        const execute = (data) => {
            return data[0].indicator("macd")[0] > 0 ? "buy" : "sell";
        };
        const strategy = new Strategy({
            warmup: 1,
            execute,
            indicatorInputs: [
                {
                    key: "macd",
                    name: "macd",
                    options: [8, 17, 2],
                },
            ],
        });

        const options0 = {
            candles,
            strategy,
            initialBalance: 100,
            stoplossLevel: 0.99,
            fee: 0,
        };

        const backtest0 = new Backtest(options0);

        const options1 = {
            candles,
            strategy,
            initialBalance: 100,
            stoplossLevel: 0.95,
            fee: 0,
        };

        const backtest1 = new Backtest(options1);

        Promise.all([backtest0.execute(), backtest1.execute()]).then(() => {
            console.log(backtest0.finalBalance);
            console.log(backtest1.finalBalance);
            assert.equal(backtest0.finalBalance, backtest1.finalBalance, "Stoploss не влияет на результат");
            done();
        });
    });
});
