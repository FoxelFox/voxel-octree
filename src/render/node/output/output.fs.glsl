#version 300 es
precision highp float;

uniform sampler2D tFinal;
in vec2 v_texCoord;
out vec4 outColor;



void main() {

    float gamma = 2.2;
    vec4 sum = texture(tFinal, v_texCoord);
    outColor.rgb = pow(1.0 + log(sum.rgb / sum.w) / 4.0, vec3(gamma));
}
