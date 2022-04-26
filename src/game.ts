import { Health } from "./components/health"
import { Hitbox } from "./components/hitbox"
import { Resource } from "./components/resource"
import { Entity } from "./entity"
import { battle } from "./scripts/battle"
import { updateAggro } from "./scripts/update-aggro"
import { updateAi } from "./scripts/update-ai"
import { updateMovement } from "./scripts/update-movement"
import { T_Component } from "./types"
import { ui } from "./ui"

const entities = new Set<Entity>()
const deadEntities = new Set<Entity>()
let deltaTime = 0
let levelUps = 0
let gameOver = false

const addEntity = (entity: Entity) =>
{
    entities.add(entity)
}

function getAll<T extends T_Component>(t: T): [InstanceType<T>][]

function getAll<T extends T_Component, U extends T_Component>(t: T, u: U): [InstanceType<T>, InstanceType<U>][]

function getAll<T extends T_Component, U extends T_Component, V extends T_Component>(t: T, u: U, v: V): [InstanceType<T>, InstanceType<U>, InstanceType<V>][]

function getAll<T extends T_Component, U extends T_Component, V extends T_Component, W extends T_Component>(t: T, u: U, v: V, w: W): [InstanceType<T>, InstanceType<U>, InstanceType<V>, InstanceType<W>][]

function getAll(...constructors: readonly T_Component[]): InstanceType<T_Component>[][]
{
    const flags = constructors.reduce((acc, ctor) => acc + ctor.flag, 0)
    const componentArrays: InstanceType<T_Component>[][] = []

    for (const entity of entities)
    {
        if (entity.hasComponentFlags(flags))
        {
            const components: InstanceType<T_Component>[] = []

            for (const constructor of constructors)
            {
                const component = entity.getComponent(constructor)
                components.push(component)
            }

            componentArrays.push(components)
        }
    }

    return componentArrays
}

const getDeltaTime = () => deltaTime

const getEntity = (entityId: string): Entity =>
{
    for (const entity of entities)
    {
        if (entity.id === entityId)
        {
            return entity
        }
    }

    throw Error(`Missing entity: ${entityId}`)
}

function getOne<T extends T_Component>(entityId: string, t: T): InstanceType<T>

function getOne<T extends T_Component, U extends T_Component>(entityId: string, t: T, u: U): [InstanceType<T>, InstanceType<U>]

function getOne<T extends T_Component, U extends T_Component, V extends T_Component>(entityId: string, t: T, u: U, v: V): [InstanceType<T>, InstanceType<U>, InstanceType<V>]

function getOne<T extends T_Component, U extends T_Component, V extends T_Component, W extends T_Component>(entityId: string, t: T, u: U, v: V, w: W): [InstanceType<T>, InstanceType<U>, InstanceType<V>, InstanceType<W>]

function getOne(entityId: string, ...constructors: readonly T_Component[]): InstanceType<T_Component> | InstanceType<T_Component>[]
{
    const entity = getEntity(entityId)

    if (constructors.length === 1)
    {
        return entity.getComponent(constructors[0])
    }

    const componentArray: InstanceType<T_Component>[] = []

    for (const ctor of constructors)
    {
        if (entity.hasComponent(ctor))
        {
            const component = entity.getComponent(ctor)
            componentArray.push(component)
        }
    }

    return componentArray
}

// TODO add entityId to health component
const markAsDead = (health: Health) =>
{
    for (const entity of entities)
    {
        if (entity.hasComponent(Health))
        {
            const entityHealth = entity.getComponent(Health)

            if (entityHealth === health)
            {
                if (entity.id === "necrawmancer")
                {
                    gameOver = true
                    ui.setGameOver(true)
                }

                deadEntities.add(entity)
            }
        }
    }
}

const removeDeadEntities = () =>
{
    for (const entity of deadEntities)
    {
        entities.delete(entity)

        if (entity.hasComponent(Health))
        {
            const health = entity.getComponent(Health)

            if (health.barVisible)
            {
                ui.removeHealthBar(health.id)
            }
        }

        if (entity.hasComponentFlags(Resource.flag | Hitbox.flag))
        {
            const resource = entity.getComponent(Resource)
            const hitbox = entity.getComponent(Hitbox)

            if (hitbox.type === "foe")
            {
                const playerResource = getOne("necrawmancer", Resource)
                playerResource.iron += resource.iron
                playerResource.rock += resource.rock
                playerResource.wood += resource.wood
                ui.updateResource(playerResource.wood, playerResource.rock, playerResource.iron, playerResource.experience)
            }
        }
    }

    deadEntities.clear()
}

const setScene = () =>
{
    gameOver = false
    ui.setGameOver(false)
    entities.clear()
    battle.createBattle()
}

const addLevelUps = (delta: number) =>
{
    levelUps += delta
}

const update = (dt: number) =>
{
    deltaTime = dt
    removeDeadEntities()

    if (levelUps || gameOver)
    {
        return
    }

    battle.tick()
    updateMovement()
    updateAi()
    updateAggro()
}

export const game = {
    addEntity,
    addLevelUps,
    getAll,
    getDeltaTime,
    getOne,
    markAsDead,
    setScene,
    update
}
