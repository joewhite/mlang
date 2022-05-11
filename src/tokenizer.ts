import { allOperators } from "./operators";

const leadingNumberRegex = /^(-?\d+(\.\d+)?|-?\.\d+)/;
const leadingIdentifierRegex = /^([A-Za-z_]\w*)/;
export const numberRegex = new RegExp(
    leadingNumberRegex.source + "$",
    leadingNumberRegex.flags
);
export const identifierRegex = new RegExp(
    leadingIdentifierRegex.source + "$",
    leadingIdentifierRegex.flags
);

export interface Line {
    readonly lineNumber: number;
    readonly text: string;
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
    const numberMatches = leadingNumberRegex.exec(line);
    if (numberMatches) {
        return numberMatches[1];
    }

    const identifierMatches = leadingIdentifierRegex.exec(line);
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

function stringToLine(text: string, index: number): Line | undefined {
    const dedentedText = text.trimStart();
    if (dedentedText === "" || dedentedText.startsWith("#")) {
        return undefined;
    }

    const tokens: string[] = [];
    const indent = text.length - dedentedText.length;

    let remainingText = dedentedText;
    while (remainingText !== "") {
        const match = nextToken(remainingText);
        if (match) {
            tokens.push(match);
            remainingText = remainingText.substring(match.length).trim();
        } else {
            throw new Error("Unexpected token at: " + remainingText);
        }
    }

    return { lineNumber: index + 1, text, indent, tokens };
}

export function stringsToLines(text: string[]): Line[] {
    return text.map(stringToLine).filter((line) => line) as Line[];
}
