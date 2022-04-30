function lineToTokens(line: string): string[] {
    const results: string[] = [];

    while (line !== "") {
        const matches = /^(\w+|=)/.exec(line);
        if (matches) {
            const match = matches[1];
            results.push(match);
            line = line.substring(match.length).trim();
        } else {
            throw new Error("Unexpected token at: " + line);
        }
    }

    return results;
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
