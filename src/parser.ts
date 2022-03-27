import { lex, Token, TokenType } from "./lexer";

export type BinaryOperation = {
    type: "binaryOperation";
    lvalue: string;
    operator: string;
    rvalue: Expression;
};

export type Expression = string | BinaryOperation;

export type Statement = {
    type: "assignment";
    lvalue: string;
    operator: string;
    rvalue: Expression;
};

class Parser {
    private tokens: Token[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private peek(index: number, tokenType: TokenType): string | undefined {
        const token = this.tokens[index];
        const matches = token?.type === tokenType;
        return matches ? token.value : undefined;
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
        const rvalue = this.parseExpression();
        return { type: "assignment", lvalue, operator, rvalue };
    }

    parseExpression(): Expression {
        if (this.peek(1, "operator")) {
            return this.parseBinaryOperation();
        }

        return this.next();
    }

    parseBinaryOperation(): BinaryOperation {
        const lvalue = this.next();
        const operator = this.next();
        const rvalue = this.next();
        return { type: "binaryOperation", lvalue, operator, rvalue };
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
            'Expected end of line but found "' +
                tokens[0].value +
                '" in line: ' +
                input
        );
    }

    return statement;
}
