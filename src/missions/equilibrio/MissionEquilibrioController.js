/**
 * MathLab — LabTech Equações
 * MissionEquilibrioController
 *
 * Orquestra a atividade da Missão Equilíbrio.
 *
 * Responsabilidades:
 * - receber ações da interface;
 * - validar a estrutura da ação;
 * - aplicar regras de equivalência;
 * - simplificar a equação;
 * - registrar transformações;
 * - atualizar a representação da balança;
 * - registrar LearningEvidence.
 *
 * Não renderiza interface.
 * Não diagnostica o estudante.
 */

import { MissionState }
    from "./MissionState.js";

import { ActionValidator }
    from "./ActionValidator.js";

import { LearningEvidence }
    from "./LearningEvidence.js";

import { LearningTrajectoryAnalyzer }
    from "../../core/ada/LearningTrajectoryAnalyzer.js";

import { EquivalenceRules }
    from "../../math/algebra/EquivalenceRules.js";

import { AlgebraicSimplifier }
    from "../../math/algebra/AlgebraicSimplifier.js";

import { EquationTransformation }
    from "../../math/algebra/EquationTransformation.js";

import { BalanceModel }
    from "../../representations/balance/BalanceModel.js";


export class MissionEquilibrioController {

    constructor({
        missionId,
        initialEquation
    } = {}) {

        if (
            typeof missionId !== "string" ||
            missionId.trim() === ""
        ) {
            throw new TypeError(
                "missionId deve ser uma string não vazia."
            );
        }

        if (!initialEquation) {
            throw new TypeError(
                "A missão exige uma equação inicial."
            );
        }

        this.state =
            new MissionState({
                missionId,
                initialEquation
            });

        this.balance =
            BalanceModel.fromEquation(
                initialEquation
            );

        this.concept =
            "equivalence";
    }


    /**
     * Retorna uma cópia da equação atual.
     */
    getCurrentEquation() {

        return this.state
            .currentEquation
            .clone();
    }


    /**
     * Retorna uma cópia da balança atual.
     */
    getBalance() {

        return this.balance.clone();
    }


    /**
     * Registra uma ação sem executar transformação.
     */
    recordAction(action) {

        this.state.recordAction(action);
    }


    /**
     * Registra evidência observável.
     *
     * Evidência não é diagnóstico.
     * ADA interpretará posteriormente.
     */
    _recordEvidence({
        action,
        mathematicalResult,
        transformationCreated,
        errorType = null,
        metadata = {}
    }) {

        const evidence =
            new LearningEvidence({

                missionId:
                    this.state.missionId,

                concept:
                    this.concept,

                action: {
                    ...action
                },

                representation:
                    this.state.currentRepresentation,

                strategy:
                    this.state.strategy,

                mathematicalResult,

                transformationCreated,

                mediationLevel:
                    this.state.mediationLevel,

                autonomy:
                    this.state.mediationLevel === 0
                        ? "autonomous"
                        : "developing",

                errorType,

                metadata: {
                    ...metadata
                }
            });


        this.state.recordEvidence(
            evidence
        );


        return evidence.clone();
    }


    /**
     * Executa uma ação da missão.
     *
     * Tipos:
     * - subtract
     * - add
     * - multiply
     * - divide
     */
    executeAction(action) {

        const validation =
            ActionValidator.validate(action);

        const normalizedAction =
            validation.action;


        /*
         * AÇÃO UNILATERAL
         *
         * É uma interação observável,
         * mas não é transformação de equivalência.
         */

        if (!validation.structurallyComplete) {

            this.state.recordAction({

                ...normalizedAction,

                result:
                    "unbalanced",

                equivalent:
                    false
            });


            const evidence =
                this._recordEvidence({

                    action:
                        normalizedAction,

                    mathematicalResult:
                        "unbalanced",

                    transformationCreated:
                        false,

                    errorType:
                        "unilateral_transformation",

                    metadata: {

                        currentEquation:
                            this.state
                                .currentEquation
                                .toString(),

                        sides:
                            normalizedAction.sides
                                ? [
                                    ...normalizedAction.sides
                                ]
                                : []
                    }
                });


            return {

                action:
                    { ...normalizedAction },

                structurallyComplete:
                    false,

                equivalent:
                    false,

                result:
                    "unbalanced",

                transformation:
                    null,

                equation:
                    this.getCurrentEquation(),

                balance:
                    this.getBalance(),

                rule:
                    null,

                evidence
            };
        }


        /*
         * AÇÃO COMPLETA
         */

        switch (normalizedAction.type) {

            case "subtract":

                return this.subtractFromBothSides(
                    normalizedAction.amount,
                    normalizedAction
                );


            case "add":

                return this.addToBothSides(
                    normalizedAction.amount,
                    normalizedAction
                );


            case "multiply":

                return this.multiplyBothSides(
                    normalizedAction.factor,
                    normalizedAction
                );


            case "divide":

                return this.divideBothSides(
                    normalizedAction.divisor,
                    normalizedAction
                );


            default:

                throw new Error(
                    `Tipo de ação não suportado: ${normalizedAction.type}`
                );
        }
    }


