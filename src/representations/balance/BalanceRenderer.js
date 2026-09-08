/**
 * MathLab — LabTech Equações
 * BalanceRenderer
 *
 * Responsabilidade:
 * Renderizar visualmente a representação concreta
 * da balança.
 *
 * Princípio arquitetural:
 * BalanceRenderer conhece Canvas.
 * BalanceRenderer conhece estética.
 * BalanceRenderer NÃO altera BalanceModel.
 * BalanceRenderer NÃO executa matemática.
 *
 * Estados visuais:
 * - neutral
 * - balanced
 * - unbalanced-left
 * - unbalanced-right
 */

export class BalanceRenderer {

    constructor(canvas, options = {}) {

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new TypeError(
                "BalanceRenderer exige um elemento HTMLCanvasElement."
            );
        }

        this.canvas = canvas;

        this.ctx =
            canvas.getContext("2d");

        if (!this.ctx) {
            throw new Error(
                "Não foi possível obter o contexto 2D do Canvas."
            );
        }

        this.options = {

            background:
                "#061A33",

            navy:
                "#0B2A4A",

            navyLight:
                "#123E67",

            gold:
                "#F2C14E",

            goldLight:
                "#FFE58A",

            goldDark:
                "#B8860B",

            blue:
                "#4D8ED8",

            blueLight:
                "#78B7FF",

            green:
                "#43E68B",

            orange:
                "#F3A847",

            red:
                "#E76F51",

            white:
                "#F7FAFC",

            muted:
                "#AFC4DA",

            fontFamily:
                "Nunito, Arial, sans-serif",

            xFont:
                "700 30px Georgia, serif",

            statusFont:
                "700 18px Nunito, Arial, sans-serif",

            ...options
        };

        this.lastState =
            "neutral";

