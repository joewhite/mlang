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
        const precedence = [
            ["* mul", "/ div", "// idiv", "% mod"],
            ["+ add", "- sub"],
        ];

        // Equivalence within each precedence layer
        for (const operators of precedence) {
            const [operator1, opcode1] = operators[0].split(" ");
            for (let i = 1; i < operators.length; ++i) {
                const [operator2, opcode2] = operators[i].split(" ");
                it(`"${operator1}" == "${operator2}"`, () => {
                    expect(
                        compile([
                            `result = a ${operator1} b ${operator2} c ${operator1} d`,
                        ])
                    ).toStrictEqual([
                        `op ${opcode1} $temp0 a b`,
                        `op ${opcode2} $temp1 $temp0 c`,
                        `op ${opcode1} result $temp1 d`,
                    ]);
                });
            }
        }

        // Precedence between layers
        for (let i = 0; i < precedence.length - 1; ++i) {
            const [operator1, opcode1] = precedence[i][0].split(" ");
            const [operator2, opcode2] = precedence[i + 1][0].split(" ");
            it(`"${operator1}" > "${operator2}"`, () => {
                expect(
                    compile([
                        `result = a ${operator1} b ${operator2} c ${operator1} d`,
                    ])
                ).toStrictEqual([
                    `op ${opcode1} $temp0 a b`,
                    `op ${opcode1} $temp1 c d`,
                    `op ${opcode2} result $temp0 $temp1`,
                ]);
            });
        }
    });
});
