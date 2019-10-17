#version 300 es
precision highp float;

uniform sampler2D chunks;
uniform mat4 mvp;
uniform vec3 cameraPosition;
uniform vec3 cameraRotation;
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform int iFrame;

in vec2 v_texCoord;
in vec3 rayDirection;
in vec3 rayOrigin;

#define MAX_DIST 1e10
#define PATH_LENGTH 12
#define LAMBERTIAN 0.
#define METAL 1.
#define DIELECTRIC 2.

layout(location = 0) out vec4 f_color;


const float EPS = 0.0001;
const float START_T = 100000.0;
const int MAX_DEPTH = 3;

vec3 opU( vec3 d, float iResult, float mat ) {
    return (iResult < d.y) ? vec3(d.x, iResult, mat) : d;
}

uint baseHash( uvec2 p ) {
    p = 1103515245U*((p >> 1U)^(p.yx));
    uint h32 = 1103515245U*((p.x)^(p.y>>3U));
    return h32^(h32 >> 16);
}

float hash1( inout float seed ) {
    uint n = baseHash(floatBitsToUint(vec2(seed+=.1,seed+=.1)));
    return float(n)/float(0xffffffffU);
}

vec2 hash2( inout float seed ) {
    uint n = baseHash(floatBitsToUint(vec2(seed+=.1,seed+=.1)));
    uvec2 rz = uvec2(n, n*48271U);
    return vec2(rz.xy & uvec2(0x7fffffffU))/float(0x7fffffff);
}

float FresnelSchlickRoughness( float cosTheta, float F0, float roughness ) {
    return F0 + (max((1. - roughness), F0) - F0) * pow(abs(1. - cosTheta), 5.0);
}

vec3 cosWeightedRandomHemisphereDirection( const vec3 n, inout float seed ) {
    vec2 r = hash2(seed);
    vec3  uu = normalize(cross(n, abs(n.y) > .5 ? vec3(1.,0.,0.) : vec3(0.,1.,0.)));
    vec3  vv = cross(uu, n);
    float ra = sqrt(r.y);
    float rx = ra*cos(6.28318530718*r.x);
    float ry = ra*sin(6.28318530718*r.x);
    float rz = sqrt(1.-r.y);
    vec3  rr = vec3(rx*uu + ry*vv + rz*n);
    return normalize(rr);
}

bool modifiedRefract(const in vec3 v, const in vec3 n, const in float ni_over_nt,
out vec3 refracted) {
    float dt = dot(v, n);
    float discriminant = 1. - ni_over_nt*ni_over_nt*(1.-dt*dt);
    if (discriminant > 0.) {
        refracted = ni_over_nt*(v - n*dt) - n*sqrt(discriminant);
        return true;
    } else {
        return false;
    }
}

vec3 modifyDirectionWithRoughness( const vec3 normal, const vec3 n, const float roughness, inout float seed ) {
    vec2 r = hash2(seed);

    vec3  uu = normalize(cross(n, abs(n.y) > .5 ? vec3(1.,0.,0.) : vec3(0.,1.,0.)));
    vec3  vv = cross(uu, n);

    float a = roughness*roughness;

    float rz = sqrt(abs((1.0-r.y) / clamp(1.+(a - 1.)*r.y,.00001,1.)));
    float ra = sqrt(abs(1.-rz*rz));
    float rx = ra*cos(6.28318530718*r.x);
    float ry = ra*sin(6.28318530718*r.x);
    vec3  rr = vec3(rx*uu + ry*vv + rz*n);

    vec3 ret = normalize(rr);
    return dot(ret,normal) > 0. ? ret : n;
}

