import { T_Component } from "./types"

export class Entity
{
    readonly id: string
    readonly components = new Map<T_Component, InstanceType<T_Component>>()
    private componentFlags = 0

    constructor(id: string)
    {
        this.id = id
    }

    addComponents(...components: readonly InstanceType<T_Component>[])
    {
        for (const component of components)
        {
            const constructor = <T_Component>component.constructor

            if (this.hasComponent(constructor))
            {
                throw Error("Duplicate component")
            }
            else
            {
                this.components.set(constructor, component)
                this.componentFlags |= constructor.flag
            }
        }
    }

    getComponent<T extends T_Component>(constructor: T)
    {
        if (!this.hasComponent(constructor))
        {
            throw Error("Missing component")
        }

        return <InstanceType<T>>this.components.get(constructor)
    }

    hasComponent<T extends T_Component>(constructor: T)
    {
        return this.components.has(constructor)
    }

    hasComponentFlags(flags: number)
    {
        return (flags & this.componentFlags) === flags
    }

    removeComponents(...components: readonly InstanceType<T_Component>[])
    {
        for (const component of components)
        {
            const constructor = <T_Component>component.constructor

            if (this.hasComponent(constructor))
            {
                this.components.delete(constructor)
                this.componentFlags &= ~constructor.flag
            }
            else
            {
                throw Error("Missing component")
            }
        }
    }
}
