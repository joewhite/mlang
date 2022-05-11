import { emit } from "./emitter";
import { lineToStatement } from "./parser";
import { stringToLine } from "./tokenizer";

export function compile(source: string[]): readonly string[] {
    const tokens = source.map(stringToLine);
    const statements = tokens.map(lineToStatement);
    return emit(statements);
}
