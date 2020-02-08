import {RTLightNode} from "./node/rt-light/rt-light";
import {Camera} from "./camera";
import {OctreeGrid} from "../octree/grid";
import {EditNode} from "./node/edit/edit-node";
import {RTChunkNode} from "./node/rt-chunk-node/rt-chunk-node";
import {ChunkNode} from "./node/chunk-node/chunk-node";
import {RTGINode} from "./node/denoiser/denoiser";
import {OutputNode} from "./node/output/output";
import {ChunkNodeCpu} from "./node/chunk-node-cpu/chunk-node-cpu";

export class PipelineCpu {

	chunkNode: ChunkNodeCpu;
	camera: Camera;
	placeVoxel: boolean = false;

	constructor(public grid: OctreeGrid) {
		this.camera = new Camera();

		this.chunkNode = new ChunkNodeCpu(this.camera, grid);
		this.chunkNode.init();

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

		grid.modify([0, 0, 0], [1023, 1023, 1023], 1);
		grid.modify([256, 0, 256], [767, 1023, 767], 0);
	}

	async run() {
		this.camera.update();
		await this.chunkNode.run();

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