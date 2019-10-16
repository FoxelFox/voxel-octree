import {OctreeNode} from "./worker/node";

export interface Chunk {
	id: number[]
	tree: OctreeNode
}

export interface VoxelsOnGPU {
	id: number[]
	data?: any
	elements?: number
}