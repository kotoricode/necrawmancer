import { Aggro } from "../components/aggro"
import { Hitbox } from "../components/hitbox"
import { Movement } from "../components/movement"
import { Transform } from "../components/transform"
import { game } from "../game"
import { T_HitboxType } from "../types"
import { Vector2 } from "../vector2"

const transforms: Record<T_HitboxType, InstanceType<typeof Transform>[]> = {
    "necrawmancer": [],
    "foe": [],
    "friend": []
}

const getClosestTarget = (transform: Transform, targetArray: Transform[]) =>
{
    if (targetArray.length)
    {
        let closest: Vector2 | undefined
        let closestDist = Infinity

        for (const targetTransform of targetArray)
        {
            const dist = transform.translation.distance(targetTransform.translation)

            if (dist < closestDist)
            {
                closest = targetTransform.translation
                closestDist = dist
            }
        }

        return { closest, closestDist }
    }
}

export const updateAi = () =>
{
    for (const array of Object.values(transforms))
    {
        array.length = 0
    }

    for (const [hitbox, transform] of game.getAll(Hitbox, Transform))
    {
        transforms[hitbox.type].push(transform)
    }

    for (const [hitbox, aggro, movement, transform] of game.getAll(Hitbox, Aggro, Movement, Transform))
    {
        if (hitbox.type === "foe" || hitbox.type === "friend")
        {
            const targets = hitbox.type === "foe" ? [...transforms.necrawmancer, ...transforms.friend] : [...transforms.foe]
            const closest = getClosestTarget(transform, targets)

            if (closest && closest.closest)
            {
                aggro.hasTarget = aggro.range >= closest.closestDist
                movement.hasTarget = !aggro.hasTarget

                if (movement.hasTarget)
                {
                    movement.target = closest.closest
                }
                else
                {
                    aggro.target = closest.closest
                }
            }
        }
    }
}
