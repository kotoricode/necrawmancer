import { Vector2 } from "../vector2"

export class Movement
{
    static readonly flag = 32
    hasTarget = false
    target = new Vector2()
    readonly speed: number

    constructor(speed: number)
    {
        this.speed = speed
    }
}
