import { Expression } from "./expressions";
import { InputLine } from "./tokenizer";

export interface AssignmentLine {
    readonly type: "assignment";
    readonly lvalue: string;
    readonly rvalue: Expression;
}

export interface EndLine {
    readonly type: "end";
}

export interface GotoLine {
    readonly type: "goto";
    readonly label: string;
}

export interface IfLine {
    readonly type: "if";
    readonly condition: Expression;
}

export interface LabelLine {
    readonly type: "label";
    readonly label: string;
}

export interface PrintLine {
    readonly type: "print";
    readonly value: Expression;
}

export type BareLine =
    | AssignmentLine
    | EndLine
    | GotoLine
    | IfLine
    | LabelLine
    | PrintLine;

export type ParsedLine = BareLine & { source: InputLine };
