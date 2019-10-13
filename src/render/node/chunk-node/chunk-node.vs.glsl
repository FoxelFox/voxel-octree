#version 300 es



uniform mat4 mvp;
uniform vec3 offset;


in vec4 position;
in vec3 normal;
out vec4 v_color;
out vec3 v_normal;
out vec3 v_position;
out vec3 wire;

void main() {
    gl_PointSize = 1.0;
    gl_Position = mvp * position;

    v_color.rgb = position.rgb;
    v_color.w = length(gl_Position.xyz);

    v_normal = normal;
    v_position = position.xyz + offset;

    int id = gl_VertexID % 3;

    switch (id) {
        case 0: wire = vec3(1.0, 0.0, 0.0); break;
        case 1: wire = vec3(0.0, 1.0, 0.0); break;
        case 2: wire = vec3(0.0, 0.0, 1.0); break;
    }
}
