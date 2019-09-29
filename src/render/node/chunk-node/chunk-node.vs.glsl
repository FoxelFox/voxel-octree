#version 300 es



uniform mat4 view;
uniform vec3 offset;

in vec3 position;
out vec4 v_color;

void main() {
    gl_PointSize = 16.0;
    gl_Position = vec4(position - offset, 1.0) * view;

    v_color = vec4(1.0);
}
