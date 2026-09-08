/**
 * MathLab — LabTech Equações
 * MissionEquilibrioView
 *
 * Camada de interface da Missão Equilíbrio.
 *
 * Responsabilidades:
 * - montar a interface;
 * - apresentar equação e balança;
 * - encaminhar ações ao Controller;
 * - apresentar feedback;
 * - não executar regras matemáticas.
 *
 * Princípio arquitetural:
 *
 *      ESTUDANTE
 *          ↓
 *        VIEW
 *          ↓
 *      CONTROLLER
 *          ↓
 *     DOMÍNIO MATEMÁTICO
 *          ↓
 *        ESTADO
 *          ↓
 *        VIEW
 */

import { BalanceRenderer }
    from "../../representations/balance/BalanceRenderer.js";


export class MissionEquilibrioView {

    constructor(
        container,
        controller,
        options = {}
    ) {

        if (!(container instanceof HTMLElement)) {

            throw new TypeError(
                "MissionEquilibrioView exige um HTMLElement."
            );
        }


        if (!controller) {

            throw new TypeError(
                "MissionEquilibrioView exige um controller."
            );
        }


        this.container =
            container;

        this.controller =
            controller;


        this.options = {

            title:
                "Missão 01 — Equilíbrio",

            ...options

        };


        /*
         * Referências da interface.
         */
        this.canvas =
            null;

        this.renderer =
            null;

        this.equationElement =
            null;

        this.feedbackElement =
            null;

        this.actionElement =
            null;


        /*
         * Estado exclusivamente visual.
         *
         * neutral:
         *   estado inicial;
         *   x ainda desconhecido.
         *
         * balanced:
         *   última ação preservou a equivalência.
         *
         * unbalanced:
         *   última tentativa não preservou
         *   a equivalência.
         */
        this.balanceStatus =
            "neutral";


        /*
         * Evita múltiplos listeners caso a View
         * seja renderizada novamente.
         */
        this.rendered =
            false;


        this.render();
    }


    /**
     * Monta a interface completa.
     */
    render() {

        this.container.innerHTML =
            "";

        this.container.className =
            "mathlab-equilibrio";


        this.injectStyles();


        /*
         * =================================================
         * CABEÇALHO
         * =================================================
         */

        const header =
            document.createElement("header");

        header.className =
            "mathlab-equilibrio__header";


        header.innerHTML = `

            <div>

                <span class="mathlab-brand">

                    <span class="mathlab-brand__math">
                        Math
                    </span><span class="mathlab-brand__lab">Lab</span>

                </span>


                <h1>
                    ${this.options.title}
                </h1>


                <p>
                    Investigue o equilíbrio e descubra o valor de x.
                </p>

            </div>

        `;


        this.container.appendChild(
            header
        );


        /*
         * =================================================
         * EQUAÇÃO
         * =================================================
         */

        this.equationElement =
            document.createElement("div");


        this.equationElement.className =
            "mathlab-equilibrio__equation";


        this.equationElement.setAttribute(
            "aria-live",
            "polite"
        );


        this.container.appendChild(
            this.equationElement
        );


        /*
         * =================================================
         * BALANÇA
         * =================================================
         */

        const balanceArea =
            document.createElement("section");


        balanceArea.className =
            "mathlab-equilibrio__balance";


        balanceArea.setAttribute(
            "aria-label",
            "Representação concreta da igualdade por meio de uma balança."
        );


        this.canvas =
            document.createElement("canvas");


        this.canvas.width =
            900;

        this.canvas.height =
            500;


        this.canvas.setAttribute(
            "aria-label",
            "Balança matemática representando os dois lados da equação."
        );


        balanceArea.appendChild(
            this.canvas
        );


        this.container.appendChild(
            balanceArea
        );


        /*
         * Renderer é responsável exclusivamente
         * pela representação visual.
         */
        this.renderer =
            new BalanceRenderer(
                this.canvas
            );


        /*
         * =================================================
         * ORIENTAÇÃO
         * =================================================
         */

        const instruction =
            document.createElement("div");


        instruction.className =
            "mathlab-equilibrio__instruction";


        instruction.textContent =
            "O que podemos fazer para manter o equilíbrio?";


        this.container.appendChild(
            instruction
        );


        /*
         * =================================================
         * AÇÕES
         * =================================================
         */

        this.actionElement =
            document.createElement("div");


        this.actionElement.className =
            "mathlab-equilibrio__actions";


        /*
         * Subtrair 1 dos dois lados.
         */
        this.createActionButton(
            "− 1",
            "subtract",
            1
        );


        /*
         * Adicionar 1 aos dois lados.
         */
        this.createActionButton(
            "+ 1",
            "add",
            1
        );


        /*
         * Multiplicar os dois lados por 2.
         */
        this.createActionButton(
            "× 2",
            "multiply",
            2
        );


        /*
         * Dividir os dois lados por 2.
         */
        this.createActionButton(
            "÷ 2",
            "divide",
            2
        );


        this.container.appendChild(
            this.actionElement
        );


        /*
         * =================================================
         * FEEDBACK
         * =================================================
         */

        this.feedbackElement =
            document.createElement("div");


        this.feedbackElement.className =
            "mathlab-equilibrio__feedback";


        this.feedbackElement.setAttribute(
            "role",
            "status"
        );


        this.feedbackElement.setAttribute(
            "aria-live",
            "polite"
        );


        this.container.appendChild(
            this.feedbackElement
        );


        /*
         * Primeira renderização.
         */
        this.update();


        this.rendered =
            true;
    }


