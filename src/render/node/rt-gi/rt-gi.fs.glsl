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
    vec3 p = texture(tPosition, v_texCoord).xyz;

    vec3 rtC = texture(tRTLight, v_texCoord).rgb;


    vec4 posOld = oldMVP * vec4(p.xyz, 1.0);
    vec2 uvOld = (posOld.xy / posOld.w) * 0.5 + 0.5;
    vec3 rtL = texture(tRTFiltered, uvOld).rgb;

    float blend = 0.7;

    // TODO
    if (abs(uvOld.x -0.5) > 0.5 || abs(uvOld.y-0.5) > 0.5) {
        blend = 0.1;
    }


    vec3 mx = vec3(0);
    vec3 mn = vec3(1);


    for (float x = -1.; x <= 1.; x+=1.) {
        for (float y = -1.; y <= 1.; y+=1.) {
            vec3 rtc = texture(tRTLight, v_texCoord + vec2(x, y) * sampleSize).rgb;
            mx = max(rtc, mx);
            mn = min(rtc, mn);
        }
    }

    vec3 clamped = clamp(rtL, mn, mx);
    outColor.rgb = mix(rtC, clamped, blend);
}
