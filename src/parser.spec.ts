import { BinaryOperation, Expression, parse, Statement } from "./parser";

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

describe("parser", () => {
    it("ignores comments", () => {
        expect(parse("# comment")).toStrictEqual(undefined);
    });

    describe("assignment", () => {
        it("parses simple assignment", () => {
            expect(parse("a = 1")).toStrictEqual(Nodes.setA("1"));
        });
        describe("binary operations", () => {
            it("parses +", () => {
                expect(parse("a = b + c + d")).toStrictEqual(
                    Nodes.setA(Nodes.op(Nodes.op("b", "+", "c"), "+", "d"))
                );
            });
            it("parses -", () => {
                expect(parse("a = b - c - d")).toStrictEqual(
                    Nodes.setA(Nodes.op(Nodes.op("b", "-", "c"), "-", "d"))
                );
            });
            it("parses *", () => {
                expect(parse("a = b * c * d")).toStrictEqual(
                    Nodes.setA(Nodes.op(Nodes.op("b", "*", "c"), "*", "d"))
                );
            });
            it("parses /", () => {
                expect(parse("a = b / c / d")).toStrictEqual(
                    Nodes.setA(Nodes.op(Nodes.op("b", "/", "c"), "/", "d"))
                );
            });
        });
    });
});
