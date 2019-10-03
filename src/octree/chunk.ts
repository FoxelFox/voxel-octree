import {OctreeNode} from "./node";

export interface Chunk {
	id: number[];
	tree: OctreeNode
}

export interface Mesh {
	id: number[];
	mesh?
	meshUpdated?: boolean
}