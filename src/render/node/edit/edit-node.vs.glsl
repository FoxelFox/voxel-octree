#version 300 es

uniform mat4 mvp;

in vec4 position;
out vec4 v_color;

void main() {
    gl_Position = mvp * position;
    gl_Position.z = gl_Position.z -0.000001;
    v_color = vec4(1.0);
}