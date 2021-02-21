import {Camera} from "../../camera";
import {OctreeGrid} from "../../../octree/grid";
import {RTChunkNode} from "./node/rt-chunk-node/rt-chunk-node";
import {EditNode} from "../shared-node/edit/edit-node";
import {OutputNode} from "../shared-node/output/output";
import {Denoiser} from "../shared-node/denoiser/denoiser";

export class PipelineV2 {

	chunkNode: RTChunkNode;
	edit: EditNode;
	denoiser: Denoiser;
	output: OutputNode;

	constructor(
		public grid: OctreeGrid,
		public camera: Camera
	) {
		this.chunkNode = new RTChunkNode(this.camera, grid);
		this.chunkNode.init();

		this.edit = new EditNode(undefined, this.camera, grid);
		this.edit.init();

		this.denoiser = new Denoiser(
			this.chunkNode,
			this.chunkNode.frameBuffer.textures[0],
			this.chunkNode.frameBuffer.textures[1],
			this.chunkNode.frameBuffer.textures[2],
			this.chunkNode.frameBuffer.textures[3],
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
		this.denoiser.run();
		this.output.run();
	}
}