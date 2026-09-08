/**
 * MathLab — LabTech Equações
 * LearningEvidence
 *
 * Responsabilidade:
 * Representar uma evidência observável da atividade
 * matemática realizada pelo estudante.
 *
 * Princípio arquitetural:
 *
 * Ação
 *   ↓
 * Evidência
 *   ↓
 * Interpretação pela ADA
 *
 * LearningEvidence NÃO diagnostica o estudante.
 * LearningEvidence NÃO classifica pseudoconceitos.
 * LearningEvidence NÃO decide a próxima mediação.
 *
 * Ele registra o acontecimento observado.
 */

export class LearningEvidence {

    constructor({
        missionId,
        concept,
        action,
        representation = null,
        strategy = null,
        mathematicalResult = null,
        transformationCreated = false,
        mediationLevel = null,
        autonomy = null,
        errorType = null,
        metadata = {}
    } = {}) {

        if (
            typeof missionId !== "string" ||
            missionId.trim() === ""
        ) {
            throw new TypeError(
                "missionId deve ser uma string não vazia."
            );
        }

        if (
            typeof concept !== "string" ||
            concept.trim() === ""
        ) {
            throw new TypeError(
                "concept deve ser uma string não vazia."
            );
        }

        if (
            !action ||
            typeof action !== "object"
        ) {
            throw new TypeError(
                "action deve ser um objeto."
            );
        }

        if (
            typeof transformationCreated !== "boolean"
        ) {
            throw new TypeError(
                "transformationCreated deve ser booleano."
            );
        }

        if (
            !metadata ||
            typeof metadata !== "object"
        ) {
            throw new TypeError(
                "metadata deve ser um objeto."
            );
        }

        this.missionId = missionId;
        this.concept = concept;

        this.action = {
            ...action
        };

        this.representation =
            representation;

        this.strategy =
            strategy;

        this.mathematicalResult =
            mathematicalResult;

        this.transformationCreated =
            transformationCreated;

        this.mediationLevel =
            mediationLevel;

        this.autonomy =
            autonomy;

        this.errorType =
            errorType;

        this.metadata = {
            ...metadata
        };

        this.timestamp =
            new Date().toISOString();
    }


    clone() {

        return new LearningEvidence({

            missionId:
                this.missionId,

            concept:
                this.concept,

            action: {
                ...this.action
            },

            representation:
                this.representation,

            strategy:
                this.strategy,

            mathematicalResult:
                this.mathematicalResult,

            transformationCreated:
                this.transformationCreated,

            mediationLevel:
                this.mediationLevel,

            autonomy:
                this.autonomy,

            errorType:
                this.errorType,

            metadata: {
                ...this.metadata
            }

        });
    }


    toJSON() {

        return {

            missionId:
                this.missionId,

            concept:
                this.concept,

            action: {
                ...this.action
            },

            representation:
                this.representation,

            strategy:
                this.strategy,

            mathematicalResult:
                this.mathematicalResult,

            transformationCreated:
                this.transformationCreated,

            mediationLevel:
                this.mediationLevel,

            autonomy:
                this.autonomy,

            errorType:
                this.errorType,

            metadata: {
                ...this.metadata
            },

            timestamp:
                this.timestamp
        };
    }
}