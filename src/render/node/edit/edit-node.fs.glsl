#version 300 es
precision mediump float;

in vec4 v_color;

layout(location = 0) out vec4 f_color;
layout(location = 1) out vec3 f_normal;
layout(location = 2) out vec3 f_position;


void main() {
    f_color = v_color;
    f_normal = vec3(0.0, 0.0, 0.0);
    f_position = vec3(0.0, 0.0, 0.0);
}