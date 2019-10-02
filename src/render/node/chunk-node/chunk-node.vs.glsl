#version 300 es



uniform mat4 mvp;


in vec3 position;
out vec4 v_color;

void main() {
    gl_PointSize = 1.0;
    gl_Position = mvp * vec4(position, 1.0);

    v_color.rgb = position;
}
