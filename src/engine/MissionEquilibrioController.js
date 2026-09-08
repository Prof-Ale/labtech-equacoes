/**
 * MathLab — LabTech Equações
 * MissionEquilibrioController
 *
 * Responsabilidade:
 * Orquestrar a atividade da Missão Equilíbrio.
 *
 * Não renderiza interface.
 * Não diagnostica o estudante.
 * Não substitui as regras matemáticas.
 *
 * MissionState              → estado da atividade
 * ActionValidator           → valida estrutura da ação
 * EquivalenceRules          → transformações matemáticas válidas
 * AlgebraicSimplifier       → simplificação
 * EquationTransformation    → registro da transformação
 * BalanceModel              → representação concreta
 * LearningEvidence          → evidência observável
 * LearningTrajectoryAnalyzer → análise da trajetória observável
 * VerificationEngine        → verificação matemática
 *
 * Fluxo semântico:
 *
 *      ação do estudante
 *              ↓
 *      ActionValidator
 *              ↓
 *      regra matemática
 *              ↓
 *      simplificação
 *              ↓
 *      EquationTransformation
 *              ↓
 *      LearningEvidence
 *              ↓
 *      MissionState
 *              ↓
 *      BalanceModel
 *              ↓
 *      LearningTrajectoryAnalyzer
 *              ↓
 *             ADA
 *
 * Verificação:
 *
 *      solução proposta
 *              ↓
 *      VerificationEngine
 *              ↓
 *      resultado matemático
 *              ↓
 *      LearningEvidence
 *              ↓
 *      trajetória
 *
 * Importante:
 *
 * O Controller não diagnostica a intenção cognitiva
 * do estudante.
 *
 * Ele registra fatos observáveis da atividade para
 * que ADA possa posteriormente interpretá-los.
 */

import { MissionState }
    from "./MissionState.js";

import { ActionValidator }
    from "./ActionValidator.js";

import { LearningEvidence }
    from "./LearningEvidence.js";

import { LearningTrajectoryAnalyzer }
    from "../core/ada/LearningTrajectoryAnalyzer.js";

import { EquivalenceRules }
    from "../math/algebra/EquivalenceRules.js";

import { AlgebraicSimplifier }
    from "../math/algebra/AlgebraicSimplifier.js";

import { EquationTransformation }
    from "../math/algebra/EquationTransformation.js";

import { VerificationEngine }
    from "../math/algebra/VerificationEngine.js";

