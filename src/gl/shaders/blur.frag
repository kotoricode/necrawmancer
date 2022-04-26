#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform float u_size;
in vec2 v_texcoord;
out vec4 out_color;

void main()
{
    vec2 px = u_size / vec2(textureSize(u_texture, 0));
    vec2 p = v_texcoord + px;
    vec2 n = v_texcoord - px;

    out_color = (
        texture(u_texture, n) +
        texture(u_texture, vec2(p.x, n.y)) +
        texture(u_texture, vec2(n.x, p.y)) +
        texture(u_texture, p)
    ) / 4.;
}
