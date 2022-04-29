function toMlog(source: string): string {
    const equalsIndex = source.indexOf("=");
    if (equalsIndex >= 0) {
        return `set ${source.substring(0, equalsIndex).trim()} ${source
            .substring(equalsIndex + 1)
            .trim()}`;
    }

    return source;
}

export function compile(source: string[]): string[] {
    return source.map(toMlog);
}
