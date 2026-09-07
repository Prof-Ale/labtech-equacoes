/**
 * MathLab — LabTech Equações
 * EquationTransformation
 *
 * Responsabilidade:
 * Representar uma transformação realizada sobre uma equação.
 *
 * Princípio arquitetural:
 * EquationModel representa o estado matemático.
 * EquivalenceRules executa as regras de transformação.
 * EquationTransformation registra o acontecimento.
 *
 * A transformação ainda não pertence à interface nem à ADA.
 */

import { EquationModel } from "./EquationModel.js";

export class EquationTransformation {

    /**
     * Cria um registro de transformação.
     *
     * @param {Object} data
     * @param {EquationModel} data.before
     * @param {Object} data.action
     * @param {EquationModel} data.after
     * @param {boolean} data.equivalent
     * @param {string} data.rule
     */
    constructor({
        before,
        action,
        after,
        equivalent,
        rule
    } = {}) {

        this.validateEquation(before, "before");
        this.validateEquation(after, "after");

        if (!action || typeof action !== "object") {
            throw new TypeError(
                "A transformação precisa possuir uma ação."
            );
        }

        if (typeof equivalent !== "boolean") {
            throw new TypeError(
                "equivalent deve ser booleano."
            );
        }

        if (typeof rule !== "string" || rule.trim() === "") {
            throw new TypeError(
                "A transformação precisa possuir uma regra."
            );
        }

        /*
         * Guardamos cópias para evitar que alterações futuras
         * modifiquem o histórico da transformação.
         */
        this.before = before.clone();
        this.action = { ...action };
        this.after = after.clone();
        this.equivalent = equivalent;
        this.rule = rule;
    }

    /**
     * Cria uma transformação a partir de um resultado
     * produzido por EquivalenceRules.
     */
    static fromRuleResult(before, ruleResult) {

        if (!ruleResult || typeof ruleResult !== "object") {
            throw new TypeError(
                "O resultado da regra é inválido."
            );
        }

        return new EquationTransformation({
            before,
            action: {
                type: ruleResult.rule,
                amount:
                    ruleResult.amount ??
                    ruleResult.factor ??
                    ruleResult.divisor
            },
            after: ruleResult.equation,
            equivalent: ruleResult.equivalent,
            rule: ruleResult.rule
        });
    }

    /**
     * Retorna uma cópia independente da transformação.
     */
    clone() {
        return new EquationTransformation({
            before: this.before,
            action: this.action,
            after: this.after,
            equivalent: this.equivalent,
            rule: this.rule
        });
    }

    /**
     * Representação simples para diagnóstico.
     */
    toJSON() {
        return {
            before: this.before.toString(),
            action: { ...this.action },
            after: this.after.toString(),
            equivalent: this.equivalent,
            rule: this.rule
        };
    }

    /**
     * Valida uma equação.
     */
    validateEquation(equation, fieldName) {

        if (!(equation instanceof EquationModel)) {
            throw new TypeError(
                `${fieldName} deve ser uma instância de EquationModel.`
            );
        }
    }
}