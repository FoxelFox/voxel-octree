#version 300 es
precision highp float;

in vec4 position;

in vec2 a_texCoord;
out vec2 v_texCoord;
out vec3 rayDirection;
out vec3 rayOrigin;
uniform mat4 inverseMVP;

void main() {
    gl_Position = position;
    v_texCoord = a_texCoord;




    // Calculate the farplane vertex position.
    // Input is clipspace, output is worldspace
    vec4 farPlane = inverseMVP * vec4(position.xy, 1.0, 1.0);
    farPlane /= farPlane.w;

    // Same as above for the near plane.
    // Remember the near plane in OpenGL is at z=-1
    vec4 nearPlane = inverseMVP * vec4(position.xy, -1.0, 1.0);
    nearPlane /= nearPlane.w;

    // No need to normalize ray direction here, as it might get
    // interpolated (and become non-unit) before going to the fragment
    // shader.
    rayDirection = normalize(farPlane.xyz - nearPlane.xyz);
    rayOrigin = nearPlane.xyz;

}