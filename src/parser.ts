import { lex, Token } from "./lexer";

export type UnaryOperator = "-" | "!" | "~";

export type UnaryOperation = {
    type: "unaryOperation";
    operator: UnaryOperator;
    value: Expression;
};

export const binaryOperators = [
    "+",
    "-",
    "*",
    "/",
    "\\",
    "==",
    "===",
    "!=",
    "!==",
    "<",
    "<=",
    ">",
    ">=",
] as const;
export type BinaryOperator = typeof binaryOperators[number];

export type BinaryOperation = {
    type: "binaryOperation";
    lvalue: Expression;
    operator: BinaryOperator;
    rvalue: Expression;
};

export type Expression = string | UnaryOperation | BinaryOperation;

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
        const operator = this.peek(1, "=");
        if (!operator) {
            return undefined;
        }

        const lvalue = this.next();
        this.next();
        const rvalue = this.parseExpression();
        return { type: "assignment", lvalue, operator, rvalue };
    }

    tryParseConditionalStatement(): Statement | undefined {
        const keyword = this.peek(0, "if", "unless");
        if (!keyword) {
            return undefined;
        }

        this.next();
        const condition = this.parseExpression();
        return { type: "conditional", keyword, condition };
    }

    parseExpression(): Expression {
        return this.parseBinaryExpression(
            ["==", "===", "!=", "!==", "<", "<=", ">", ">="],
            () => this.parseSum()
        );
    }

    parseSum(): Expression {
        return this.parseBinaryExpression(["+", "-"], () => this.parseTerm());
    }

    parseTerm(): Expression {
        return this.parseBinaryExpression(["*", "/", "\\"], () =>
            this.parseFactor()
        );
    }

    parseFactor(): Expression {
        const operator = this.peek(0, "-", "!", "~");
        if (operator) {
            this.next();
            const value = this.parseValue();
            return { type: "unaryOperation", operator, value };
        }

        return this.parseValue();
    }

    parseValue(): Expression {
        const regex = /^(@?[\p{L}_]\w*|\d+(\.\d+)?|\.\d+)$/u;
        const value = this.next();
        if (!regex.test(value)) {
            throw new Error("Expected value but found: " + value);
        }

        return value;
    }

    private peek<T extends string>(
        index: number,
        ...values: T[]
    ): T | undefined {
        const token = this.tokens[index]?.value;
        return values.includes(token as T) ? (token as T) : undefined;
    }

    private next(): string {
        const token = this.tokens.shift();

        if (!token) {
            throw new Error("Unexpected end of line");
        }

        return token.value;
    }

    private parseBinaryExpression(
        operators: BinaryOperator[],
        getNextValue: () => Expression
    ): Expression {
        let expression: Expression = getNextValue();
        let operator: BinaryOperator | undefined;
        while ((operator = this.peek(0, ...operators))) {
            this.next();
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
