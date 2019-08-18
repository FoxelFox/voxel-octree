import {expose} from "threads/dist";
import {ASUtil, instantiateStreaming} from "assemblyscript/lib/loader";

interface MyApi {
    add(a: number, b: number): number;
}

let interop: ASUtil & MyApi;
const imports: any = {};

const worker = {



    async init() {
      interop = await instantiateStreaming<MyApi>(fetch("../build/optimized.wasm"), imports);
    },

    getIndex() {

        const results = new Uint32Array(2048);

        for (let i = 0; i < 204800000; i++) {
            results[i] = interop.add(i, interop.add(i, 2));
        }

        return results;
    }
};

export type IndexWorker = typeof worker;

expose(worker);