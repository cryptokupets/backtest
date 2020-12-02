require("mocha");
const { assert } = require("chai");
const { Advisor } = require("../lib/Advisor");
const { Strategy } = require("../lib/Strategy");
const fs = require("fs");

describe("AdviceService", () => {
    it("execute", function (done) {
        const { candles } = JSON.parse(
            fs.readFileSync("./test/data/data1.json")
        );
        const execute = (data) => {
            console.log("execute: ", data);
            const cci = data[0].indicator("cci").values[0];
            return cci >= 100 ? "buy" : "sell";
        };

        const strategy = new Strategy({
            warmup: 1,
            execute,
            indicatorInputs: [
                {
                    key: "cci",
                    name: "cci",
                    options: [5],
                },
            ],
        });

        Advisor.execute(candles, strategy).then((advices) => {
            console.log(advices);
            done();
        });
    });

    it("calculate", function () {
        const strategyCode =
            'const cci = indicators.cci[0]; return cci >= 100 ? "buy" : "sell"';
        const indicators = [
            {
                cci: [100],
            },
            {
                cci: [0],
            },
        ];

        const advices = ["buy", "sell"];

        for (let i = 0; i <= 1; i++) {
            const advice = Advisor.calculate(indicators[i], strategyCode);
            // console.log(advice);
            assert.equal(advice, advices[i]);
        }
    });

    it("buffer", function () {
        const buffer = {};
        const strategyCode =
            'const cci = indicators.cci[0]; buffer.value = 1; return cci >= 100 ? "buy" : "sell"';
        const indicators = {
            cci: 100,
        };

        Advisor.calculate(indicators, strategyCode, buffer);
        // console.log(buffer);
        assert.isObject(buffer);
        assert.property(buffer, "value");
        assert.equal(buffer.value, 1);
    });
});
