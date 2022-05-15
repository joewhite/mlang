import { Block } from "./blocks";
import { ParsedLine } from "./parser";

class BlockBuilder {
    private readonly lines: ParsedLine[];

    constructor(lines: ParsedLine[]) {
        this.lines = lines;
    }

    execute(): Block[] {
        if (this.lines[0]?.source.indent > 0) {
            throw new Error("Invalid indentation");
        }

        return this.parseBlockContents(0);
    }

    private parseBlockContents(minIndent: number): Block[] {
        const results: Block[] = [];

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

            const block = this.lineToBlock(line);
            results.push(block);
        }

        return results;
    }

    private lineToBlock(statement: ParsedLine): Block {
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

export function parsedLinesToBlocks(statements: ParsedLine[]): Block[] {
    return new BlockBuilder(statements).execute();
}
