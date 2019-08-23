import {ModuleThread, spawn, Worker} from "threads/dist";
import {IndexWorker} from "./worker";

export class OctreeGrid {

    pool: ModuleThread<IndexWorker>[] = [];
    queue = [];


    constructor () {

    }

    async initThreads() {
        for( let i = 0; i < navigator.hardwareConcurrency; i++) {
            const thread = await spawn<IndexWorker>(new Worker("./worker"));
            this.pool.push(thread);
        }
    }

    balanceWork() {
        while (this.queue[0] && this.pool[0]) {
            const work = this.queue.shift();
            const worker = this.pool.shift();

            worker.work().then(() => {


                this.pool.push(worker);
                this.balanceWork();
            });
        }
    }

    add() {
        this.queue.push({});
        this.balanceWork();
    }

    sub() {

    }
}