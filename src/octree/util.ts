export function map3D1D(p: number[]): number {
    return p[0] + 16384 * (p[1] + 16384 * p[2]);
}

export const childIndices = [
    [0 , 0, 0],
    [1 , 0, 0],
    [0 , 1, 0],
    [1 , 1, 0],
    [0 , 0, 1],
    [1 , 0, 1],
    [0 , 1, 1],
    [1 , 1, 1],
];

export const childDirections = [
    [-1, -1, -1],
    [ 1, -1, -1],
    [-1,  1, -1],
    [ 1,  1, -1],
    [-1, -1,  1],
    [ 1, -1,  1],
    [-1,  1,  1],
    [ 1,  1,  1]
];

const i32 = new Int32Array(1);
const f32 = new Float32Array(i32.buffer, 0, 1);

export function rgba(r: number, g: number, b: number, a: number): number {
    i32[0] = (a << 24 | b << 16 | g << 8 | r) & 0xfeffffff;
    return f32[0];

}