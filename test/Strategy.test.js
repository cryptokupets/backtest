require("mocha");
const { assert } = require("chai");
const { Strategy } = require("../lib/Strategy");

describe("Strategy", () => {
    it("execute", function () {
        const strategyCode =
            'const cci = indicators.cci; return cci >= 100 ? "buy" : "sell"';
        const indicators = [
            {
                cci: 100,
            },
            {
                cci: 0,
            },
        ];
        const advices = ["buy", "sell"];
        const strategy = new Strategy(strategyCode);

        for (let i = 0; i <= 1; i++) {
            const advice = strategy.execute({}, indicators[i]);
            // console.log(advice);
            assert.equal(advice, advices[i]);
        }
    });

    it("buffer", function () {
        const strategyCode = 'buffer.value = 1; return ""';
        const indicators = {
            cci: 100,
        };

        const strategy = new Strategy(strategyCode);
        const { buffer } = strategy;
        strategy.execute({}, indicators);
        // console.log(buffer);
        assert.isObject(buffer);
        assert.property(buffer, "value");
        assert.equal(buffer.value, 1);
    });
});
