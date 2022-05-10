import { compile } from "./compiler";

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
    describe("operators", () => {
        function itHandles(operator: string, opcode: string) {
            it(`${operator} (single)`, () => {
                expect(compile([`result = a ${operator} b`])).toStrictEqual([
                    `op ${opcode} result a b`,
                ]);
            });
            it(`${operator} (multiple)`, () => {
                expect(
                    compile([
                        `result = a ${operator} b ${operator} c ${operator} d`,
                    ])
                ).toStrictEqual([
                    `op ${opcode} $temp0 a b`,
                    `op ${opcode} $temp1 $temp0 c`,
                    `op ${opcode} result $temp1 d`,
                ]);
            });
        }

        itHandles("+", "add");
        itHandles("-", "sub");
        itHandles("*", "mul");
        itHandles("/", "div");
        itHandles("%", "mod");
        itHandles("//", "idiv");
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
    describe("order of operations", () => {
        it("+ and - are at the same level", () => {
            expect(compile(["result = a + b - c + d"])).toStrictEqual([
                "op add $temp0 a b",
                "op sub $temp1 $temp0 c",
                "op add result $temp1 d",
            ]);
        });
        it("* higher precedence than +", () => {
            expect(compile(["result = a * b + c * d"])).toStrictEqual([
                "op mul $temp0 a b",
                "op mul $temp1 c d",
                "op add result $temp0 $temp1",
            ]);
        });
        it("* and / are at the same level", () => {
            expect(compile(["result = a * b / c * d"])).toStrictEqual([
                "op mul $temp0 a b",
                "op div $temp1 $temp0 c",
                "op mul result $temp1 d",
            ]);
        });
        it("* and % are at the same level", () => {
            expect(compile(["result = a * b % c * d"])).toStrictEqual([
                "op mul $temp0 a b",
                "op mod $temp1 $temp0 c",
                "op mul result $temp1 d",
            ]);
        });
        it("* and // are at the same level", () => {
            expect(compile(["result = a * b // c * d"])).toStrictEqual([
                "op mul $temp0 a b",
                "op idiv $temp1 $temp0 c",
                "op mul result $temp1 d",
            ]);
        });
    });
});
