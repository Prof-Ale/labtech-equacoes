/**
 * MathLab — LabTech Equações
 * EquationModel
 *
 * Responsabilidade:
 * Representar matematicamente uma equação de primeiro grau
 * de forma independente da interface, da balança e da ADA.
 *
 * Princípio arquitetural:
 * EquationModel descreve a equação.
 * Não decide se uma transformação é equivalente.
 */

export class EquationModel {
    constructor({ left = [], right = [] } = {}) {
        this.left = this.normalizeSide(left);
        this.right = this.normalizeSide(right);
    }

    /**
     * Cria uma equação a partir de uma estrutura declarativa.
     */
    static from(data) {
        return new EquationModel(data);
    }

    /**
     * Cria uma cópia independente da equação.
     */
    clone() {
        return new EquationModel({
            left: this.left.map(term => ({ ...term })),
            right: this.right.map(term => ({ ...term }))
        });
    }

    /**
     * Normaliza os termos de um membro da equação.
     */
    normalizeSide(terms) {
        if (!Array.isArray(terms)) {
            throw new TypeError("Os termos de um membro devem ser um array.");
        }

        return terms.map(term => {
            if (!term || typeof term !== "object") {
                throw new TypeError("Cada termo deve ser um objeto.");
            }

            if (term.type === "x") {
                return {
                    type: "x",
                    coefficient: Number(term.coefficient ?? 1)
                };
            }

            if (term.type === "constant") {
                return {
                    type: "constant",
                    value: Number(term.value ?? 0)
                };
            }

            throw new Error(`Tipo de termo não suportado: ${term.type}`);
        });
    }

    /**
     * Retorna todos os termos com variável.
     */
    getVariableTerms(side = null) {
        const terms = this.getSide(side);

        return terms.filter(term => term.type === "x");
    }

    /**
     * Retorna todos os termos constantes.
     */
    getConstantTerms(side = null) {
        const terms = this.getSide(side);

        return terms.filter(term => term.type === "constant");
    }

    /**
     * Retorna o coeficiente total de x em um membro.
     */
    getVariableCoefficient(side) {
        return this.getVariableTerms(side)
            .reduce((sum, term) => sum + term.coefficient, 0);
    }

    /**
     * Retorna a soma das constantes de um membro.
     */
    getConstantValue(side) {
        return this.getConstantTerms(side)
            .reduce((sum, term) => sum + term.value, 0);
    }

    /**
     * Retorna um membro específico.
     */
    getSide(side) {
        if (side === "LEFT") {
            return this.left;
        }

        if (side === "RIGHT") {
            return this.right;
        }

        return [...this.left, ...this.right];
    }

    /**
     * Avalia numericamente um membro da equação para determinado x.
     */
    evaluateSide(side, x) {
        const variablePart =
            this.getVariableCoefficient(side) * x;

        const constantPart =
            this.getConstantValue(side);

        return variablePart + constantPart;
    }

    /**
     * Avalia os dois membros da equação.
     */
    evaluate(x) {
        return {
            left: this.evaluateSide("LEFT", x),
            right: this.evaluateSide("RIGHT", x)
        };
    }

    /**
     * Verifica se determinado valor satisfaz a equação.
     */
    isSolution(x, tolerance = 1e-9) {
        const result = this.evaluate(x);

        return Math.abs(result.left - result.right) <= tolerance;
    }

    /**
     * Resolve uma equação linear:
     *
     * ax + b = cx + d
     *
     * retornando:
     * x = (d - b) / (a - c)
     */
    getSolution() {
        const a = this.getVariableCoefficient("LEFT");
        const b = this.getConstantValue("LEFT");

        const c = this.getVariableCoefficient("RIGHT");
        const d = this.getConstantValue("RIGHT");

        const coefficient = a - c;
        const constant = d - b;

        if (coefficient === 0 && constant === 0) {
            return {
                type: "INDETERMINATE",
                value: null
            };
        }

        if (coefficient === 0) {
            return {
                type: "NO_SOLUTION",
                value: null
            };
        }

        return {
            type: "UNIQUE",
            value: constant / coefficient
        };
    }

    /**
     * Representação textual simples da equação.
     */
    toString() {
        return `${this.formatSide(this.left)} = ${this.formatSide(this.right)}`;
    }

    /**
     * Formata um membro da equação.
     */
    formatSide(terms) {
        if (terms.length === 0) {
            return "0";
        }

        return terms
            .map((term, index) => {
                if (term.type === "x") {
                    return this.formatX(term.coefficient, index);
                }

                return this.formatConstant(term.value, index);
            })
            .join(" + ")
            .replace(/\+ -/g, "- ");
    }

    /**
     * Formata termo variável.
     */
    formatX(coefficient) {
        if (coefficient === 1) {
            return "x";
        }

        if (coefficient === -1) {
            return "-x";
        }

        return `${coefficient}x`;
    }

    /**
     * Formata termo constante.
     */
    formatConstant(value) {
        return String(value);
    }
}
