import { parseLine, Statement } from "./line-parser";

export type ScriptStatement = Statement & { children?: ScriptStatement[] };

interface LineModel {
    indent: number;
    statement: Statement;
    children: LineModel[];
}

function getIndentSize(line: string): number {
    const indentMatch = /^ */.exec(line);
    return indentMatch ? indentMatch[0].length : 0;
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
    const currentIndents: LineModel[] = [];

    for (const line of lines) {
        const statement = parseLine(line);
        if (statement) {
            const indent = getIndentSize(line);

            const lineModel = {
                indent,
                statement,
                children: [],
            };

            while (
                currentIndents[currentIndents.length - 1]?.indent >= indent
            ) {
                currentIndents.pop();
            }

            if (currentIndents.length) {
                currentIndents[currentIndents.length - 1].children.push(
                    lineModel
                );
            } else {
                script.push(lineModel);
            }

            currentIndents.push(lineModel);
        }
    }

    return script.map(lineModelToScriptStatement);
}
