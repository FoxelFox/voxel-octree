export function map3D1D(p: number[]): number {
    return p[0] + 16384 * (p[1] + 16384 * p[2]);
}