import {OctreeNode} from "./worker/node";

export interface Chunk {
	id: number[]
	tree: OctreeNode
}

export interface VoxelsOnGPU {
	id: number[]
	v?: any
	rt?: any
	colors?: any
	index?: { v: number, rt: number }
}