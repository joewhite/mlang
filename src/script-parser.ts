import { parseLine, Statement } from "./line-parser";

export type ScriptStatement = Statement & { children?: ScriptStatement[] };

interface LineModel {
    indent: number;
    statement: Statement;
    children: LineModel[];
}

interface IndentMarker {
    indent: number;
    children: LineModel[];
}

function getIndentSize(line: string): number {
    const indentMatch = /^ */.exec(line);
    return indentMatch ? indentMatch[0].length : 0;
}

function last<T>(array: T[]): T {
    return array[array.length - 1];
}

function lineModelToScriptStatement(lineModel: LineModel): ScriptStatement {
    return lineModel.children.length
        ? {
              ...lineModel.statement,
              children: lineModel.children.map(lineModelToScriptStatement),
          }
        : lineModel.statement;
}

export function parseScript(...lines: string[]): ScriptStatement[] {
    const script: LineModel[] = [];
    const currentIndents: IndentMarker[] = [];

    for (const line of lines) {
        const statement = parseLine(line);
        if (statement) {
            const indent = getIndentSize(line);

            const lineModel = {
                indent,
                statement,
                children: [],
            };

            while (last(currentIndents)?.indent >= indent) {
                currentIndents.pop();
            }

            if (currentIndents.length) {
                last(currentIndents).children.push(lineModel);
            } else {
                script.push(lineModel);
            }

            currentIndents.push(lineModel);
        }
    }

    return script.map(lineModelToScriptStatement);
}
