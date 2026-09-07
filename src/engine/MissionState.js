/**
 * MathLab — LabTech Equações
 * MissionState
 *
 * Responsabilidade:
 * Representar o estado de uma missão de aprendizagem.
 *
 * MissionState registra fatos da atividade.
 * Não diagnostica o estudante.
 * Não define regras matemáticas.
 * Não controla a interface.
 *
 * EquationModel        → estado matemático
 * EquivalenceRules     → transformações válidas
 * MissionState         → estado da atividade
 * ADA                  → interpretação pedagógica futura
 */

export class MissionState {

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

        this.missionId = missionId;

        this.initialEquation =
            initialEquation.clone();

        this.currentEquation =
            initialEquation.clone();

        this.transformations = [];

        this.actions = [];

        this.currentRepresentation =
            "concrete";

        this.currentStage =
            "exploration";

        this.mediationLevel =
            0;

        this.strategy =
            null;

        this.completed =
            false;
    }


    /**
     * Registra uma ação realizada pelo estudante.
     *
     * A ação é registrada como evidência.
     */
    recordAction(action) {

        if (!action || typeof action !== "object") {
            throw new TypeError(
                "A ação deve ser um objeto."
            );
        }

        this.actions.push({
            ...action,
            timestamp: Date.now()
        });
    }


    /**
     * Registra uma transformação matemática.
     */
    recordTransformation(transformation) {

        if (!transformation) {
            throw new TypeError(
                "A transformação é obrigatória."
            );
        }

        this.transformations.push(
            transformation.clone()
        );

        this.currentEquation =
            transformation.after.clone();
    }


    /**
     * Altera a representação utilizada.
     */
    setRepresentation(representation) {

        if (
            typeof representation !== "string" ||
            representation.trim() === ""
        ) {
            throw new TypeError(
                "A representação deve ser uma string não vazia."
            );
        }

        this.currentRepresentation =
            representation;
    }


    /**
     * Altera a etapa atual da missão.
     */
    setStage(stage) {

        if (
            typeof stage !== "string" ||
            stage.trim() === ""
        ) {
            throw new TypeError(
                "A etapa deve ser uma string não vazia."
            );
        }

        this.currentStage = stage;
    }


    /**
     * Registra a estratégia escolhida.
     */
    setStrategy(strategy) {

        if (
            strategy !== null &&
            (
                typeof strategy !== "string" ||
                strategy.trim() === ""
            )
        ) {
            throw new TypeError(
                "A estratégia deve ser uma string não vazia ou null."
            );
        }

        this.strategy = strategy;
    }


    /**
     * Registra o nível atual de mediação.
     *
     * 0 = autonomia
     * 1+ = presença progressiva de suporte
     */
    setMediationLevel(level) {

        if (
            typeof level !== "number" ||
            !Number.isInteger(level) ||
            level < 0
        ) {
            throw new TypeError(
                "O nível de mediação deve ser um inteiro maior ou igual a zero."
            );
        }

        this.mediationLevel = level;
    }


    /**
     * Finaliza a missão.
     */
    complete() {

        this.completed = true;
    }


    /**
     * Cria uma cópia independente do estado.
     */
    clone() {

        const clone =
            new MissionState({
                missionId: this.missionId,
                initialEquation: this.initialEquation
            });

        clone.currentEquation =
            this.currentEquation.clone();

        clone.transformations =
            this.transformations.map(
                transformation =>
                    transformation.clone()
            );

        clone.actions =
            this.actions.map(
                action => ({ ...action })
            );

        clone.currentRepresentation =
            this.currentRepresentation;

        clone.currentStage =
            this.currentStage;

        clone.mediationLevel =
            this.mediationLevel;

        clone.strategy =
            this.strategy;

        clone.completed =
            this.completed;

        return clone;
    }


    /**
     * Serializa o estado para análise, persistência
     * ou Learning Analytics.
     */
    toJSON() {

        return {

            missionId:
                this.missionId,

            initialEquation:
                this.initialEquation.toString(),

            currentEquation:
                this.currentEquation.toString(),

            transformations:
                this.transformations.map(
                    transformation =>
                        transformation.toJSON()
                ),

            actions:
                this.actions.map(
                    action => ({ ...action })
                ),

            currentRepresentation:
                this.currentRepresentation,

            currentStage:
                this.currentStage,

            mediationLevel:
                this.mediationLevel,

            strategy:
                this.strategy,

            completed:
                this.completed
        };
    }
}