import { BalanceModel }
    from "../representations/balance/BalanceModel.js";


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

        /**
         * Conceito central da Missão Equilíbrio.
         *
         * O Controller identifica o domínio da missão,
         * mas não realiza diagnóstico conceitual.
         */
        this.concept =
            "equivalence";
    }


    /**
     * Retorna a equação atual da missão.
     *
     * Uma cópia é devolvida para impedir que
     * a interface altere diretamente o estado interno.
     */
    getCurrentEquation() {

        return this.state.currentEquation.clone();
    }


    /**
     * Retorna uma cópia da representação
     * atual da balança.
     */
    getBalance() {

        return this.balance.clone();
    }


    /**
     * Registra uma ação do estudante.
     *
     * Este método registra apenas a ação.
     * Não executa transformação matemática.
     *
     * A execução semântica deve utilizar
     * executeAction().
     *
     * Mantido para compatibilidade com o motor atual.
     */
    recordAction(action) {

        this.state.recordAction(action);
    }


    /**
     * Cria e registra uma evidência observável.
     *
     * Responsabilidade:
     * transformar o acontecimento da atividade
     * em um objeto LearningEvidence.
     *
     * NÃO interpreta o estudante.
     * NÃO diagnostica pseudoconceitos.
     * NÃO decide mediação.
     *
     * autonomy pode ser explicitamente informado
     * quando a natureza da evidência permitir
     * uma classificação observável mais específica.
     */
    _recordEvidence({
        action,
        mathematicalResult,
        transformationCreated,
        errorType = null,
        autonomy = null,
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
                    autonomy
                    || (
                        this.state.mediationLevel === 0
                            ? "autonomous"
                            : "developing"
                    ),

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
     * Executa uma ação semântica da Missão Equilíbrio.
     *
     * Tipos suportados:
     *
     * subtract
     * add
     * multiply
     * divide
     *
     * Ações parciais não alteram a equação matemática.
     *
     * Elas, porém, geram evidência observável
     * para posterior interpretação pela ADA.
     */
    executeAction(action) {

        const validation =
            ActionValidator.validate(action);

        const normalizedAction =
            validation.action;


        /*
        ==================================================
        AÇÃO ESTRUTURALMENTE INCOMPLETA
        ==================================================
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
                            this.state.currentEquation
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
        ==================================================
        AÇÃO ESTRUTURALMENTE COMPLETA
        ==================================================
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
     * Subtrai a mesma quantidade
     * dos dois lados da equação.
     */
    subtractFromBothSides(
        amount,
        actionOverride = null
    ) {

        const before =
            this.state.currentEquation.clone();


        const resultado =
            EquivalenceRules.subtractFromBothSides(
                before,
                amount
            );


        const after =
            AlgebraicSimplifier.simplifyEquation(
                resultado.equation
            );


        const action =
            actionOverride
            || {
                type: "subtract",
                amount,
                sides: [
                    "left",
                    "right"
                ]
            };


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
     * Adiciona a mesma quantidade
     * aos dois lados da equação.
     */
    addToBothSides(
        amount,
        actionOverride = null
    ) {

        const before =
            this.state.currentEquation.clone();


        const resultado =
            EquivalenceRules.addToBothSides(
                before,
                amount
            );


        const after =
            AlgebraicSimplifier.simplifyEquation(
                resultado.equation
            );


        const action =
            actionOverride
            || {
                type: "add",
                amount,
                sides: [
                    "left",
                    "right"
                ]
            };


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
     * Multiplica os dois lados da equação
     * pelo mesmo fator.
     */
    multiplyBothSides(
        factor,
        actionOverride = null
    ) {

        const before =
            this.state.currentEquation.clone();


        const resultado =
            EquivalenceRules.multiplyBothSides(
                before,
                factor
            );


        const after =
            AlgebraicSimplifier.simplifyEquation(
                resultado.equation
            );


        const action =
            actionOverride
            || {
                type: "multiply",
                factor,
                sides: [
                    "left",
                    "right"
                ]
            };


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
     * Divide os dois lados da equação
     * pelo mesmo divisor.
     *
     * A proteção contra divisão por zero
     * pertence à EquivalenceRules.
     */
    divideBothSides(
        divisor,
        actionOverride = null
    ) {

        const before =
            this.state.currentEquation.clone();


        const resultado =
            EquivalenceRules.divideBothSides(
                before,
                divisor
            );


        const after =
            AlgebraicSimplifier.simplifyEquation(
                resultado.equation
            );


        const action =
            actionOverride
            || {
                type: "divide",
                divisor,
                sides: [
                    "left",
                    "right"
                ]
            };


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
     * Verifica uma solução proposta para a equação atual.
     *
     * Diferentemente de uma transformação,
     * a verificação NÃO modifica a equação.
     *
     * Ela produz uma evidência observável sobre
     * a capacidade do estudante de testar uma solução.
     *
     * Exemplo:
     *
     *     x = 6
     *
     *     verificar 6
     *
     *     2(6) + 7 = 19
     *     19 = 19
     *
     * A verificação pode constituir evidência
     * de autonomia quando realizada com
     * mediação nível 0.
     */
    verifySolution(value) {

        const equation =
            this.state.currentEquation.clone();


        const verification =
            VerificationEngine.verify(
                equation,
                value
            );


        const action = {

            type:
                "verify",

            value,

            sides: [
                "left",
                "right"
            ]
        };


        const mathematicalResult =
            verification.verified
                ? "verified"
                : "not_verified";


        this.state.recordAction({

            ...action,

            result:
                mathematicalResult,

            verified:
                verification.verified
        });


        const evidence =
            this._recordEvidence({

                action,

                mathematicalResult,

                transformationCreated:
                    false,

                errorType:
                    verification.verified
                        ? null
                        : "verification_failed",

                autonomy:
                    verification.verified &&
                    this.state.mediationLevel === 0
                        ? "autonomous"
                        : (
                            this.state.mediationLevel === 0
                                ? "developing"
                                : "developing"
                        ),

                metadata: {

                    equation:
                        equation.toString(),

                    value,

                    left:
                        verification.left,

                    right:
                        verification.right,

                    verified:
                        verification.verified
                }
            });


        return {

            action:
                { ...action },

            verification,

            equation:
                equation.clone(),

            transformation:
                null,

            equivalent:
                verification.verified,

            result:
                mathematicalResult,

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
     * Registra a estratégia utilizada
     * pelo estudante.
     */
    setStrategy(strategy) {

        this.state.setStrategy(
            strategy
        );
    }


    /**
     * Define o nível de mediação.
     *
     * 0 → autonomia
     * 1 → pergunta
     * 2 → relação
     * 3 → ação sugerida
     * 4 → representação
     * 5 → demonstração
     * 6 → explicitação conceitual
     */
    setMediationLevel(level) {

        this.state.setMediationLevel(
            level
        );
    }


    /**
     * Analisa os padrões observáveis
     * da trajetória de aprendizagem.
     *
     * O Controller apenas encaminha as evidências
     * para o LearningTrajectoryAnalyzer.
     *
     * Não realiza diagnóstico.
     * Não interpreta consolidação conceitual.
     * Não decide mediação.
     *
     * Essas responsabilidades permanecem
     * na camada ADA.
     */
    getTrajectoryAnalysis() {

        return LearningTrajectoryAnalyzer.analyze(
            this.state.evidences
        );
    }


    /**
     * Verifica se determinado valor
     * satisfaz a equação atual.
     *
     * Método legado/consulta rápida.
     *
     * Não registra evidência.
     * Para uma verificação pedagógica observável,
     * utilizar verifySolution().
     */
    checkSolution(value) {

        return this.state.currentEquation
            .isSolution(value);
    }


    /**
     * Obtém a solução atual.
     */
    getSolution() {

        return this.state.currentEquation
            .getSolution();
    }


    /**
     * Finaliza a missão.
     */
    complete() {

        this.state.complete();
    }


    /**
     * Retorna uma cópia do estado completo
     * da missão.
     */
    getState() {

        return this.state.clone();
    }


    /**
     * Retorna uma visão serializável
     * da atividade.
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