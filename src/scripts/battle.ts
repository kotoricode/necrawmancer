import { camera } from "../camera"
import { Aggro } from "../components/aggro"
import { Drawable } from "../components/drawable"
import { Health } from "../components/health"
import { Hitbox } from "../components/hitbox"
import { Movement } from "../components/movement"
import { Resource } from "../components/resource"
import { Transform } from "../components/transform"
import { CANVAS_HALF_WIDTH } from "../const"
import { Entity } from "../entity"
import { E_DrawPriority } from "../enum"
import { game } from "../game"
import { ui } from "../ui"

let unitCounter = 1
let spawnTimerCap = 12
let spawnTimer = spawnTimerCap

const spawnKnight = () =>
{
    const entity = new Entity(`knight-${unitCounter}`)
    unitCounter++
    const drawable = new Drawable("programDefault", "modelDefault", "knight.png", E_DrawPriority.Unit)
    const transform = new Transform(CANVAS_HALF_WIDTH - 50, (Math.random() * 300 | 0) - 150)
    const movement = new Movement(50)
    const aggro = new Aggro(5, 5, 4, 100, true, 0, false)
    const health = new Health(200, 200, true)
    const hitbox = new Hitbox(100, 100, "foe")
    const resource = new Resource(1, 0, 0, 100)
    drawable.material.stageUniform("u_transform", transform.translation)
    drawable.material.stageUniform("u_viewProjection", camera.viewProjection)
    drawable.material.stageUniform("u_facing", 1)
    entity.addComponents(drawable, transform, hitbox, movement, aggro, health, resource)
    game.addEntity(entity)
}

const spawnAxeman = () =>
{
    const entity = new Entity(`axeman-${unitCounter}`)
    unitCounter++
    const drawable = new Drawable("programDefault", "modelDefault", "axeman.png", E_DrawPriority.Unit)
    const transform = new Transform(CANVAS_HALF_WIDTH - 50, (Math.random() * 300 | 0) - 150)
    const movement = new Movement(75)
    const aggro = new Aggro(4, 2, 3, 100, true, 0, false)
    const health = new Health(130, 130, true)
    const hitbox = new Hitbox(100, 100, "foe")
    const resource = new Resource(0, 2, 0, 50)
    drawable.material.stageUniform("u_transform", transform.translation)
    drawable.material.stageUniform("u_viewProjection", camera.viewProjection)
    drawable.material.stageUniform("u_facing", 1)
    entity.addComponents(drawable, transform, hitbox, movement, aggro, health, resource)
    game.addEntity(entity)
}


const spawnPeasant = () =>
{
    const entity = new Entity(`peasant-${unitCounter}`)
    unitCounter++
    const drawable = new Drawable("programDefault", "modelDefault", "peasant.png", E_DrawPriority.Unit)
    const transform = new Transform(CANVAS_HALF_WIDTH - 50, (Math.random() * 300 | 0) - 150)
    const movement = new Movement(100)
    const aggro = new Aggro(3, 1, 2.5, 100, true, 0, false)
    const health = new Health(70, 70, true)
    const hitbox = new Hitbox(100, 100, "foe")
    const resource = new Resource(0, 0, 3, 20)
    drawable.material.stageUniform("u_transform", transform.translation)
    drawable.material.stageUniform("u_viewProjection", camera.viewProjection)
    drawable.material.stageUniform("u_facing", 1)
    entity.addComponents(drawable, transform, hitbox, movement, aggro, health, resource)
    game.addEntity(entity)
}

const spawnTreant = (x: number, y: number) =>
{
    const entity = new Entity(`treant-${unitCounter}`)
    unitCounter++
    const drawable = new Drawable("programDefault", "modelDefault", "treant.png", E_DrawPriority.Unit)
    const transform = new Transform(x, y)
    const movement = new Movement(20)
    const aggro = new Aggro(3, 8, 5, 150, true, 0, false)
    const health = new Health(200, 200, true)
    const hitbox = new Hitbox(100, 100, "friend")
    const resource = new Resource(0, 0, 0, 0)
    drawable.material.stageUniform("u_transform", transform.translation)
    drawable.material.stageUniform("u_viewProjection", camera.viewProjection)
    drawable.material.stageUniform("u_facing", 1)
    entity.addComponents(drawable, transform, hitbox, movement, aggro, health, resource)
    game.addEntity(entity)
}

