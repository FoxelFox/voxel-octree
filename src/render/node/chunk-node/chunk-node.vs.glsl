#version 300 es



uniform mat4 mvp;


in vec3 position;
out vec4 v_color;
out vec3 wire;

void main() {
    gl_PointSize = 1.0;
    gl_Position = mvp * vec4(position, 1.0);

    v_color.rgb = position;
    v_color.w = length(gl_Position.xyz);

    int id = gl_VertexID % 3;

    switch (id) {
        case 0: wire = vec3(1.0, 0.0, 0.0); break;
        case 1: wire = vec3(0.0, 1.0, 0.0); break;
        case 2: wire = vec3(0.0, 0.0, 1.0); break;
    }
}
