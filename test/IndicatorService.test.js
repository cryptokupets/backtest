require("mocha");
const { assert } = require("chai");
const { IndicatorService } = require("../lib/IndicatorService");
const fs = require("fs");

describe("IndicatorService", () => {
    it("execute", function (done) {
        const candles = JSON.parse(fs.readFileSync("./test/data/data.json"));
        const options = {
            candles,
            name: "max",
            options: [2],
        };

        IndicatorService.execute(options).then((output) => {
            // console.log(output);
            assert.isArray(output, "массив данных");
            assert.isObject(output[0], "первый элемент является объектом");
            assert.isAtLeast(output.length, 1, "длина больше 1");

            done();
        });
    });
});
