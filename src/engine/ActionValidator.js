/**
 * MathLab — LabTech Equações
 * ActionValidator
 *
 * Responsabilidade:
 * Validar estruturalmente uma ação realizada pelo estudante.
 *
 * Princípio arquitetural:
 *
 * ActionValidator
 *      ↓
 * verifica a estrutura da ação
 *
 * MissionEquilibrioController
 *      ↓
 * executa a ação matemática
 *
 * EquivalenceRules
 *      ↓
 * determina a transformação matemática
 *
 * ADA
 *      ↓
 * posteriormente interpreta a evidência
 *
 * Importante:
 * ActionValidator NÃO diagnostica o estudante.
 * ActionValidator NÃO decide equivalência matemática.
 */

export class ActionValidator {

    static SUPPORTED_ACTIONS = [
        "subtract",
        "add",
        "multiply",
        "divide"
    ];

    static validate(action) {

        if (!action || typeof action !== "object") {
            throw new TypeError(
                "A ação deve ser um objeto."
            );
        }

        if (
            typeof action.type !== "string" ||
            action.type.trim() === ""
        ) {
            throw new TypeError(
                "A ação precisa possuir um tipo."
            );
        }

        const type = action.type.trim().toLowerCase();

        if (!this.SUPPORTED_ACTIONS.includes(type)) {
            throw new Error(
                `Tipo de ação não suportado: ${action.type}`
            );
        }

        const normalizedAction = {
            ...action,
            type,
            sides: this.normalizeSides(action.sides)
        };

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

        if (
            action.factor !== undefined &&
            (
                typeof action.factor !== "number" ||
                !Number.isFinite(action.factor)
            )
        ) {
            throw new TypeError(
                "factor deve ser um número finito."
            );
        }

        if (
            action.divisor !== undefined &&
            (
                typeof action.divisor !== "number" ||
                !Number.isFinite(action.divisor)
            )
        ) {
            throw new TypeError(
                "divisor deve ser um número finito."
            );
        }

        const structurallyComplete =
            this.preservesBothSides(normalizedAction);

        return {
            valid: true,
            structurallyComplete,
            action: normalizedAction,
            result: structurallyComplete
                ? "both_sides"
                : "partial_side"
        };
    }

    static normalizeSides(sides) {

        if (!Array.isArray(sides)) {
            return [];
        }

        return [
            ...new Set(
                sides
                    .filter(side => typeof side === "string")
                    .map(side => side.trim().toLowerCase())
                    .filter(side =>
                        side === "left" ||
                        side === "right"
                    )
            )
        ];
    }

    static preservesBothSides(action) {

        const sides = this.normalizeSides(
            action?.sides
        );

        return (
            sides.includes("left") &&
            sides.includes("right")
        );
    }
}