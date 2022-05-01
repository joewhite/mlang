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

function tokensToStatement(tokens: string[]): Statement {
    if (tokens.length === 1 && tokens[0] === "end") {
        return { type: "end" };
    }

    if (tokens.length === 3 && tokens[1] === "=") {
        return { type: "assignment", lvalue: tokens[0], rvalue: tokens[2] };
    }

    throw new Error("Syntax error");
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
