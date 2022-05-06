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
    it("errors on extra tokens at end of line", () => {
        expect(() => compile(["value = 1 1"])).toThrow();
    });
    describe("expressions", () => {
        it("handles addition", () => {
            expect(compile(["result = a + b"])).toStrictEqual([
                "op add result a b",
            ]);
        });
        it("handles multiple additions", () => {
            expect(compile(["result = a + b + c + d"])).toStrictEqual([
                "op add $temp0 a b",
                "op add $temp1 $temp0 c",
                "op add result $temp1 d",
            ]);
        });
        it("handles subtraction", () => {
            expect(compile(["result = a - b"])).toStrictEqual([
                "op sub result a b",
            ]);
        });
        it("handles multiple subtractions", () => {
            expect(compile(["result = a - b - c - d"])).toStrictEqual([
                "op sub $temp0 a b",
                "op sub $temp1 $temp0 c",
                "op sub result $temp1 d",
            ]);
        });
        it("handles multiplication", () => {
            expect(compile(["result = a * b"])).toStrictEqual([
                "op mul result a b",
            ]);
        });
        it("handles multiple multiplications", () => {
            expect(compile(["result = a * b * c * d"])).toStrictEqual([
                "op mul $temp0 a b",
                "op mul $temp1 $temp0 c",
                "op mul result $temp1 d",
            ]);
        });
        it("handles parentheses", () => {
            expect(compile(["result = (a + b) + (c + d)"])).toStrictEqual([
                "op add $temp0 a b",
                "op add $temp1 c d",
                "op add result $temp0 $temp1",
            ]);
        });
        it("errors on missing close parenthesis", () => {
            expect(() => compile(["result = (a + b"])).toThrowError(
                "Unexpected end of line"
            );
        });
    });
});
