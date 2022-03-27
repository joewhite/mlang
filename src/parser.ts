import { lex, Token } from "./lexer";

export type Statement = {
    type: "assignment";
    lvalue: string;
    operator: string;
    rvalue: unknown;
};

class Parser {
    private tokens: Token[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private next(): string {
        const token = this.tokens.shift();
        if (!token) {
            throw new Error("Unexpected end of line");
        }

        return token.value;
    }

    parseStatement(): Statement {
        const lvalue = this.next();
        const operator = this.next();
        const rvalue = this.next();
        return { type: "assignment", lvalue, operator, rvalue };
    }
}

export function parse(input: string): Statement | undefined {
    const tokens = lex(input);
    if (tokens.length === 0) {
        // Blank or comment
        return undefined;
    }

    const statement = new Parser(tokens).parseStatement();
    if (tokens.length > 0) {
        throw new Error(
            'Unexpected token "' + tokens[0].value + '" in line: ' + input
        );
    }

    return statement;
}
