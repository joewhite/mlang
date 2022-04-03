import { lex, Token, TokenType } from "./lexer";

export type BinaryOperation = {
    type: "binaryOperation";
    lvalue: Expression;
    operator: string;
    rvalue: Expression;
};

export type Expression = string | BinaryOperation;

export type AssignmentStatement = {
    type: "assignment";
    lvalue: string;
    operator: string;
    rvalue: Expression;
};

export type ConditionalStatement = {
    type: "conditional";
    keyword: string;
    condition: Expression;
};

export type Statement = AssignmentStatement | ConditionalStatement;

class Parser {
    private readonly tokens: Token[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    tryParseLine(): Statement | undefined {
        if (this.tokens.length === 0) {
            // Blank or comment
            return undefined;
        }

        return this.parseStatement();
    }

    parseStatement(): Statement {
        const result =
            this.tryParseAssignmentStatement() ??
            this.tryParseConditionalStatement();
        if (!result) {
            if (this.tokens.length) {
                throw new Error("Syntax error at " + this.tokens[0].value);
            }

            throw new Error("Unexpected end of line");
        }

        return result;
    }

    tryParseAssignmentStatement(): Statement | undefined {
        if (!this.peek(1, "assignmentOperator")) {
            return undefined;
        }

        const lvalue = this.next();
        const operator = this.next();
        const rvalue = this.parseExpression();
        return { type: "assignment", lvalue, operator, rvalue };
    }

    tryParseConditionalStatement(): Statement | undefined {
        if (!this.peek(0, "conditionalKeyword")) {
            return undefined;
        }

        const keyword = this.next();
        const condition = this.parseExpression();
        return { type: "conditional", keyword, condition };
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
            this.parseValue()
        );
    }

    parseValue(): Expression {
        return this.next("value");
    }

    private peek(index: number, tokenType: TokenType): string | undefined {
        const token = this.tokens[index];
        const matches = token?.type === tokenType;
        return matches ? token.value : undefined;
    }

    private next(tokenType?: TokenType): string {
        const token = this.tokens.shift();

        if (!token) {
            throw new Error("Unexpected end of line");
        }

        if (tokenType && token.type !== tokenType) {
            throw new Error(
                `Expected ${tokenType} but was ${token.type}: ${token.value}`
            );
        }

        return token.value;
    }

    private parseBinaryExpression(
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
}

export function parse(input: string): Statement | undefined;
export function parse<T>(input: string, rule: (parser: Parser) => T): T;
export function parse(
    input: string,
    rule?: (parser: Parser) => unknown
): unknown {
    const tokens = lex(input);
    const parser = new Parser(tokens);
    const result = rule ? rule(parser) : parser.tryParseLine();

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
