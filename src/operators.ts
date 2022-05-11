/* eslint-disable @typescript-eslint/naming-convention */
export const additiveOperators = {
    "+": "add",
    "-": "sub",
} as const;
export const multiplicativeOperators = {
    "*": "mul",
    "/": "div",
    "%": "mod",
    "//": "idiv",
} as const;
export const binaryOperators = {
    ...additiveOperators,
    ...multiplicativeOperators,
} as const;
/* eslint-enable @typescript-eslint/naming-convention */

export const assignmentOperators = ["="] as const;
export const labelOperators = [":"] as const;
export const parentheticalOperators = ["(", ")"] as const;
export const unaryOperators = ["-"] as const;

export const allOperators = [
    ...Object.keys(binaryOperators),
    ...assignmentOperators,
    ...labelOperators,
    ...parentheticalOperators,
    ...unaryOperators,
] as const;
