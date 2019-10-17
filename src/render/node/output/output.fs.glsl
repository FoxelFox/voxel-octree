#version 300 es
precision mediump float;

uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tPosition;
uniform vec3 cameraPosition;
uniform vec3 cameraRotation;

in vec2 v_texCoord;
out vec4 outColor;

void main() {

    vec4 d = texture(tDiffuse, v_texCoord);
    vec4 n = texture(tNormal, v_texCoord);
    vec4 p = texture(tPosition, v_texCoord);



    vec3 sun1 = normalize(vec3(1.0, -0.75, 0.5));
    vec3 sun2 = normalize(vec3(-0.25, -0.5, -0.5));

    if (length(n.xyz) < 0.1 || length(n.xyz) > 1.1) {
        outColor = d;
    } else {
        vec4 a = d * max(dot(sun1, n.xyz), 0.25) * vec4(1.0, 0.9, 0.9, 1.0);
        vec4 b = d * max(dot(sun2, n.xyz), 0.25) * vec4(0.9, 0.9, 1.0, 1.0);

        float distance = min(1.0 / pow(distance(-cameraPosition, p.xyz) * 2.0, 0.5), 10.0) * 0.1;
        outColor = mix (a, b, 0.5) + distance;

    }

}