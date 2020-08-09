import {Camera} from "../../camera";
import {OctreeGrid} from "../../../octree/grid";

import {generateStartScene} from "../../../generator/start-scene";
import {RTChunkNode} from "./node/rt-chunk-node/rt-chunk-node";
import {EditNode} from "../shared-node/edit/edit-node";
import {OutputNode} from "../shared-node/output/output";
import {Denoiser} from "../shared-node/denoiser/denoiser";

export class PipelineV1 {

	chunkNode: RTChunkNode;
	edit: EditNode;
	denoiser: Denoiser;
	output: OutputNode;
	camera: Camera;

	constructor(public grid: OctreeGrid) {
		this.camera = new Camera();

		this.chunkNode = new RTChunkNode(this.camera, grid);
		this.chunkNode.init();

		this.edit = new EditNode(undefined, this.camera, grid);
		this.edit.init();


		//this.denoiser = new Denoiser(this.chunkNode, this.rtLightNode, this.camera);
		this.denoiser.init();

		//this.output = new OutputNode(this.rtGINode);
		//this.output.init();

		generateStartScene(grid);
	}

	run() {
		this.camera.update();
		this.chunkNode.run();
		this.edit.run();
		this.output.run();
	}
}