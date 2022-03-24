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

    it("lexes arithmetic operators", () => {
        expect(lex("+-*/")).toStrictEqual([
            { type: "operator", value: "+" },
            { type: "operator", value: "-" },
            { type: "operator", value: "*" },
            { type: "operator", value: "/" },
        ]);
    });

    it("lexes assignment operator", () => {
        expect(lex("=")).toStrictEqual([{ type: "operator", value: "=" }]);
    });
    it("lexes equality operator", () => {
        expect(lex("==")).toStrictEqual([{ type: "operator", value: "==" }]);
    });
    it("lexes strict equality operator", () => {
        expect(lex("===")).toStrictEqual([{ type: "operator", value: "===" }]);
    });
    it("lexes not-equal operator", () => {
        expect(lex("!=")).toStrictEqual([{ type: "operator", value: "!=" }]);
    });
    it("lexes strict not-equal operator", () => {
        expect(lex("!==")).toStrictEqual([{ type: "operator", value: "!==" }]);
    });
    it("lexes less-than operator", () => {
        expect(lex("<")).toStrictEqual([{ type: "operator", value: "<" }]);
    });
    it("lexes less-than-or-equal operator", () => {
        expect(lex("<=")).toStrictEqual([{ type: "operator", value: "<=" }]);
    });
    it("lexes greater-than operator", () => {
        expect(lex(">")).toStrictEqual([{ type: "operator", value: ">" }]);
    });
    it("lexes greater-than-or-equal operator", () => {
        expect(lex(">=")).toStrictEqual([{ type: "operator", value: ">=" }]);
    });

    it("tokenizes a string with no spaces between tokens", () => {
        expect(lex("a=1")).toStrictEqual([
            { type: "value", value: "a" },
            { type: "operator", value: "=" },
            { type: "value", value: "1" },
        ]);
    });
    it("tokenizes a string with spaces between tokens", () => {
        expect(lex("a = 1")).toStrictEqual([
            { type: "value", value: "a" },
            { type: "operator", value: "=" },
            { type: "value", value: "1" },
        ]);
    });
    it("tokenizes a string with leading spaces", () => {
        expect(lex("    end")).toStrictEqual([{ type: "value", value: "end" }]);
    });
});
