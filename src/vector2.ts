export class Vector2 extends Array<number>
{
    constructor(x = 0, y = 0)
    {
        super(2)
        this[0] = x
        this[1] = y
    }

    get x()
    {
        return this[0]
    }

    set x(value: number)
    {
        this[0] = value
    }

    get y()
    {
        return this[1]
    }

    set y(value: number)
    {
        this[1] = value
    }

    copy(vector2: Vector2)
    {
        this.x = vector2.x
        this.y = vector2.y
    }

    distance(vec: Vector2)
    {
        return ((this.x-vec.x)**2 + (this.y-vec.y)**2) ** 0.5
    }

    add(dx: number, dy: number)
    {
        this[0] += dx
        this[1] += dy
    }
}
