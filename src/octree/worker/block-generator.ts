import {childDirections, map3D1D} from "../util";
import {expose} from "threads/worker";

function createBlock(out: Float32Array, info, index: number): number {
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
			index = createBlock(out, childInfo, index);
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

		// top 1
		out[index++] = info.position[0] - offset;
		out[index++] = info.position[1] - offset;
		out[index++] = info.position[2] + offset;
		out[index++] = offset;

		return index;
	}
}

const worker = {

	work(chunk: string, mesh?) {
		const master = JSON.parse(chunk);
		if (!mesh) {
			console.log("created new buffer")
		}
		const b = mesh ? mesh : new SharedArrayBuffer(16777216 * 3 * 4);
		const f32 = new Float32Array(b);
		const info = {
			depth: 0,
			position: [0, 0, 0],
			chunkPosition: master.id,
			size: 0.5,
			node: master.tree
		};

		const f32Count = createBlock(f32, info, 0);

		return {
			elements: f32Count / 4,
			data: f32.buffer
		};
	}
};

export type BlockGeneratorWorker = typeof worker;

expose(worker);