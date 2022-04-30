function lineToTokens(line: string): string[] {
    return line.split(" ");
}

function tokensToMlog(tokens: string[]): string {
    if (tokens.length >= 3) {
        return `set ${tokens[0]} ${tokens[2]}`;
    }

    return tokens[0];
}

export function compile(source: string[]): string[] {
    const tokens = source.map(lineToTokens);
    const mlog = tokens.map(tokensToMlog);
    return mlog;
}
