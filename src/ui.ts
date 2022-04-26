import { game } from "./game"
import { Perk } from "./perk"
import { clamp01, getElement } from "./util"

enum Menu
{
    LevelUp = 1,
    Resource = 2,
    GameOver = 4
}

const HEALTH_BAR_WIDTH_PX = 100
const HEALTH_BAR_HEIGHT_PX = 10

let summoning: null | "treant" | "golem" | "titan" = null

class Progress
{
    private speed: number
    private value: number
    private direction: number
    private subcribers: { show: (() => void)[], hide: (() => void)[] } = {
        show: [],
        hide: []
    }

    constructor(speed: number, value: number, direction: number)
    {
        this.speed = speed
        this.value = value
        this.direction = direction
    }

    addEventListener(name: keyof typeof this.subcribers, subscriber: () => void)
    {
        this.subcribers[name].push(subscriber)
    }

    getHidden()
    {
        return !this.value && this.direction <= 0
    }

    getValue()
    {
        return this.value
    }

    setDirection(direction: number)
    {
        this.direction = direction
    }

    update(dt: number)
    {
        if (this.direction)
        {
            const increasing = this.direction > 0

            if ((this.value < 1 && increasing) || (this.value && !increasing))
            {
                this.value = clamp01(this.value + dt * this.direction * this.speed)

                if (this.value === 1 && increasing)
                {
                    for (const subscriber of this.subcribers.show)
                    {
                        subscriber()
                    }
                }
                else if (!this.value && !increasing)
                {
                    for (const subscriber of this.subcribers.hide)
                    {
                        subscriber()
                    }
                }
            }
        }
    }
}

let activeMenuFlags = 0

const pausedMask = Menu.LevelUp | Menu.GameOver

let divUi: HTMLDivElement
let divPerk: HTMLDivElement
const txtsPerk: HTMLDivElement[] = Array(3)
let divResource: HTMLDivElement

const pause = new Progress(4, 0, -1)
const resource = new Progress(4, 0, -1)

let summonTreant: HTMLInputElement
let summonGolem: HTMLInputElement
let summonTitan: HTMLInputElement

const createHealthBar = (id: string) =>
{
    const bg = document.createElement("div")
    bg.id = id
    bg.style.position = "absolute"
    bg.style.backgroundColor = "#ee0033"
    bg.style.width = `${HEALTH_BAR_WIDTH_PX}px`
    bg.style.height = `${HEALTH_BAR_HEIGHT_PX}px`

    const fg = document.createElement("div")
    fg.style.backgroundColor = "#44cc11"
    fg.style.width = `${HEALTH_BAR_WIDTH_PX}px`
    fg.style.height = `${HEALTH_BAR_HEIGHT_PX}px`
    bg.appendChild(fg)

    divUi.appendChild(bg)
}

const removeHealthBar = (id: string) =>
{
    const node = getElement(`#${id}`)
    divUi.removeChild(node)
}

const paused = () => !!(activeMenuFlags & pausedMask)

const getPauseProgress = () => pause.getValue()

const setResourceBarDirection = (direction: number) =>
{
    resource.setDirection(direction)
    const progress = resource.getValue()

    if (direction > 0 && !progress)
    {
        divUi.appendChild(divResource)
    }
}

const showPerkMenu = (...perks: Perk[]) =>
{
    activeMenuFlags |= Menu.LevelUp
    divUi.appendChild(divPerk)
}

const setGameOver = (value: boolean) =>
{
    if (value)
    {
        activeMenuFlags |= Menu.GameOver
        pause.setDirection(1)
    }
    else
    {
        activeMenuFlags &= ~Menu.GameOver
        pause.setDirection(-1)
    }
}

const init = () =>
{
    divUi = getElement<HTMLDivElement>("#ui")
    createPerkMenu()
    createResourceBar()

    summonTreant = getElement<HTMLInputElement>("#summon-treant")
    summonGolem = getElement<HTMLInputElement>("#summon-golem")
    summonTitan = getElement<HTMLInputElement>("#summon-titan")

    summonTreant.addEventListener("click", () =>
    {
        summoning = "treant"
    })

    summonGolem.addEventListener("click", () =>
    {
        summoning = "golem"
    })

    summonTitan.addEventListener("click", () =>
    {
        summoning = "titan"
    })
}

const createPerkMenu = () =>
{
    divPerk = document.createElement("div")
    divPerk.id = "select-perk-background"

    const content = document.createElement("div")
    content.id = "select-perk-content"
    divPerk.appendChild(content)

    const title = document.createElement("div")
    title.id = "select-perk-content-title"
    content.appendChild(title)

    const header = document.createElement("h2")
    header.textContent = "Level up!"
    title.appendChild(header)

    const desc = document.createTextNode("Select a perk")
    title.appendChild(desc)

    const button = document.createElement("input")
    button.type = "button"
    button.classList.add("game-button")
    button.value = "Continue"
    button.disabled = true
    button.addEventListener("click", () =>
    {
        activeMenuFlags &= ~Menu.LevelUp
        divUi.removeChild(divPerk)
        game.addLevelUps(-1)
    })

    for (let i = 0; i < txtsPerk.length; i++)
    {
        const perkDiv = document.createElement("div")
        perkDiv.id = "perk" + i
        perkDiv.classList.add("perk")
        content.appendChild(perkDiv)

        const perkInput = document.createElement("input")
        perkInput.id = `perk${i}-input`
        perkInput.type = "radio"
        perkInput.name = "perk"
        perkInput.classList.add("display-none")
        perkInput.addEventListener("change", () =>
        {
            button.disabled = false
        })
        perkDiv.appendChild(perkInput)

        const perkLabel = document.createElement("label")
        perkLabel.htmlFor = `perk${i}-input`
        perkDiv.appendChild(perkLabel)

        const text = document.createElement("div")
        perkLabel.appendChild(text)
        txtsPerk[i] = text
    }

    content.appendChild(button)
}

const createResourceBar = () =>
{
    divResource = document.createElement("div")
}

const update = (dt: number) =>
{
    pause.update(dt)
    resource.update(dt)
}

const updateHealthBar = (id: string, x: number, y: number, fraction: number) =>
{
    const bg = getElement(`#${id}`)
    bg.style.left = `${x - HEALTH_BAR_WIDTH_PX / 2}px`
    bg.style.top = `${y}px`

    const fg = getElement(`#${id} > div`)
    fg.style.width = `${HEALTH_BAR_WIDTH_PX * fraction}px`
}

const updateResource = (wood: number, rock: number, iron: number, experience: number) =>
{
    const woodAmount = getElement("#resource-wood > div")
    const rockAmount = getElement("#resource-rock > div")
    const ironAmount = getElement("#resource-iron > div")

    woodAmount.textContent = `${wood}`
    rockAmount.textContent = `${rock}`
    ironAmount.textContent = `${iron}`
}

const getSummoning = () =>
{
    const retVal = summoning
    summoning = null
    return retVal
}

const updateSummons = (wood: number, rock: number, iron: number) =>
{
    summonTreant.disabled = wood < 9
    summonGolem.disabled = rock < 9
    summonTitan.disabled = iron < 9
}

export const ui = {
    createHealthBar,
    init,
    paused,
    getSummoning,
    getPauseProgress,
    removeHealthBar,
    showPerkMenu,
    setGameOver,
    setResourceBarDirection,
    update,
    updateHealthBar,
    updateResource,
    updateSummons
}
