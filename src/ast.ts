import { binaryOperators, unaryOperators } from "./operators";

// Expressions

export type UnaryOperator = typeof unaryOperators[0];

export interface UnaryOperation {
    type: "unaryOperation";
    operator: UnaryOperator;
    value: Expression;
}

export type BinaryOperator = keyof typeof binaryOperators;

export interface BinaryOperation {
    type: "binaryOperation";
    lvalue: Expression;
    operator: BinaryOperator;
    rvalue: Expression;
}

export type Expression = string | UnaryOperation | BinaryOperation;

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
