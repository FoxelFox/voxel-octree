import {expose, Transfer, TransferDescriptor} from "threads/dist";
import {Chunk} from "./chunk";
import {childIndex, OctreeNode, TraversalInfo} from "./node";
import {childDirections, map3D1D} from "./util";
import {checkServerIdentity} from "tls";

const minOffset = 0.0009765625;

function createMesh(out: Float32Array, info: TraversalInfo, vertexIndex: number): number {
	if (info.node.children) {
		for (const childID in info.node.children) {
			const childDirection = childDirections[childID];
			const childSize = info.size / 2;
			const childInfo: TraversalInfo = {
				node: info.node.children[childID],
				size: childSize,
				depth: info.depth + 1,
				position: [
					info.position[0] + childDirection[0] * childSize,
					info.position[1] + childDirection[1] * childSize,
					info.position[2] + childDirection[2] * childSize
				]
			};
			vertexIndex = createMesh(out, childInfo, vertexIndex);
		}
		return vertexIndex;

	} else {


		if (info.node.data === 0) {
			return vertexIndex;
		}

		const offset = info.size;

		const relPositionStart = [
			(info.position[0] - offset + 0.5) * 1024,
			(info.position[1] - offset + 0.5) * 1024,
			(info.position[2] - offset + 0.5) * 1024
		];

		const relPositionEnd = [
			(info.position[0] + offset + 0.5) * 1024,
			(info.position[1] + offset + 0.5) * 1024,
			(info.position[2] + offset + 0.5) * 1024
		];

		// top 1
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;

		// top 2
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;


		// bottom 1

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		// bottom 2
		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;


		// Front 1
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		// Front 2
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		// back 1
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;

		// back 2
		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;


		// right 1
		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		// right 2

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		// left 1
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		// left 2

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;


		return vertexIndex;
	}
}


const worker = {

    work(id: number[], chunks: string, mesh?) {


    	const parsed = JSON.parse(chunks);
    	const master = parsed[map3D1D(id)];
    	const f32 = mesh ? new Float32Array(mesh) : new Float32Array(16777216 * 3);
    	const info: TraversalInfo = {
    		depth: 0,
			position: [0, 0, 0],
			size: 0.5,
			node: master.tree
		};

    	const f32Count = createMesh(f32, info, 0);

        return {
        	vertexCount: f32Count / 3,
        	buffer: Transfer(f32.buffer)
        };
    }
};

export type IndexWorker = typeof worker;

expose(worker);