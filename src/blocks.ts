import { Expression } from "./expressions";
import { BareLine, IfLine } from "./parsed-lines";

export interface IfBlock {
    type: "if";
    condition: Expression;
    ifBlock: Block[];
}

export type Block = Exclude<BareLine, IfLine> | IfBlock;
