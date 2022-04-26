import esbuild from "esbuild"
import fs from "fs"
import process from "process"

const minify = process.argv.includes("minify")

esbuild.build({
    bundle: true,
    color: true,
    entryPoints: ["src/main.ts"],
    minify,
    outfile: "dist/main.js",
    plugins: [{
        name: "glsl",
        setup(build)
        {
            const buildOptions = {
                filter: /\.(?:vert|frag)$/u
            }

            build.onLoad(buildOptions, args => ({
                loader: "text",
                contents: fs.readFileSync(args.path, "utf-8")
            }))
        }
    }]
})
