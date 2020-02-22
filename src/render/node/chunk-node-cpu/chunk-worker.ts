import {expose, Transfer} from "threads/worker";
import {Observable} from "threads/observable";

let data = [];
let observer;
let sync = 0;

const worker = {


    create() {
        return new Observable((o) => {
            observer = o;

        });
    },

    init(out) {
        for (let i = 0; i < out.length; i++) {
            data[i] = new Uint8Array(out[i]);
        }

    },

    work(start, end, width) {
        for (let y = start; y < end; y++) {
            for (let x = 0; x < width; x++) {
                // for (let g = 0; g < 128; g++) {
                data[sync][(x + y * width) * 4] = Math.random() * 255;
                data[sync][(x + y * width) * 4 + 1] = Math.random() * 255;
                data[sync][(x + y * width) * 4 + 2] = Math.random() * 255;
                data[sync][(x + y * width) * 4 + 3] = Math.random() * 255;
                //}
            }
        }

        sync++;
        observer.next(sync);
        if (sync === data.length) {
            sync = 0;
        }
    }
};

export type ChunkWorker = typeof worker;

expose(worker);