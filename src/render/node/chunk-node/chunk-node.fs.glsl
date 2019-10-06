#version 300 es

precision highp float;

in vec4 v_color;
layout(location = 0) out vec4 f_color;

void main() {
    //f_color = vec4((v_color.rgb + 1.0) * 0.5, 1.0);
    f_color = vec4( 1.0);
}