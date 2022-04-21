import { parseScript } from "./script-parser";

describe("parseScript", () => {
    it("works for empty file", () => {
        expect(parseScript()).toStrictEqual([]);
    });
    it("ignores comments", () => {
        expect(parseScript("# This is a comment")).toStrictEqual([]);
    });
    it("works for single statement", () => {
        expect(parseScript("result = 0")).toStrictEqual([
            {
                type: "assignment",
                lvalue: "result",
                operator: "=",
                rvalue: "0",
            },
        ]);
    });
});
