/**
 * MathLab — LabTech Equações
 * BalanceModel
 *
 * Responsabilidade:
 * Representar a balança como uma representação concreta
 * de uma relação matemática entre dois membros.
 *
 * Princípio arquitetural:
 * BalanceModel não desenha.
 * BalanceModel não anima.
 * BalanceModel não conhece Canvas ou DOM.
 *
 * Ele representa o estado concreto da balança.
 */

import { EquationModel } from "../../math/algebra/EquationModel.js";

export class BalanceModel {

    /**
     * Cria uma representação de balança.
     *
     * @param {Object} data
     * @param {Array} data.left
     * @param {Array} data.right
     */
    constructor({
        left = [],
        right = []
    } = {}) {

        this.left = this.normalizeSide(left);
        this.right = this.normalizeSide(right);
    }

    /**
     * Cria uma balança a partir de uma equação.
     *
     * Exemplo:
     *
     * x + 3 = 8
     *
     * torna-se:
     *
     * esquerda:
     *   x
     *   3 unidades
     *
     * direita:
     *   8 unidades
     */
    static fromEquation(equation) {

        this.validateEquation(equation);

        return new BalanceModel({

            left: this.convertEquationSide(
                equation,
                "LEFT"
            ),

            right: this.convertEquationSide(
                equation,
                "RIGHT"
            )
        });
    }

    /**
     * Cria uma cópia independente da balança.
     */
    clone() {

        return new BalanceModel({

            left: this.left.map(item => ({
                ...item
            })),

            right: this.right.map(item => ({
                ...item
            }))
        });
    }

    /**
     * Normaliza os elementos de um lado.
     */
    normalizeSide(items) {

        if (!Array.isArray(items)) {
            throw new TypeError(
                "Os elementos de um lado da balança devem ser um array."
            );
        }

        return items.map(item => {

            if (!item || typeof item !== "object") {
                throw new TypeError(
                    "Cada elemento da balança deve ser um objeto."
                );
            }

            if (
                item.type !== "x" &&
                item.type !== "unit"
            ) {
                throw new Error(
                    `Tipo de elemento não suportado: ${item.type}`
                );
            }

            const quantity = Number(
                item.quantity ?? 1
            );

            if (
                !Number.isFinite(quantity) ||
                quantity < 0
            ) {
                throw new TypeError(
                    "A quantidade deve ser um número não negativo."
                );
            }

            const normalized = {
                type: item.type,
                quantity
            };

            /**
             * Somente unidades possuem sinal.
             *
             * Se o sinal não for informado,
             * assumimos +1 para preservar
             * o comportamento anterior.
             */
            if (item.type === "unit") {

                normalized.sign =
                    item.sign === -1
                        ? -1
                        : 1;
            }

            return normalized;
        });
    }

    /**
     * Converte um membro da EquationModel
     * para elementos concretos da balança.
     */
    static convertEquationSide(equation, side) {

        const elements = [];

        const variableCoefficient =
            equation.getVariableCoefficient(side);

        const constantValue =
            equation.getConstantValue(side);

        if (variableCoefficient !== 0) {

            elements.push({
                type: "x",
                quantity: Math.abs(variableCoefficient)
            });
        }

        if (constantValue !== 0) {

            elements.push({
                type: "unit",
                quantity: Math.abs(constantValue),
                sign: constantValue < 0 ? -1 : 1
            });
        }

        return elements;
    }

    /**
     * Retorna um lado específico.
     */
    getSide(side) {

        if (side === "LEFT") {
            return this.left;
        }

        if (side === "RIGHT") {
            return this.right;
        }

        throw new Error(
            `Lado inválido: ${side}`
        );
    }

