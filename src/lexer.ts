export type Token =
    | { type: "value"; value: string }
    | { type: "operator"; value: string };

export type TokenType = Token["type"];

const lexerRules = [
    { type: "value", regex: /^([\p{L}@_]\w*|\d+(\.\d+)?|\.\d+)/u },
    { type: "operator", regex: /^([-+*/]|={1,3}|<=?|>=?|!==?)/ },
] as const;

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
