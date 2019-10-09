import {OctreeNode} from "./worker/node";

export interface Chunk {
	id: number[]
	tree: OctreeNode
}

export interface Mesh {
	id: number[]
	mesh?: any
	vertexCount?: number
}