export function map3D1D(x: number, y: number, z: number): number {
    return x + 16384 * (y + 16384 * z);
}