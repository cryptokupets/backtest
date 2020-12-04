require("mocha");
const { assert } = require("chai");
const { IdealAdvisor } = require("../lib/IdealAdvisor");
const fs = require("fs");

describe("IdealAdvisor", () => {
    it("execute", function () {
        const candles = JSON.parse(fs.readFileSync("./test/data/data2.json"));
        const advices = IdealAdvisor.execute(candles, 0);
        // console.log(advices);
        const norm = [
            { time: "2005-11-03", side: "buy" },
            { time: "2005-11-04", side: "sell" },
            { time: "2005-11-07", side: "buy" },
            { time: "2005-11-09", side: "sell" },
        ];

        assert.isArray(advices);
        assert.equal(advices.length, 4);

        norm.forEach((e, i) => {
            const advice = advices[i];

            assert.property(advice, "time");
            assert.property(advice, "side");
            assert.equal(advice.time, e.time);
            assert.equal(advice.side, e.side);
        });
    });
});
