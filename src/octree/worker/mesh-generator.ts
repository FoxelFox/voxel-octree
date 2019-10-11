import {TraversalInfo} from "./node";
import {childDirections, map3D1D} from "../util";
import {expose, Transfer} from "threads/worker";

export function createMesh(out: Float32Array, info: TraversalInfo, vertexIndex: number): number {
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
		if (!mesh) {
			console.log("created new buffer")
		}
		const b = mesh ? mesh : new SharedArrayBuffer(4194304 * 3 * 4);
		const f32 = new Float32Array(b);
		const info: TraversalInfo = {
			depth: 0,
			position: [0, 0, 0],
			size: 0.5,
			node: master.tree
		};

		const f32Count = createMesh(f32, info, 0);

		return {
			vertexCount: f32Count / 3,
			mesh: f32.buffer
		};
	}
};

export type MeshGeneratorWorker = typeof worker;

expose(worker);