        this.lastBalance =
            null;
    }


    /**
     * Renderiza a balança.
     *
     * @param {BalanceModel} balance
     * @param {Object|string} state
     *
     * Exemplos:
     * render(balance)
     * render(balance, "balanced")
     * render(balance, { state: "unbalanced-left" })
     */
    render(balance, state = "neutral") {

        if (!balance) {
            throw new TypeError(
                "BalanceRenderer exige um BalanceModel."
            );
        }

        const visualState =
            typeof state === "string"
                ? state
                : state?.state || "neutral";

        this.lastState =
            visualState;

        this.lastBalance =
            balance.clone
                ? balance.clone()
                : balance;

        this.clear();

        this.drawBackground();

        const geometry =
            this.calculateGeometry();

        const tilt =
            this.calculateTilt(balance, visualState);

        this.drawAmbientMath();

        this.drawScaleBase(
            geometry
        );

        this.drawBeam(
            geometry,
            tilt
        );

        this.drawSuspension(
            geometry,
            tilt
        );

        this.drawPan(
            geometry,
            "LEFT",
            tilt
        );

        this.drawPan(
            geometry,
            "RIGHT",
            tilt
        );

        this.drawElements(
            balance,
            "LEFT",
            geometry
        );

        this.drawElements(
            balance,
            "RIGHT",
            geometry
        );

        this.drawCenterPivot(
            geometry
        );

        this.drawStatus(
            visualState,
            geometry
        );

        return this.canvas;
    }


    /**
     * Limpa o Canvas.
     */
    clear() {

        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }


    /**
     * Fundo institucional MathLab.
     */
    drawBackground() {

        const ctx =
            this.ctx;

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                this.canvas.height
            );

        gradient.addColorStop(
            0,
            "#061A33"
        );

        gradient.addColorStop(
            0.55,
            "#082443"
        );

        gradient.addColorStop(
            1,
            "#031426"
        );

        ctx.fillStyle =
            gradient;

        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        /**
         * Halo central discreto.
         */
        const halo =
            ctx.createRadialGradient(
                this.canvas.width / 2,
                this.canvas.height * 0.52,
                20,
                this.canvas.width / 2,
                this.canvas.height * 0.52,
                this.canvas.width * 0.48
            );

        halo.addColorStop(
            0,
            "rgba(242,193,78,0.10)"
        );

        halo.addColorStop(
            1,
            "rgba(242,193,78,0)"
        );

        ctx.fillStyle =
            halo;

        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }


    /**
     * Elementos matemáticos decorativos.
     *
     * São deliberadamente discretos.
     * A balança continua sendo o foco.
     */
    drawAmbientMath() {

        const ctx =
            this.ctx;

        ctx.save();

        ctx.globalAlpha =
            0.055;

        ctx.fillStyle =
            this.options.goldLight;

        ctx.font =
            "italic 72px Georgia";

        ctx.fillText(
            "x",
            50,
            105
        );

        ctx.fillText(
            "+",
            this.canvas.width * 0.43,
            105
        );

        ctx.fillText(
            "=",
            this.canvas.width * 0.55,
            105
        );

        ctx.fillText(
            "x²",
            this.canvas.width - 125,
            105
        );

        ctx.restore();
    }


    /**
     * Geometria responsiva.
     */
    calculateGeometry() {

        const width =
            this.canvas.width;

        const height =
            this.canvas.height;

        const centerX =
            width / 2;

        const beamY =
            height * 0.42;

        const panY =
            height * 0.58;

        const panWidth =
            Math.min(
                width * 0.29,
                230
            );

        const panHeight =
            Math.min(
                height * 0.12,
                58
            );

        return {

            width,
            height,

            centerX,
            beamY,
            panY,

            panWidth,
            panHeight,

            leftX:
                centerX -
                width * 0.29,

            rightX:
                centerX +
                width * 0.29,

            baseY:
                height * 0.86
        };
    }


    /**
     * Determina a inclinação visual.
     *
     * A matemática permanece no BalanceModel.
     * Aqui apenas traduzimos o estado em movimento visual.
     */
    calculateTilt(balance, state) {

        if (
            state === "balanced"
        ) {
            return 0;
        }

        if (
            state === "unbalanced-left"
        ) {
            return 0.075;
        }

        if (
            state === "unbalanced-right"
        ) {
            return -0.075;
        }

        /**
         * Estado neutro:
         * pequena inclinação quase imperceptível.
         */
        return 0;
    }


    /**
     * Base da balança.
     */
    drawScaleBase(geometry) {

        const {
            centerX,
            baseY
        } = geometry;

        const ctx =
            this.ctx;

        ctx.save();

        /**
         * Sombra.
         */
        ctx.fillStyle =
            "rgba(0,0,0,0.35)";

        ctx.beginPath();

        ctx.ellipse(
            centerX,
            baseY + 16,
            170,
            18,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /**
         * Corpo azul.
         */
        const bodyGradient =
            ctx.createLinearGradient(
                centerX - 110,
                baseY - 85,
                centerX + 110,
                baseY
            );

        bodyGradient.addColorStop(
            0,
            "#173F68"
        );

        bodyGradient.addColorStop(
            0.5,
            "#0B2A4A"
        );

        bodyGradient.addColorStop(
            1,
            "#061A33"
        );

        ctx.fillStyle =
            bodyGradient;

        ctx.beginPath();

        ctx.moveTo(
            centerX - 110,
            baseY - 65
        );

        ctx.lineTo(
            centerX + 110,
            baseY - 65
        );

        ctx.lineTo(
            centerX + 145,
            baseY
        );

        ctx.lineTo(
            centerX - 145,
            baseY
        );

        ctx.closePath();

        ctx.fill();

        /**
         * Borda dourada.
         */
        ctx.strokeStyle =
            this.options.gold;

        ctx.lineWidth =
            4;

        ctx.stroke();

        /**
         * Placa MathLab.
         */
        ctx.fillStyle =
            this.options.gold;

        ctx.fillRect(
            centerX - 62,
            baseY - 42,
            124,
            28
        );

        ctx.fillStyle =
            this.options.navy;

        ctx.font =
            "700 13px Nunito, Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "MathLab",
            centerX,
            baseY - 23
        );

        ctx.restore();
    }


    /**
     * Haste central.
     */
    drawBeam(geometry, tilt) {

        const {
            centerX,
            beamY,
            width
        } = geometry;

        const ctx =
            this.ctx;

        ctx.save();

        ctx.translate(
            centerX,
            beamY
        );

        ctx.rotate(
            tilt
        );

        /**
         * Sombra da haste.
         */
        ctx.shadowColor =
            "rgba(0,0,0,0.4)";

        ctx.shadowBlur =
            12;

        ctx.shadowOffsetY =
            6;

        const beamGradient =
            ctx.createLinearGradient(
                0,
                -12,
                0,
                12
            );

        beamGradient.addColorStop(
            0,
            this.options.goldLight
        );

        beamGradient.addColorStop(
            0.5,
            this.options.gold
        );

        beamGradient.addColorStop(
            1,
            this.options.goldDark
        );

        ctx.fillStyle =
            beamGradient;

        ctx.beginPath();

        ctx.roundRect(
            -width * 0.35,
            -11,
            width * 0.70,
            22,
            11
        );

        ctx.fill();

        ctx.shadowColor =
            "transparent";

        ctx.restore();
    }


    /**
     * Cabos que sustentam os pratos.
     */
    drawSuspension(geometry, tilt) {

        const {
            centerX,
            beamY,
            panY,
            leftX,
            rightX
        } = geometry;

        const ctx =
            this.ctx;

        ctx.save();

        ctx.translate(
            centerX,
            beamY
        );

        ctx.rotate(
            tilt
        );

        const localLeft =
            leftX - centerX;

        const localRight =
            rightX - centerX;

        const deltaY =
            panY - beamY;

        ctx.strokeStyle =
            this.options.gold;

        ctx.lineWidth =
            4;

        ctx.lineCap =
            "round";

        /**
         * Esquerda.
         */
        ctx.beginPath();

        ctx.moveTo(
            localLeft,
            10
        );

        ctx.lineTo(
            localLeft - 48,
            deltaY
        );

        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(
            localLeft,
            10
        );

        ctx.lineTo(
            localLeft + 48,
            deltaY
        );

        ctx.stroke();

        /**
         * Direita.
         */
        ctx.beginPath();

        ctx.moveTo(
            localRight,
            10
        );

        ctx.lineTo(
            localRight - 48,
            deltaY
        );

        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(
            localRight,
            10
        );

        ctx.lineTo(
            localRight + 48,
            deltaY
        );

        ctx.stroke();

        ctx.restore();
    }


    /**
     * Desenha um prato.
     */
    drawPan(
        geometry,
        side,
        tilt
    ) {

        const {
            centerX,
            panY,
            panWidth,
            panHeight,
            leftX,
            rightX
        } = geometry;

        const ctx =
            this.ctx;

        const x =
            side === "LEFT"
                ? leftX
                : rightX;

        const sideAngle =
            side === "LEFT"
                ? tilt
                : tilt;

        ctx.save();

        ctx.translate(
            x,
            panY
        );

        ctx.rotate(
            sideAngle
        );

        /**
         * Sombra.
         */
        ctx.fillStyle =
            "rgba(0,0,0,0.28)";

        ctx.beginPath();

        ctx.ellipse(
            0,
            12,
            panWidth / 2,
            panHeight / 2,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /**
         * Prato dourado.
         */
        const gradient =
            ctx.createLinearGradient(
                0,
                -panHeight / 2,
                0,
                panHeight
            );

        gradient.addColorStop(
            0,
            this.options.goldLight
        );

        gradient.addColorStop(
            0.45,
            this.options.gold
        );

        gradient.addColorStop(
            1,
            this.options.goldDark
        );

        ctx.fillStyle =
            gradient;

        ctx.beginPath();

        ctx.ellipse(
            0,
            0,
            panWidth / 2,
            panHeight / 2,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /**
         * Interior azul.
         */
        ctx.fillStyle =
            "rgba(6,26,51,0.40)";

        ctx.beginPath();

        ctx.ellipse(
            0,
            -4,
            panWidth / 2 - 10,
            panHeight / 2 - 10,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }


    /**
     * Elementos concretos.
     */
    drawElements(
        balance,
        side,
        geometry
    ) {

        const elements =
            balance.getSide(side);

        const x =
            side === "LEFT"
                ? geometry.leftX
                : geometry.rightX;

        const baseY =
            geometry.panY - 8;

        const spacing =
            42;

        let cursor =
            x -
            ((elements.length - 1) * spacing) / 2;

        for (const item of elements) {

            const quantity =
                Math.max(
                    1,
                    Math.min(
                        item.quantity,
                        8
                    )
                );

            /**
             * Para quantidades maiores,
             * agrupamos visualmente.
             */
            for (
                let index = 0;
                index < quantity;
                index++
            ) {

                const offset =
                    index -
                    (quantity - 1) / 2;

                const px =
                    cursor +
                    offset * 34;

                const py =
                    baseY -
                    Math.floor(index / 4) * 34;

                if (item.type === "x") {

                    this.drawXBlock(
                        px,
                        py
                    );

                } else {

                    this.drawUnit(
                        px,
                        py,
                        item.sign
                    );
                }
            }

            cursor +=
                Math.max(
                    52,
                    quantity * 18
                );
        }
    }


    /**
     * Bloco da incógnita.
     */
    drawXBlock(x, y) {

        const ctx =
            this.ctx;

        const size =
            42;

        ctx.save();

        ctx.shadowColor =
            "rgba(0,0,0,0.45)";

        ctx.shadowBlur =
            8;

        ctx.shadowOffsetY =
            5;

        const gradient =
            ctx.createLinearGradient(
                x - size / 2,
                y - size / 2,
                x + size / 2,
                y + size / 2
            );

        gradient.addColorStop(
            0,
            "#5B9BE6"
        );

        gradient.addColorStop(
            1,
            "#194E82"
        );

        ctx.fillStyle =
            gradient;

        ctx.beginPath();

        ctx.roundRect(
            x - size / 2,
            y - size / 2,
            size,
            size,
            9
        );

        ctx.fill();

        ctx.shadowColor =
            "transparent";

        ctx.strokeStyle =
            this.options.goldLight;

        ctx.lineWidth =
            2;

        ctx.stroke();

        ctx.fillStyle =
            this.options.white;

        ctx.font =
            this.options.xFont;

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            "x",
            x,
            y + 1
        );

        ctx.restore();
    }


    /**
     * Unidade matemática.
     */
    drawUnit(
        x,
        y,
        sign = 1
    ) {

        const ctx =
            this.ctx;

        const radius =
            15;

        ctx.save();

        ctx.shadowColor =
            "rgba(0,0,0,0.40)";

        ctx.shadowBlur =
            7;

        ctx.shadowOffsetY =
            4;

        const gradient =
            ctx.createRadialGradient(
                x - 5,
                y - 6,
                2,
                x,
                y,
                radius
            );

        gradient.addColorStop(
            0,
            this.options.goldLight
        );

        gradient.addColorStop(
            0.65,
            this.options.gold
        );

        gradient.addColorStop(
            1,
            this.options.goldDark
        );

        ctx.fillStyle =
            gradient;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.shadowColor =
            "transparent";

        /**
         * Unidade negativa.
         */
        if (sign === -1) {

            ctx.strokeStyle =
                this.options.red;

            ctx.lineWidth =
                3;

            ctx.beginPath();

            ctx.moveTo(
                x - 7,
                y
            );

            ctx.lineTo(
                x + 7,
                y
            );

            ctx.stroke();
        }

        ctx.restore();
    }


    /**
     * Pivô central.
     */
    drawCenterPivot(geometry) {

        const {
            centerX,
            beamY,
            height
        } = geometry;

        const ctx =
            this.ctx;

        ctx.save();

        /**
         * Haste.
         */
        const gradient =
            ctx.createLinearGradient(
                centerX - 12,
                beamY,
                centerX + 12,
                height * 0.86
            );

        gradient.addColorStop(
            0,
            this.options.goldLight
        );

        gradient.addColorStop(
            0.45,
            this.options.gold
        );

        gradient.addColorStop(
            1,
            this.options.goldDark
        );

        ctx.fillStyle =
            gradient;

        ctx.beginPath();

        ctx.roundRect(
            centerX - 12,
            beamY + 5,
            24,
            height * 0.40,
            12
        );

        ctx.fill();

        /**
         * Pivô.
         */
        ctx.fillStyle =
            this.options.navy;

        ctx.strokeStyle =
            this.options.gold;

        ctx.lineWidth =
            5;

        ctx.beginPath();

        ctx.arc(
            centerX,
            beamY,
            27,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.stroke();

        ctx.fillStyle =
            this.options.goldLight;

        ctx.beginPath();

        ctx.arc(
            centerX,
            beamY,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }


    /**
     * Estado pedagógico visual.
     */
    drawStatus(
        state,
        geometry
    ) {

        const ctx =
            this.ctx;

        let text =
            "Observe a relação";

        let color =
            this.options.muted;

        if (state === "balanced") {

            text =
                "Equilíbrio mantido";

            color =
                this.options.green;

        } else if (
            state === "unbalanced-left" ||
            state === "unbalanced-right"
        ) {

            text =
                "O equilíbrio mudou";

            color =
                this.options.orange;
        }

        ctx.save();

        ctx.textAlign =
            "center";

        ctx.font =
            this.options.statusFont;

        ctx.fillStyle =
            color;

        ctx.shadowColor =
            color;

        ctx.shadowBlur =
            state === "balanced"
                ? 10
                : 0;

        ctx.fillText(
            text,
            geometry.centerX,
            38
        );

        ctx.restore();
    }
}