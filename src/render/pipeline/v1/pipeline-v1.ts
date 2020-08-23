import {RTLightNode} from "./node/rt-light/rt-light";
import {Camera} from "../../camera";
import {OctreeGrid} from "../../../octree/grid";
import {EditNode} from "../shared-node/edit/edit-node";
import {ChunkNode} from "./node/chunk-node/chunk-node";
import {Denoiser} from "../shared-node/denoiser/denoiser";
import {OutputNode} from "../shared-node/output/output";
import {generateStartScene} from "../../../generator/start-scene";

export class PipelineV1 {

	chunkNode: ChunkNode;
	rtLightNode: RTLightNode;
	denoiser: Denoiser;
	edit: EditNode;
	output: OutputNode;

	constructor (
		public grid: OctreeGrid,
		public camera: Camera
	) {

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

		this.denoiser = new Denoiser(
			this.chunkNode,
			this.chunkNode.frameBuffer.textures[0],
			this.chunkNode.frameBuffer.textures[1],
			this.chunkNode.frameBuffer.textures[2],
			this.rtLightNode.frameBuffer.textures[0],
			this.camera
		);
		this.denoiser.init();

		this.output = new OutputNode(this.denoiser);
		this.output.init();
	}

	run() {
		this.camera.update();
		this.chunkNode.run();
		this.edit.run();
		this.rtLightNode.run();
		this.denoiser.run();
		this.output.run();
	}
}