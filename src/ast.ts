// Expressions

import { binaryOperators } from "./operators";

export type BinaryOperator = keyof typeof binaryOperators;

export interface BinaryOperation {
    type: "binaryOperation";
    lvalue: Expression;
    operator: BinaryOperator;
    rvalue: Expression;
}

export type Expression = string | BinaryOperation;

// Statements

export interface EndStatement {
    readonly type: "end";
}

export interface AssignmentStatement {
    readonly type: "assignment";
    readonly lvalue: string;
    readonly rvalue: Expression;
}

export type Statement = EndStatement | AssignmentStatement;
