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
 *
 * Fluxo semântico:
 *
 *      ação do estudante
 *              ↓
 *      ActionValidator
 *              ↓
 *      regra matemática
 *              ↓
 *      transformação
 *              ↓
 *      simplificação
 *              ↓
 *      MissionState
 *              ↓
 *      BalanceModel
 *
 * Importante:
 *
 * O Controller não diagnostica a intenção cognitiva
 * do estudante. Ele registra evidências da atividade
 * para que ADA possa posteriormente interpretá-las.
 */

import { MissionState }
    from "./MissionState.js";

import { ActionValidator }
    from "./ActionValidator.js";

import { EquivalenceRules }
    from "../math/algebra/EquivalenceRules.js";

import { AlgebraicSimplifier }
    from "../math/algebra/AlgebraicSimplifier.js";

import { EquationTransformation }
    from "../math/algebra/EquationTransformation.js";

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
     * Este método registra apenas a evidência
     * da ação. Não executa nenhuma transformação.
     *
     * A execução semântica deve utilizar
     * executeAction().
     */
    recordAction(action) {

        this.state.recordAction(action);
    }


    /**
     * Executa uma ação semântica da Missão Equilíbrio.
     *
     * Esta é a principal porta de entrada para
     * a futura interface do MathLab.
     *
     * Exemplo:
     *
     * controller.executeAction({
     *     type: "subtract",
     *     amount: 4,
     *     sides: ["left", "right"]
     * });
     *
     * A ação passa por:
     *
     * 1. validação estrutural;
     * 2. identificação dos lados;
     * 3. aplicação da regra matemática;
     * 4. simplificação;
     * 5. criação da transformação;
     * 6. registro no estado;
     * 7. atualização da balança.
     *
     * Ações parciais não alteram a equação matemática.
     * Elas são evidências importantes para posterior
     * interpretação pela ADA.
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

            /*
             * A ação pode ser uma interação válida
             * do estudante, mas não constitui uma
             * transformação de equivalência.
             *
             * Exemplo:
             *
             * retirar 4 apenas do lado esquerdo.
             *
             * A equação matemática não é alterada.
             *
             * A evidência, entretanto, é registrada
             * para que ADA possa interpretar o evento.
             */

            this.state.recordAction({

                ...normalizedAction,

                result:
                    "unbalanced",

                equivalent:
                    false
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
                    null
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


            default:

                throw new Error(
                    `Tipo de ação não suportado: ${normalizedAction.type}`
                );
        }
    }


    /**
     * Subtrai a mesma quantidade
     * dos dois lados da equação.
     *
     * Este método representa a operação matemática.
     *
     * O parâmetro actionOverride existe para permitir
     * que executeAction() preserve exatamente a ação
     * validada pelo ActionValidator.
     *
     * Quando chamado diretamente, o método cria
     * sua própria ação semântica.
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


        /*
         * A ação é registrada exatamente uma vez.
         *
         * Isso corrige a duplicação existente quando
         * recordAction() era chamado antes de
         * subtractFromBothSides().
         */

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
                resultado.rule
        };
    }


    /**
     * Adiciona a mesma quantidade
     * aos dois lados da equação.
     *
     * Este método representa a operação matemática.
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


        /*
         * Ação registrada uma única vez.
         */

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
                resultado.rule
        };
    }


    /**
     * Define a representação atual.
     *
     * Exemplos:
     *
     * concrete
     * visual
     * textual
     * symbolic
     */
    setRepresentation(representation) {

        this.state.setRepresentation(
            representation
        );
    }


    /**
     * Define a etapa da missão.
     *
     * Exemplos:
     *
     * exploration
     * transformation
     * verification
     * generalization
     */
    setStage(stage) {

        this.state.setStage(stage);
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
     * Verifica se determinado valor
     * satisfaz a equação atual.
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