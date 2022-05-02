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
    lvalue: string;
    operator: string;
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

    if (tokens.peek(0, "+")) {
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
    emit(statement: Statement): string[] {
        const { type } = statement;
        switch (type) {
            case "assignment":
                if (typeof statement.rvalue === "string") {
                    return [`set ${statement.lvalue} ${statement.rvalue}`];
                }

                if (typeof statement.rvalue.rvalue === "string") {
                    return [
                        `op add ${statement.lvalue} ${statement.rvalue.lvalue} ${statement.rvalue.rvalue}`,
                    ];
                }

                throw new Error("Expression too complex");
            case "end":
                return [`end`];
            default:
                throw new UnreachableCaseError(type);
        }
    }
}

export function compile(source: string[]): string[] {
    const tokens = source.map(lineToTokens);
    const statements = tokens.map(tokensToStatement);

    const emitter = new Emitter();
    const mlog = statements.flatMap((statement) => emitter.emit(statement));

    return mlog;
}
