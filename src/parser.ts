import { lex } from "./lexer";

export type Statement = { type: "assignment"; lvalue: string; rvalue: unknown };

export function parse(input: string): Statement | undefined {
    const tokens = lex(input);
    if (tokens.length === 0) {
        // Blank or comment
        return undefined;
    }

    return {
        type: "assignment",
        lvalue: tokens[0].value,
        rvalue: tokens[2].value,
    };
}
