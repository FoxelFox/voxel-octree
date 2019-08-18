// @ts-ignore
import { instantiateStreaming, ASUtil } from "assemblyscript/lib/loader";

interface MyApi {
    add(a: number, b: number): number;
}

const imports: any = {};

async function main() {
    let interop: ASUtil & MyApi =
        await instantiateStreaming<MyApi>(fetch("../build/optimized.wasm"), imports);

    // Finally, call the add function we exported
    console.log("The result is:", interop.add(1, 2));
}

main();