import {ModuleThread, spawn, Worker} from "threads/dist";
import {IndexWorker} from "./worker";
import {OctreeNode} from "./node";
import {map3D1D} from "./util";

export class OctreeGrid {

    pool: ModuleThread<IndexWorker>[] = [];
    queue = [];
    chunks: {[key: number]: OctreeNode} = {};


    constructor (
        public scale: number
    ) {
        this.chunks[map3D1D(0, 0, 0)] = new OctreeNode(0);
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

    modify(p1: number[], p2: number[], value: number) {
        const cP1 = [
            p1[0] % this.scale,
            p1[1] % this.scale,
            p1[2] % this.scale
        ];

        const cP2 = [
            p2[0] % this.scale,
            p2[1] % this.scale,
            p2[2] % this.scale
        ];

        for (let x = cP1[0]; x <= cP2[0]; x++) {
            for (let y = cP1[0]; y <= cP2[0]; y++) {
                for (let z = cP1[0]; z <= cP2[0]; z++) {
                    // TODO
                    // this.chunks[map3D1D(x, y, z)]
                }
            }
        }

    }

    workExample(p1: number[], p2: number[], value: number) {
        this.queue.push({p1, p2, value});
        this.balanceWork();
    }

}