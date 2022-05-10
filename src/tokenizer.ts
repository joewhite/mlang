import { allOperators } from "./operators";

const operatorsLongestFirst: readonly string[] = (function () {
    const tokens = [...allOperators];
    tokens.sort((a, b) => {
        // Reversed - longest first
        if (a.length < b.length) {
            return 1;
        }

        if (a.length > b.length) {
            return -1;
        }

        return 0;
    });
    return tokens;
})();

function nextToken(line: string): string | undefined {
    const numberMatches = /^(-?\d+(\.\d+)?|-?\.\d+)/.exec(line);
    if (numberMatches) {
        return numberMatches[1];
    }

    const identifierMatches = /^(\w+)/.exec(line);
    if (identifierMatches) {
        return identifierMatches[1];
    }

    for (const token of operatorsLongestFirst) {
        if (line.startsWith(token)) {
            return token;
        }
    }

    return undefined;
}

export function lineToTokens(line: string): string[] {
    const results: string[] = [];

    while (line !== "") {
        const match = nextToken(line);
        if (match) {
            results.push(match);
            line = line.substring(match.length).trim();
        } else {
            throw new Error("Unexpected token at: " + line);
        }
    }

    return results;
}
