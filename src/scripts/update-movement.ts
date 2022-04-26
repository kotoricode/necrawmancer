import { Aggro } from "../components/aggro"
import { Drawable } from "../components/drawable"
import { Hitbox } from "../components/hitbox"
import { Movement } from "../components/movement"
import { Transform } from "../components/transform"
import { game } from "../game"
import { mouse } from "../mouse"
import { Vector2 } from "../vector2"

export const updateMovement = () =>
{
    if (mouse.consumeClick() && !attackFoe(mouse.worldPosition))
    {
        const [movement, aggro] = game.getOne("necrawmancer", Movement, Aggro)
        movement.hasTarget = true
        movement.target.copy(mouse.worldPosition)
        aggro.hasTarget = false
    }

    const dt = game.getDeltaTime()

    for (const [movement, transform, drawable] of game.getAll(Movement, Transform, Drawable))
    {
        if (movement.hasTarget)
        {
            const current = transform.translation
            const target = movement.target

            const distance = current.distance(target)
            const step = dt * movement.speed

            if (distance <= step)
            {
                transform.translation.copy(target)
                movement.hasTarget = false
            }
            else
            {
                const ratio = step / distance
                const diffX = (target.x - current.x) * ratio
                const diffY = (target.y - current.y) * ratio

                transform.translation.add(diffX, diffY)

                const facing = Math.sign(diffX)
                if (facing)
                {
                    drawable.material.stageUniform("u_facing", facing)
                }
            }
        }
    }
}

const attackFoe = (mousePos: Vector2) =>
{
    const sorted = []

    for (const [transform, hitbox] of game.getAll(Transform, Hitbox))
    {
        sorted.push({ transform, hitbox })
    }

    sorted.sort((a, b) => a.transform.translation.y - b.transform.translation.y)

    for (const entity of sorted)
    {
        if (entity.hitbox.hovered(mousePos, entity.transform) && entity.hitbox.type === "foe")
        {
            const [aggro, movement] = game.getOne("necrawmancer", Aggro, Movement)
            aggro.hasTarget = true
            aggro.target = entity.transform.translation
            movement.hasTarget = false
            return true
        }
    }

    return false
}
