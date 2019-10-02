import {OctreeNode} from "./node";

export interface Chunk {
	id: number[];
	tree: OctreeNode
	mesh?
	meshUpdated?
}