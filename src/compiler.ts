import { UnreachableCaseError } from "ts-essentials";
import { ScriptStatement } from "./script-parser";

export function compile(statements: ScriptStatement[]): string[] {
    const mlog: string[] = [];

    for (const statement of statements) {
        if (statement.children) {
            throw new Error(
                `Statement of type '${statement.type}' should not have nested children`
            );
        }

        const { type } = statement;
        switch (type) {
            case "assignment":
                if (typeof statement.rvalue === "string") {
                    mlog.push(`set ${statement.lvalue} ${statement.rvalue}`);
                } else {
                    throw new Error("Not implemented");
                }

                break;

            case "conditional":
                throw new Error("Not implemented");

            case "end":
                mlog.push("end");
                break;

            default:
                throw new UnreachableCaseError(type);
        }
    }

    return mlog;
}
