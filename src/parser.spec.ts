import { parse } from "./parser";

describe("parser", () => {
    it("ignores comments", () => {
        expect(parse("# comment")).toStrictEqual(undefined);
    });
    it("parses assignment", () => {
        expect(parse("a = 1")).toStrictEqual({
            type: "assignment",
            lvalue: "a",
            operator: "=",
            rvalue: "1",
        });
    });
});
