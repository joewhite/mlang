import { Expression } from "./expressions";
import { BareLine, IfHeaderStatement } from "./parsed-lines";

export interface IfBlock {
    type: "if";
    condition: Expression;
    ifBlock: Block[];
}

export type Block = Exclude<BareLine, IfHeaderStatement> | IfBlock;
