import {TraversalInfo} from "./node";
import {childDirections, map3D1D} from "../util";
import {expose, Transfer} from "threads/worker";

export function createMesh(out: Float32Array, info, vertexIndex: number): number {
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

		// Welcome prototype to hell.

		// top 1
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 1;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 1;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 1;

		// top 2
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 1;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 1;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 1;


		// bottom 1

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = -1;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = -1;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = -1;

		// bottom 2
		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = -1;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = -1;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = -1;

		// Front 1
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 1;
		out[vertexIndex++] = 0;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 1;
		out[vertexIndex++] = 0;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 1;
		out[vertexIndex++] = 0;

		// Front 2
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 1;
		out[vertexIndex++] = 0;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 1;
		out[vertexIndex++] = 0;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 1;
		out[vertexIndex++] = 0;

		// back 1
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = -1;
		out[vertexIndex++] = 0;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = -1;
		out[vertexIndex++] = 0;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = -1;
		out[vertexIndex++] = 0;

		// back 2
		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = -1;
		out[vertexIndex++] = 0;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = -1;
		out[vertexIndex++] = 0;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = -1;
		out[vertexIndex++] = 0;


		// right 1
		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = 1;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = 1;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = 1;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;

		// right 2

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = 1;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = 1;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = 1;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;

		// left 1
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = -1;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = -1;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = -1;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;

		// left 2

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = -1;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;
		out[vertexIndex++] = -1;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;
		out[vertexIndex++] = -1;
		out[vertexIndex++] = 0;
		out[vertexIndex++] = 0;


		return vertexIndex;
	}
}

const worker = {

	work(id: number[], chunks: string, mesh?) {
		const parsed = JSON.parse(chunks);
		const master = parsed[map3D1D(id)];
		if (!mesh) {
			console.log("created new buffer")
		}
		const b = mesh ? mesh : new SharedArrayBuffer(16777216 * 3 * 4);
		const f32 = new Float32Array(b);
		const info = {
			depth: 0,
			position: [0, 0, 0],
			chunkPosition: id,
			size: 0.5,
			node: master.tree
		};

		const f32Count = createMesh(f32, info, 0);

		return {
			vertexCount: f32Count / 6,
			mesh: f32.buffer
		};
	}
};

export type MeshGeneratorWorker = typeof worker;

expose(worker);