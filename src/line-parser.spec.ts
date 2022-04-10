import {
    BinaryOperation,
    BinaryOperator,
    Expression,
    parseLine,
    Statement,
    UnaryOperation,
    UnaryOperator,
} from "./line-parser";

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

function unaryNode(operator: UnaryOperator, value: Expression): UnaryOperation {
    return { type: "unaryOperation", operator, value };
}

function opNode(
    lvalue: Expression,
    operator: BinaryOperator,
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
        expect(parseLine("# comment")).toStrictEqual(undefined);
    });

    describe("assignment", () => {
        it("parses simple assignment", () => {
            expect(parseLine("a = 1")).toStrictEqual(assignNode("a", "1"));
        });
        it("parses binary expression", () => {
            expect(parseLine("a = b + c")).toStrictEqual(
                assignNode("a", opNode("b", "+", "c"))
            );
        });
    });

    describe("conditional", () => {
        it("parses if", () => {
            expect(parseLine("if a == b")).toStrictEqual(
                condNode("if", opNode("a", "==", "b"))
            );
        });
        it("parses unless", () => {
            expect(parseLine("unless a == b")).toStrictEqual(
                condNode("unless", opNode("a", "==", "b"))
            );
        });
    });

    describe("expressions", () => {
        function parseExpression(input: string) {
            return parseLine(input, (parser) => parser.parseExpression());
        }

        it("parses unary -", () => {
            expect(parseExpression("-a")).toStrictEqual(unaryNode("-", "a"));
        });
        it("parses unary !", () => {
            expect(parseExpression("!a")).toStrictEqual(unaryNode("!", "a"));
        });
        it("parses unary ~", () => {
            expect(parseExpression("~a")).toStrictEqual(unaryNode("~", "a"));
        });

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
            it("puts negative over multiplication", () => {
                expect(parseExpression("-a * -b")).toStrictEqual(
                    opNode(unaryNode("-", "a"), "*", unaryNode("-", "b"))
                );
            });
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
