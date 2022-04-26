import { Vector2 } from "../vector2"

export class Transform
{
    static readonly flag = 128

    readonly translation: Vector2

    constructor(tx: number, ty: number)
    {
        this.translation = new Vector2(tx, ty)
    }
}
