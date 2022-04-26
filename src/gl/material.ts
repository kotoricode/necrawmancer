import { gl } from "../main"
import { T_ModelId, T_ProgramId, T_ShaderId } from "../types"
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../const"

import vertDefault from "./shaders/default.vert"
import fragDefault from "./shaders/default.frag"
import vertImage from "./shaders/image.vert"
import fragBlur from "./shaders/blur.frag"
import fragDesaturate from "./shaders/desaturate.frag"

type T_UniformFormat = "uniform1f" | "uniform2fv" | "uniformMatrix4fv"

const shaderSources: Record<T_ShaderId, string> = Object.freeze({
    vertDefault,
    fragDefault,
    vertImage,
    fragBlur,
    fragDesaturate
})

const programDefinitions: Record<T_ProgramId, { vertId: T_ShaderId, fragId: T_ShaderId }> = Object.freeze({
    programDefault: {
        vertId: "vertDefault",
        fragId: "fragDefault"
    },
    programBlur: {
        vertId: "vertImage",
        fragId: "fragBlur"
    },
    programDesaturate: {
        vertId: "vertImage",
        fragId: "fragDesaturate"
    }
})

const modelAttributes: Record<T_ModelId, { [key: string]: { [key: string]: number } }> = Object.freeze({
    modelDefault: {
        a_position: {
            size: 2,
            offset: 8 * Float32Array.BYTES_PER_ELEMENT
        },
        a_texcoord: {
            size: 2,
            offset: 0
        }
    },
    modelGround: {
        a_position: {
            size: 2,
            offset: 16 * Float32Array.BYTES_PER_ELEMENT
        },
        a_texcoord: {
            size: 2,
            offset: 0
        }
    },
    modelImage: {
        a_position: {
            size: 2,
            offset: 24 * Float32Array.BYTES_PER_ELEMENT
        },
        a_texcoord: {
            size: 2,
            offset: 0
        }
    }
})

const programUniformFormats: Record<T_ProgramId, { [key: string]: T_UniformFormat }> = Object.freeze({
    programDefault: {
        u_transform: "uniform2fv",
        u_viewProjection: "uniformMatrix4fv",
        u_facing: "uniform1f"
    },
    programBlur: {
        u_size: "uniform1f"
    },
    programDesaturate: {
    }
})

const compiledShaders = new Map<T_ShaderId, WebGLShader>()
const linkedPrograms = new Map<T_ProgramId, WebGLProgram>()
const textures = new Map<string, WebGLTexture>()

const missingTextureSide = 8
const missingTexturePixels = [
    [0xEC, 0x66, 0xFF, 255],
    [0x33, 0, 0x99, 255]
]
const missingTexture = new Uint8Array(missingTextureSide ** 2 * 4)
for (let i = 0; i < missingTextureSide; i++)
{
    const iOff = i * 4 * missingTextureSide
    const iMod2 = i % 2

    for (let j = 0; j < missingTextureSide; j++)
    {
        const ijOff = iOff + j * 4
        const pixel = missingTexturePixels[iMod2 ^ (j % 2)]
        missingTexture[ijOff] = pixel[0]
        missingTexture[ijOff+1] = pixel[1]
        missingTexture[ijOff+2] = pixel[2]
        missingTexture[ijOff+3] = pixel[3]
    }
}

let programInUse: WebGLProgram
let textureInUse: WebGLTexture

export class Material
{
    private static buffer: WebGLBuffer

    private program: WebGLProgram
    private texture: WebGLTexture
    private vao: WebGLVertexArrayObject
    private stagedUniforms = new Map<string, number | number[]>()
    private readonly uniformFormats: { [key: string]: T_UniformFormat }

    constructor(programId: T_ProgramId, modelId: T_ModelId, textureId: string)
    {
        this.program = this.getProgram(programId)
        this.texture = this.getTexture(textureId)
        this.vao = this.getVertexArray(modelId)
        this.uniformFormats = programUniformFormats[programId]
    }

    private static createFramebufferTexture = (textureId: string) =>
    {
        const texture = gl.createTexture()

        if (!texture)
        {
            throw Error("Failed to create texture")
        }

        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, CANVAS_WIDTH, CANVAS_HEIGHT)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.bindTexture(gl.TEXTURE_2D, null)