vec2 randomInUnitDisk( inout float seed ) {
    vec2 h = hash2(seed) * vec2(1,6.28318530718);
    float phi = h.y;
    float r = sqrt(h.x);
    return r*vec2(sin(phi),cos(phi));
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


vec3 worldhit( in vec3 ro, in vec3 rd, in vec2 dist, out vec3 normal ) {
    vec3 tmp0, tmp1, d = vec3(dist, 0.);

    vec4 block;
    for (int x = 0; x < 1024; ++x) {
        block = texelFetch(chunks, ivec2(x, 0), 0);
        if (block.w == 0.0) {
            break;
        }
        d = opU(d, iBox(ro - block.xyz, rd, d.xy, normal, vec3(block.w)), 7.);
    }

    return d;
}

vec3 pal(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
    return a + b*cos(6.28318530718*(c*t+d));
}

float checkerBoard( vec2 p ) {
    return mod(floor(p.x) + floor(p.y), 2.);
}

vec3 getSkyColor( vec3 rd ) {
//    vec3 col = mix(vec3(1),vec3(.5,.7,1), .5+.5*rd.y);
//    float sun = clamp(dot(normalize(vec3(-.4,.7,-.6)),rd), 0., 1.);
//    col += vec3(1,.6,.1)*(pow(sun,4.) + 10.*pow(sun,32.));
    return rd;
}



float gpuIndepentHash(float p) {
    p = fract(p * .1031);
    p *= p + 19.19;
    p *= p + p;
    return fract(p);
}

void getMaterialProperties(in vec3 pos, in float mat,
out vec3 albedo, out float type, out float roughness) {
    albedo = pal(mat*.59996323+.5, vec3(.5),vec3(.5),vec3(1),vec3(0,.1,.2));

    if( mat < 1.5 ) {
        albedo = vec3(.25 + .25*checkerBoard(pos.xz * 5.));
        roughness = .75 * albedo.x - .15;
        type = METAL;
    } else {
        type = floor(gpuIndepentHash(mat+.3) * 3.);
        roughness = (1.-type*.475) * gpuIndepentHash(mat);
    }
}

float schlick(float cosine, float r0) {
    return r0 + (1.-r0)*pow((1.-cosine),5.);
}
vec3 render( in vec3 ro, in vec3 rd, inout float seed ) {
    vec3 albedo, normal, col = vec3(1.);
    float roughness, type;

    for (int i=0; i<PATH_LENGTH; ++i) {
        vec3 res = worldhit( ro, rd, vec2(.0001, 100), normal );
        if (res.z > 0.) {
            ro += rd * res.y;

            getMaterialProperties(ro, res.z, albedo, type, roughness);

            if (type < LAMBERTIAN+.5) { // Added/hacked a reflection term
                float F = FresnelSchlickRoughness(max(0.,-dot(normal, rd)), .04, roughness);
                if (F > hash1(seed)) {
                    rd = modifyDirectionWithRoughness(normal, reflect(rd,normal), roughness, seed);
                } else {
                    col *= albedo;
                    rd = cosWeightedRandomHemisphereDirection(normal, seed);
                }
            } else if (type < METAL+.5) {
                col *= albedo;
                rd = modifyDirectionWithRoughness(normal, reflect(rd,normal), roughness, seed);
            } else { // DIELECTRIC
                vec3 normalOut, refracted;
                float ni_over_nt, cosine, reflectProb = 1.;
                if (dot(rd, normal) > 0.) {
                    normalOut = -normal;
                    ni_over_nt = 1.4;
                    cosine = dot(rd, normal);
                    cosine = sqrt(1.-(1.4*1.4)-(1.4*1.4)*cosine*cosine);
                } else {
                    normalOut = normal;
                    ni_over_nt = 1./1.4;
                    cosine = -dot(rd, normal);
                }

                if (modifiedRefract(rd, normalOut, ni_over_nt, refracted)) {
                    float r0 = (1.-ni_over_nt)/(1.+ni_over_nt);
                    reflectProb = FresnelSchlickRoughness(cosine, r0*r0, roughness);
                }

                rd = hash1(seed) <= reflectProb ? reflect(rd,normal) : refracted;
                rd = modifyDirectionWithRoughness(-normalOut, rd, roughness, seed);
            }
        } else {
            col *= getSkyColor(rd);
            return col;
        }
    }
    return vec3(0);
}



void main()
{


    //vec4 data = vec4(0.0);



    //vec3 normal;

    //float fpd = data.x;

    //vec2 p = (-iResolution.xy + 2.* vec2(gl_FragCoord) - 1.)/iResolution.y;
    // float seed = float(baseHash(floatBitsToUint(p - iTime)))/float(0xffffffffU);
    float seed = 1.0;
    // AA
//    p += 2.*hash2(seed)/iResolution.y;
//    vec3 rd = ca * normalize( vec3(p.xy,1.6) );

    // DOF
//    vec3 fp = ro + rd * fpd;
//    ro = ro + ca * vec3(randomInUnitDisk(seed), 0.)*.02;
//    rd = normalize(fp - ro);

    vec3 col = render(rayOrigin, rayDirection, seed);


    f_color = vec4(col, 1.0);


}