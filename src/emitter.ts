import { BinaryOperation, Expression } from "./expressions";
import { binaryOperators } from "./operators";
import { Block } from "./statements";
import { UnreachableCaseError } from "./utils";

interface JumpInstruction {
    readonly type: "jump";
    readonly label: string;
    readonly operator: string;
    readonly lvalue: string;
    readonly rvalue: string;
}

type Instruction = string | JumpInstruction;

class Emitter {
    private nextTempIdentifierNumber = 0;
    private readonly instructions: Instruction[] = [];
    private readonly labels: Map<string, number> = new Map();

    nextTempIdentifier(): string {
        return `$temp${this.nextTempIdentifierNumber++}`;
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
            variable = this.nextTempIdentifier();
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
            const tempVariable = this.nextTempIdentifier();
            this.instructions.push(
                `op ${operation.not} ${tempVariable} ${lvalue} ${rvalue}`
            );
            this.instructions.push(`op equal ${target()} ${tempVariable} 0`);
        }
    }

    emitAll(blocks: Block[]) {
        blocks.forEach((block) => {
            this.emit(block);
        });
    }

    getInstructions(): readonly string[] {
        return this.instructions.map(this.resolveInstruction.bind(this));
    }

    private emit(block: Block): void {
        const { type } = block;
        switch (type) {
            case "assignment":
                this.assign(() => block.lvalue, block.rvalue);
                break;

            case "end":
                this.instructions.push(`end`);
                break;

            case "goto":
                this.instructions.push({
                    type: "jump",
                    label: block.label,
                    operator: "always",
                    lvalue: "0",
                    rvalue: "0",
                });
                break;

            case "if": {
                const ifLabel = this.nextTempIdentifier();
                const endLabel = this.nextTempIdentifier();

                // Conditionally jump to the "if" block
                this.instructions.push({
                    type: "jump",
                    label: ifLabel,
                    // MASSIVE HACK
                    lvalue: (block.condition as BinaryOperation)
                        .lvalue as string,
                    operator: "equal",
                    rvalue: (block.condition as BinaryOperation)
                        .rvalue as string,
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
                this.emitAll(block.ifBlock);

                this.addLabel(endLabel);
                break;
            }

            case "label":
                if (this.labels.has(block.label)) {
                    throw new Error(`Duplicate label "${block.label}"`);
                }

                this.addLabel(block.label);
                break;

            case "print": {
                const value = this.resolveExpressionToVariable(block.value);
                this.instructions.push(`print ${value}`);
                break;
            }

            default:
                throw new UnreachableCaseError(type);
        }
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

export function emit(blocks: Block[]): readonly string[] {
    const emitter = new Emitter();
    emitter.emitAll(blocks);
    return emitter.getInstructions();
}
