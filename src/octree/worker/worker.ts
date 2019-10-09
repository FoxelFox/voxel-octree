import {expose, Transfer} from "threads/dist";

import {TraversalInfo} from "./node";
import {childDirections, map3D1D} from "../util";
import {createMesh} from "./mesh-generator";




const worker = {

    work(id: number[], chunks: string, mesh?) {
    	const parsed = JSON.parse(chunks);
    	const master = parsed[map3D1D(id)];
    	const f32 = mesh ? new Float32Array(mesh) : new Float32Array(1048576 * 3);
    	const info: TraversalInfo = {
    		depth: 0,
			position: [0, 0, 0],
			size: 0.5,
			node: master.tree
		};

    	const f32Count = createMesh(f32, info, 0);

        return {
        	vertexCount: f32Count / 3,
        	mesh: Transfer(f32.buffer)
        };
    }
};

export type IndexWorker = typeof worker;

expose(worker);