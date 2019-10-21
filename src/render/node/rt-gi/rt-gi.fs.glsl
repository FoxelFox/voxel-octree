#version 300 es
precision highp float;

uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tPosition;

uniform sampler2D tRTLight;
uniform sampler2D tRTNormal;
uniform sampler2D tRTPosition;

uniform sampler2D tChunks;

uniform int rtBlocks;
uniform vec2 sampleSize;

in vec2 v_texCoord;

out vec4 outColor;


#define MAX_DIST 1e10


vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
    return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
{
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
    0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
    -0.577350269189626,  // -1.0 + 2.0 * C.x
    0.024390243902439); // 1.0 / 41.0
    // First corner
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);

    // Other corners
    vec2 i1;
    //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
    //i1.y = 1.0 - i1.x;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    // x0 = x0 - 0.0 + 0.0 * C.xx ;
    // x1 = x0 - i1 + 1.0 * C.xx ;
    // x2 = x0 - 1.0 + 2.0 * C.xx ;
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    // Permutations
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;

    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

    // Compute final noise value at P
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
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

    vec2 start = mod(vec2(gl_FragCoord) * sampleSize, 0.125)  ;
    for (float x = start.x; x < 1.0; x = x + 0.125) {
        for (float y = start.y; y < 1.0; y = y + 0.125) {

            //vec2 uv = vec2(snoise(vec2(x,y) * 320.0), snoise(vec2(y, x) * 320.0));
            vec2 uv = vec2(x,y);
            vec3 rtC = texture(tRTLight, uv).rgb;
            vec3 rtN = texture(tRTNormal, uv).xyz;
            vec3 rtP = texture(tRTPosition, uv).xyz;

            float dist = distance(rtP, p);
            vec3 intensity = rtC / (1.0 + dist * dist * 10.0);

            // raytrace
            vec3 normal;
            vec2 rtDist = vec2(.0001, 100);
            float rt = MAX_DIST;
            vec4 block;

            for (int x = 0; x < rtBlocks; ++x) {
                block = texelFetch(tChunks, ivec2(x, 0), 0);

                rt = min(iBox((p + n * 0.0001) - block.xyz, (p + rtP), rtDist, normal, vec3(block.w)), rt);
            }

            //sum += bounceLight;
            sum += rt > (dist - 0.1) ? intensity : vec3(0);
            //sum += vec3(dist);
        }
    }

    outColor.rgb +=  d * sum / 64.0;
    //outColor.rg = start;
}
