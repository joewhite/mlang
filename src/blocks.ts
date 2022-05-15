import { Expression } from "./expressions";
import { IfHeaderStatement, Statement } from "./parsed-lines";

export interface IfBlock {
    type: "if";
    condition: Expression;
    ifBlock: Block[];
}

export type Block = Exclude<Statement, IfHeaderStatement> | IfBlock;
