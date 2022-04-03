import { BinaryOperation, Expression, parse, Statement } from "./parser";

function assignNode(lvalue: string, rvalue: Expression): Statement {
    return {
        type: "assignment",
        lvalue,
        operator: "=",
        rvalue,
    };
}

function condNode(keyword: string, condition: Expression): Statement {
    return {
        type: "conditional",
        keyword,
        condition,
    };
}

function opNode(
    lvalue: Expression,
    operator: string,
    rvalue: Expression
): BinaryOperation {
    return {
        type: "binaryOperation",
        lvalue,
        operator,
        rvalue,
    };
}

describe("parse()", () => {
    it("ignores comments", () => {
        expect(parse("# comment")).toStrictEqual(undefined);
    });

    describe("assignment", () => {
        it("parses simple assignment", () => {
            expect(parse("a = 1")).toStrictEqual(assignNode("a", "1"));
        });
        it("parses binary expression", () => {
            expect(parse("a = b + c")).toStrictEqual(
                assignNode("a", opNode("b", "+", "c"))
            );
        });
    });

    describe("conditional", () => {
        it("parses if", () => {
            expect(parse("if a == b")).toStrictEqual(
                condNode("if", opNode("a", "==", "b"))
            );
        });
        it("parses unless", () => {
            expect(parse("unless a == b")).toStrictEqual(
                condNode("unless", opNode("a", "==", "b"))
            );
        });
    });

    describe("expressions", () => {
        function parseExpression(input: string) {
            return parse(input, (parser) => parser.parseExpression());
        }

        it("parses infix +", () => {
            expect(parseExpression("a + b + c")).toStrictEqual(
                opNode(opNode("a", "+", "b"), "+", "c")
            );
        });
        it("parses infix -", () => {
            expect(parseExpression("a - b - c")).toStrictEqual(
                opNode(opNode("a", "-", "b"), "-", "c")
            );
        });
        it("parses infix *", () => {
            expect(parseExpression("a * b * c")).toStrictEqual(
                opNode(opNode("a", "*", "b"), "*", "c")
            );
        });
        it("parses infix /", () => {
            expect(parseExpression("a / b / c")).toStrictEqual(
                opNode(opNode("a", "/", "b"), "/", "c")
            );
        });
        it("parses infix \\", () => {
            expect(parseExpression("a \\ b \\ c")).toStrictEqual(
                opNode(opNode("a", "\\", "b"), "\\", "c")
            );
        });
        describe("order of operations", () => {
            it("puts multiplication over addition", () => {
                expect(parseExpression("a * b + c * d")).toStrictEqual(
                    opNode(opNode("a", "*", "b"), "+", opNode("c", "*", "d"))
                );
            });
            it("puts addition over comparison", () => {
                expect(parseExpression("a + b <= c + d")).toStrictEqual(
                    opNode(opNode("a", "+", "b"), "<=", opNode("c", "+", "d"))
                );
            });
        });
    });
});
