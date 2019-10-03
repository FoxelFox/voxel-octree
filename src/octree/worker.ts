import {expose, Transfer, TransferDescriptor} from "threads/dist";
import {Chunk} from "./chunk";
import {OctreeNode} from "./node";
import {map3D1D} from "./util";



const worker = {

    work(id: number[], chunks: { [key: number]: Chunk } = {}) {

    	const master = chunks[map3D1D(id)];

        const vertices = [];
        for (let i = 0; i < 16384; i++) {
			vertices.push(Math.random());
			vertices.push(Math.random());
			vertices.push(Math.random());
        }

        let lol = 1;
        // for(const i in vertices) {
        // 	lol = (lol + vertices[i]) / 2;
        // 	vertices[i] = lol;
        // }
		//
		for(const i in vertices) {
			vertices[i] = Math.sin(vertices[i]) / lol;
		}
		//
		// for(const i in vertices) {
		// 	vertices[i] = Math.min(Math.random() / vertices[i], Math.cos(vertices[i]));
		// }
		//
		// for(const i in vertices) {
		// 	vertices[i] = Math.sin(Math.random() * vertices[i] + Math.random() * vertices[i]);
		// }

        const f32 = new Float32Array(vertices);
        return Transfer(f32.buffer);
    }
};

export type IndexWorker = typeof worker;

expose(worker);