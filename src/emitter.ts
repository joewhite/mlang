import { Expression, Statement } from "./ast";
import { binaryOperators } from "./operators";
import { UnreachableCaseError } from "./utils";

interface JumpInstruction {
    readonly type: "jump";
    readonly label: string;
    readonly operation: string;
    readonly lvalue: string;
    readonly rvalue: string;
}

type Instruction = string | JumpInstruction;

class Emitter {
    private nextTempVariableNumber = 0;
    private readonly instructions: Instruction[] = [];
    private readonly labels: Map<string, number> = new Map();

    nextTempVariableName(): string {
        return `$temp${this.nextTempVariableNumber++}`;
    }

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
            variable = this.nextTempVariableName();
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
        if ("op" in operation) {
            this.instructions.push(
                `op ${operation.op} ${target()} ${lvalue} ${rvalue}`
            );
        } else {
            const tempVariable = this.nextTempVariableName();
            this.instructions.push(
                `op ${operation.not} ${tempVariable} ${lvalue} ${rvalue}`
            );
            this.instructions.push(`op equal ${target()} ${tempVariable} 0`);
        }
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
            case "goto":
                this.instructions.push({
                    type: "jump",
                    label: statement.label,
                    operation: "always",
                    lvalue: "0",
                    rvalue: "0",
                });
                break;
            case "if":
                break;
            case "label":
                if (this.labels.has(statement.label)) {
                    throw new Error(`Duplicate label "${statement.label}"`);
                }

                this.labels.set(statement.label, this.instructions.length);
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

    resolveInstruction(instruction: Instruction): string {
        if (typeof instruction === "string") {
            return instruction;
        }

        switch (instruction.type) {
            case "jump": {
                const labelOffset = this.labels.get(instruction.label);
                if (labelOffset === undefined) {
                    throw new Error(`Unknown label "${instruction.label}"`);
                }

                // If we would jump past the end, jump to the beginning instead
                const jumpOffset =
                    labelOffset >= this.instructions.length ? 0 : labelOffset;

                return `jump ${jumpOffset} ${instruction.operation} ${instruction.lvalue} ${instruction.rvalue}`;
            }

            default:
                throw new UnreachableCaseError(instruction.type);
        }
    }

    getInstructions(): readonly string[] {
        return this.instructions.map(this.resolveInstruction.bind(this));
    }
}

export function emit(statements: Statement[]): readonly string[] {
    const emitter = new Emitter();
    statements.forEach((statement) => {
        emitter.emit(statement);
    });
    return emitter.getInstructions();
}
