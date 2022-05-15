import { emit } from "./emitter";
import { linesToParsedLines } from "./parser";
import { parsedLinesToStatements } from "./statement-builder";
import { stringsToLines } from "./tokenizer";

export function compile(source: string[]): readonly string[] {
    const lines = stringsToLines(source);
    const parsedLines = linesToParsedLines(lines);
    const statements = parsedLinesToStatements(parsedLines);
    return emit(statements);
}
