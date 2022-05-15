import { Statement } from "./statements";
import { ParsedLine } from "./parsed-lines";

class StatementBuilder {
    private readonly lines: ParsedLine[];

    constructor(lines: ParsedLine[]) {
        this.lines = lines;
    }

    execute(): Statement[] {
        if (this.lines[0]?.source.indent > 0) {
            throw new Error("Invalid indentation");
        }

        return this.parseBlockContents(0);
    }

    private parseBlockContents(minIndent: number): Statement[] {
        const results: Statement[] = [];

        let actualIndent: number | undefined;
        let line: ParsedLine | undefined;
        while ((line = this.nextIfIndentIsAtLeast(minIndent))) {
            if (
                actualIndent !== undefined &&
                line.source.indent !== actualIndent
            ) {
                throw new Error("Invalid indentation");
            }

            actualIndent = line.source.indent;

            const statement = this.lineToStatement(line);
            results.push(statement);
        }

        return results;
    }

    private lineToStatement(line: ParsedLine): Statement {
        if (line.type === "if") {
            const ifBlock = this.parseBlockContents(line.source.indent + 1);
            return { type: "if", condition: line.condition, ifBlock };
        }

        return line;
    }

    private nextIfIndentIsAtLeast(minIndent: number): ParsedLine | undefined {
        if (this.lines[0]?.source.indent >= minIndent) {
            return this.lines.shift();
        }

        return undefined;
    }
}

export function parsedLinesToStatements(lines: ParsedLine[]): Statement[] {
    return new StatementBuilder(lines).execute();
}
