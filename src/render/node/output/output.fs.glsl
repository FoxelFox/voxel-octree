#version 300 es
precision mediump float;

uniform sampler2D image;
in vec2 v_texCoord;
out vec4 outColor;

void main() {

    if (v_texCoord.x > 0.4999 && v_texCoord.x < 0.5001 && v_texCoord.y > 0.4999 && v_texCoord.y < 0.5001) {
        outColor = vec4(1.0);
    } else {
        outColor = texture(image, v_texCoord);
    }

}