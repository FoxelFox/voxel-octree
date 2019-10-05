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