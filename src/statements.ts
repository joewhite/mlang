import { Expression } from "./expressions";
import { BareLine, IfLine } from "./parsed-lines";

export interface IfStatement {
    type: "if";
    condition: Expression;
    ifBlock: Statement[];
}

export type Statement = Exclude<BareLine, IfLine> | IfStatement;
