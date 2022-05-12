/* eslint-disable @typescript-eslint/naming-convention */
export const additiveOperators = {
    "+": { op: "add" },
    "-": { op: "sub" },
} as const;
export const equalityOperators = {
    "==": { op: "equal" },
    "!=": { op: "notEqual" },
    "===": { op: "strictEqual" },
    "!==": { not: "strictEqual" },
} as const;
export const relationalOperators = {
    "<": { op: "lessThan" },
    "<=": { op: "lessThanEq" },
    ">": { op: "greaterThan" },
    ">=": { op: "greaterThanEq" },
} as const;
export const multiplicativeOperators = {
    "*": { op: "mul" },
    "/": { op: "div" },
    "%": { op: "mod" },
    "//": { op: "idiv" },
} as const;
export const binaryOperators = {
    ...additiveOperators,
    ...equalityOperators,
    ...multiplicativeOperators,
    ...relationalOperators,
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
