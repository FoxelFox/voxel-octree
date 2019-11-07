#version 300 es
precision highp float;

uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tPosition;

uniform sampler2D tRTLight;
uniform sampler2D tRTFiltered;
uniform sampler2D tChunks;

uniform mat4 oldMVP;
uniform int rtBlocks;
uniform vec2 sampleSize;
uniform vec2 sampleRTSize;

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
    vec3 n = texture(tNormal, v_texCoord).xyz;
    vec4 p = texture(tPosition, v_texCoord);

    vec4 rtC = texture(tRTLight, v_texCoord);


    vec4 posOld = oldMVP * vec4(p.xyz, 1.0);
    vec2 uvOld = (posOld.xy / posOld.w) * 0.5 + 0.5;


    vec4 rtL = texture(tRTFiltered, uvOld);

    float blend = 0.95;

    // TODO
    if (abs(uvOld.x -0.5) > 0.5 || abs(uvOld.y-0.5) > 0.5 || abs(rtL.w - rtC.w) > 0.05) {
        blend = 0.25;
    }


    vec3 mx = vec3(0);
    vec3 mn = vec3(1);
    int samples = 0;
    
    float bounds = 2.0;
    vec3 sum = vec3(0);

    if (length(n.xyz) < 0.1 || length(n.xyz) > 1.1) {
        outColor = rtC;
    } else {
        outColor = mix(rtC, rtL, blend);     
        outColor.w = rtC.w;
    }

    

    
    
    
}
