import { EquationModel }
    from "./EquationModel.js";


export class VerificationEngine {

    static verify(
        equation,
        value
    ) {

        if (!(equation instanceof EquationModel)) {

            throw new TypeError(
                "equation deve ser uma instância de EquationModel."
            );
        }


        if (!Number.isFinite(value)) {

            throw new TypeError(
                "O valor de verificação deve ser um número finito."
            );
        }


        const left =
            equation.evaluateSide(
                equation.left,
                value
            );


        const right =
            equation.evaluateSide(
                equation.right,
                value
            );


        const verified =
            Math.abs(left - right) < 1e-9;


        return {

            value,

            left,

            right,

            verified,

            mathematicalResult:
                verified
                    ? "verified"
                    : "not_verified"
        };
    }
}