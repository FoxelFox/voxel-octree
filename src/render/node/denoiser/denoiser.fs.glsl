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

    vec4 d = texture(tDiffuse, v_texCoord);
    vec3 n = texture(tNormal, v_texCoord).xyz;
    vec4 p = texture(tPosition, v_texCoord);

    vec4 rtC = texture(tRTLight, v_texCoord);

    vec4 posOld = oldMVP * vec4(p.xyz, 1.0);
    vec2 uvOld = (posOld.xy / posOld.w) * 0.5 + 0.5;


    vec3 nL = texture(tNormalL, uvOld).xyz;
    vec4 dL = texture(tDiffuseL, uvOld);
    vec4 pL = texture(tPositionL, uvOld);
    vec4 rtL = texture(tRTLightL, uvOld);

    vec4 sum = texture(tRTFiltered, uvOld);

    if (sum.w >= 60.0 && reset < 1.0) {
        sum = vec4(sum.rgb / 2.0, sum.w / 2.0);
    }

    // TODO
    if (abs(uvOld.x -0.5) > 0.5 || abs(uvOld.y-0.5) > 0.5 || d != dL || n != nL || abs(pL.w - p.w) > 0.01) {
    
        
        sum = vec4(sum.rgb / 15.0, sum.w / 15.0);
        //rtC = texture(tRTLightL, v_texCoord);
        //sum = vec4(rtC.rgb, 1.0);
    }
    
    
    if (length(n.xyz) < 0.1 || length(n.xyz) > 1.1 || length(nL.xyz) < 0.1 || length(nL.xyz) > 1.1) {
        // cursor
    
        //outColor = vec4(rtC.rgb, 1.0);
        sum = vec4(rtC.rgb, 1.0);
    }

    
    outColor = sum + vec4(rtC.rgb , 1.0);        
    

    
    

}

