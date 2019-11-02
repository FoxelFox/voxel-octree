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
#define SUN normalize(vec3(0.25, -0.125, 0.5))

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

vec3 sky(vec3 rd) {
    float sun_amount = max(dot(rd, SUN), 0.0);
    vec3 sun_color = vec3(1.0, .95, 0.9);

    vec3  sky = mix(vec3(.4, .5, .6), vec3(.55, .65, .75), 1.0 - rd.y);
    sky = sky + sun_color * min(pow(sun_amount, 1500.0) * 5.0, 1.0);
    sky = sky + sun_color * min(pow(sun_amount, 10.0) * .6, 1.0);

    return sky;
}

vec4 hit(in vec3 ro, in vec3 rd, inout vec3 normal) {
    float rtMin = MAX_DIST;
    vec4 blockMin = vec4(1);
    vec3 normalMin = vec3(0);
    float rt;
    vec4 block;
    vec2 dist = vec2(.00000001, 10);
    for (int x = 0; x < rtBlocks; ++x) {
        block = texelFetch(tChunks, ivec2(x, 0), 0);
        if (block.w == 0.0) {
            break;
        }
        rt = iBox(ro - block.xyz, rd, dist, normal, vec3(block.w));
        if (rt < rtMin) {
            rtMin = rt;
            normalMin = normal;
            blockMin = block;
        }
    }

    normal = normalMin;
    vec3 sun1 = normalize(vec3(0.5, -0.75, 1.0));
    return rtMin > 1.0 ? vec4(sky(rd), 1.0) : vec4(0);
}



void main() {

    vec4 d = texture(tDiffuse, v_texCoord);
    vec4 n = texture(tNormal, v_texCoord);
    vec4 p = texture(tPosition, v_texCoord);
    vec4 l = texture(tLastRT, v_texCoord);



    vec3 sun1 = normalize(vec3(0.5, -0.75, 1.0));
    vec3 sun2 = normalize(vec3(-0.5, 0.75, -1.0));

    if (length(n.xyz) < 0.1 || length(n.xyz) > 1.1) {
        f_color.xyz = sky(normalize(rayDirection));
    } else {
        vec4 block;
        vec3 normal = vec3(0);
        vec2 dist = vec2(.00000001, 10);
        vec3 rand = hash32(uvec2(v_texCoord * 4096.0 * frame)) * 2.0 - 1.0;

        vec4 h = hit(p.xyz, rand + n.xyz, normal);

        //vec4 rtSun = vec4(rt);


        f_color = h;
        //f_color = d * rtAO;

    }
}