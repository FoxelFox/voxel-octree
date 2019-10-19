#version 300 es
precision mediump float;

uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tPosition;
uniform vec3 cameraPosition;
uniform vec3 cameraRotation;

in vec2 v_texCoord;
in vec3 rayDirection;
in vec3 rayOrigin;

out vec4 outColor;

void main() {

    vec4 d = texture(tDiffuse, v_texCoord);
    vec4 n = texture(tNormal, v_texCoord);
    vec4 p = texture(tPosition, v_texCoord);



    vec3 sun1 = normalize(vec3(0.5, -0.75, 1.0));
    vec3 sun2 = normalize(vec3(-0.5, 0.75, -1.0));

    if (length(n.xyz) < 0.1 || length(n.xyz) > 1.1) {
        outColor = d;
    } else {
        vec4 sun1Light = max(dot(sun1, n.xyz), 0.0) * vec4(1.0, 0.95, 0.95, 1.0);
        vec4 sun2Light = max(dot(sun2, n.xyz), 0.0) * vec4(0.95, 0.95, 1.0, 1.0) * 0.5;

        float distance = 1.0 / (1.0 + pow(distance(-rayOrigin, p.xyz), 1.0));
        float playerLight = distance * dot(n.xyz, -rayDirection);

        outColor = d * clamp(mix(sun1Light + sun2Light, vec4(playerLight), 0.5) * 2.0, 0.0, 1.0);
        //outColor = vec4(distance * dot(n.xyz, -rayDirection));
        //outColor = vec4(playerLight);
    }

}