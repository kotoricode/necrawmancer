#version 300 es

uniform mat4 u_viewProjection;
uniform vec2 u_transform;
uniform float u_facing;
in vec2 a_position;
in vec2 a_texcoord;
out vec2 v_texcoord;

void main()
{
    gl_Position = u_viewProjection * vec4(a_position + u_transform, 0, 1);
    v_texcoord = vec2(abs(0.5 * u_facing + a_texcoord.x - 0.5), a_texcoord.y);
}
