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
        expect(lex("a")).toStrictEqual(["a"]);
    });
    it("lexes an identifier", () => {
        expect(lex("abc1")).toStrictEqual(["abc1"]);
    });
    it("lexes an identifier starting with '_'", () => {
        expect(lex("_abc1")).toStrictEqual(["_abc1"]);
    });
    it("lexes an identifier starting with '@'", () => {
        expect(lex("@abc1")).toStrictEqual(["@abc1"]);
    });

    it("lexes an integer", () => {
        expect(lex("123")).toStrictEqual(["123"]);
    });
    it("lexes a float", () => {
        expect(lex("1.23")).toStrictEqual(["1.23"]);
    });
    it("lexes a float with no leading zero", () => {
        expect(lex(".23")).toStrictEqual([".23"]);
    });

    it("lexes operators", () => {
        expect(lex("+-*/\\!~")).toStrictEqual([
            "+",
            "-",
            "*",
            "/",
            "\\",
            "!",
            "~",
        ]);
    });

    it("lexes identifier with non-BMP Unicode", () => {
        expect(lex("𐐨")).toStrictEqual(["𐐨"]);
    });
    it("lexes 'if' keyword", () => {
        expect(lex("if")).toStrictEqual(["if"]);
    });
    it("lexes 'unless' keyword", () => {
        expect(lex("unless")).toStrictEqual(["unless"]);
    });
    it("lexes assignment operator", () => {
        expect(lex("=")).toStrictEqual(["="]);
    });
    it("lexes equality operator", () => {
        expect(lex("==")).toStrictEqual(["=="]);
    });
    it("lexes strict equality operator", () => {
        expect(lex("===")).toStrictEqual(["==="]);
    });
    it("lexes not-equal operator", () => {
        expect(lex("!=")).toStrictEqual(["!="]);
    });
    it("lexes strict not-equal operator", () => {
        expect(lex("!==")).toStrictEqual(["!=="]);
    });
    it("lexes less-than operator", () => {
        expect(lex("<")).toStrictEqual(["<"]);
    });
    it("lexes less-than-or-equal operator", () => {
        expect(lex("<=")).toStrictEqual(["<="]);
    });
    it("lexes greater-than operator", () => {
        expect(lex(">")).toStrictEqual([">"]);
    });
    it("lexes greater-than-or-equal operator", () => {
        expect(lex(">=")).toStrictEqual([">="]);
    });

    it("tokenizes a string with no spaces between tokens", () => {
        expect(lex("a=1")).toStrictEqual(["a", "=", "1"]);
    });
    it("tokenizes a string with spaces between tokens", () => {
        expect(lex("a = 1")).toStrictEqual(["a", "=", "1"]);
    });
    it("tokenizes a string with leading spaces", () => {
        expect(lex("    end")).toStrictEqual(["end"]);
    });
});
