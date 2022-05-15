import { parsedLinesToBlocks } from "./block-builder";
import { emit } from "./emitter";
import { linesToParsedLines } from "./parser";
import { stringsToLines } from "./tokenizer";

export function compile(source: string[]): readonly string[] {
    const lines = stringsToLines(source);
    const statements = linesToParsedLines(lines);
    const blocks = parsedLinesToBlocks(statements);
    return emit(blocks);
}
