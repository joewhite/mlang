import { BinaryOperator, Expression, Statement, UnaryOperator } from "./ast";
import {
    additiveOperators,
    multiplicativeOperators,
    unaryOperators,
} from "./operators";
import { Line } from "./tokenizer";

// Precedence names ("parseSomePrecedence" methods below) are borrowed from
// the C# compiler's source code, since C# has a pretty sane order of
// precedence. Look for "private enum Precedence" in:
// https://github.com/dotnet/roslyn/blob/main/src/Compilers/CSharp/Portable/Parser/LanguageParser.cs
// This code is based on revision:
// https://github.com/dotnet/roslyn/blob/0c31b36b31a1ebebc38e1e09a61e44e41a84abd2/src/Compilers/CSharp/Portable/Parser/LanguageParser.cs#L10309

class TokenStream {
    tokens: string[];

    constructor(tokens: readonly string[]) {
        this.tokens = [...tokens];
    }

    peek(
        offset: number,
        expectedValue: string | readonly string[] | ((value: string) => boolean)
    ): boolean {
        const token = this.tokens[offset];

        if (typeof expectedValue === "string") {
            return token === expectedValue;
        }

        if (typeof expectedValue === "function") {
            return expectedValue(token);
        }

        return expectedValue.includes(token);
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

function parseValue(tokens: TokenStream): string {
    const value = tokens.next();
    const valueMatches = /^(\w|-\d|-?\.\d)/.exec(value);
    if (!valueMatches) {
        throw new Error(`Expected value but found: ${value}`);
    }

    return value;
}

function parseUnary(tokens: TokenStream): Expression {
    if (tokens.peek(0, unaryOperators)) {
        const operator = tokens.next() as UnaryOperator;
        const value = parseUnary(tokens);
        return { type: "unaryOperation", operator, value };
    }

    return parseValue(tokens);
}

function parseAdditive(tokens: TokenStream): Expression {
    if (tokens.peek(0, "(")) {
        tokens.next("(");
        const parenthesizedExpression = parseExpression(tokens);
        tokens.next(")");
        return parenthesizedExpression;
    }

    return parseUnary(tokens);
}

function parseMultiplicative(tokens: TokenStream): Expression {
    let result: Expression = parseAdditive(tokens);

    while (tokens.peek(0, (token) => token in multiplicativeOperators)) {
        const operator = tokens.next() as BinaryOperator;
        const rvalue = parseAdditive(tokens);
        result = { type: "binaryOperation", lvalue: result, operator, rvalue };
    }

    return result;
}

function parseExpression(tokens: TokenStream): Expression {
    let result: Expression = parseMultiplicative(tokens);

    while (tokens.peek(0, (token) => token in additiveOperators)) {
        const operator = tokens.next() as BinaryOperator;
        const rvalue = parseMultiplicative(tokens);
        result = { type: "binaryOperation", lvalue: result, operator, rvalue };
    }

    return result;
}

function parseStatement(tokens: TokenStream): Statement {
    if (tokens.peek(0, "end")) {
        tokens.next();
        return { type: "end" };
    }

    if (tokens.peek(0, "print")) {
        tokens.next();
        const value = parseExpression(tokens);
        return { type: "print", value };
    }

    if (tokens.peek(1, "=")) {
        const lvalue = tokens.next();
        tokens.next();
        const rvalue = parseExpression(tokens);
        return { type: "assignment", lvalue, rvalue };
    }

    throw new Error("Syntax error");
}

export function lineToStatement(line: Line): Statement {
    if (line.indent > 0) {
        throw new Error("Invalid indentation");
    }

    const tokenStream = new TokenStream(line.tokens);

    const statement = parseStatement(tokenStream);
    tokenStream.verifyEmpty();

    return statement;
}
