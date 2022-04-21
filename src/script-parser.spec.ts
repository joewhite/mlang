import { parseScript, ScriptStatement } from "./script-parser";

describe("parseScript", () => {
    it("works for empty file", () => {
        expect(parseScript()).toStrictEqual([]);
    });
    it("ignores comments", () => {
        expect(parseScript("# This is a comment")).toStrictEqual([]);
    });
    it("parses flat list of statements", () => {
        expect(parseScript("end", "end")).toStrictEqual([
            { type: "end" },
            { type: "end" },
        ]);
    });
    it("parses one level of nesting", () => {
        expect(
            parseScript("if a", "  end", "  end", "if b", "  end")
        ).toStrictEqual<ScriptStatement[]>([
            {
                type: "conditional",
                keyword: "if",
                condition: "a",
                children: [{ type: "end" }, { type: "end" }],
            },
            {
                type: "conditional",
                keyword: "if",
                condition: "b",
                children: [{ type: "end" }],
            },
        ]);
    });
    it("parses multiple levels of nesting", () => {
        expect(
            parseScript(
                "if a",
                "  if b",
                "    if c",
                "      end",
                "  end",
                "end"
            )
        ).toStrictEqual([
            {
                type: "conditional",
                keyword: "if",
                condition: "a",
                children: [
                    {
                        type: "conditional",
                        keyword: "if",
                        condition: "b",
                        children: [
                            {
                                type: "conditional",
                                keyword: "if",
                                condition: "c",
                                children: [{ type: "end" }],
                            },
                        ],
                    },
                    { type: "end" },
                ],
            },
            { type: "end" },
        ]);
    });
});
