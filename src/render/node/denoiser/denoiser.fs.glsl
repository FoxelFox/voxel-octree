#version 300 es
precision lowp float;

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


    vec3 nL = texture(tNormal, uvOld).xyz;
    vec3 dL = texture(tDiffuse, uvOld).rgb;
    vec4 rtL = texture(tRTFiltered, uvOld);

    float blend = (n == nL && d == dL)  ? 0.94 : 0.7;

    // TODO
    if (abs(uvOld.x -0.5) > 0.5 || abs(uvOld.y-0.5) > 0.5 || abs(rtL.w - rtC.w) > 0.01 || d != dL ) {
        blend = 0.1;
        rtL = texture(tRTFiltered, v_texCoord);
    }
    
    
    if (length(n.xyz) < 0.1 || length(n.xyz) > 1.1) {
        // cursor
        outColor = rtC;
    } else {
        //outColor = mix(rtC, rtL, blend);     




        
        outColor.rgb = mix(rtC.rgb, rtL.rgb , blend);


        outColor.w = rtC.w;
        // outColor.rgb = sum / float(samples);
    }
    
}