const spawnGolem = (x: number, y: number) =>
{
    const entity = new Entity(`golem-${unitCounter}`)
    unitCounter++
    const drawable = new Drawable("programDefault", "modelDefault", "golem.png", E_DrawPriority.Unit)
    const transform = new Transform(x, y)
    const movement = new Movement(10)
    const aggro = new Aggro(2, 40, 7, 100, true, 0, false)
    const health = new Health(400, 400, true)
    const hitbox = new Hitbox(100, 100, "friend")
    const resource = new Resource(0, 0, 0, 0)
    drawable.material.stageUniform("u_transform", transform.translation)
    drawable.material.stageUniform("u_viewProjection", camera.viewProjection)
    drawable.material.stageUniform("u_facing", 1)
    entity.addComponents(drawable, transform, hitbox, movement, aggro, health, resource)
    game.addEntity(entity)
}

const spawnTitan = (x: number, y: number) =>
{
    const entity = new Entity(`golem-${unitCounter}`)
    unitCounter++
    const drawable = new Drawable("programDefault", "modelDefault", "titan.png", E_DrawPriority.Unit)
    const transform = new Transform(x, y)
    const movement = new Movement(40)
    const aggro = new Aggro(5, 20, 4, 170, true, 0, false)
    const health = new Health(300, 300, true)
    const hitbox = new Hitbox(100, 100, "friend")
    const resource = new Resource(0, 0, 0, 0)
    drawable.material.stageUniform("u_transform", transform.translation)
    drawable.material.stageUniform("u_viewProjection", camera.viewProjection)
    drawable.material.stageUniform("u_facing", 1)
    entity.addComponents(drawable, transform, hitbox, movement, aggro, health, resource)
    game.addEntity(entity)
}


const createBattle = () =>
{
    {
        const entity = new Entity("ground")
        const drawable = new Drawable("programDefault", "modelGround", "ground.jpg", E_DrawPriority.Ground)
        const transform = new Transform(0, 0)
        drawable.material.stageUniform("u_transform", transform.translation)
        drawable.material.stageUniform("u_viewProjection", camera.viewProjection)
        drawable.material.stageUniform("u_facing", 1)
        entity.addComponents(drawable, transform)
        game.addEntity(entity)
    }
    {
        const entity = new Entity("necrawmancer")
        const drawable = new Drawable("programDefault", "modelDefault", "necrawmancer.png", E_DrawPriority.Unit)
        const transform = new Transform(0, 0)
        const movement = new Movement(150)
        const aggro = new Aggro(4, 10, 3, 600, false, 700, false)
        const health = new Health(100, 100, true)
        const hitbox = new Hitbox(100, 100, "necrawmancer")
        const resource = new Resource(0, 0, 3, 0)
        drawable.material.stageUniform("u_transform", transform.translation)
        drawable.material.stageUniform("u_viewProjection", camera.viewProjection)
        drawable.material.stageUniform("u_facing", 1)
        entity.addComponents(drawable, transform, hitbox, movement, aggro, health, resource)
        game.addEntity(entity)

        ui.updateResource(resource.wood, resource.rock, resource.iron, resource.experience)
    }
    spawnPeasant()
}

const tick = () =>
{
    const [resource, transform] = game.getOne("necrawmancer", Resource, Transform)

    const summoning = ui.getSummoning()

    if (summoning === "treant")
    {
        spawnTreant(transform.translation.x, transform.translation.y)
        resource.wood -= 9
    }
    else if (summoning === "golem")
    {
        spawnGolem(transform.translation.x, transform.translation.y)
        resource.rock -= 9
    }
    else if (summoning === "titan")
    {
        spawnTitan(transform.translation.x, transform.translation.y)
        resource.iron -= 9
    }

    ui.updateResource(resource.wood, resource.rock, resource.iron, resource.experience)
    ui.updateSummons(resource.wood, resource.rock, resource.iron)

    const dt = game.getDeltaTime()
    spawnTimer -= dt

    if (spawnTimer <= 0)
    {
        const r = Math.random()

        if (r < 0.5)
        {
            spawnPeasant()
        }
        else if (r < 0.9)
        {
            spawnAxeman()
        }
        else
        {
            spawnKnight()
        }

        spawnTimerCap = Math.max(spawnTimerCap - 0.08, 0.1)
        spawnTimer = spawnTimerCap
    }
}

export const battle = {
    tick,
    createBattle
}
