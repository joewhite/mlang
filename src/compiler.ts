import { emit } from "./emitter";
import { tokensToStatement } from "./parser";
import { lineToTokens } from "./tokenizer";

export function compile(source: string[]): readonly string[] {
    const tokens = source.map(lineToTokens);
    const statements = tokens.map(tokensToStatement);
    return emit(statements);
}
