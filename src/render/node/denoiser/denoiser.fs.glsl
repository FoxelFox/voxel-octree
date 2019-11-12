#version 300 es
precision highp float;

uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tPosition;

uniform sampler2D tDiffuseL;
uniform sampler2D tNormalL;
uniform sampler2D tPositionL;
uniform sampler2D tRTLightL;


uniform sampler2D tRTLight;
uniform sampler2D tRTFiltered;
uniform sampler2D tChunks;

uniform mat4 oldMVP;
uniform int rtBlocks;
uniform vec2 sampleSize;
uniform vec2 sampleRTSize;
uniform float reset;

in vec2 v_texCoord;

out vec4 outColor;


void main() {

    vec3 d = texture(tDiffuse, v_texCoord).rgb;
    vec3 n = texture(tNormal, v_texCoord).xyz;
    vec4 p = texture(tPosition, v_texCoord);

    vec4 rtC = texture(tRTLight, v_texCoord);

    vec4 posOld = oldMVP * vec4(p.xyz, 1.0);
    vec2 uvOld = (posOld.xy / posOld.w) * 0.5 + 0.5;


    vec3 nL = texture(tNormalL, uvOld).xyz;
    vec3 dL = texture(tDiffuseL, uvOld).rgb;
    vec4 pL = texture(tPositionL, uvOld);
    vec4 rtL = texture(tRTLightL, uvOld);

    vec4 sum = texture(tRTFiltered, uvOld);

    float blend = ( d == dL && abs(pL.w - p.w) < 0.01)  ? 0.94 : 0.0;


    // TODO
    if (abs(uvOld.x -0.5) > 0.5 || abs(uvOld.y-0.5) > 0.5) {
        blend = 0.25;
        rtL = texture(tRTLightL, v_texCoord);
    }
    
    
    if (length(n.xyz) < 0.1 || length(n.xyz) > 1.1) {
        // cursor
        outColor = vec4(rtC.rgb, 1.0);
    } else {
        //outColor = mix(rtC, rtL, blend);     

        vec3 mx = vec3(0);
        vec3 mn = vec3(1);

        for (float x = -1.; x <= 1.; x+=1.) {
            for (float y = -1.; y <= 1.; y+=1.) {
                vec3 rtc = texture(tRTLight, v_texCoord + vec2(x, y) * sampleSize).rgb;
                mx = max(rtc, mx);
                mn = min(rtc, mn);
            }
        }

        vec3 clamped = clamp(sum.rgb / sum.w, mn, mx);
        vec3 cL = mix(rtC.rgb, clamped, 0.5);

        // if (blend > 0.5) {
        //     outColor = sum + vec4(cL, 1);
        // } else {

            
        // }

        
        outColor = vec4(mix(rtC.rgb, sum.rgb / sum.w, blend), 1.0);

        if (reset < 0.5) {
            outColor = sum + vec4(rtC.rgb, 1.0);
        } else {
            outColor = vec4(mix(rtC.rgb, sum.rgb / sum.w, blend), 1.0);
        }
        
    
    }
    
}
