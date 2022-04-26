import { game } from "../game"
import { clamp01 } from "../util"

const experienceBrackets = <const>[
    -Infinity,
    100,
    200,
    350,
    550,
    800,
    1100,
    1500,
    2000,
    3000,
    Infinity
]

export class Resource
{
    static readonly flag = 64

    iron: number
    rock: number
    wood: number
    experience: number
    level = 1

    constructor(iron: number, rock: number, wood: number, experience: number)
    {
        this.iron = iron
        this.rock = rock
        this.wood = wood
        this.experience = experience
    }

    addExperience(value: number)
    {
        this.experience += value
        const oldLevel = this.level
        const newLevel = experienceBrackets.findIndex(cap => cap > this.experience)
        const diff = newLevel - oldLevel
        if (diff)
        {
            this.level = newLevel
            game.addLevelUps(diff)
        }
    }

    getProgress01()
    {
        const level = experienceBrackets.findIndex(cap => cap > this.experience)
        const base = Math.max(experienceBrackets[level - 1], 0)
        const cap = Math.min(experienceBrackets[level], experienceBrackets[experienceBrackets.length - 1])
        return clamp01((this.experience + base) / cap)
    }
}
