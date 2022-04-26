#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform float u_progress;
in vec2 v_texcoord;
out vec4 out_color;

void main()
{
    vec4 color = texture(u_texture, v_texcoord);
    float gray = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
    out_color = mix(
        color,
        vec4(gray, gray, gray, color.a),
        u_progress
    );
}
