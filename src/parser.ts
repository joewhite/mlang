import { BinaryOperator, Expression, Statement, UnaryOperator } from "./ast";
import {
    additiveOperators,
    equalityOperators,
    multiplicativeOperators,
    relationalOperators,
    unaryOperators,
} from "./operators";
import { identifierRegex, Line, numberRegex } from "./tokenizer";

// Precedence names ("parseSomePrecedence" methods below) are borrowed from
// the C# compiler's source code, since C# has a pretty sane order of
// precedence. Look for "private enum Precedence" in:
// https://github.com/dotnet/roslyn/blob/main/src/Compilers/CSharp/Portable/Parser/LanguageParser.cs
// This code is based on revision:
// https://github.com/dotnet/roslyn/blob/0c31b36b31a1ebebc38e1e09a61e44e41a84abd2/src/Compilers/CSharp/Portable/Parser/LanguageParser.cs#L10309

export type StatementWithSource = Statement & { source: Line };

class TokenStream {
    readonly line: Line;
    private readonly tokens: string[];

    constructor(line: Line) {
        this.line = line;
        this.tokens = [...line.tokens];
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

// Helper functions

function parseAtom(
    description: string,
    tokens: TokenStream,
    ...regexes: RegExp[]
) {
    const value = tokens.next();
    if (!regexes.some((regex) => regex.exec(value))) {
        throw new Error(`Expected ${description} but found: ${value}`);
    }

    return value;
}

function parseBinary(
    tokens: TokenStream,
    operatorMetadata: Record<string, { op: string } | { not: string }>,
    next: (tokens: TokenStream) => Expression
): Expression {
    let result = next(tokens);

    const operators = Object.keys(operatorMetadata);
    while (tokens.peek(0, operators)) {
        const operator = tokens.next() as BinaryOperator;
        const rvalue = next(tokens);
        result = { type: "binaryOperation", lvalue: result, operator, rvalue };
    }

    return result;
}

// Main parser logic

function parseIdentifier(tokens: TokenStream): string {
    return parseAtom("identifier", tokens, identifierRegex);
}

function parseIdentifierOrNumber(tokens: TokenStream): string {
    return parseAtom(
        "identifier or number",
        tokens,
        numberRegex,
        identifierRegex
    );
}

function parseValue(tokens: TokenStream): Expression {
    if (tokens.peek(0, "(")) {
        tokens.next("(");
        const parenthesizedExpression = parseExpression(tokens);
        tokens.next(")");
        return parenthesizedExpression;
    }

    return parseIdentifierOrNumber(tokens);
}

function parseUnary(tokens: TokenStream): Expression {
    if (tokens.peek(0, unaryOperators)) {
        const operator = tokens.next() as UnaryOperator;
        const value = parseUnary(tokens);
        return { type: "unaryOperation", operator, value };
    }

    return parseValue(tokens);
}

function parseMultiplicative(tokens: TokenStream): Expression {
    return parseBinary(tokens, multiplicativeOperators, parseUnary);
}

function parseAdditive(tokens: TokenStream): Expression {
    return parseBinary(tokens, additiveOperators, parseMultiplicative);
}

function parseRelational(tokens: TokenStream): Expression {
    return parseBinary(tokens, relationalOperators, parseAdditive);
}

function parseEquality(tokens: TokenStream): Expression {
    return parseBinary(tokens, equalityOperators, parseRelational);
}

const parseExpression = parseEquality;

function parseStatement(tokens: TokenStream): Statement {
    if (tokens.peek(1, ":")) {
        const label = parseIdentifier(tokens);
        tokens.next(":");
        return { type: "label", label };
    }

    if (tokens.peek(0, "end")) {
        tokens.next();
        return { type: "end" };
    }

    if (tokens.peek(0, "goto")) {
        tokens.next();
        const label = parseIdentifier(tokens);
        return { type: "goto", label };
    }

    if (tokens.peek(0, "if")) {
        tokens.next("if");
        const condition = parseExpression(tokens);
        return { type: "if", condition };
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

    throw new Error(
        `Unrecognized syntax in line ${tokens.line.lineNumber}: ${tokens.line.text}`
    );
}

function lineToStatement(line: Line): StatementWithSource {
    const tokenStream = new TokenStream(line);

    const statement = parseStatement(tokenStream);
    tokenStream.verifyEmpty();

    return { ...statement, source: line };
}

export function linesToStatements(lines: Line[]): StatementWithSource[] {
    return lines.map(lineToStatement);
}
