const tokenRegexes = [
    "@?[\\p{L}_]\\w*", // Value (identifier or number)
    "\\d+(\\.\\d+)?", // Number
    "\\.\\d+", // Decimal number without leading zero
    "[-+*/\\\\~]", // Most single-character operators (unary and binary)
    "={1,3}", // =, ==, and ===
    "!={0,2}", // !, !=, and !==
    "<=?", // < and <=
    ">=?", // > and >=
];
const tokenRegex = new RegExp("^(" + tokenRegexes.join("|") + ")", "u");

function nextToken(line: string): string {
    const match2 = tokenRegex.exec(line);
    if (match2) {
        return match2[0];
    }

    throw new Error("Could not parse token at: " + line);
}

export function lex(line: string): string[] {
    const results = [];
    line = line.trim();
    while (line && !line.startsWith("#")) {
        const token = nextToken(line);
        results.push(token);
        line = line.substring(token.length).trim();
    }

    return results;
}
