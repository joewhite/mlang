import { compile } from "./compiler";

describe("compiler", () => {
    describe("given empty input", () => {
        it("gives empty output", () => {
            expect(compile([])).toStrictEqual([]);
        });
    });
    describe("given trivial program", () => {
        it("gives trivial output", () => {
            expect(compile(["end"])).toStrictEqual(["end"]);
        });
    });
    it("handles simple assignment", () => {
        expect(compile(["x = 1"])).toStrictEqual(["set x 1"]);
    });
});
