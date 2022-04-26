import { audio } from "./audio"
import { camera } from "./camera"
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./const"
import { game } from "./game"
import { Material } from "./gl/material"
import { renderer } from "./gl/renderer"
import { mouse } from "./mouse"
import { ui } from "./ui"
import { getElement } from "./util"

const initGl = () =>
{
    const gl = canvas.getContext("webgl2", {
        antialias: false,
        depth: false
    })

    if (!gl)
    {
        throw Error("Failed to create WebGL2 context")
    }

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 1)
    gl.viewport(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    return gl
}

export const canvas = getElement<HTMLCanvasElement>("#canvas")
export const gl = initGl()

let playing = false
let oldTimestamp = 0

const mainLoop = (timestamp: number) =>
{
    if (playing)
    {
        const dt = (timestamp - oldTimestamp) / 1000
        mouse.update()
        ui.update(dt)
        game.update(dt)
        camera.update()
        renderer.render()
    }
    oldTimestamp = timestamp
    requestAnimationFrame(mainLoop)
}

document.addEventListener("DOMContentLoaded", () =>
{
    const start = getElement<HTMLDivElement>("#start")
    start.classList.remove("display-none")
    start.classList.add("start-show")
    start.addEventListener("click", () =>
    {
        start.classList.remove("start-show")
        start.classList.add("display-none")

        const staticUi = getElement<HTMLDivElement>("#static-ui")
        staticUi.classList.remove("display-none")

        audio.init()
        game.setScene()
        playing = true
    }, { once: true })

    mouse.init()
    ui.init()
    Material.init()
    renderer.init()
    mainLoop(0)
}, { once: true })
