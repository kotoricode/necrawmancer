let ctx: AudioContext
let gain: GainNode
const element = new Audio()
element.loop = true
element.addEventListener("canplaythrough", () =>
{
    element.play()
}, { once: true })

const init = () =>
{
    ctx = new AudioContext()
    gain = ctx.createGain()
    gain.connect(ctx.destination)
    element.src = "./audio/bgm.mp3"
}

export const audio = {
    init
}
