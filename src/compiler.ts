import {
    additiveOperators,
    assignmentOperators,
    binaryOperators,
    multiplicativeOperators,
    parentheticalOperators,
} from "./operators";
import { UnreachableCaseError } from "./utils";

function nextToken(line: string): string | undefined {
    const numberMatches = /^(\d+(\.\d+)?)/.exec(line);
    if (numberMatches) {
        return numberMatches[1];
    }

    const identifierMatches = /^(\w+)/.exec(line);
    if (identifierMatches) {
        return identifierMatches[1];
    }

    for (const token of operatorsLongestFirst) {
        if (line.startsWith(token)) {
            return token;
        }
    }

    return undefined;
}

function lineToTokens(line: string): string[] {
    const results: string[] = [];

    while (line !== "") {
        const match = nextToken(line);
        if (match) {
            results.push(match);
            line = line.substring(match.length).trim();
        } else {
            throw new Error("Unexpected token at: " + line);
        }
    }

    return results;
}

// Expressions

export type BinaryOperator = keyof typeof binaryOperators;

const operatorsLongestFirst: readonly string[] = (function () {
    const tokens = [
        ...assignmentOperators,
        ...parentheticalOperators,
        ...Object.keys(binaryOperators),
    ];
    tokens.sort((a, b) => {
        // Reversed - longest first
        if (a.length < b.length) {
            return 1;
        }

        if (a.length > b.length) {
            return -1;
        }

        return 0;
    });
    return tokens;
})();

interface BinaryOperation {
    type: "binaryOperation";
    lvalue: Expression;
    operator: BinaryOperator;
    rvalue: Expression;
}

type Expression = string | BinaryOperation;

// Statements

interface EndStatement {
    readonly type: "end";
}

interface AssignmentStatement {
    readonly type: "assignment";
    readonly lvalue: string;
    readonly rvalue: Expression;
}

type Statement = EndStatement | AssignmentStatement;

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

function tokensToStatement(tokens: string[]): Statement {
    const tokenStream = new TokenStream(tokens);

    const statement = parseStatement(tokenStream);
    tokenStream.verifyEmpty();

    return statement;
}

class Emitter {
    private nextTempVariableNumber = 0;
    private readonly instructions: string[] = [];

    resolveExpressionToVariable(expression: Expression): string {
        if (typeof expression === "string") {
            return expression;
        }

        // Lazy-generate the variable name at the last moment, when the actual
        // instruction is being generated, to make sure the variables are in
        // increasing order in the final generated code, even when we're using
        // recursion to generate that code. The increasing variable names
        // aren't strictly a requirement, but they make the output easier to
        // read, and test expectations easier to write.
        let variable = "";
        this.assign(() => {
            variable = `$temp${this.nextTempVariableNumber++}`;
            return variable;
        }, expression);
        return variable;
    }

    assign(target: () => string, value: Expression): void {
        if (typeof value === "string") {
            this.instructions.push(`set ${target()} ${value}`);
            return;
        }

        const lvalue = this.resolveExpressionToVariable(value.lvalue);
        const operation = binaryOperators[value.operator];
        const rvalue = this.resolveExpressionToVariable(value.rvalue);
        this.instructions.push(
            `op ${operation} ${target()} ${lvalue} ${rvalue}`
        );
    }

    emit(statement: Statement): void {
        const { type } = statement;
        switch (type) {
            case "assignment":
                this.assign(() => statement.lvalue, statement.rvalue);
                break;
            case "end":
                this.instructions.push(`end`);
                break;
            default:
                throw new UnreachableCaseError(type);
        }
    }

    getInstructions(): readonly string[] {
        return this.instructions;
    }
}

export function compile(source: string[]): readonly string[] {
    const tokens = source.map(lineToTokens);
    const statements = tokens.map(tokensToStatement);

    const emitter = new Emitter();
    statements.forEach((statement) => {
        emitter.emit(statement);
    });
    return emitter.getInstructions();
}
