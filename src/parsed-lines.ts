import { Expression } from "./expressions";
import { InputLine } from "./tokenizer";

export interface AssignmentStatement {
    readonly type: "assignment";
    readonly lvalue: string;
    readonly rvalue: Expression;
}

export interface EndStatement {
    readonly type: "end";
}

export interface GotoStatement {
    readonly type: "goto";
    readonly label: string;
}

export interface IfHeaderStatement {
    readonly type: "if";
    readonly condition: Expression;
}

export interface LabelStatement {
    readonly type: "label";
    readonly label: string;
}

export interface PrintStatement {
    readonly type: "print";
    readonly value: Expression;
}

export type Statement =
    | AssignmentStatement
    | EndStatement
    | GotoStatement
    | IfHeaderStatement
    | LabelStatement
    | PrintStatement;

export type ParsedLine = Statement & { source: InputLine };
