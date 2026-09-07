/**
 * MathLab — LabTech Equações
 * ActionValidator
 *
 * Responsabilidade:
 * Validar estruturalmente as ações realizadas
 * pelo estudante durante uma missão.
 *
 * Não diagnostica o estudante.
 * Não define regras matemáticas.
 * Não altera a equação.
 *
 * ActionValidator
 *      ↓
 * descreve a ação executada
 *
 * EquivalenceRules
 *      ↓
 * determina a transformação matemática
 *
 * ADA
 *      ↓
 * interpreta pedagogicamente a evidência
 */

export class ActionValidator {

    /**
     * Valida uma ação de operação sobre os dois lados.
     *
     * Exemplo:
     *
     * {
     *     type: "subtract",
     *     amount: 4,
     *     sides: ["left", "right"]
     * }
     */
    static validate(action) {

        this.validateActionObject(action);

        const normalizedSides =
            this.normalizeSides(action.sides);

        const validSides =
            normalizedSides.length > 0;

        const bothSides =
            normalizedSides.includes("left") &&
            normalizedSides.includes("right");

        return {

            valid:
                validSides,

            structurallyComplete:
                bothSides,

            action: {
                ...action,
                sides: normalizedSides
            },

            result:
                bothSides
                    ? "both_sides"
                    : "partial_side"

        };
    }


    /**
     * Verifica se a ação preserva estruturalmente
     * a ideia de operar nos dois lados.
     *
     * Esta função NÃO prova equivalência matemática.
     * Ela apenas verifica a estrutura da ação.
     */
    static preservesBothSides(action) {

        const result =
            this.validate(action);

        return result.structurallyComplete;
    }


    /**
     * Normaliza os lados informados.
     *
     * Remove duplicações e mantém apenas
     * "left" e "right".
     */
    static normalizeSides(sides) {

        if (!Array.isArray(sides)) {
            throw new TypeError(
                "sides deve ser um array."
            );
        }

        const allowed =
            new Set([
                "left",
                "right"
            ]);

        const normalized =
            sides.filter(
                side =>
                    allowed.has(side)
            );

        return [
            ...new Set(normalized)
        ];
    }


    /**
     * Valida a estrutura básica da ação.
     */
    static validateActionObject(action) {

        if (
            !action ||
            typeof action !== "object"
        ) {
            throw new TypeError(
                "A ação deve ser um objeto."
            );
        }


        if (
            typeof action.type !== "string" ||
            action.type.trim() === ""
        ) {
            throw new TypeError(
                "A ação deve possuir um tipo."
            );
        }


        if (
            action.amount !== undefined &&
            (
                typeof action.amount !== "number" ||
                !Number.isFinite(action.amount)
            )
        ) {
            throw new TypeError(
                "amount deve ser um número finito."
            );
        }


        if (!Array.isArray(action.sides)) {
            throw new TypeError(
                "A ação deve informar os lados."
            );
        }
    }
}