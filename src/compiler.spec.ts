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
        expect(compile(["value = 1"])).toStrictEqual(["set value 1"]);
    });
    it("tokenizes properly without spaces", () => {
        expect(compile(["value=1"])).toStrictEqual(["set value 1"]);
    });
});
