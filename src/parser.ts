/* eslint-disable @typescript-eslint/member-ordering */ // temporary during refactoring
import { lex, Token, TokenType } from "./lexer";

export type BinaryOperation = {
    type: "binaryOperation";
    lvalue: Expression;
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
    private readonly tokens: Token[];

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

    parseBinaryExpression(
        operatorType: TokenType,
        getNextValue: () => Expression
    ): Expression {
        let expression: Expression = getNextValue();
        while (this.peek(0, operatorType)) {
            const operator = this.next();
            const rvalue = getNextValue();
            expression = {
                type: "binaryOperation",
                lvalue: expression,
                operator,
                rvalue,
            };
        }

        return expression;
    }

    parseExpression(): Expression {
        return this.parseBinaryExpression("comparisonOperator", () =>
            this.parseSum()
        );
    }

    parseSum(): Expression {
        return this.parseBinaryExpression("additiveOperator", () =>
            this.parseTerm()
        );
    }

    parseTerm(): Expression {
        return this.parseBinaryExpression("multiplicativeOperator", () =>
            this.next()
        );
    }
}

function parseRule<T>(input: string, rule: (_: Parser) => T): T | undefined {
    const tokens = lex(input);
    if (tokens.length === 0) {
        // Blank or comment
        return undefined;
    }

    const result = rule(new Parser(tokens));
    if (tokens.length > 0) {
        throw new Error(
            'Expected end of line but found "' +
                tokens[0].value +
                '" in line: ' +
                input
        );
    }

    return result;
}

export function parse(input: string): Statement | undefined {
    return parseRule(input, (p) => p.parseStatement());
}

export function parseExpression(input: string): Expression | undefined {
    return parseRule(input, (p) => p.parseExpression());
}
