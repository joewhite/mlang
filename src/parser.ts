import { BinaryOperator, Expression, Statement } from "./ast";
import { additiveOperators, multiplicativeOperators } from "./operators";

class TokenStream {
    tokens: string[];

    constructor(tokens: readonly string[]) {
        this.tokens = [...tokens];
    }

    peek(
        offset: number,
        expectedValue: string | ((value: string) => boolean)
    ): boolean {
        const token = this.tokens[offset];
        return typeof expectedValue === "string"
            ? token === expectedValue
            : expectedValue(token);
    }

    next(expectedToken?: string): string {
        const result = this.tokens.shift();
        if (!result) {
            throw new Error("Unexpected end of line");
        }

        if (expectedToken && result !== expectedToken) {
            throw new Error(`Expected: ${expectedToken}\n but was: ${result}`);
        }

        return result;
    }

    verifyEmpty(): void {
        if (this.tokens.length) {
            throw new Error(
                "Error parsing statement\nExpected end of line but found: " +
                    this.tokens[0]
            );
        }
    }
}

function parseFactor(tokens: TokenStream): Expression {
    if (tokens.peek(0, "(")) {
        tokens.next("(");
        const parenthesizedExpression = parseExpression(tokens);
        tokens.next(")");
        return parenthesizedExpression;
    }

    return tokens.next();
}

function parseTerm(tokens: TokenStream): Expression {
    let result: Expression = parseFactor(tokens);

    while (tokens.peek(0, (token) => token in multiplicativeOperators)) {
        const operator = tokens.next() as BinaryOperator;
        const rvalue = parseFactor(tokens);
        result = { type: "binaryOperation", lvalue: result, operator, rvalue };
    }

    return result;
}

function parseExpression(tokens: TokenStream): Expression {
    let result: Expression = parseTerm(tokens);

    while (tokens.peek(0, (token) => token in additiveOperators)) {
        const operator = tokens.next() as BinaryOperator;
        const rvalue = parseTerm(tokens);
        result = { type: "binaryOperation", lvalue: result, operator, rvalue };
    }

    return result;
}

function parseStatement(tokens: TokenStream): Statement {
    if (tokens.peek(0, "end")) {
        tokens.next();
        return { type: "end" };
    }

    if (tokens.peek(1, "=")) {
        const lvalue = tokens.next();
        tokens.next();
        const rvalue = parseExpression(tokens);
        return { type: "assignment", lvalue, rvalue };
    }

    throw new Error("Syntax error");
}

export function tokensToStatement(tokens: string[]): Statement {
    const tokenStream = new TokenStream(tokens);

    const statement = parseStatement(tokenStream);
    tokenStream.verifyEmpty();

    return statement;
}
