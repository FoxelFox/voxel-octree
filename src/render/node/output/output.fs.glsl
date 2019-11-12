#version 300 es
precision highp float;

uniform sampler2D tFinal;
in vec2 v_texCoord;
out vec4 outColor;



void main() {

    float gamma = 1.5;
    vec4 sum = texture(tFinal, v_texCoord);
    outColor.rgb = pow(0.95 + log(sum.rgb / sum.w) / 4.0, vec3(gamma));
}
