import {expose} from "threads/dist";
import {ASUtil, instantiateStreaming} from "assemblyscript/lib/loader";

interface MyApi {
    add(a: number, b: number): number;
    work(): void;
}

let interop: ASUtil & MyApi;
const imports: any = {};

const worker = {



    async init() {
      interop = await instantiateStreaming<MyApi>(fetch("./optimized.wasm"), imports);
    },

    getIndex() {
        interop.work();
    }
};

export type IndexWorker = typeof worker;

expose(worker);