import {
    BinaryOperation,
    Expression,
    parse,
    parseExpression,
    Statement,
} from "./parser";

class Nodes {
    static setA(rvalue: Expression): Statement {
        return {
            type: "assignment",
            lvalue: "a",
            operator: "=",
            rvalue,
        };
    }

    static op(
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
}

describe("parse()", () => {
    it("ignores comments", () => {
        expect(parse("# comment")).toStrictEqual(undefined);
    });

    describe("assignment", () => {
        it("parses simple assignment", () => {
            expect(parse("a = 1")).toStrictEqual(Nodes.setA("1"));
        });
        it("parses binary expression", () => {
            expect(parse("a = b + c")).toStrictEqual(
                Nodes.setA(Nodes.op("b", "+", "c"))
            );
        });
    });
});

describe("parseExpression()", () => {
    it("parses +", () => {
        expect(parseExpression("a + b + c")).toStrictEqual(
            Nodes.op(Nodes.op("a", "+", "b"), "+", "c")
        );
    });
    it("parses -", () => {
        expect(parseExpression("a - b - c")).toStrictEqual(
            Nodes.op(Nodes.op("a", "-", "b"), "-", "c")
        );
    });
    it("parses *", () => {
        expect(parseExpression("a * b * c")).toStrictEqual(
            Nodes.op(Nodes.op("a", "*", "b"), "*", "c")
        );
    });
    it("parses /", () => {
        expect(parseExpression("a / b / c")).toStrictEqual(
            Nodes.op(Nodes.op("a", "/", "b"), "/", "c")
        );
    });
    describe("order of operations", () => {
        it("puts multiplication over addition", () => {
            expect(parseExpression("a * b + c * d")).toStrictEqual(
                Nodes.op(Nodes.op("a", "*", "b"), "+", Nodes.op("c", "*", "d"))
            );
        });
        it("puts addition over comparison", () => {
            expect(parseExpression("a + b <= c + d")).toStrictEqual(
                Nodes.op(Nodes.op("a", "+", "b"), "<=", Nodes.op("c", "+", "d"))
            );
        });
    });
});
