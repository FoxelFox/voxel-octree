#version 300 es
precision mediump float;

uniform sampler2D image;
in vec2 v_texCoord;
out vec4 outColor;

void main() {
    outColor = texture(image, v_texCoord);
}