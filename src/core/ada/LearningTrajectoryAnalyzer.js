/**
 * LearningTrajectoryAnalyzer
 *
 * Analisa evidências observáveis produzidas durante uma missão.
 *
 * Responsabilidade:
 * - identificar padrões na trajetória de aprendizagem;
 * - descrever mudanças observáveis;
 * - não realizar diagnóstico pedagógico;
 * - não inferir consolidação conceitual.
 *
 * Arquitetura:
 *
 * LearningEvidence[]
 *        ↓
 * LearningTrajectoryAnalyzer
 *        ↓
 * padrões observáveis
 *        ↓
 * ADA / DiagnosticEngine
 *        ↓
 * hipótese diagnóstica + mediação
 */

export class LearningTrajectoryAnalyzer {

    /**
     * Analisa uma trajetória composta por LearningEvidence.
     *
     * @param {Array} evidences
     * @returns {Object}
     */
    static analyze(evidences = []) {

        if (!Array.isArray(evidences)) {
            throw new TypeError("evidences deve ser um array.");
        }

        const validEvidences = evidences.filter(Boolean);

        if (validEvidences.length === 0) {
            return {
                totalEvidence: 0,
                equivalentTransformations: 0,
                unilateralTransformations: 0,
                mediationReduction: false,
                autonomyProgression: false,
                representationProgression: false,
                strategyConsistency: true
            };
        }

        const mediationLevels = validEvidences
            .map(evidence => evidence.mediationLevel)
            .filter(level => Number.isFinite(level));

        const representations = validEvidences
            .map(evidence => evidence.representation)
            .filter(Boolean);

        const strategies = validEvidences
            .map(evidence => evidence.strategy)
            .filter(strategy => strategy !== null && strategy !== undefined);

        const firstMediation = mediationLevels[0];
        const lastMediation = mediationLevels[mediationLevels.length - 1];

        return {
            totalEvidence: validEvidences.length,

            equivalentTransformations:
                validEvidences.filter(
                    evidence =>
                        evidence.mathematicalResult === "equivalent" &&
                        evidence.transformationCreated === true
                ).length,

            unilateralTransformations:
                validEvidences.filter(
                    evidence =>
                        evidence.errorType === "unilateral_transformation"
                ).length,

            mediationReduction:
                mediationLevels.length >= 2 &&
                lastMediation < firstMediation,

            autonomyProgression:
                mediationLevels.length >= 2 &&
                firstMediation > 0 &&
                lastMediation === 0,

            representationProgression:
                this._hasRepresentationProgression(representations),

            strategyConsistency:
                this._hasStrategyConsistency(strategies)
        };
    }

    /**
     * Verifica se houve progressão representacional observável.
     *
     * A ordem considerada é:
     *
     * concreta → visual → textual → simbólica/abstrata
     *
     * Não significa que uma representação "é melhor" que outra.
     * Apenas permite observar uma trajetória de mudança representacional.
     *
     * @param {Array} representations
     * @returns {Boolean}
     */
    static _hasRepresentationProgression(representations) {

        if (representations.length < 2) {
            return false;
        }

        const levels = representations
            .map(representation =>
                this._representationLevel(representation)
            )
            .filter(level => level !== null);

        if (levels.length < 2) {
            return false;
        }

        return levels.some(
            (level, index) =>
                index > 0 && level > levels[index - 1]
        );
    }

    /**
     * Normaliza representações do domínio.
     *
     * @param {String} representation
     * @returns {Number|null}
     */
    static _representationLevel(representation) {

        const levels = {
            concrete: 0,
            visual: 1,
            textual: 2,
            symbolic: 3,
            abstract: 3,

            CONCRETA: 0,
            VISUAL: 1,
            TEXTUAL: 2,
            ABSTRATA: 3
        };

        return Object.prototype.hasOwnProperty.call(
            levels,
            representation
        )
            ? levels[representation]
            : null;
    }

    /**
     * Verifica se as estratégias utilizadas permaneceram consistentes.
     *
     * Estratégias nulas/ausentes não entram na comparação.
     *
     * @param {Array} strategies
     * @returns {Boolean}
     */
    static _hasStrategyConsistency(strategies) {

        if (strategies.length <= 1) {
            return true;
        }

        return strategies.every(
            strategy => strategy === strategies[0]
        );
    }
}