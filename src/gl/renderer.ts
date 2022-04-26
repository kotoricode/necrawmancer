import { Drawable } from "../components/drawable"
import { Transform } from "../components/transform"
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../const"
import { E_DrawPriority } from "../enum"
import { game } from "../game"
import { gl } from "../main"
import { ui } from "../ui"
import { Material } from "./material"

let sceneFbo: WebGLFramebuffer
let fxFbo1: WebGLFramebuffer
let fxFbo2: WebGLFramebuffer

let fxBlur1: Material
let fxBlur2: Material
let fxDesat1: Material

const priorityArrays = new Map<E_DrawPriority, { drawable: Drawable, y: number }[]>([
    [E_DrawPriority.Ground, []],
    [E_DrawPriority.Unit, []]
])

const bindReadDrawFramebuffers = (read: WebGLFramebuffer, draw: WebGLFramebuffer | null) =>
{
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, read)
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, draw)
}

const createFramebuffer = () =>
{
    const fbo = gl.createFramebuffer()

    if (!fbo)
    {
        throw Error("Failed to create framebuffer")
    }

    return fbo
}

const createRenderbuffer = (samples: number, format: number, attachment: number) =>
{
    const rbo = gl.createRenderbuffer()

    if (!rbo)
    {
        throw Error("Failed to create renderbuffer")
    }

    gl.bindRenderbuffer(gl.RENDERBUFFER, rbo)
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, format, CANVAS_WIDTH, CANVAS_HEIGHT)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, attachment, gl.RENDERBUFFER, rbo)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
}

const drawRect = () =>
{
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

const init = () =>
{
    sceneFbo = createFramebuffer()
    fxFbo1 = createFramebuffer()
    fxFbo2 = createFramebuffer()

    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFbo)
    const samples = gl.getParameter(gl.MAX_SAMPLES)
    createRenderbuffer(samples, gl.RGBA8, gl.COLOR_ATTACHMENT0)
    createRenderbuffer(samples, gl.DEPTH_COMPONENT16, gl.DEPTH_ATTACHMENT)

    fxBlur1 = new Material("programBlur", "modelImage", "fxTexture1")
    fxBlur2 = new Material("programBlur", "modelImage", "fxTexture2")
    fxDesat1 = new Material("programDesaturate", "modelImage", "fxTexture1")
    fxBlur1.attachTextureToFramebuffer(fxFbo1)
    fxBlur2.attachTextureToFramebuffer(fxFbo2)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}

const render = () =>
{
    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFbo)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    renderDrawablesBackToFront()

    const pauseProgress = ui.getPauseProgress()
    const drawFbo = pauseProgress ? fxFbo1 : null
    bindReadDrawFramebuffers(sceneFbo, drawFbo)
    gl.blitFramebuffer(
        0, 0, CANVAS_WIDTH, CANVAS_HEIGHT,
        0, 0, CANVAS_WIDTH, CANVAS_HEIGHT,
        gl.COLOR_BUFFER_BIT,
        gl.NEAREST
    )

    if (pauseProgress)
    {
        fxBlur(pauseProgress)
        fxDesaturate(pauseProgress)
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}

const renderDrawablesBackToFront = () =>
{
    for (const array of priorityArrays.values())
    {
        array.length = 0
    }

    for (const [drawable, transform] of game.getAll(Drawable, Transform))
    {
        const array = priorityArrays.get(drawable.drawPriority)

        if (!array)
        {
            throw Error(`Missing draw priority queue ${drawable.drawPriority}`)
        }

        array.push({ drawable, y: transform.translation.y })
    }

    for (const array of priorityArrays.values())
    {
        array.sort((a, b) => b.y - a.y)

        for (const entity of array)
        {
            const material = entity.drawable.material
            material.useProgram()
            material.bindTexture()
            material.bindVertexArray()
            material.setUniforms()
            drawRect()
        }
    }
}

const fxBlur = (pauseProgress: number) =>
{
    fxBlur1.useProgram()
    fxBlur1.bindVertexArray()
    const blurSizeLocation = fxBlur1.getUniformLocation("u_size")

    bindReadDrawFramebuffers(fxFbo1, fxFbo2)
    fxBlur1.bindTexture()
    gl.uniform1f(blurSizeLocation, 1.5 * pauseProgress)
    drawRect()

    bindReadDrawFramebuffers(fxFbo2, fxFbo1)
    fxBlur2.bindTexture()
    drawRect()

    bindReadDrawFramebuffers(fxFbo1, fxFbo2)
    fxBlur1.bindTexture()
    gl.uniform1f(blurSizeLocation, 2.5 * pauseProgress)
    drawRect()

    bindReadDrawFramebuffers(fxFbo2, fxFbo1)
    fxBlur2.bindTexture()
    drawRect()
}

const fxDesaturate = (pauseProgress: number) =>
{
    bindReadDrawFramebuffers(fxFbo1, null)
    fxDesat1.useProgram()
    const desatProgressLocation = fxDesat1.getUniformLocation("u_progress")
    gl.uniform1f(desatProgressLocation, pauseProgress)
    fxDesat1.bindTexture()
    fxDesat1.bindVertexArray()
    drawRect()
}

export const renderer = {
    init,
    render
}
