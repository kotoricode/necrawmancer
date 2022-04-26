import { Vector2 } from "../vector2"

export class Aggro
{
    static readonly flag = 1

    dice: number
    dieSides: number
    target = new Vector2()
    hasTarget = false
    cooldown: number
    cooldownRemaining = 0
    range: number
    melee: boolean
    rangeSpeed: number
    rangePosition = new Vector2()
    selfDestructOnImpact = false

    constructor(dice: number, dieSides: number, cooldown: number, range: number, melee: boolean, rangeSpeed: number, selfDestructOnImpact: boolean)
    {
        this.dice = dice
        this.dieSides = dieSides
        this.cooldown = cooldown
        this.range = range
        this.melee = melee
        this.rangeSpeed = rangeSpeed
        this.selfDestructOnImpact = selfDestructOnImpact
    }

    getDamage()
    {
        let damage = 0

        for (let i = 0; i < this.dice; i++)
        {
            damage += (Math.random() * this.dieSides | 0) + 1
        }

        return damage
    }
}
