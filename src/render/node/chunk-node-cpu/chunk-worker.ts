import {expose, Transfer} from "threads/worker";

const worker = {

    work(start, end, width, out) {
        const data = new Uint8Array(out);

        for (let x = 0; x < width; x++) {
            for (let y = start; y < end; y++) {
                const h = data[(x + y * width) * 4] + 1;
                data[(x + y * width) * 4] = h;
                data[(x + y * width) * 4 + 1] = h;
                data[(x + y * width) * 4 + 2] = h;

            }
        }
    }
};

export type ChunkWorker = typeof worker;

expose(worker);