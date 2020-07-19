import {TraversalInfo} from "./node";
import {childDirections, map3D1D, rgba} from "../util";
import {expose, Transfer} from "threads/worker";




const colorMap = {
	1: rgba(255, 255, 255, 0),
	2: rgba(244, 67, 54, 0),
	3: rgba(76, 175, 80, 0),
	4: rgba(33, 150, 243, 0),
	5: rgba(255, 152, 0, 0),
	6: rgba(233, 30, 99, 0),
	7: rgba(128, 128, 128, 0),
	8: rgba(64, 64, 64, 0),
	9: rgba(32, 32, 32, 0),
	10: rgba(255, 255, 255, 255)
}

export function createMesh (
	out: Float32Array,
	rt: Float32Array,
	colors: Float32Array,
	info,
	index: {v: number, rt: number, c: number}
): {v: number, rt: number, c: number} {
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
			index = createMesh(out, rt, colors, childInfo, index);
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
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = 1;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = 1;
		out[index.v++] = colorMap[info.node.data];

		// top 2
		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = 1;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = 1;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = 1;
		out[index.v++] = colorMap[info.node.data];


		// bottom 1

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = colorMap[info.node.data];

		// bottom 2
		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = colorMap[info.node.data];

		// Front 1
		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		// Front 2
		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		// back 1
		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		// back 2
		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 0;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];


		// right 1
		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		// right 2

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] + offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = 1;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		// left 1
		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		// left 2

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] + offset;
		out[index.v++] = info.position[2] - offset;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		out[index.v++] = info.position[0] - offset;
		out[index.v++] = info.position[1] - offset;
		out[index.v++] = info.position[2] + offset;
		out[index.v++] = -1;
		out[index.v++] = 0;
		out[index.v++] = 0;
		out[index.v++] = colorMap[info.node.data];

		// top 1
		rt[index.rt++] = info.position[0];
		rt[index.rt++] = info.position[1];
		rt[index.rt++] = info.position[2];
		rt[index.rt++] = offset;


		colors[index.c++] = colorMap[info.node.data];

		return index;
	}
}

const oc_size = 64

export function createOctree (
	out: Float32Array,
	info,
	index128: number
): number {
	let index32 = index128 * 4;
	if (info.node.children) {

		for (const childID in info.node.children) {
			const childInfo = {
				node: info.node.children[childID],
				depth: info.depth + 1
			};

			if (childInfo.node.children) {
				const childIndex128 = index128 + 8;
				out[index32++] = (childIndex128 % oc_size) / oc_size;
				out[index32++] = Math.floor(childIndex128 / oc_size) / oc_size;
				out[index32++] = info.depth; // empty placeholder
				out[index32++] = 0; // type 0 stands for node
				index128 = createOctree(out, childInfo, childIndex128);
			} else {
				out[index32++] = colorMap[childInfo.node.data] ? colorMap[childInfo.node.data] : 0;
				out[index32++] = 0; // empty placeholder
				out[index32++] = childInfo.depth; // empty placeholder
				out[index32++] = 1; // type 1 stands for leaf
			}
		}
		return index128;
	} else {
		// only if the root has no children
		if (info.node.data === 0) {
			return index128;
		}

		out[index32++] = colorMap[info.node.data];
		out[index32++] = 0; // empty placeholder
		out[index32++] = info.depth; // empty placeholder
		out[index32++] = 1; // type 1 stands for leaf

		return index128;
	}
}


const worker = {

	work(id: number[], chunks: string, mesh?, pBlocks?, pColors?, pOctree?) {
		const parsed = JSON.parse(chunks);
		const master = parsed[map3D1D(id)];
		if (!mesh) {
			console.log("created new buffer")
		}
		const b = mesh ? mesh : new SharedArrayBuffer(16777216 * 3 * 4);
		const f32 = new Float32Array(b);

		const blocks = pBlocks ? pBlocks : new SharedArrayBuffer(16 * 16 * 16 * 4 * 4);
		const blocks32 = new Float32Array(blocks);

		const octree = pOctree ? pOctree : new SharedArrayBuffer(16 * 16 * 16 * 4 * 4);
		const octree32 = new Float32Array(octree);

		const colors = pColors ? pColors : new SharedArrayBuffer(16 * 16 * 16 * 4 * 4);
		const colors32 = new Float32Array(colors);

		const info = {
			depth: 0,
			position: [0, 0, 0],
			chunkPosition: id,
			size: 0.5,
			node: master.tree
		};

		const index = createMesh(f32, blocks32, colors32, info, { v: 0, rt: 0, c: 0 });
		index.v /= 7;
		index.rt /= 4;


		const infoOC = {
			depth: 0,
			position: [0, 0, 0],
			chunkPosition: id,
			size: 0.5,
			node: master.tree
		};

		const indexOC = createOctree(octree32, infoOC, 0);

		return {
			index: index,
			indexOC: indexOC,
			oc: octree32.buffer,
			v: f32.buffer,
			rt: blocks32.buffer,
			colors: colors32.buffer
		};
	}
};

export type MeshGeneratorWorker = typeof worker;

expose(worker);