    /**
     * Cria um botão de ação.
     *
     * A View apenas descreve a ação.
     * A transformação matemática pertence ao Controller.
     */
    createActionButton(
        label,
        type,
        value
    ) {

        const button =
            document.createElement("button");


        button.type =
            "button";


        button.className =
            "mathlab-action";


        button.textContent =
            label;


        button.dataset.action =
            type;


        button.dataset.value =
            String(value);


        button.setAttribute(
            "aria-label",
            this.getActionAriaLabel(
                type,
                value
            )
        );


        button.addEventListener(
            "click",
            () => {

                this.executeAction(
                    type,
                    value
                );

            }
        );


        this.actionElement.appendChild(
            button
        );
    }


    /**
     * Texto acessível para cada ação.
     */
    getActionAriaLabel(
        type,
        value
    ) {

        switch (type) {

            case "subtract":

                return `Subtrair ${value} dos dois lados`;

            case "add":

                return `Adicionar ${value} aos dois lados`;

            case "multiply":

                return `Multiplicar os dois lados por ${value}`;

            case "divide":

                return `Dividir os dois lados por ${value}`;

            default:

                return "Executar ação";
        }
    }


    /**
     * Executa uma ação solicitada pelo estudante.
     *
     * IMPORTANTE:
     *
     * Esta função NÃO resolve a equação.
     *
     * Ela apenas transforma o clique em uma
     * ação semântica e entrega ao Controller.
     */
    executeAction(
        type,
        value
    ) {

        try {

            const numericValue =
                Number(value);


            if (!Number.isFinite(numericValue)) {

                throw new TypeError(
                    "O valor da ação deve ser numérico."
                );
            }


            /*
             * =================================================
             * CONTRATO DA AÇÃO
             * =================================================
             *
             * Toda ação da Missão Equilíbrio deve indicar
             * explicitamente que atua nos dois lados.
             */
            const action = {

                type,

                sides: [
                    "left",
                    "right"
                ]

            };


            /*
             * O campo numérico depende da operação.
             */
            switch (type) {

                case "subtract":

                    action.amount =
                        numericValue;

                    break;


                case "add":

                    action.amount =
                        numericValue;

                    break;


                case "multiply":

                    action.factor =
                        numericValue;

                    break;


                case "divide":

                    action.divisor =
                        numericValue;

                    break;


                default:

                    throw new Error(
                        `Ação não suportada pela missão: ${type}`
                    );
            }


            /*
             * Entrega a ação ao Controller.
             *
             * Aqui acontece a passagem:
             *
             * VIEW → CONTROLLER
             */
            const result =
                this.controller.executeAction(
                    action
                );


            /*
             * =================================================
             * ESTADO VISUAL
             * =================================================
             *
             * Não calculamos equilíbrio aqui.
             *
             * O Controller já determinou se a transformação
             * preservou a equivalência.
             */
            if (
                result &&
                result.equivalent === true
            ) {

                this.balanceStatus =
                    "balanced";

            } else {

                this.balanceStatus =
                    "unbalanced";
            }


            /*
             * Feedback ao estudante.
             */
            this.showActionFeedback(
                result
            );


            /*
             * Atualiza a equação e a representação.
             */
            this.update();


        } catch (error) {

            /*
             * Erro de integração ou ação inválida.
             *
             * Não apagamos o estado anterior.
             */
            this.showFeedback(
                error.message,
                "error"
            );
        }
    }


