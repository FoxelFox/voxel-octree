#version 300 es

precision highp float;

in vec4 v_color;
layout(location = 0) out vec4 f_color;

void main() {
    f_color = v_color;
}