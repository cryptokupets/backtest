require("mocha");
const { assert } = require("chai");
const { Backtest } = require("../lib/Backtest");
const { Strategy } = require("../lib/Strategy");
const fs = require("fs");

describe("Backtest", () => {
    it("execute", function (done) {
        const candles = JSON.parse(fs.readFileSync("./test/data/data.json"));
        const strategyFunction = (data) => {
            const max0 = data[0].indicator("max")[0];
            const max1 = data[1].indicator("max")[0];
            return max0 > max1 ? "buy" : "sell";
        };
        const strategy = new Strategy({
            warmup: 1,
            strategyFunction,
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
            stoplossLimit: 0.999,
        };
        const backtest = new Backtest(options);

        backtest.execute().then(() => {
            console.log(backtest.finalBalance);
            // console.log(backtest.trades);
            done();
        });
    });
});
