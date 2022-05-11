import { emit } from "./emitter";
import { linesToStatements } from "./parser";
import { stringsToLines } from "./tokenizer";

export function compile(source: string[]): readonly string[] {
    const lines = stringsToLines(source);
    const statements = linesToStatements(lines);
    return emit(statements);
}
