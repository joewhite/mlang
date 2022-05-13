import { Statement } from "./ast";
import { StatementWithSource } from "./parser";

export function statementsToBlocks(
    statements: StatementWithSource[]
): Statement[] {
    for (const statement of statements) {
        if (statement.source.indent > 0) {
            throw new Error("Invalid indentation");
        }
    }

    return statements;
}
