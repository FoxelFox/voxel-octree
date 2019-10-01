import {OctreeNode} from "./node";

export interface Chunk {
	tree: OctreeNode
	mesh?
	meshUpdated?
}