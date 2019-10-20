#version 300 es
precision highp float;

uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tPosition;
uniform sampler2D tChunks;
uniform vec3 cameraPosition;
uniform vec3 cameraRotation;
uniform int rtBlocks;

in vec2 v_texCoord;
in vec3 rayDirection;
in vec3 rayOrigin;

layout(location = 0) out vec4 f_color;
layout(location = 1) out vec4 f_normal;
layout(location = 2) out vec4 f_position;

#define MAX_DIST 1e10

float iBox( in vec3 ro, in vec3 rd, in vec2 distBound, inout vec3 normal, in vec3 boxSize ) {
    vec3 m = sign(rd)/max(abs(rd), 1e-8);
    vec3 n = m*ro;
    vec3 k = abs(m)*boxSize;

    vec3 t1 = -n - k;
    vec3 t2 = -n + k;

    float tN = max( max( t1.x, t1.y ), t1.z );
    float tF = min( min( t2.x, t2.y ), t2.z );

    if (tN > tF || tF <= 0.) {
        return MAX_DIST;
    } else {
        if (tN >= distBound.x && tN <= distBound.y) {
            normal = -sign(rd)*step(t1.yzx,t1.xyz)*step(t1.zxy,t1.xyz);
            return tN;
        } else if (tF >= distBound.x && tF <= distBound.y) {
            normal = -sign(rd)*step(t1.yzx,t1.xyz)*step(t1.zxy,t1.xyz);
            return tF;
        } else {
            return MAX_DIST;
        }
    }
}

float rand(float n){return fract(sin(n) * 43758.5453123);}
float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(float p){
    float fl = floor(p);
    float fc = fract(p);
    return mix(rand(fl), rand(fl + 1.0), fc);
}

float noise(vec2 n) {
    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

void main() {

    vec4 d = texture(tDiffuse, v_texCoord);
    vec4 n = texture(tNormal, v_texCoord);
    vec4 p = texture(tPosition, v_texCoord);



    vec3 sun1 = normalize(vec3(0.5, -0.75, 1.0));
    vec3 sun2 = normalize(vec3(-0.5, 0.75, -1.0));

    if (length(n.xyz) < 0.1 || length(n.xyz) > 1.1) {
        f_color = d;
        f_normal = n;
        f_position = p;
    } else {
        vec4 block;
        float rt = MAX_DIST;
        float rt0 = MAX_DIST;
        float rt1 = MAX_DIST;
        float rt2 = MAX_DIST;
        float rt3 = MAX_DIST;
        float rt4 = MAX_DIST;
        float rt5 = MAX_DIST;

        vec3 normal = vec3(0);
        vec2 dist = vec2(.0001, 100);

        for (int x = 0; x < rtBlocks; ++x) {
            block = texelFetch(tChunks, ivec2(x, 0), 0);
            if (block.w == 0.0) {
                break;
            }


            rt = min(iBox(p.xyz - block.xyz, sun1, dist, normal, vec3(block.w)), rt);

        }




        vec4 sun1Light = max(dot(sun1, n.xyz), 0.0) * vec4(1.0, 0.95, 0.95, 1.0);

        sun1Light = rt > 1.0 ? vec4(1.0) : vec4(0.1);
        //rt0 = rt0 > 1.0 ? min(rt0, 1.0) : 0.25;



        f_color = d * sun1Light;
        f_normal.xyz = rayDirection;
        f_position = p;
    }
}