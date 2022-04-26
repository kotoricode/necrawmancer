import { E_DrawPriority } from "../enum"
import { Material } from "../gl/material"
import { T_ModelId, T_ProgramId } from "../types"

export class Drawable
{
    static readonly flag = 4

    readonly material: Material
    readonly drawPriority: E_DrawPriority

    constructor(programId: T_ProgramId, modelId: T_ModelId, textureId: string, drawPriority: E_DrawPriority)
    {
        this.material = new Material(programId, modelId, textureId)
        this.drawPriority = drawPriority
    }
}