    /**
     * Subtrai a mesma quantidade dos dois lados.
     */
    subtractFromBothSides(
        amount,
        actionOverride = null
    ) {

        return this._applyTransformation(
            EquivalenceRules.subtractFromBothSides,
            amount,
            actionOverride || {
                type: "subtract",
                amount,
                sides: [
                    "left",
                    "right"
                ]
            }
        );
    }


    /**
     * Adiciona a mesma quantidade aos dois lados.
     */
    addToBothSides(
        amount,
        actionOverride = null
    ) {

        return this._applyTransformation(
            EquivalenceRules.addToBothSides,
            amount,
            actionOverride || {
                type: "add",
                amount,
                sides: [
                    "left",
                    "right"
                ]
            }
        );
    }


    /**
     * Multiplica os dois lados pelo mesmo fator.
     */
    multiplyBothSides(
        factor,
        actionOverride = null
    ) {

        return this._applyTransformation(
            EquivalenceRules.multiplyBothSides,
            factor,
            actionOverride || {
                type: "multiply",
                factor,
                sides: [
                    "left",
                    "right"
                ]
            }
        );
    }


    /**
     * Divide os dois lados pelo mesmo divisor.
     */
    divideBothSides(
        divisor,
        actionOverride = null
    ) {

        return this._applyTransformation(
            EquivalenceRules.divideBothSides,
            divisor,
            actionOverride || {
                type: "divide",
                divisor,
                sides: [
                    "left",
                    "right"
                ]
            }
        );
    }


    /**
     * Núcleo comum das transformações.
     */
    _applyTransformation(
        ruleFunction,
        value,
        action
    ) {

        const before =
            this.state.currentEquation.clone();


        const resultado =
            ruleFunction.call(
                EquivalenceRules,
                before,
                value
            );


        const after =
            AlgebraicSimplifier
                .simplifyEquation(
                    resultado.equation
                );


        const transformation =
            new EquationTransformation({

                before,

                action,

                after,

                equivalent:
                    resultado.equivalent,

                rule:
                    resultado.rule
            });


        this.state.recordAction({

            ...action,

            result:
                resultado.equivalent
                    ? "balanced"
                    : "unbalanced",

            equivalent:
                resultado.equivalent
        });


        this.state.recordTransformation(
            transformation
        );


        this.balance =
            BalanceModel.fromEquation(
                after
            );


        const evidence =
            this._recordEvidence({

                action,

                mathematicalResult:
                    resultado.equivalent
                        ? "equivalent"
                        : "unbalanced",

                transformationCreated:
                    true,

                metadata: {

                    before:
                        before.toString(),

                    after:
                        after.toString(),

                    rule:
                        resultado.rule
                }
            });


        return {

            action:
                { ...action },

            structurallyComplete:
                true,

            transformation:
                transformation.clone(),

            equation:
                after.clone(),

            balance:
                this.balance.clone(),

            equivalent:
                resultado.equivalent,

            result:
                resultado.equivalent
                    ? "balanced"
                    : "unbalanced",

            rule:
                resultado.rule,

            evidence
        };
    }


    /**
     * Define a representação atual.
     */
    setRepresentation(representation) {

        this.state.setRepresentation(
            representation
        );
    }


    /**
     * Define a etapa da missão.
     */
    setStage(stage) {

        this.state.setStage(
            stage
        );
    }


    /**
     * Define a estratégia.
     */
    setStrategy(strategy) {

        this.state.setStrategy(
            strategy
        );
    }


    /**
     * Define o nível de mediação.
     */
    setMediationLevel(level) {

        this.state.setMediationLevel(
            level
        );
    }


    /**
     * Analisa a trajetória observável.
     */
    getTrajectoryAnalysis() {

        return LearningTrajectoryAnalyzer.analyze(
            this.state.evidences
        );
    }


    /**
     * Verifica uma solução.
     */
    checkSolution(value) {

        return this.state
            .currentEquation
            .isSolution(value);
    }


    /**
     * Obtém a solução matemática.
     */
    getSolution() {

        return this.state
            .currentEquation
            .getSolution();
    }


    /**
     * Finaliza a missão.
     */
    complete() {

        this.state.complete();
    }


    /**
     * Retorna cópia do estado.
     */
    getState() {

        return this.state.clone();
    }


    /**
     * Serialização.
     */
    toJSON() {

        return {

            mission:
                this.state.toJSON(),

            balance:
                this.balance.toJSON()
        };
    }
}