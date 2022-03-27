const lexerRules = [
    { type: "value", regex: /^([\p{L}@_]\w*|\d+(\.\d+)?|\.\d+)/u },
    { type: "multiplicativeOperator", regex: /^[*/]/ },
    { type: "additiveOperator", regex: /^[-+]/ },
    { type: "comparisonOperator", regex: /^(===?|<=?|>=?|!==?)/ },
    { type: "assignmentOperator", regex: /^=/ },
] as const;

export type TokenType = typeof lexerRules[number]["type"];

export interface Token {
    type: TokenType;
    value: string;
}

function nextToken(line: string): Token {
    for (const rule of lexerRules) {
        const match = line.match(rule.regex);
        if (match) {
            return { type: rule.type, value: match[0] };
        }
    }

    throw new Error("Could not parse token: " + line);
}

export function lex(line: string): Token[] {
    const results = [];
    line = line.trim();
    while (line && !line.startsWith("#")) {
        const token = nextToken(line);
        results.push(token);
        line = line.substring(token.value.length).trim();
    }

    return results;
}
