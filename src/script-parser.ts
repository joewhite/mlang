import { parseLine, Statement } from "./line-parser";

export type ScriptStatement = Statement & { children?: Statement[] };

export function parseScript(...lines: string[]): ScriptStatement[] {
    const model: Statement[] = [];
    for (const line of lines) {
        const statement = parseLine(line);
        if (statement) {
            model.push(statement);
        }
    }

    return model;
}
