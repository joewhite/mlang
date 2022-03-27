import { Expression, parse, Statement } from "./parser";

describe("parser", () => {
    it("ignores comments", () => {
        expect(parse("# comment")).toStrictEqual(undefined);
    });

    describe("assignment", () => {
        function assignA(rvalue: Expression): Statement {
            return { type: "assignment", lvalue: "a", operator: "=", rvalue };
        }

        it("parses simple assignment", () => {
            expect(parse("a = 1")).toStrictEqual(assignA("1"));
        });
        describe("binary operations", () => {
            it("parses +", () => {
                expect(parse("a = b + c")).toStrictEqual(
                    assignA({
                        type: "binaryOperation",
                        lvalue: "b",
                        operator: "+",
                        rvalue: "c",
                    })
                );
            });
        });
    });
});
