class UnreachableCaseError extends Error {
    constructor(_: never) {
        super();
    }
}

function lineToTokens(line: string): string[] {
    const results: string[] = [];

    while (line !== "") {
        const matches = /^(\w+|[=+])/.exec(line);
        if (matches) {
            const match = matches[1];
            results.push(match);
            line = line.substring(match.length).trim();
        } else {
            throw new Error("Unexpected token at: " + line);
        }
    }

    return results;
}

// Expressions
interface BinaryOperation {
    type: "binaryOperation";
    lvalue: Expression;
    operator: string;
    rvalue: string;
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

    peek(offset: number, value: string): boolean {
        return this.tokens[offset] === value;
    }

    next(): string {
        const result = this.tokens.shift();
        if (!result) {
            throw new Error("Unexpected end of line");
        }

        return result;
    }

    verifyEmpty(): void {
        if (this.tokens.length) {
            throw new Error(
                "Expected end of line but found: " + this.tokens[0]
            );
        }
    }
}

function parseExpression(tokens: TokenStream): Expression {
    let result: Expression = tokens.next();

    while (tokens.peek(0, "+")) {
        const operator = tokens.next();
        const rvalue = tokens.next();
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

        const variable = `$temp${this.nextTempVariableNumber++}`;
        this.assign(variable, expression);
        return variable;
    }

    assign(target: string, value: Expression): void {
        if (typeof value === "string") {
            this.instructions.push(`set ${target} ${value}`);
            return;
        }

        const lvalue = this.resolveExpressionToVariable(value.lvalue);
        this.instructions.push(`op add ${target} ${lvalue} ${value.rvalue}`);
    }

    emit(statement: Statement): void {
        const { type } = statement;
        switch (type) {
            case "assignment":
                this.assign(statement.lvalue, statement.rvalue);
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
