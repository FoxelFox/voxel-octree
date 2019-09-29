import {ChunkNode} from "./node/chunk-node/chunk-node";
import {OutputNode} from "./node/output/output";
import {Camera} from "./camera";

export class Pipeline {

	chunkNode: ChunkNode;
	output: OutputNode;

	camera: Camera;

	constructor() {
		this.camera = new Camera();

		this.chunkNode = new ChunkNode(this.camera);
		this.chunkNode.init();

		this.output = new OutputNode(this.chunkNode.frameBuffer.textures[0]);
		this.output.init();
	}

	run() {
		this.camera.update();
		this.chunkNode.run();
		this.output.run();
	}
}