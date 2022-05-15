import { Expression, IfHeaderStatement, Statement } from "./ast";

export interface IfBlock {
    type: "if";
    condition: Expression;
    ifBlock: Block[];
}

export type Block = Exclude<Statement, IfHeaderStatement> | IfBlock;
