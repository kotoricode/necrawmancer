import { CANVAS_HALF_HEIGHT, CANVAS_HALF_WIDTH } from "./const"
import { T_Tuple } from "./types"
import { Vector2 } from "./vector2"

type T_Matrix = T_Tuple<number, 16>

const getIdentity = (): T_Matrix => [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]

const invertMatrixTo = (matrix: T_Matrix, result: T_Matrix) =>
{
    const [
        M0, M1, M2, M3,
        M4, M5, M6, M7,
        M8, M9, MA, MB,
        MC, MD, ME, MF
    ] = matrix

    const M49 = M4 * M9
    const M4A = M4 * MA
    const M4B = M4 * MB
    const M58 = M5 * M8
    const M5A = M5 * MA
    const M5B = M5 * MB
    const M68 = M6 * M8
    const M69 = M6 * M9
    const M6B = M6 * MB
    const M78 = M7 * M8
    const M79 = M7 * M9
    const M7A = M7 * MA

    const A0 = M5A*MF + M6B*MD + M79*ME - M5B*ME - M69*MF - M7A*MD
    const A1 = M4B*ME + M68*MF + M7A*MC - M4A*MF - M6B*MC - M78*ME
    const A2 = M49*MF + M5B*MC + M78*MD - M4B*MD - M58*MF - M79*MC
    const A3 = M4A*MD + M58*ME + M69*MC - M49*ME - M5A*MC - M68*MD

    const det = M0*A0 + M1*A1 + M2*A2 + M3*A3

    if (!det)
    {
        throw Error("Zero determinant")
    }

    const M0D = M0 * MD
    const M0E = M0 * ME
    const M0F = M0 * MF
    const M1C = M1 * MC
    const M1E = M1 * ME
    const M1F = M1 * MF
    const M2C = M2 * MC
    const M2D = M2 * MD
    const M2F = M2 * MF
    const M3D = M3 * MD
    const M3E = M3 * ME
    const M3C = M3 * MC

    result[0]  = A0 / det
    result[1]  = (M1E*MB + M2F*M9 + M3D*MA - M1F*MA - M2D*MB - M3E*M9) / det
    result[2]  = (M1F*M6 + M2D*M7 + M3E*M5 - M1E*M7 - M2F*M5 - M3D*M6) / det
    result[3]  = (M7A*M1 + M5B*M2 + M69*M3 - M6B*M1 - M79*M2 - M5A*M3) / det
    result[4]  = A1 / det
    result[5]  = (M0F*MA + M2C*MB + M3E*M8 - M0E*MB - M2F*M8 - M3C*MA) / det
    result[6]  = (M0E*M7 + M2F*M4 + M3C*M6 - M0F*M6 - M2C*M7 - M3E*M4) / det
    result[7]  = (M6B*M0 + M78*M2 + M4A*M3 - M7A*M0 - M4B*M2 - M68*M3) / det
    result[8]  = A2 / det
    result[9]  = (M0D*MB + M1F*M8 + M3C*M9 - M0F*M9 - M1C*MB - M3D*M8) / det
    result[10] = (M0F*M5 + M1C*M7 + M3D*M4 - M0D*M7 - M1F*M4 - M3C*M5) / det
    result[11] = (M79*M0 + M4B*M1 + M58*M3 - M5B*M0 - M78*M1 - M49*M3) / det
    result[12] = A3 / det
    result[13] = (M0E*M9 + M1C*MA + M2D*M8 - M0D*MA - M1E*M8 - M2C*M9) / det
    result[14] = (M0D*M6 + M1E*M4 + M2C*M5 - M0E*M5 - M1C*M6 - M2D*M4) / det
    result[15] = (M5A*M0 + M68*M1 + M49*M2 - M69*M0 - M4A*M1 - M58*M2) / det
}

const multiplyMatricesTo = (left: T_Matrix, right: T_Matrix, result: T_Matrix) =>
{
    const [
        L0, L1, L2, L3,
        L4, L5, L6, L7,
        L8, L9, LA, LB,
        LC, LD, LE, LF
    ] = left

    const [
        R0, R1, R2, R3,
        R4, R5, R6, R7,
        R8, R9, RA, RB,
        RC, RD, RE, RF
    ] = right

    result[0]  = L0*R0 + L4*R1 + L8*R2 + LC*R3
    result[1]  = L1*R0 + L5*R1 + L9*R2 + LD*R3
    result[2]  = L2*R0 + L6*R1 + LA*R2 + LE*R3
    result[3]  = L3*R0 + L7*R1 + LB*R2 + LF*R3
    result[4]  = L0*R4 + L4*R5 + L8*R6 + LC*R7
    result[5]  = L1*R4 + L5*R5 + L9*R6 + LD*R7
    result[6]  = L2*R4 + L6*R5 + LA*R6 + LE*R7
    result[7]  = L3*R4 + L7*R5 + LB*R6 + LF*R7
    result[8]  = L0*R8 + L4*R9 + L8*RA + LC*RB
    result[9]  = L1*R8 + L5*R9 + L9*RA + LD*RB
    result[10] = L2*R8 + L6*R9 + LA*RA + LE*RB
    result[11] = L3*R8 + L7*R9 + LB*RA + LF*RB
    result[12] = L0*RC + L4*RD + L8*RE + LC*RF
    result[13] = L1*RC + L5*RD + L9*RE + LD*RF
    result[14] = L2*RC + L6*RD + LA*RE + LE*RF
    result[15] = L3*RC + L7*RD + LB*RE + LF*RF
}

const ndcToWorld = (ndc: Vector2, world: Vector2) =>
{
    const [
        M0, M1, , M3,
        M4, M5, , M7,
        , , , ,
        MC, MD, , MF
    ] = invertedViewProjection

    const { x, y } = ndc
    const w = M3*x + M7*y + MF

    world.x = (M0*x + M4*y + MC) / w
    world.y = (M1*x + M5*y + MD) / w
}

const update = () =>
{
    invertMatrixTo(position, view)
    multiplyMatricesTo(projection, view, viewProjection)
    invertMatrixTo(viewProjection, invertedViewProjection)
}

const worldToScreen = (world: Vector2, screen: Vector2) =>
{
    const [
        M0, M1, , M3,
        M4, M5, , M7,
        , , , ,
        MC, MD, , MF
    ] = viewProjection

    const { x, y } = world
    const w = M3*x + M7*y + MF
    const ndcX = (M0*x + M4*y + MC) / w
    const ndcY = (M1*x + M5*y + MD) / w

    screen.x = (1 + ndcX) * CANVAS_HALF_WIDTH
    screen.y = (1 - ndcY) * CANVAS_HALF_HEIGHT
}

const far = 2
const near = 1
const len = far - near
const projection: T_Matrix = [
    1 / CANVAS_HALF_WIDTH, 0, 0, 0,
    0, 1 / CANVAS_HALF_HEIGHT, 0, 0,
    0, 0, -2 / len, 0,
    0, 0, -(far + near) / len, 1
]

const view = getIdentity()
const viewProjection = getIdentity()
const invertedViewProjection = getIdentity()

const position = getIdentity()
position[14] = len / 2 + near

export const camera = {
    invertedViewProjection,
    ndcToWorld,
    update,
    worldToScreen,
    viewProjection
}