    /**
     * Adiciona elementos a um lado.
     */
    add(side, type, quantity = 1, sign = 1) {

        this.validateSide(side);
        this.validateType(type);
        this.validateQuantity(quantity);

        const target = this.getSide(side);

        /**
         * Variáveis não possuem sinal nesta representação.
         * Unidades podem ser positivas ou negativas.
         */
        if (type === "unit") {

            sign = sign === -1 ? -1 : 1;

            const existing =
                target.find(
                    item =>
                        item.type === type &&
                        item.sign === sign
                );

            if (existing) {

                existing.quantity += quantity;

            } else {

                target.push({
                    type,
                    quantity,
                    sign
                });
            }

        } else {

            const existing =
                target.find(
                    item => item.type === type
                );

            if (existing) {

                existing.quantity += quantity;

            } else {

                target.push({
                    type,
                    quantity
                });
            }
        }

        return this;
    }

    /**
     * Remove elementos de um lado.
     *
     * Retorna false se não houver quantidade suficiente.
     */
    remove(side, type, quantity = 1, sign = 1) {

        this.validateSide(side);
        this.validateType(type);
        this.validateQuantity(quantity);

        const target = this.getSide(side);

        let existing;

        if (type === "unit") {

            sign = sign === -1 ? -1 : 1;

            existing =
                target.find(
                    item =>
                        item.type === type &&
                        item.sign === sign
                );

        } else {

            existing =
                target.find(
                    item => item.type === type
                );
        }

        if (!existing || existing.quantity < quantity) {
            return false;
        }

        existing.quantity -= quantity;

        if (existing.quantity === 0) {

            const index =
                target.indexOf(existing);

            target.splice(index, 1);
        }

        return true;
    }

    /**
     * Avalia numericamente os dois lados
     * para determinado valor de x.
     */
    evaluate(x) {

        this.validateNumber(x);

        const left =
            this.evaluateSide("LEFT", x);

        const right =
            this.evaluateSide("RIGHT", x);

        return {
            left,
            right,
            balanced: left === right
        };
    }

    /**
     * Avalia um lado.
     */
    evaluateSide(side, x) {

        const elements = this.getSide(side);

        return elements.reduce(
            (total, item) => {

                if (item.type === "x") {
                    return total + item.quantity * x;
                }

                if (item.type === "unit") {

                    const sign =
                        item.sign === -1
                            ? -1
                            : 1;

                    return total +
                        sign * item.quantity;
                }

                return total;
            },
            0
        );
    }

    /**
     * Verifica se os dois lados possuem
     * a mesma quantidade numérica.
     */
    isBalanced(x) {

        return this.evaluate(x).balanced;
    }

    /**
     * Converte o estado da balança
     * para uma estrutura serializável.
     */
    toJSON() {

        return {
            left: this.left.map(item => ({
                ...item
            })),

            right: this.right.map(item => ({
                ...item
            }))
        };
    }

    /**
     * Valida o lado.
     */
    static validateSideValue(side) {

        if (
            side !== "LEFT" &&
            side !== "RIGHT"
        ) {
            throw new Error(
                `Lado inválido: ${side}`
            );
        }
    }

    validateSide(side) {

        BalanceModel.validateSideValue(side);
    }

    /**
     * Valida o tipo de elemento.
     */
    validateType(type) {

        if (
            type !== "x" &&
            type !== "unit"
        ) {
            throw new Error(
                `Tipo de elemento não suportado: ${type}`
            );
        }
    }

    /**
     * Valida quantidade.
     */
    validateQuantity(quantity) {

        if (
            typeof quantity !== "number" ||
            !Number.isFinite(quantity) ||
            quantity <= 0
        ) {
            throw new TypeError(
                "A quantidade deve ser um número positivo."
            );
        }
    }

    /**
     * Valida número.
     */
    validateNumber(value) {

        if (
            typeof value !== "number" ||
            !Number.isFinite(value)
        ) {
            throw new TypeError(
                "O valor deve ser um número finito."
            );
        }
    }

    /**
     * Valida EquationModel.
     */
    static validateEquation(equation) {

        if (!(equation instanceof EquationModel)) {
            throw new TypeError(
                "A balança precisa ser criada a partir de uma EquationModel."
            );
        }
    }
    
}