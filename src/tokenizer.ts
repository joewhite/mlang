import { allOperators } from "./operators";

export interface Line {
    readonly indent: number;
    readonly tokens: string[];
}

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

function stringToLine(text: string): Line {
    const tokens: string[] = [];

    let remainingText = text.trimStart();
    const indent = text.length - remainingText.length;
    while (remainingText !== "") {
        const match = nextToken(remainingText);
        if (match) {
            tokens.push(match);
            remainingText = remainingText.substring(match.length).trim();
        } else {
            throw new Error("Unexpected token at: " + remainingText);
        }
    }

    return { indent, tokens };
}

export function stringsToLines(text: string[]): Line[] {
    return text.map(stringToLine);
}
