import { Statement } from "./ast";
import { ParsedLine } from "./parser";

class BlockBuilder {
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
        const results: ParsedLine[] = [];

        let line: ParsedLine | undefined;
        while ((line = this.nextIfIndentIsAtLeast(minIndent))) {
            if (
                results.length &&
                line.source.indent !== results[0].source.indent
            ) {
                throw new Error("Invalid indentation");
            }

            const block = this.lineToBlock(line);

            results.push(block);
        }

        return results;
    }

    private lineToBlock(statement: ParsedLine): ParsedLine {
        if (statement.type === "if") {
            this.parseBlockContents(statement.source.indent + 1);
        }

        return statement;
    }

    private nextIfIndentIsAtLeast(minIndent: number): ParsedLine | undefined {
        if (this.lines[0]?.source.indent >= minIndent) {
            return this.lines.shift();
        }

        return undefined;
    }
}

export function parsedLinesToBlocks(statements: ParsedLine[]): Statement[] {
    return new BlockBuilder(statements).execute();
}
