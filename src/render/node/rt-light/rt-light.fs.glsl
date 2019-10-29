#version 300 es
precision highp float;

uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tPosition;
uniform sampler2D tChunks;
uniform sampler2D tLastRT;

uniform vec3 cameraPosition;
uniform vec3 cameraRotation;
uniform int rtBlocks;
uniform float frame;
uniform vec2 sampleSize;
uniform mat4 oldMVP;

in vec2 v_texCoord;
in vec3 rayDirection;
in vec3 rayOrigin;

layout(location = 0) out vec4 f_color;

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
    vec4 l = texture(tLastRT, v_texCoord);



    vec3 sun1 = normalize(vec3(0.5, -0.75, 1.0));
    vec3 sun2 = normalize(vec3(-0.5, 0.75, -1.0));

    if (length(n.xyz) < 0.1 || length(n.xyz) > 1.1) {
        f_color = d;
    } else {
        vec4 block;


        vec3 normal = vec3(0);
        vec2 dist = vec2(.00000001, 10);


        vec3 rand = hash32(uvec2(v_texCoord * 4096.0 * frame)) * 2.0 - 1.0;

        float rt = MAX_DIST;
        for (int x = 0; x < rtBlocks; ++x) {
            block = texelFetch(tChunks, ivec2(x, 0), 0);
            if (block.w == 0.0) {
                break;
            }
            rt = min(iBox(p.xyz - block.xyz, rand + sun1 * 16.0, dist, normal, vec3(block.w)), rt);

        }

        vec4 rtSun = rt > 1.0 ? vec4(1.0) : vec4(0.0);

        rt = MAX_DIST;
        for (int x = 0; x < rtBlocks; ++x) {
            block = texelFetch(tChunks, ivec2(x, 0), 0);
            if (block.w == 0.0) {
                break;
            }
            rt = min(iBox(p.xyz - block.xyz, rand + n.xyz, dist, normal, vec3(block.w)), rt);

        }
        vec4 rtAO = vec4(rt);

        f_color = (rtAO + rtSun) / 2.0;



        ///////////////////////////////////////////
        // TAA
        //////////////////////////////////////////

        vec4 posOld = oldMVP * vec4(p.xyz, 1.0);
        vec2 uvOld = (posOld.xy / posOld.w) * 0.5 + 0.5;


        float blend = 0.95;

        if (abs(uvOld.x) > 1.0 || abs(uvOld.y) > 1.0) {
            blend = 0.0;
        }


        vec3 sum = vec3(0);
        int samples = 0;
        for (float x = -1.; x <= 1.; x+=1.) {
            for (float y = -1.; y <= 1.; y+=1.) {
                sum += texture(tLastRT, uvOld + vec2(x, y) * sampleSize).rgb;
                samples++;
            }
        }



        f_color.rgb = mix(f_color.rgb, sum / float(samples), blend);
    }
}