import { T_HitboxType } from "../types"
import { Vector2 } from "../vector2"
import { Transform } from "./transform"

export class Hitbox
{
    static readonly flag = 16

    private width: number
    private height: number
    readonly type: T_HitboxType

    constructor(width: number, height: number, type: T_HitboxType)
    {
        this.width = width
        this.height = height
        this.type = type
    }

    hovered(mousePos: Vector2, transform: Transform)
    {
        const left = transform.translation.x - this.width / 2
        const right = left + this.width
        const bottom = transform.translation.y
        const top = bottom + this.height

        return left <= mousePos.x && mousePos.x <= right && bottom <= mousePos.y && mousePos.y <= top
    }
}
