require("mocha");
const { assert } = require("chai");
const { Advisor } = require("../lib/Advisor");
const { Strategy } = require("../lib/Strategy");
const fs = require("fs");

describe("AdviceService", () => {
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

        Advisor.execute(candles, strategy).then((advices) => {
            // console.log(advices);
            done();
        });
    });
});
