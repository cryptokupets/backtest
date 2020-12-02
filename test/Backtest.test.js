require("mocha");
const { assert } = require("chai");
const { Backtest } = require("../lib/Backtest");
const { Strategy } = require("../lib/Strategy");
const fs = require("fs");

describe("Backtest", () => {
    it.skip("execute", function (done) {
        const { candles } = JSON.parse(
            fs.readFileSync("./test/data/data1.json")
        );
        const indicatorInputs = {
            cci: {
                name: "cci",
                options: [5],
            },
        };
        const strategyCode = 'const { cci } = indicators; return cci >= 100 ? "buy" : "sell"';
        const options = {
            candles,
            indicatorInputs,
            strategyCode,
        };
        const backtest = new Backtest(options);

        backtest.execute().then(() => {
            console.log(backtest);
            // console.log(backtest.trades);
            const { indicatorOutputs } = backtest;
            console.log(indicatorOutputs);
            assert.exists(indicatorOutputs);
            // assert.isNotEmpty(indicatorOutputs);
            done();
        });
    });

    it.skip("stoploss", function (done) {
        const candles = JSON.parse(fs.readFileSync("./test/data/data.json"));
        const execute = (data) => {
            return data[0].indicator("macd")[0] > 0 ? "buy" : "sell";
        };
        const strategy = new Strategy({
            // TODO убрать
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
            // console.log(backtest0.finalBalance);
            // console.log(backtest1.finalBalance);
            const finalBalance0 =
                backtest0.trades[backtest0.trades.length - 1].amount;
            const finalBalance1 =
                backtest1.trades[backtest1.trades.length - 1].amount;
            assert.notEqual(
                finalBalance0,
                finalBalance1,
                "Stoploss не влияет на результат"
            );
            done();
        });
    });

    it.skip("calculateIndicators", function (done) {
        const { candles } = JSON.parse(
            fs.readFileSync("./test/data/data1.json")
        );
        const indicatorInputs = {
            cci: {
                name: "cci",
                options: [5],
            },
        };
        const strategyCode = 'return ""';
        const options = {
            candles,
            indicatorInputs,
            strategyCode,
        };
        const backtest = new Backtest(options);

        backtest.calculateIndicators().then(() => {
            // console.log(backtest);
            // console.log(backtest.indicatorOutputs.cci.map(e => e.values));
            assert.property(backtest, "indicatorOutputs");
            const { indicatorOutputs } = backtest;
            assert.isObject(indicatorOutputs);
            assert.property(indicatorOutputs, "cci");

            const { cci } = indicatorOutputs;
            assert.isArray(cci);
            assert.isNotEmpty(cci);

            const cci0 = cci[0];
            assert.isObject(cci0);
            assert.property(cci0, "time");
            assert.property(cci0, "values");

            const { values } = cci0;
            assert.isArray(values);
            assert.isNotEmpty(values);

            const values0 = values[0];
            assert.isNumber(values0);

            done();
        });
    });

    it("execute", function (done) {
        const { candles } = JSON.parse(
            fs.readFileSync("./test/data/data1.json")
        );
        const indicatorInputs = {
            cci: {
                name: "cci",
                options: [5],
            },
        };
        const strategyCode = '/* console.log(indicators); */ const { cci } = indicators; console.log(cci && cci[0]); return cci && cci[0] >= 100 ? "buy" : "sell"';
        const options = {
            candles,
            indicatorInputs,
            strategyCode,
        };
        const backtest = new Backtest(options);
        backtest.calculateIndicators().then((indicatorOutputs) => {
            // console.log(indicatorOutputs);
            const advices = backtest.calculateAdvices();
            console.log(advices);
            // console.log(backtest.trades);
            // const { indicatorOutputs } = backtest;
            // assert.exists(indicatorOutputs);
            // assert.isNotEmpty(indicatorOutputs);
            done();
        });
    });
});
