#version 300 es
precision mediump float;

uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tPosition;
uniform sampler2D tChunks;
uniform vec3 cameraPosition;
uniform vec3 cameraRotation;

in vec2 v_texCoord;
in vec3 rayDirection;
in vec3 rayOrigin;

out vec4 outColor;

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

void main() {

    vec4 d = texture(tDiffuse, v_texCoord);
    vec4 n = texture(tNormal, v_texCoord);
    vec4 p = texture(tPosition, v_texCoord);



    vec3 sun1 = normalize(vec3(0.5, -0.75, 1.0));
    vec3 sun2 = normalize(vec3(-0.5, 0.75, -1.0));

    if (length(n.xyz) < 0.1 || length(n.xyz) > 1.1) {
        outColor = d;
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

        for (int x = 0; x < 4096; ++x) {
            block = texelFetch(tChunks, ivec2(x, 0), 0);
            if (block.w == 0.0) {
                break;
            }


            //rt = min(iBox(p.xyz - block.xyz, sun1, dist, normal, vec3(block.w)), rt);
            rt = min(iBox(p.xyz - block.xyz, sun1, dist, normal, vec3(block.w)), rt);
//            rt0 = min(iBox(p.xyz - block.xyz , sun1 + vec3(0.5, 0.1, 0.1), dist, normal, vec3(block.w)), rt0);
//            rt1 = min(iBox(p.xyz - block.xyz, sun1 + vec3(0.1, 0.5, 0.1), dist, normal, vec3(block.w)), rt1);
//            rt2 = min(iBox(p.xyz - block.xyz, sun1 + vec3(0.5, 0.1, 0.5), dist, normal, vec3(block.w)), rt2);
//
//            rt3 = min(iBox(p.xyz - block.xyz, sun1 + vec3(-0.5, 0.1, 0.01), dist, normal, vec3(block.w)), rt3);
//            rt4 = min(iBox(p.xyz - block.xyz, sun1 + vec3(0.1, -0.5, 0.1), dist, normal, vec3(block.w)), rt4);
//            rt5 = min(iBox(p.xyz - block.xyz, sun1 + vec3(0.1, 0.1, -0.5), dist, normal, vec3(block.w)), rt5);



        }



        if (rt > 100.0) {
            vec4 sun1Light = max(dot(sun1, n.xyz), 0.0) * vec4(1.0, 0.95, 0.95, 1.0);
            outColor = d * sun1Light;
        } else {
            outColor = d * 0.25;
        }
        //outColor = vec4(rt0 + rt1 +rt2 +rt3 +rt4 +rt5) / 6.0;


        //outColor = vec4(distance * dot(n.xyz, -rayDirection));
        //outColor = vec4(p);
    }

}