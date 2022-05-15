import { Block } from "./blocks";
import { ParsedLine } from "./parsed-lines";

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

    private lineToBlock(line: ParsedLine): Block {
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

export function parsedLinesToBlocks(lines: ParsedLine[]): Block[] {
    return new BlockBuilder(lines).execute();
}
