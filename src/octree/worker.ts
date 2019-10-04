import {expose, Transfer, TransferDescriptor} from "threads/dist";
import {Chunk} from "./chunk";
import {OctreeNode} from "./node";
import {map3D1D} from "./util";



const worker = {

    work(id: number[], chunks: { [key: number]: Chunk } = {}, mesh) {

    	const master = chunks[map3D1D(id)];
    	const size = 16384 * 3;
    	const f32 = new Float32Array(mesh);

        for (let i = 0; i < size; i++) {
			f32[i] = Math.random();
        }

        return Transfer(f32.buffer);
    }
};

export type IndexWorker = typeof worker;

expose(worker);