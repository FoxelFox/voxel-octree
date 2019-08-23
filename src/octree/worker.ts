import {expose} from "threads/dist";

const worker = {

    work() {

    }
};

export type IndexWorker = typeof worker;

expose(worker);