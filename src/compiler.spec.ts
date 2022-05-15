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
describe("ignored lines", () => {
    it("ignores blank lines", () => {
        expect(compile(["", "end", ""])).toStrictEqual(["end"]);
    });
    it("ignores comments", () => {
        expect(compile(["# comment 1", "end", "# comment 2"])).toStrictEqual([
            "end",
        ]);
    });
});
it("gives syntax error on unrecognized input", () => {
    expect(() => compile(["print 1", "lorem ipsum"])).toThrowError(
        "Unrecognized syntax in line 2: lorem ipsum"
    );
});
describe("print statement", () => {
    it("accepts values", () => {
        expect(compile(["print 1"])).toStrictEqual(["print 1"]);
    });
    it("accepts expressions", () => {
        expect(compile(["print 1 + 2"])).toStrictEqual([
            "op add $temp0 1 2",
            "print $temp0",
        ]);
    });
});
it("handles multiple statements", () => {
    expect(compile(["print 1", "print 2"])).toStrictEqual([
        "print 1",
        "print 2",
    ]);
});
describe("indentation", () => {
    it("ignores indentation on blank lines", () => {
        expect(compile(["  ", "end", "  "])).toStrictEqual(["end"]);
    });
    it("ignores indentation on comment lines", () => {
        expect(
            compile(["  # indented comment", "end", "  # indented comment"])
        ).toStrictEqual(["end"]);
    });
    it("errors if first line is indented", () => {
        expect(() => compile(["  print 1"])).toThrowError(
            "Invalid indentation"
        );
    });
    it("errors if second line is unexpectedly indented", () => {
        expect(() => compile(["print 1", "  print 2"])).toThrowError(
            "Invalid indentation"
        );
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
describe("values", () => {
    it("errors on non-value when value expected", () => {
        expect(() => compile(["value = +"])).toThrowError(
            "Expected identifier or number but found: +"
        );
    });
    it("accepts alphanumeric with leading alpha", () => {
        expect(compile(["result = abc123"])).toStrictEqual([
            "set result abc123",
        ]);
    });
    it("accepts leading underscore", () => {
        expect(compile(["result = _abc123"])).toStrictEqual([
            "set result _abc123",
        ]);
    });
    it("accepts integer", () => {
        expect(compile(["result = 123"])).toStrictEqual(["set result 123"]);
    });
    it("accepts decimal", () => {
        expect(compile(["result = 123.45"])).toStrictEqual([
            "set result 123.45",
        ]);
    });
    it("accepts decimal with no leading zero", () => {
        expect(compile(["result = .45"])).toStrictEqual(["set result .45"]);
    });
    it("accepts negative integer", () => {
        expect(compile(["result = -123"])).toStrictEqual(["set result -123"]);
    });
    it("accepts negative decimal", () => {
        expect(compile(["result = -123.45"])).toStrictEqual([
            "set result -123.45",
        ]);
    });
    it("accepts negative decimal with no leading zero", () => {
        expect(compile(["result = -.45"])).toStrictEqual(["set result -.45"]);
    });
    it("does not accept dollar sign", () => {
        expect(() => compile(["result = $abc123"])).toThrowError(
            "Unexpected token at: $abc123"
        );
    });
});
describe("expressions", () => {
    describe("operators", () => {
        function itDoesBinary(
            operator: string,
            expectedInstructionsSingle: string[],
            expectedInstructionsMultiple: string[]
        ) {
            it(`${operator} (single)`, () => {
                expect(compile([`result = a ${operator} b`])).toStrictEqual(
                    expectedInstructionsSingle
                );
            });
            it(`${operator} (multiple)`, () => {
                expect(
                    compile([
                        `result = a ${operator} b ${operator} c ${operator} d`,
                    ])
                ).toStrictEqual(expectedInstructionsMultiple);
            });
        }

        function itDoesSimpleBinary(operator: string, opcode: string) {
            itDoesBinary(
                operator,
                [`op ${opcode} result a b`],
                [
                    `op ${opcode} $temp0 a b`,
                    `op ${opcode} $temp1 $temp0 c`,
                    `op ${opcode} result $temp1 d`,
                ]
            );
        }

        it("unary - (single)", () => {
            expect(compile(["result = -a"])).toStrictEqual([
                "op sub result 0 a",
            ]);
        });
        it("unary - (multiple)", () => {
            expect(compile(["result = - -a"])).toStrictEqual([
                "op sub $temp0 0 a",
                "op sub result 0 $temp0",
            ]);
        });

        itDoesSimpleBinary("+", "add");
        itDoesSimpleBinary("-", "sub");

        itDoesSimpleBinary("*", "mul");
        itDoesSimpleBinary("/", "div");
        itDoesSimpleBinary("%", "mod");
        itDoesSimpleBinary("//", "idiv");

        itDoesSimpleBinary("==", "equal");
        itDoesSimpleBinary("!=", "notEqual");
        itDoesSimpleBinary("===", "strictEqual");
        itDoesBinary(
            "!==",
            ["op strictEqual $temp0 a b", "op equal result $temp0 0"],
            [
                "op strictEqual $temp0 a b",
                "op equal $temp1 $temp0 0",
                "op strictEqual $temp2 $temp1 c",
                "op equal $temp3 $temp2 0",
                "op strictEqual $temp4 $temp3 d",
                "op equal result $temp4 0",
            ]
        );

        itDoesSimpleBinary("<", "lessThan");
        itDoesSimpleBinary("<=", "lessThanEq");
        itDoesSimpleBinary(">", "greaterThan");
        itDoesSimpleBinary(">=", "greaterThanEq");
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

            [
                "< lessThan",
                "<= lessThanEq",
                "> greaterThan",
                ">= greaterThanEq",
            ],
            // Not checking !== here because its codegen is more complicated
            ["== equal", "!= notEqual", "=== strictEqual"],
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

        it('"==" == "!=="', () => {
            expect(compile([`result = a == b !== c == d`])).toStrictEqual([
                `op equal $temp0 a b`,
                `op strictEqual $temp1 $temp0 c`,
                `op equal $temp2 $temp1 0`,
                `op equal result $temp2 d`,
            ]);
        });

        // Other precedence checks
        it("can negate a parenthesized expression", () => {
            expect(compile(["result = -(a + b)"])).toStrictEqual([
                "op add $temp0 a b",
                "op sub result 0 $temp0",
            ]);
        });
    });
});
describe("goto", () => {
    it("ignores unused labels", () => {
        expect(compile(["label1:", "end"])).toStrictEqual(["end"]);
    });
    it("errors on unknown label", () => {
        expect(() => compile(["goto label1"])).toThrowError(
            `Unknown label "label1"`
        );
    });
    it("errors on duplicate label", () => {
        expect(() => compile(["label1:", "label1:"])).toThrowError(
            `Duplicate label "label1"`
        );
    });
    it("can goto a label mid-script", () => {
        expect(
            compile(["print 1", "label1:", "print 2", "goto label1"])
        ).toStrictEqual([
            "print 1", // Offset 0
            "print 2", // Offset 1, aka label1
            "jump 1 always 0 0",
        ]);
    });
    it("wraps around if label is at the end of the script", () => {
        expect(
            compile(["print 1", "goto label1", "print 2", "label1:"])
        ).toStrictEqual(["print 1", "jump 0 always 0 0", "print 2"]);
    });
});
describe("if", () => {
    it("works without else", () => {
        expect(
            compile(["if a == b", "  print 1", "  print 2", "print 3"])
        ).toStrictEqual([
            "jump 2 equal a b",
            "jump 4 always 0 0",
            "print 1",
            "print 2",
            "print 3",
        ]);
    });
    it("supports nested ifs", () => {
        expect(
            compile([
                "if a == b",
                "  print 1",
                "  if c == d",
                "    print 2",
                "    print 3",
                "  print 4",
                "print 5",
            ])
        ).toStrictEqual([
            "jump 2 equal a b",
            "jump 8 always 0 0",
            "print 1",
            "jump 5 equal c d",
            "jump 7 always 0 0",
            "print 2",
            "print 3",
            "print 4",
            "print 5",
        ]);
    });
});
