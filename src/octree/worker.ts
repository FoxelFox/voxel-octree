import {expose, Transfer, TransferDescriptor} from "threads/dist";
import {Chunk} from "./chunk";

const worker = {

    work(chunk: Chunk) {
        const buffer = new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ]);

        return Transfer(buffer.buffer);
    }
};

export type IndexWorker = typeof worker;

expose(worker);