import { lex } from "./lexer";

describe("lexer", () => {
    it("ignores blank lines", () => {
        expect(lex("")).toStrictEqual([]);
    });
    it("ignores whitespace lines", () => {
        expect(lex("    ")).toStrictEqual([]);
    });
    it("ignores comments", () => {
        expect(lex("# comment")).toStrictEqual([]);
    });
    it("ignores indented comments", () => {
        expect(lex("    # comment")).toStrictEqual([]);
    });

    it("lexes a single-character identifier", () => {
        expect(lex("a")).toStrictEqual([{ type: "value", value: "a" }]);
    });
    it("lexes an identifier", () => {
        expect(lex("abc1")).toStrictEqual([{ type: "value", value: "abc1" }]);
    });
    it("lexes an identifier starting with '_'", () => {
        expect(lex("_abc1")).toStrictEqual([{ type: "value", value: "_abc1" }]);
    });
    it("lexes an identifier starting with '@'", () => {
        expect(lex("@abc1")).toStrictEqual([{ type: "value", value: "@abc1" }]);
    });

    it("lexes an integer", () => {
        expect(lex("123")).toStrictEqual([{ type: "value", value: "123" }]);
    });
    it("lexes a float", () => {
        expect(lex("1.23")).toStrictEqual([{ type: "value", value: "1.23" }]);
    });
    it("lexes a float with no leading zero", () => {
        expect(lex(".23")).toStrictEqual([{ type: "value", value: ".23" }]);
    });

    it("lexes operators", () => {
        expect(lex("+-*/\\!~")).toStrictEqual([
            { type: "additiveOperator", value: "+" },
            { type: "additiveOperator", value: "-" },
            { type: "multiplicativeOperator", value: "*" },
            { type: "multiplicativeOperator", value: "/" },
            { type: "multiplicativeOperator", value: "\\" },
            { type: "notOperator", value: "!" },
            { type: "notOperator", value: "~" },
        ]);
    });

    it("lexes 'if' keyword", () => {
        expect(lex("if")).toStrictEqual([
            { type: "conditionalKeyword", value: "if" },
        ]);
    });
    it("lexes 'unless' keyword", () => {
        expect(lex("unless")).toStrictEqual([
            { type: "conditionalKeyword", value: "unless" },
        ]);
    });
    it("lexes assignment operator", () => {
        expect(lex("=")).toStrictEqual([
            { type: "assignmentOperator", value: "=" },
        ]);
    });
    it("lexes equality operator", () => {
        expect(lex("==")).toStrictEqual([
            { type: "comparisonOperator", value: "==" },
        ]);
    });
    it("lexes strict equality operator", () => {
        expect(lex("===")).toStrictEqual([
            { type: "comparisonOperator", value: "===" },
        ]);
    });
    it("lexes not-equal operator", () => {
        expect(lex("!=")).toStrictEqual([
            { type: "comparisonOperator", value: "!=" },
        ]);
    });
    it("lexes strict not-equal operator", () => {
        expect(lex("!==")).toStrictEqual([
            { type: "comparisonOperator", value: "!==" },
        ]);
    });
    it("lexes less-than operator", () => {
        expect(lex("<")).toStrictEqual([
            { type: "comparisonOperator", value: "<" },
        ]);
    });
    it("lexes less-than-or-equal operator", () => {
        expect(lex("<=")).toStrictEqual([
            { type: "comparisonOperator", value: "<=" },
        ]);
    });
    it("lexes greater-than operator", () => {
        expect(lex(">")).toStrictEqual([
            { type: "comparisonOperator", value: ">" },
        ]);
    });
    it("lexes greater-than-or-equal operator", () => {
        expect(lex(">=")).toStrictEqual([
            { type: "comparisonOperator", value: ">=" },
        ]);
    });

    it("tokenizes a string with no spaces between tokens", () => {
        expect(lex("a=1")).toStrictEqual([
            { type: "value", value: "a" },
            { type: "assignmentOperator", value: "=" },
            { type: "value", value: "1" },
        ]);
    });
    it("tokenizes a string with spaces between tokens", () => {
        expect(lex("a = 1")).toStrictEqual([
            { type: "value", value: "a" },
            { type: "assignmentOperator", value: "=" },
            { type: "value", value: "1" },
        ]);
    });
    it("tokenizes a string with leading spaces", () => {
        expect(lex("    end")).toStrictEqual([{ type: "value", value: "end" }]);
    });
});
