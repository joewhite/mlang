import { Expression } from "./expressions";
import { binaryOperators } from "./operators";
import { Statement } from "./statements";
import { UnreachableCaseError } from "./utils";

const conditionOperators = ["==", "!=", "<", "<=", ">", ">=", "==="] as const;

type ConditionOperator = typeof conditionOperators[number];

function isConditionOperator(operator: string): operator is ConditionOperator {
    return conditionOperators.includes(operator as ConditionOperator);
}

interface Condition {
    lvalue: string;
    operator: ConditionOperator;
    rvalue: string;
}

interface JumpInstruction {
    readonly type: "jump";
    readonly label: string;
    readonly operator: string;
    readonly lvalue: string;
    readonly rvalue: string;
}

type Instruction = string | JumpInstruction;

class Emitter {
    private nextTempLabelNumber = 0;
    private nextTempVariableNumber = 0;
    private readonly instructions: Instruction[] = [];
    private readonly labels: Map<string, number> = new Map();

    nextTempVariableName(): string {
        return `$temp${this.nextTempVariableNumber++}`;
    }

    nextTempLabel(): string {
        return `$label${this.nextTempLabelNumber++}`;
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

    emitAll(statements: Statement[]) {
        statements.forEach((statement) => {
            this.emit(statement);
        });
    }

    getInstructions(): readonly string[] {
        return this.instructions.map(this.resolveInstruction.bind(this));
    }

    private emit(statement: Statement): void {
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
                    operator: "always",
                    lvalue: "0",
                    rvalue: "0",
                });
                break;

            case "if": {
                const ifLabel = this.nextTempLabel();
                const endLabel = this.nextTempLabel();

                const condition = this.getCondition(statement.condition);
                // Conditionally jump to the "if" block
                this.instructions.push({
                    type: "jump",
                    label: ifLabel,
                    lvalue: condition.lvalue,
                    operator: binaryOperators[condition.operator].op,
                    rvalue: condition.rvalue,
                });

                // End of "else" block - jump to end
                this.instructions.push({
                    type: "jump",
                    label: endLabel,
                    operator: "always",
                    lvalue: "0",
                    rvalue: "0",
                });

                // Start of "if" block
                this.addLabel(ifLabel);
                this.emitAll(statement.ifBlock);

                this.addLabel(endLabel);
                break;
            }

            case "label":
                if (this.labels.has(statement.label)) {
                    throw new Error(`Duplicate label "${statement.label}"`);
                }

                this.addLabel(statement.label);
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

    private getCondition(expression: Expression): Condition {
        if (
            typeof expression !== "string" &&
            expression.type === "binaryOperation"
        ) {
            if (isConditionOperator(expression.operator)) {
                // The expression is a binary operation using an operator
                // that's supported by the jump instruction. Convert it to
                // a Condition.
                const lvalue = this.resolveExpressionToVariable(
                    expression.lvalue
                );
                const rvalue = this.resolveExpressionToVariable(
                    expression.rvalue
                );
                return {
                    lvalue,
                    operator: expression.operator,
                    rvalue,
                };
            }
        }

        // In all other cases, return "expression != 0".
        return {
            lvalue: this.resolveExpressionToVariable(expression),
            operator: "!=",
            rvalue: "0",
        };
    }

    private resolveInstruction(instruction: Instruction): string {
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

                return `jump ${jumpOffset} ${instruction.operator} ${instruction.lvalue} ${instruction.rvalue}`;
            }

            default:
                throw new UnreachableCaseError(instruction.type);
        }
    }

    private addLabel(label: string) {
        this.labels.set(label, this.instructions.length);
    }
}

export function emit(statements: Statement[]): readonly string[] {
    const emitter = new Emitter();
    emitter.emitAll(statements);
    return emitter.getInstructions();
}
