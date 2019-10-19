import {TraversalInfo} from "./node";
import {childDirections, map3D1D} from "../util";
import {expose, Transfer} from "threads/worker";

export function createMesh(out: Float32Array, rt: Float32Array, info, index: {v: number, rt: number}): {v: number, rt: number} {
	if (info.node.children) {
		for (const childID in info.node.children) {
			const childDirection = childDirections[childID];
			const childSize = info.size / 2;
			const childInfo = {
				node: info.node.children[childID],
				size: childSize,
				depth: info.depth + 1,
				chunkPosition: info.chunkPosition,
				position: [
					info.position[0] + childDirection[0] * childSize,
					info.position[1] + childDirection[1] * childSize,
					info.position[2] + childDirection[2] * childSize
				]
			};
			index = createMesh(out, rt, childInfo, index);
		}
		return index;

	} else {


		if (info.node.data === 0) {
			return index;
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

		// Welcome prototype to hell.

		// top 1
		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = 1;

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = 1;

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = 1;

		// top 2
		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = 1;

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = 1;

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = 1;


		// bottom 1

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = -1;

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = -1;

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = -1;

		// bottom 2
		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = -1;

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = -1;

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = -1;

		// Front 1
		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 1;
		out[index.v++] = 0;

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = 1;
		out[index.v++] = 0;

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 1;
		out[index.v++] = 0;

		// Front 2
		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = 1;
		out[index.v++] = 0;

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = 1;
		out[index.v++] = 0;

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 1;
		out[index.v++] = 0;

		// back 1
		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = 0;

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = 0;

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = 0;

		// back 2
		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = 0;

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = 0;

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = 0;


		// right 1
		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = 0;

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = 0;

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = 0;

		// right 2

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = 0;

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = 0;

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = 0;

		// left 1
		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = 0;

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = 0;

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = 0;

		// left 2

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = 0;

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = 0;

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = 0;

		// top 1
		rt[index.rt++] = info.position[0];
		rt[index.rt++] = info.position[1];
		rt[index.rt++] = info.position[2];
		rt[index.rt++] = offset;


		return index;
	}
}

const worker = {

	work(id: number[], chunks: string, mesh?, rtBlocks?) {
		const parsed = JSON.parse(chunks);
		const master = parsed[map3D1D(id)];
		if (!mesh) {
			console.log("created new buffer")
		}
		const b = mesh ? mesh : new SharedArrayBuffer(16777216 * 3 * 4);
		const f32 = new Float32Array(b);

		const rt = rtBlocks ? rtBlocks : new SharedArrayBuffer(16 * 16 * 16 * 4 * 4);
		const rt32 = new Float32Array(rt);

		const info = {
			depth: 0,
			position: [0, 0, 0],
			chunkPosition: id,
			size: 0.5,
			node: master.tree
		};

		const index = createMesh(f32, rt32, info, { v: 0, rt: 0 });
		index.v /= 6;
		index.rt /= 4;
		return {
			index: index,
			v: f32.buffer,
			rt: rt32.buffer
		};
	}
};

export type MeshGeneratorWorker = typeof worker;

expose(worker);