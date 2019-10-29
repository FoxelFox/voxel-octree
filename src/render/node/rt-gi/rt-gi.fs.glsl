#version 300 es
precision highp float;

uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tPosition;

uniform sampler2D tRTLight;


uniform sampler2D tChunks;

uniform int rtBlocks;
uniform vec2 sampleSize;

in vec2 v_texCoord;

out vec4 outColor;


#define MAX_DIST 1e10


uint baseHash( uvec2 p ) {
    p = 1103515245U*((p >> 1U)^(p.yx));
    uint h32 = 1103515245U*((p.x)^(p.y>>3U));
    return h32^(h32 >> 16);
}

vec3 hash32(uvec2 x)
{
    uint n = baseHash(x);
    uvec3 rz = uvec3(n, n*16807U, n*48271U);
    return vec3((rz >> 1) & uvec3(0x7fffffffU))/float(0x7fffffff);
}


void main() {

    vec3 d = texture(tDiffuse, v_texCoord).rgb;
    //vec3 n = texture(tNormal, v_texCoord).xyz;
    //vec3 p = texture(tPosition, v_texCoord).xyz;

    vec3 rtC = texture(tRTLight, v_texCoord).rgb;

    outColor.rgb = d * rtC;
}
