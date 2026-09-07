/**
 * MathLab — LabTech Equações
 * EquivalenceRules
 *
 * Responsabilidade:
 * Definir transformações que preservam ou não
 * a equivalência de uma equação.
 *
 * Princípio arquitetural:
 * EquationModel representa a equação.
 * EquivalenceRules representa as transformações.
 * A interface e a ADA observam essas transformações,
 * mas não definem a matemática.
 */

import { EquationModel } from "./EquationModel.js";

export class EquivalenceRules {

    /**
     * Subtrai uma constante dos dois membros.
     *
     * Exemplo:
     *
     * x + 3 = 8
     * −3 dos dois lados
     * x = 5
     */
    static subtractFromBothSides(equation, amount) {
        this.validateEquation(equation);
        this.validateNumber(amount);

        const result = equation.clone();

        result.left = this.subtractConstant(result.left, amount);
        result.right = this.subtractConstant(result.right, amount);

        return {
            equation: result,
            equivalent: true,
            rule: "SUBTRACT_BOTH_SIDES",
            amount
        };
    }

    /**
     * Adiciona uma constante aos dois membros.
     */
    static addToBothSides(equation, amount) {
        this.validateEquation(equation);
        this.validateNumber(amount);

        const result = equation.clone();

        result.left = this.addConstant(result.left, amount);
        result.right = this.addConstant(result.right, amount);

        return {
            equation: result,
            equivalent: true,
            rule: "ADD_BOTH_SIDES",
            amount
        };
    }

    /**
     * Multiplica os dois membros por um número.
     */
    static multiplyBothSides(equation, factor) {
        this.validateEquation(equation);
        this.validateNumber(factor);

        const result = equation.clone();

        result.left = this.multiplySide(result.left, factor);
        result.right = this.multiplySide(result.right, factor);

        return {
            equation: result,
            equivalent: true,
            rule: "MULTIPLY_BOTH_SIDES",
            factor
        };
    }

    /**
     * Divide os dois membros por um número.
     */
    static divideBothSides(equation, divisor) {
        this.validateEquation(equation);
        this.validateNumber(divisor);

        if (divisor === 0) {
            throw new Error("Não é possível dividir por zero.");
        }

        const result = equation.clone();

        result.left = this.multiplySide(result.left, 1 / divisor);
        result.right = this.multiplySide(result.right, 1 / divisor);

        return {
            equation: result,
            equivalent: true,
            rule: "DIVIDE_BOTH_SIDES",
            divisor
        };
    }

    /**
     * Operação auxiliar:
     * subtrai uma constante de um membro.
     */
    static subtractConstant(terms, amount) {
        return [
            ...terms,
            {
                type: "constant",
                value: -amount
            }
        ];
    }

    /**
     * Operação auxiliar:
     * adiciona uma constante a um membro.
     */
    static addConstant(terms, amount) {
        return [
            ...terms,
            {
                type: "constant",
                value: amount
            }
        ];
    }

    /**
     * Multiplica todos os termos de um membro.
     */
    static multiplySide(terms, factor) {
        return terms.map(term => {

            if (term.type === "x") {
                return {
                    type: "x",
                    coefficient: term.coefficient * factor
                };
            }

            return {
                type: "constant",
                value: term.value * factor
            };
        });
    }

    /**
     * Valida se recebemos uma EquationModel.
     */
    static validateEquation(equation) {
        if (!(equation instanceof EquationModel)) {
            throw new TypeError(
                "A transformação exige uma instância de EquationModel."
            );
        }
    }

    /**
     * Valida valores numéricos.
     */
    static validateNumber(value) {
        if (typeof value !== "number" || !Number.isFinite(value)) {
            throw new TypeError(
                "O valor da transformação deve ser um número finito."
            );
        }
    }
}