    /**
     * Atualiza a representação completa.
     *
     * NÃO usa:
     *
     *     balance.isBalanced()
     *
     * porque, enquanto x é desconhecido,
     * não existe valor numérico para avaliar.
     *
     * O estado visual é controlado por balanceStatus.
     */
    update() {

        const equation =
            this.controller.getCurrentEquation();


        const balance =
            this.controller.getBalance();


        /*
         * EquationModel possui toString().
         *
         * Não usamos format(), pois esse método
         * não pertence ao contrato atual.
         */
        this.equationElement.textContent =
            equation.toString();


        /*
         * A representação visual recebe:
         *
         * 1. modelo concreto da balança;
         * 2. estado visual.
         */
        this.renderer.render(
            balance,
            this.balanceStatus
        );
    }


    /**
     * Apresenta feedback específico da ação.
     */
    showActionFeedback(
        result
    ) {

        if (!result) {

            return;
        }


        /*
         * Transformação equivalente.
         */
        if (
            result.transformation &&
            result.transformation.equivalent === true
        ) {

            this.showFeedback(
                "Equilíbrio mantido.",
                "success"
            );


            return;
        }


        /*
         * Ação estruturalmente inválida
         * ou não equivalente.
         */
        this.showFeedback(
            "Observe o que aconteceu com o equilíbrio.",
            "attention"
        );
    }


    /**
     * Feedback genérico.
     */
    showFeedback(
        message,
        type = "neutral"
    ) {

        if (!this.feedbackElement) {

            return;
        }


        this.feedbackElement.textContent =
            message;


        this.feedbackElement.dataset.type =
            type;
    }


