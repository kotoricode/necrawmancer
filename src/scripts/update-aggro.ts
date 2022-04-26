import { camera } from "../camera"
import { Aggro } from "../components/aggro"
import { Drawable } from "../components/drawable"
import { Health } from "../components/health"
import { Movement } from "../components/movement"
import { Transform } from "../components/transform"
import { Entity } from "../entity"
import { E_DrawPriority } from "../enum"
import { game } from "../game"
import { Vector2 } from "../vector2"

const positionDamageMap = new Map<Vector2, number>()

export const updateAggro = () =>
{
    const dt = game.getDeltaTime()
    positionDamageMap.clear()

    for (const [aggro, health, transform] of game.getAll(Aggro, Health, Transform))
    {
        aggro.cooldownRemaining = Math.max(aggro.cooldownRemaining - dt, 0)

        if (aggro.hasTarget && !aggro.cooldownRemaining)
        {
            if (aggro.melee)
            {
                const dist = transform.translation.distance(aggro.target)

                if (dist <= aggro.range)
                {
                    const damage = aggro.getDamage()
                    positionDamageMap.set(aggro.target, damage)
                    aggro.cooldownRemaining = aggro.cooldown

                    if (aggro.selfDestructOnImpact)
                    {
                        game.markAsDead(health)
                    }
                }
            }
            else
            {
                const projEntity = new Entity("projectile")
                const projTransform = new Transform(transform.translation.x, transform.translation.y)
                const projDrawable = new Drawable("programDefault", "modelDefault", "magic-missile.png", E_DrawPriority.Unit)
                projDrawable.material.stageUniform("u_transform", projTransform.translation)
                projDrawable.material.stageUniform("u_viewProjection", camera.viewProjection)
                projDrawable.material.stageUniform("u_facing", 1)
                const projMovement = new Movement(aggro.rangeSpeed)
                projMovement.target = aggro.target
                projMovement.hasTarget = true
                const projAggro = new Aggro(aggro.dice, aggro.dieSides, 0, 1, true, 0, true)
                projAggro.hasTarget = true
                projAggro.target = aggro.target
                const projHealth = new Health(1, 1, false)
                projEntity.addComponents(projDrawable, projTransform, projMovement, projAggro, projHealth)
                game.addEntity(projEntity)

                aggro.cooldownRemaining = aggro.cooldown
            }
        }
    }

    for (const [health, transform] of game.getAll(Health, Transform))
    {
        const damageReceived = positionDamageMap.get(transform.translation)

        if (damageReceived !== undefined)
        {
            health.changeCurrent(-damageReceived)
        }

        camera.worldToScreen(transform.translation, health.barScreenPosition)
        health.updateBar()
    }

    for (const [health] of game.getAll(Health))
    {
        if (!health.getFraction())
        {
            game.markAsDead(health)
        }
    }
}
