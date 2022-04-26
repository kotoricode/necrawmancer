import { camera } from "./camera"
import { CANVAS_HALF_HEIGHT, CANVAS_HALF_WIDTH } from "./const"
import { canvas } from "./main"
import { Vector2 } from "./vector2"

const clientPosition = new Vector2()
const ndcPosition = new Vector2()
const worldPosition = new Vector2()

let clicked = false
let clickPending = false
let onCanvas = false

const consumeClick = () =>
{
    const consumed = onCanvas && clicked
    clicked = false
    return consumed
}

const init = () =>
{
    canvas.addEventListener("mousemove", (event: MouseEvent) =>
    {
        clientPosition.x = event.clientX
        clientPosition.y = event.clientY
    })

    canvas.addEventListener("click", (event: MouseEvent) =>
    {
        clickPending = true
        clientPosition.x = event.clientX
        clientPosition.y = event.clientY
    })

    canvas.addEventListener("mouseenter", () =>
    {
        onCanvas = true
    })

    canvas.addEventListener("mouseleave", () =>
    {
        onCanvas = false
    })
}

const update = () =>
{
    clicked = clickPending
    clickPending = false
    const rect = canvas.getBoundingClientRect()
    ndcPosition.x = (clientPosition.x - rect.left) / CANVAS_HALF_WIDTH - 1
    ndcPosition.y = 1 - (clientPosition.y - rect.top) / CANVAS_HALF_HEIGHT
    camera.ndcToWorld(ndcPosition, worldPosition)
}

export const mouse = {
    consumeClick,
    onCanvas,
    init,
    update,
    worldPosition
}
