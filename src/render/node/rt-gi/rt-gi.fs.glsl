#version 300 es
precision highp float;

uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tPosition;

uniform sampler2D tRTLight;
uniform sampler2D tRTNormal;
uniform sampler2D tRTPosition;


in vec2 v_texCoord;

out vec4 outColor;


void main() {

    vec3 d = texture(tDiffuse, v_texCoord).rgb;
    vec3 n = texture(tNormal, v_texCoord).xyz;
    vec3 p = texture(tPosition, v_texCoord).xyz;

    vec3 rtC = texture(tRTLight, v_texCoord).rgb;
    vec3 rtN = texture(tRTNormal, v_texCoord).xyz;
    vec3 rtP = texture(tRTPosition, v_texCoord).xyz;


    vec3 sum = vec3(0.0);

    float dist = distance(p, rtP);
    vec3 intensity = dot(n, -rtN) * rtC / (1.0 + dist);

    outColor.rgb = intensity * d;

    for (float x = 0.0; x < 1.0; x = x + 0.125) {
        for (float y = 0.0; y < 1.0; y = y + 0.125) {

            vec3 rtC = texture(tRTLight, vec2(x,y)).rgb;
            vec3 rtN = texture(tRTNormal, vec2(x,y)).xyz;
            vec3 rtP = texture(tRTPosition, vec2(x,y)).xyz;

            float dist = distance(p, rtP);

            //vec3 intensity = dot(n, -rtN) * rtC / (1.0 + dist);
            vec3 intensity = rtC / (1.0 + dist);

            sum += intensity * d;


        }
    }

    outColor.rgb += d * sum / 64.0;

}
