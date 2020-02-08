#version 300 es

precision highp float;

uniform sampler2D tColor;
in vec2 v_texCoord;
out vec4 outColor;

void main() {
    outColor = texture(tColor, v_texCoord);
}