import { ui } from "../ui"
import { Vector2 } from "../vector2"

export class Health
{
    static readonly flag = 8
    private static id = 1

    readonly id: string
    private current: number
    private max: number
    readonly barScreenPosition = new Vector2()
    readonly barVisible: boolean

    constructor(current: number, max: number, barVisible: boolean)
    {
        this.current = current
        this.max = max
        this.barVisible = barVisible

        this.id = `health-${Health.id}`
        Health.id++

        if (this.barVisible)
        {
            ui.createHealthBar(this.id)
        }
    }

    changeCurrent(delta: number)
    {
        this.current = Math.min(Math.max(this.current + delta, 0), this.max)
    }

    changeMax(delta: number)
    {
        const percentage = this.current / this.max
        this.max = Math.max(this.max + delta, 0)
        this.current = this.max * percentage
    }

    getFraction()
    {
        return this.current / this.max
    }

    updateBar()
    {
        if (this.barVisible)
        {
            ui.updateHealthBar(this.id, this.barScreenPosition.x, this.barScreenPosition.y, this.getFraction())
        }
    }
}
