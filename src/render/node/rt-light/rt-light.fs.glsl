#version 300 es
precision lowp float;
precision lowp int;
precision lowp sampler2D;

uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tPosition;
uniform sampler2D tChunks;
uniform sampler2D tColors;
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
#define SUN normalize(vec3(0.5, -0.75, 1.0))
#define BOUNCES 3;

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


vec2 hash2(float seed) {
    uint n = baseHash(floatBitsToUint(vec2(seed+=.1,seed+=.1)));
    uvec2 rz = uvec2(n, n*48271U);
    return vec2(rz.xy & uvec2(0x7fffffffU))/float(0x7fffffff);
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
    seed = rr.x;
    return normalize(rr);
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
    vec3 sun_color = vec3(0.6, .4, 0.2);

    vec3  sky = mix(vec3(.75, .73, .71), vec3(.5, .7, .9), 0.25 + rd.z);
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
    int minIndex = -1;

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
            minIndex = x;
        }
    }

    normal = normalMin;

    
    vec4 blockColor = minIndex != -1 ? texelFetch(tColors, ivec2(minIndex, 0), 0) : vec4(0);
    return vec4(minIndex, 0, 0, rtMin);
}



void main() {

    vec4 d = texture(tDiffuse, v_texCoord);
    vec4 n = texture(tNormal, v_texCoord);
    vec4 p = texture(tPosition, v_texCoord);
    vec4 l = texture(tLastRT, v_texCoord);



    if (length(n.xyz) < 0.1 || length(n.xyz) > 1.1) {
        f_color.xyz = sky(normalize(rayDirection));
    } else {
        vec4 block;
        vec3 albedo = d.rgb;
        vec2 dist = vec2(.00000001, 10);


        vec3 rand = hash32(uvec2(v_texCoord * 4096.0 * frame)) * 2.0 - 1.0;
        vec3 normal = n.xyz;
        vec4 result = vec4(0);
        vec3 ro = p.xyz;
        vec3 rd = vec3(0);
        float seed = (v_texCoord.x + v_texCoord.y * frame) * 1.0;

        
        rd = cosWeightedRandomHemisphereDirection(normal, seed);
        //rd = normalize(rand + normal);
        
        ro += rd * result.w;
        int len = int(gl_FragCoord.x * gl_FragCoord.y + frame) % 3 + 1;
        
        int i = 0;

        if (d.w == 0.0) {
            while (true) {
                        
                        
                result = hit(ro , rd, normal);
                vec4 block = texelFetch(tColors, ivec2(result.x, 0), 0);
                

                if (result.w > 1.0) {
                    albedo *= sky(rd);
                    break;
                } else if (block.w > 0.0){
                    albedo *= block.rgb + block.rgb * block.w * 1.25;
                    break;
                } else {
                    if (len == ++i) {

                        // last try to hit sun
                        rd = normalize(rand + SUN * 64.0);    
                        result = hit(ro, rd, normal);
                    
                        if (result.w > 1.0) {
                            albedo *= block.rgb * sky(rd);
                        } else {
                            albedo *= 0.0;
                        }
                        
                        break;
                    }

                    
                    albedo *= block.rgb;

                    ro += rd * result.w;
                    rd = cosWeightedRandomHemisphereDirection(normal, seed);
                    
                }         
            }

        } else {
            albedo += albedo;
        }

        



        
    
        


        


        f_color.rgb = (albedo ) ;
        f_color.w = p.w;
    

    }
}