        textures.set(textureId, texture)
    }

    static init()
    {
        const buffer = gl.createBuffer()

        if (!buffer)
        {
            throw Error("Failed to create buffer")
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

        const vertices = new Float32Array([
            // Image texture coordinates
            0, 1,
            1, 1,
            0, 0,
            1, 0,

            // Unit model
            -50, 0,
            50, 0,
            -50, 100,
            50, 100,

            // Ground model
            -CANVAS_WIDTH/2, -CANVAS_HEIGHT/2,
            CANVAS_WIDTH/2, -CANVAS_HEIGHT/2,
            -CANVAS_WIDTH/2, CANVAS_HEIGHT/2,
            CANVAS_WIDTH/2, CANVAS_HEIGHT/2,

            // Image model
            -1, 1,
            1, 1,
            -1, -1,
            1, -1,
        ])

        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)

        this.buffer = buffer

        this.createFramebufferTexture("fxTexture1")
        this.createFramebufferTexture("fxTexture2")
    }

    private getProgram(programId: T_ProgramId)
    {
        const existing = linkedPrograms.get(programId)

        if (existing)
        {
            return existing
        }

        const program = gl.createProgram()

        if (!program)
        {
            throw Error("Failed to create program")
        }

        const definition = programDefinitions[programId]
        const vertShader = this.getShader(definition.vertId, gl.VERTEX_SHADER)
        const fragShader = this.getShader(definition.fragId, gl.FRAGMENT_SHADER)

        gl.attachShader(program, vertShader)
        gl.attachShader(program, fragShader)
        gl.linkProgram(program)
        gl.detachShader(program, vertShader)
        gl.detachShader(program, fragShader)

        linkedPrograms.set(programId, program)

        return program
    }

    private getShader(shaderId: T_ShaderId, shaderType: number)
    {
        const existing = compiledShaders.get(shaderId)

        if (existing)
        {
            return existing
        }

        const shader = gl.createShader(shaderType)

        if (!shader)
        {
            throw Error("Failed to create shader")
        }

        const shaderSource = shaderSources[shaderId]

        gl.shaderSource(shader, shaderSource)
        gl.compileShader(shader)

        compiledShaders.set(shaderId, shader)

        return shader
    }

    private getTexture(textureName: string)
    {
        const existing = textures.get(textureName)

        if (existing)
        {
            return existing
        }

        const texture = gl.createTexture()

        if (!texture)
        {
            throw Error("Failed to create texture")
        }

        textures.set(textureName, texture)

        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, missingTextureSide, missingTextureSide, 0, gl.RGBA, gl.UNSIGNED_BYTE, missingTexture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.generateMipmap(gl.TEXTURE_2D)
        gl.bindTexture(gl.TEXTURE_2D, null)

        const image = new Image()
        image.addEventListener("load", async () =>
        {
            const bitmap = await createImageBitmap(image, {
                premultiplyAlpha: "premultiply"
            })

            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
            gl.generateMipmap(gl.TEXTURE_2D)
            gl.bindTexture(gl.TEXTURE_2D, null)
        }, { once: true })
        image.src = `./image/${textureName}`

        return texture
    }

    private getVertexArray(modelId: T_ModelId)
    {
        const vao = gl.createVertexArray()

        if (!vao)
        {
            throw Error("Failed to create VAO")
        }

        gl.bindVertexArray(vao)
        gl.bindBuffer(gl.ARRAY_BUFFER, Material.buffer)

        for (const [attribute, layout] of Object.entries(modelAttributes[modelId]))
        {
            const location = gl.getAttribLocation(this.program, attribute)
            gl.enableVertexAttribArray(location)
            gl.vertexAttribPointer(location, layout.size, gl.FLOAT, false, 0, layout.offset)
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null)
        gl.bindVertexArray(null)

        return vao
    }

    attachTextureToFramebuffer = (fbo: WebGLFramebuffer) =>
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0)
    }

    bindTexture()
    {
        if (this.texture !== textureInUse)
        {
            textureInUse = this.texture
            gl.bindTexture(gl.TEXTURE_2D, textureInUse)
        }
    }

    bindVertexArray()
    {
        gl.bindVertexArray(this.vao)
    }

    getUniformLocation(uniform: string)
    {
        return gl.getUniformLocation(this.program, uniform)
    }

    setUniforms()
    {
        for (const [uniform, value] of this.stagedUniforms.entries())
        {
            const location = gl.getUniformLocation(this.program, uniform) // TODO cache these
            const format = this.uniformFormats[uniform]

            switch (format)
            {
                case "uniform1f":
                    if (Array.isArray(value))
                    {
                        throw Error(`Invalid value type ${typeof value} for uniform format ${format}`)
                    }
                    gl[format](location, value)
                    break

                case "uniform2fv":
                    if (!Array.isArray(value))
                    {
                        throw Error(`Invalid value type ${typeof value} for uniform format ${format}`)
                    }
                    gl[format](location, value)
                    break

                case "uniformMatrix4fv":
                    if (!Array.isArray(value))
                    {
                        throw Error(`Invalid value type ${typeof value} for uniform format ${format}`)
                    }
                    gl[format](location, false, value)
                    break
            }
        }
    }

    stageUniform(uniform: string, value: number | number[])
    {
        this.stagedUniforms.set(uniform, value)
    }

    useProgram()
    {
        if (this.program !== programInUse)
        {
            programInUse = this.program
            gl.useProgram(programInUse)
        }
    }
}
