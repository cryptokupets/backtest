require("mocha");
const { assert } = require("chai");
const { IndicatorService } = require("../lib/IndicatorService");
const fs = require("fs");

describe("IndicatorService", () => {
    it("execute", function (done) {
        const { candles, indicatorOutputs } = JSON.parse(fs.readFileSync("./test/data/data1.json"));
        const options = {
            candles,
            name: "cci",
            options: [5],
        };

        IndicatorService.execute(options).then((output) => {
            console.log(output);
            assert.isArray(output, "массив данных");
            assert.isObject(output[0], "первый элемент является объектом");
            assert.isAtLeast(output.length, 1, "длина больше 1");

            for (let index = 0; index < output.length; index++) {
                assert.equal(indicatorOutputs[index].time, output[index].time);
                assert.equal(indicatorOutputs[index].values[0], Math.round(output[index].values[0] * 100) / 100);
            }
            done();
        });
    });
});
