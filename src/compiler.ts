import { emit } from "./emitter";
import { linesToParsedLines } from "./parser";
import { parsedLinesToBlocks } from "./statement-builder";
import { stringsToLines } from "./tokenizer";

export function compile(source: string[]): readonly string[] {
    const lines = stringsToLines(source);
    const parsedLines = linesToParsedLines(lines);
    const blocks = parsedLinesToBlocks(parsedLines);
    return emit(blocks);
}
