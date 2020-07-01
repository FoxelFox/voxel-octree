import {RTLightNode} from "./node/rt-light/rt-light";
import {Camera} from "./camera";
import {OctreeGrid} from "../octree/grid";
import {EditNode} from "./node/edit/edit-node";
import {RTChunkNode} from "./node/rt-chunk-node/rt-chunk-node";
import {ChunkNode} from "./node/chunk-node/chunk-node";
import {RTGINode} from "./node/denoiser/denoiser";
import {OutputNode} from "./node/output/output";

export class Pipeline {

	chunkNode: ChunkNode;
	rtLightNode: RTLightNode;
	rtGINode: RTGINode;
	edit: EditNode;
	output: OutputNode;

	camera: Camera;

	placeVoxel: boolean = false;

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

		document.addEventListener("keydown", async (element) => {
			switch (element.key) {
				case "e":
				case "E":
					this.placeVoxel = true;
					break;
			}

		});

		document.addEventListener("keyup", async (element) => {
			switch (element.key) {
				case "e":
				case "E":
					this.placeVoxel = false;
					break;
			}
		});

		grid.modify([0, 0, 0], [1023, 1023, 255], 1);
		grid.modify([0, 0, 0], [255, 1023, 511], 1);

		grid.modify([256 + 64, 256+128, 256], [256 + 64 + 64 -1, 256+128 +64-1, 319], 1);
		grid.modify([256 + 64, 256-128, 256], [256 + 64 + 64 -1, 256-128 +64-1, 319], 1);

		grid.modify([512 + 128, 768+64, 256], [512 + 128 + 64 -1, 768+128 -1, 319], 1);
		grid.modify([512 + 128, 768+64 -256, 256], [512 + 128 + 64 -1, 768-128 -1, 319], 1);

		grid.modify([256, 256, 256], [447, 256+64-1, 447], 2);
		grid.modify([576, 768 - 64, 256], [767, 831 -64, 447], 3);
		grid.modify([768, 0, 0], [1023, 1023, 511], 1);
		grid.modify([0, 512, 256], [255, 767, 511], 0);
		grid.modify([768, 256, 256], [1023, 511, 511], 0);
	}

	run() {
		this.camera.update();

		this.chunkNode.run();
		this.edit.run();
		this.rtLightNode.run();
		this.rtGINode.run();
		this.output.run();

		if (this.placeVoxel) {
			const p = this.camera.position;
			const start = [Math.floor(p[0] * -1024 + 512), Math.floor(p[1] * -1024 + 512), Math.floor(p[2] * -1024 + 512)];
			const end = [start[0] + 7, start[1] +7, start[2] +7];
			this.grid.modify(start, end, 1);
		}
	}

	meshesIncoming(meshes) {

	}
}