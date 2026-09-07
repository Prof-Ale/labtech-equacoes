/**
 * MathLab — LabTech Equações
 * AlgebraicSimplifier
 *
 * Responsabilidade:
 * Simplificar expressões algébricas representadas
 * como conjuntos de termos.
 *
 * Princípio arquitetural:
 *
 * EquationModel
 *      ↓
 * representa o estado matemático
 *
 * EquivalenceRules
 *      ↓
 * realiza transformações
 *
 * AlgebraicSimplifier
 *      ↓
 * organiza e combina termos equivalentes
 *
 * EquationTransformation
 *      ↓
 * registra o acontecimento
 *
 * O simplificador não decide se uma transformação
 * é matematicamente válida. Ele apenas simplifica
 * a representação resultante.
 */

import { EquationModel } from "./EquationModel.js";

export class AlgebraicSimplifier {

    /**
     * Simplifica uma equação inteira.
     *
     * Cada membro é simplificado
     * independentemente.
     *
     * Exemplo:
     *
     * 2x + 4 - 4 = 14 - 4
     *
     * torna-se:
     *
     * 2x = 10
     */
    static simplifyEquation(equation) {

        this.validateEquation(equation);

        return new EquationModel({

            left: this.simplifySide(equation.left),

            right: this.simplifySide(equation.right)

        });
    }


    /**
     * Simplifica um único membro da equação.
     *
     * Regras:
     *
     * 1. Combina termos em x.
     * 2. Combina constantes.
     * 3. Remove termos cujo resultado seja zero.
     *
     * Exemplo:
     *
     * 2x + 3x + 7 - 2
     *
     * torna-se:
     *
     * 5x + 5
     */
    static simplifySide(terms) {

        if (!Array.isArray(terms)) {
            throw new TypeError(
                "O lado da equação deve ser um array de termos."
            );
        }

        let coefficientX = 0;
        let constantValue = 0;

        for (const term of terms) {

            this.validateTerm(term);

            if (term.type === "x") {

                coefficientX += term.coefficient;

            } else if (term.type === "constant") {

                constantValue += term.value;

            }

        }


        const result = [];


        /*
         * Primeiro registramos o termo em x.
         */

        if (coefficientX !== 0) {

            result.push({

                type: "x",

                coefficient: coefficientX

            });

        }


        /*
         * Depois registramos a constante.
         */

        if (constantValue !== 0) {

            result.push({

                type: "constant",

                value: constantValue

            });

        }


        return result;
    }


    /**
     * Valida a equação recebida.
     */
    static validateEquation(equation) {

        if (!(equation instanceof EquationModel)) {

            throw new TypeError(
                "A simplificação exige uma instância de EquationModel."
            );

        }

    }


    /**
     * Valida um termo algébrico.
     */
    static validateTerm(term) {

        if (!term || typeof term !== "object") {

            throw new TypeError(
                "Termo algébrico inválido."
            );

        }


        if (term.type === "x") {

            if (
                typeof term.coefficient !== "number" ||
                !Number.isFinite(term.coefficient)
            ) {

                throw new TypeError(
                    "O coeficiente de x deve ser um número finito."
                );

            }

            return;
        }


        if (term.type === "constant") {

            if (
                typeof term.value !== "number" ||
                !Number.isFinite(term.value)
            ) {

                throw new TypeError(
                    "O valor da constante deve ser um número finito."
                );

            }

            return;
        }


        throw new TypeError(
            `Tipo de termo desconhecido: ${term.type}`
        );
    }
}