    /**
     * Injeta os estilos específicos da missão.
     *
     * Nesta etapa não estamos fazendo nova cirurgia estética.
     * O objetivo é manter a composição funcional já validada.
     */
    injectStyles() {

        if (
            document.getElementById(
                "mathlab-equilibrio-styles"
            )
        ) {

            return;
        }


        const style =
            document.createElement("style");


        style.id =
            "mathlab-equilibrio-styles";


        style.textContent = `

            .mathlab-equilibrio {

                min-height:
                    100svh;

                box-sizing:
                    border-box;

                padding:
                    clamp(10px, 1.5vh, 20px)
                    clamp(16px, 2vw, 32px);

                color:
                    #F7FAFC;

                background:
                    linear-gradient(
                        135deg,
                        #031426 0%,
                        #082443 55%,
                        #061A33 100%
                    );

                font-family:
                    Nunito,
                    Arial,
                    sans-serif;

                overflow:
                    hidden;

                display:
                    flex;

                flex-direction:
                    column;
            }


            .mathlab-equilibrio__header {

                width:
                    100%;

                max-width:
                    1100px;

                margin:
                    0 auto 4px;

                flex:
                    0 0 auto;

                display:
                    flex;

                justify-content:
                    space-between;

                align-items:
                    flex-start;
            }


            .mathlab-brand {

                font-size:
                    22px;

                font-weight:
                    900;

                letter-spacing:
                    -1px;
            }


            .mathlab-brand__math {

                color:
                    #F7FAFC;
            }


            .mathlab-brand__lab {

                color:
                    #F2C14E;
            }


            .mathlab-equilibrio h1 {

                margin:
                    5px 0 2px;

                font-size:
                    clamp(
                        25px,
                        3.2vh,
                        32px
                    );

                line-height:
                    1.05;
            }


            .mathlab-equilibrio p {

                margin:
                    0;

                color:
                    #AFC4DA;

                font-size:
                    14px;
            }


            .mathlab-equilibrio__equation {

                width:
                    100%;

                max-width:
                    1100px;

                margin:
                    0 auto 2px;

                flex:
                    0 0 auto;

                text-align:
                    center;

                color:
                    #F2C14E;

                font-family:
                    Georgia,
                    serif;

                font-size:
                    clamp(
                        34px,
                        5vh,
                        44px
                    );

                font-weight:
                    700;

                min-height:
                    44px;

                line-height:
                    1;
            }


            .mathlab-equilibrio__balance {

                width:
                    100%;

                max-width:
                    1100px;

                margin:
                    0 auto;

                flex:
                    1 1 auto;

                min-height:
                    0;

                overflow:
                    hidden;

                border:
                    1px solid
                    rgba(
                        242,
                        193,
                        78,
                        .18
                    );

                border-radius:
                    24px;

                box-shadow:
                    0 20px 60px
                    rgba(
                        0,
                        0,
                        0,
                        .35
                    );

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;
            }


            .mathlab-equilibrio__balance canvas {

                display:
                    block;

                width:
                    100%;

                height:
                    auto;

                max-height:
                    52vh;

                object-fit:
                    contain;

                background:
                    transparent;
            }


            .mathlab-equilibrio__instruction {

                width:
                    100%;

                max-width:
                    700px;

                margin:
                    6px auto 5px;

                flex:
                    0 0 auto;

                text-align:
                    center;

                color:
                    #F7FAFC;

                font-size:
                    17px;

                font-weight:
                    700;
            }


            .mathlab-equilibrio__actions {

                display:
                    flex;

                justify-content:
                    center;

                align-items:
                    center;

                flex-wrap:
                    wrap;

                gap:
                    9px;

                width:
                    100%;

                max-width:
                    800px;

                margin:
                    0 auto;

                flex:
                    0 0 auto;
            }


            .mathlab-action {

                min-width:
                    96px;

                padding:
                    9px 17px;

                border:
                    1px solid
                    rgba(
                        242,
                        193,
                        78,
                        .5
                    );

                border-radius:
                    12px;

                color:
                    #F7FAFC;

                background:
                    rgba(
                        18,
                        62,
                        103,
                        .85
                    );

                font:
                    800 16px
                    Nunito,
                    Arial,
                    sans-serif;

                cursor:
                    pointer;

                transition:
                    transform .15s ease,
                    background .15s ease,
                    border-color .15s ease;
            }


            .mathlab-action:hover {

                transform:
                    translateY(-2px);

                background:
                    #194E82;

                border-color:
                    #F2C14E;
            }


            .mathlab-action:active {

                transform:
                    translateY(0);
            }


            .mathlab-action:focus-visible {

                outline:
                    3px solid
                    #FFE58A;

                outline-offset:
                    3px;
            }


            .mathlab-equilibrio__feedback {

                width:
                    100%;

                max-width:
                    700px;

                min-height:
                    22px;

                margin:
                    5px auto 0;

                padding:
                    5px 14px;

                border-radius:
                    12px;

                text-align:
                    center;

                font-size:
                    14px;

                font-weight:
                    800;

                color:
                    #AFC4DA;

                flex:
                    0 0 auto;
            }


            .mathlab-equilibrio__feedback[data-type="success"] {

                color:
                    #43E68B;

                background:
                    rgba(
                        67,
                        230,
                        139,
                        .08
                    );
            }


            .mathlab-equilibrio__feedback[data-type="attention"] {

                color:
                    #F3A847;

                background:
                    rgba(
                        243,
                        168,
                        71,
                        .08
                    );
            }


            .mathlab-equilibrio__feedback[data-type="error"] {

                color:
                    #E76F51;

                background:
                    rgba(
                        231,
                        111,
                        81,
                        .08
                    );
            }


            @media (max-height: 720px) {

                .mathlab-equilibrio {

                    padding:
                        8px 18px;
                }


                .mathlab-equilibrio__header {

                    margin-bottom:
                        2px;
                }


                .mathlab-brand {

                    font-size:
                        20px;
                }


                .mathlab-equilibrio h1 {

                    margin-top:
                        3px;

                    font-size:
                        24px;
                }


                .mathlab-equilibrio p {

                    font-size:
                        12px;
                }


                .mathlab-equilibrio__equation {

                    font-size:
                        33px;

                    min-height:
                        38px;
                }


                .mathlab-equilibrio__balance canvas {

                    max-height:
                        48vh;
                }


                .mathlab-equilibrio__instruction {

                    margin:
                        4px auto 4px;

                    font-size:
                        15px;
                }


                .mathlab-action {

                    min-width:
                        90px;

                    padding:
                        7px 14px;

                    font-size:
                        15px;
                }


                .mathlab-equilibrio__feedback {

                    margin-top:
                        3px;

                    padding:
                        3px 10px;

                    font-size:
                        13px;
                }
            }


            @media (max-width: 700px) {

                .mathlab-equilibrio {

                    padding:
                        10px;
                }


                .mathlab-equilibrio h1 {

                    font-size:
                        24px;
                }


                .mathlab-equilibrio__equation {

                    font-size:
                        32px;
                }


                .mathlab-equilibrio__balance canvas {

                    max-height:
                        48vh;
                }


                .mathlab-action {

                    flex:
                        1 1 42%;
                }
            }

        `;


        document.head.appendChild(
            style
        );
    }
}