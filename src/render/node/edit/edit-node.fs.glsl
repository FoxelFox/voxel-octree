#version 300 es
precision mediump float;

in vec4 v_color;

layout(location = 0) out vec4 f_color;
layout(location = 1) out vec4 f_normal;
layout(location = 2) out vec4 f_position;


void main() {
    f_color = v_color;
}