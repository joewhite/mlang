import { Expression, Statement } from "./ast";
import { binaryOperators } from "./operators";
import { UnreachableCaseError } from "./utils";

class Emitter {
    private nextTempVariableNumber = 0;
    private readonly instructions: string[] = [];

    resolveExpressionToVariable(expression: Expression): string {
        if (typeof expression === "string") {
            return expression;
        }

        // Lazy-generate the variable name at the last moment, when the actual
        // instruction is being generated, to make sure the variables are in
        // increasing order in the final generated code, even when we're using
        // recursion to generate that code. The increasing variable names
        // aren't strictly a requirement, but they make the output easier to
        // read, and test expectations easier to write.
        let variable = "";
        this.assign(() => {
            variable = `$temp${this.nextTempVariableNumber++}`;
            return variable;
        }, expression);
        return variable;
    }

    assign(target: () => string, value: Expression): void {
        if (typeof value === "string") {
            this.instructions.push(`set ${target()} ${value}`);
            return;
        }

        if (value.type === "unaryOperation") {
            const { operator } = value;
            switch (operator) {
                case "-": {
                    const opValue = this.resolveExpressionToVariable(
                        value.value
                    );
                    this.instructions.push(`op sub ${target()} 0 ${opValue}`);
                    return;
                }

                default:
                    throw new UnreachableCaseError(operator);
            }
        }

        const lvalue = this.resolveExpressionToVariable(value.lvalue);
        const operation = binaryOperators[value.operator];
        const rvalue = this.resolveExpressionToVariable(value.rvalue);
        this.instructions.push(
            `op ${operation} ${target()} ${lvalue} ${rvalue}`
        );
    }

    emit(statement: Statement): void {
        const { type } = statement;
        switch (type) {
            case "assignment":
                this.assign(() => statement.lvalue, statement.rvalue);
                break;
            case "end":
                this.instructions.push(`end`);
                break;
            case "print": {
                const value = this.resolveExpressionToVariable(statement.value);
                this.instructions.push(`print ${value}`);
                break;
            }

            default:
                throw new UnreachableCaseError(type);
        }
    }

    getInstructions(): readonly string[] {
        return this.instructions;
    }
}

export function emit(statements: Statement[]): readonly string[] {
    const emitter = new Emitter();
    statements.forEach((statement) => {
        emitter.emit(statement);
    });
    return emitter.getInstructions();
}
