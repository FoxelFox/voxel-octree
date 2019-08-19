// The entry file of your WebAssembly module.

export function add(a: i32, b: i32): i32 {
  return a + b;
}


export function work(): void {
  for (let i = 0; i < 15000000; i++) {
    add(i, add(i, 2));
  }
}