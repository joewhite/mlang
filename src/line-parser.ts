import { lex } from "./lexer";

export const unaryOperators = ["-", "!", "~"] as const;
export type UnaryOperator = typeof unaryOperators[number];

export type UnaryOperation = {
    readonly type: "unaryOperation";
    readonly operator: UnaryOperator;
    readonly value: Expression;
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
    readonly type: "binaryOperation";
    readonly lvalue: Expression;
    readonly operator: BinaryOperator;
    readonly rvalue: Expression;
};

export type Expression = string | UnaryOperation | BinaryOperation;

export type AssignmentStatement = {
    readonly type: "assignment";
    readonly lvalue: string;
    readonly operator: string;
    readonly rvalue: Expression;
};

export type ConditionalStatement = {
    readonly type: "conditional";
    readonly keyword: string;
    readonly condition: Expression;
};

export type EndStatement = {
    readonly type: "end";
};

export type Statement =
    | AssignmentStatement
    | ConditionalStatement
    | EndStatement;

class LineParser {
    private readonly tokens: string[];

    constructor(tokens: string[]) {
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
            this.tryParseConditionalStatement() ??
            this.tryParseEndStatement();
        if (!result) {
            if (this.tokens.length) {
                throw new Error("Syntax error at: " + this.tokens[0]);
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

    tryParseEndStatement(): Statement | undefined {
        const keyword = this.peek(0, "end");
        if (!keyword) {
            return undefined;
        }

        this.next();
        return { type: "end" };
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
        // We don't need to be as exacting as the lexer, but at least
        // spot-check that it's not an operator or something
        const regex = /^@?[\w.]+$/u;

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
        const token = this.tokens[index];
        return values.includes(token as T) ? (token as T) : undefined;
    }

    private next(): string {
        const token = this.tokens.shift();

        if (!token) {
            throw new Error("Unexpected end of line");
        }

        return token;
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

export function parseLine(input: string): Statement | undefined;
export function parseLine<T>(input: string, rule: (parser: LineParser) => T): T;
export function parseLine(
    input: string,
    rule?: (parser: LineParser) => unknown
): unknown {
    const tokens = lex(input);
    const parser = new LineParser(tokens);
    const result = rule ? rule(parser) : parser.tryParseLine();

    if (tokens.length > 0) {
        throw new Error(
            `Expected end of line but found "${tokens[0]}" in line: ${input}`
        );
    }

    return result;
}
