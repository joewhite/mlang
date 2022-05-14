import { Statement } from "./ast";
import { StatementWithSource } from "./parser";

class BlockBuilder {
    private readonly statements: StatementWithSource[];

    constructor(statements: StatementWithSource[]) {
        this.statements = statements;
    }

    execute(): Statement[] {
        if (this.statements[0]?.source.indent > 0) {
            throw new Error("Invalid indentation");
        }

        return this.parseBlockContents(0);
    }

    private parseBlockContents(minIndent: number): Statement[] {
        const results: StatementWithSource[] = [];

        let statement: StatementWithSource | undefined;
        while ((statement = this.nextIfIndentIsAtLeast(minIndent))) {
            if (
                results.length &&
                statement.source.indent !== results[0].source.indent
            ) {
                throw new Error("Invalid indentation");
            }

            const block = this.statementToBlock(statement);

            results.push(block);
        }

        return results;
    }

    private statementToBlock(
        statement: StatementWithSource
    ): StatementWithSource {
        return statement;
    }

    private nextIfIndentIsAtLeast(
        minIndent: number
    ): StatementWithSource | undefined {
        if (this.statements[0]?.source.indent >= minIndent) {
            return this.statements.shift();
        }

        return undefined;
    }
}

export function statementsToBlocks(
    statements: StatementWithSource[]
): Statement[] {
    return new BlockBuilder(statements).execute();
}
