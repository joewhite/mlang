class UnreachableCaseError extends Error {
    constructor(_: never) {
        super();
    }
}

function lineToTokens(line: string): string[] {
    const results: string[] = [];

    while (line !== "") {
        const matches = /^(\w+|=)/.exec(line);
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

interface EndStatement {
    readonly type: "end";
}
interface AssignmentStatement {
    readonly type: "assignment";
    readonly lvalue: string;
    readonly rvalue: string;
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

function parseStatement(tokens: TokenStream): Statement | undefined {
    if (tokens.peek(0, "end")) {
        tokens.next();
        return { type: "end" };
    }

    if (tokens.peek(1, "=")) {
        const lvalue = tokens.next();
        tokens.next();
        const rvalue = tokens.next();
        return { type: "assignment", lvalue, rvalue };
    }

    return undefined;
}

function tokensToStatement(tokens: string[]): Statement {
    const tokenStream = new TokenStream(tokens);

    const statement = parseStatement(tokenStream);
    if (!statement) {
        throw new Error("Syntax error");
    }

    tokenStream.verifyEmpty();
    return statement;
}

function statementToMlog(statement: Statement): string {
    const { type } = statement;
    switch (type) {
        case "assignment":
            return `set ${statement.lvalue} ${statement.rvalue}`;
        case "end":
            return `end`;
        default:
            throw new UnreachableCaseError(type);
    }
}

export function compile(source: string[]): string[] {
    const tokens = source.map(lineToTokens);
    const statements = tokens.map(tokensToStatement);
    const mlog = statements.map(statementToMlog);
    return mlog;
}
