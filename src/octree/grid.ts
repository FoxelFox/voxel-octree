import {ModuleThread, spawn, Worker} from "threads/dist";
import {IndexWorker} from "./worker";

export class OctreeGrid {

    pool: ModuleThread<IndexWorker>[] = [];
    queue = [];
    finishedWork = 0;
    start = Date.now();

    constructor () {
        this.initThreads().then(() => {
            console.log(`Started ${this.pool.length} Threads for Mesh generation with WebAssembly.`);
            this.balanceWork();
        });
    }

    async initThreads() {
        for( let i = 0; i < navigator.hardwareConcurrency; i++) {
            const thread = await spawn<IndexWorker>(new Worker("./worker"));
            await thread.init();
            this.pool.push(thread);
        }
    }

    balanceWork() {
        while (this.queue[0] && this.pool[0]) {
            const work = this.queue.shift();
            const worker = this.pool.shift();

            worker.getIndex().then(result => {
                document.getElementById("points").innerText = (++this.finishedWork / (Date.now() - this.start) * 1000).toFixed(0).toString() + " Points";
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