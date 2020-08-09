import {RTLightNode} from "./node/rt-light/rt-light";
import {Camera} from "./camera";
import {OctreeGrid} from "../octree/grid";
import {EditNode} from "./node/edit/edit-node";
import {ChunkNode} from "./node/chunk-node/chunk-node";
import {RTGINode} from "./node/denoiser/denoiser";
import {OutputNode} from "./node/output/output";
import {generateStartScene} from "../generator/start-scene";

export class Pipeline {

	chunkNode: ChunkNode;
	rtLightNode: RTLightNode;
	rtGINode: RTGINode;
	edit: EditNode;
	output: OutputNode;
	camera: Camera;

	constructor(public grid: OctreeGrid) {
		this.camera = new Camera();

		this.chunkNode = new ChunkNode(this.camera, grid);
		this.chunkNode.init();

		this.edit = new EditNode(undefined, this.camera, grid);
		this.edit.init();

		this.rtLightNode = new RTLightNode(
			this.chunkNode.frameBuffer.textures[0],
			this.chunkNode.frameBuffer.textures[1],
			this.chunkNode.frameBuffer.textures[2],
			this.camera,
			this.chunkNode.chunks,
			this.chunkNode.colors,
			this.chunkNode
		);
		this.rtLightNode.init();

		this.rtGINode = new RTGINode(this.chunkNode, this.rtLightNode, this.camera);
		this.rtGINode.init();

		this.output = new OutputNode(this.rtGINode);
		this.output.init();

		generateStartScene(grid);
	}

	run() {
		this.camera.update();
		this.chunkNode.run();
		this.edit.run();
		this.rtLightNode.run();
		this.rtGINode.run();
		this.output.run();
	}
}