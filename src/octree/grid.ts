import {ModuleThread, spawn, Worker} from "threads/dist";
import {IndexWorker} from "./worker";
import {OctreeNode} from "./node";
import {map3D1D} from "./util";

export class OctreeGrid {

	pool: ModuleThread<IndexWorker>[] = [];
	queue = [];
	chunks: { [key: number]: OctreeNode } = {};


	constructor(
		public scale: number
	) {
		this.chunks[map3D1D(0, 0, 0)] = new OctreeNode(0);
	}

	async initThreads() {
		for (let i = 0; i < navigator.hardwareConcurrency; i++) {
			const thread = await spawn<IndexWorker>(new Worker("./worker"));
			this.pool.push(thread);
		}
	}

	balanceWork() {
		while (this.queue[0] && this.pool[0]) {
			const work = this.queue.shift();
			const worker = this.pool.shift();

			worker.work().then(() => {


				this.pool.push(worker);
				this.balanceWork();
			});
		}
	}

	modify(p1: number[], p2: number[], value: number) {

		const startChunkIDCoords = [
			Math.floor(p1[0] / this.scale),
			Math.floor(p1[1] / this.scale),
			Math.floor(p1[2] / this.scale)
		];

		const endChunkIDCoords = [
		    Math.floor(p2[0] / this.scale),
			Math.floor(p2[1] / this.scale),
			Math.floor(p2[2] / this.scale)
		];

		for (let x = startChunkIDCoords[0]; x <= endChunkIDCoords[0]; x++) {
			for (let y = startChunkIDCoords[1]; y <= endChunkIDCoords[1]; y++) {
				for (let z = startChunkIDCoords[2]; z <= endChunkIDCoords[2]; z++) {

				    const chunkAbsStartX = x * this.scale;
				    const chunkAbsEndX = (x + 1) * this.scale;
                    const chunkAbsStartY = y * this.scale;
                    const chunkAbsEndY = (y + 1) * this.scale;
                    const chunkAbsStartZ = z * this.scale;
                    const chunkAbsEndZ = (z + 1) * this.scale;

                    const relStartPoint = [
                        p1[0] > chunkAbsStartX ? p1[0] - chunkAbsStartX : 0,
                        p1[1] > chunkAbsStartY ? p1[1] - chunkAbsStartY : 0,
                        p1[2] > chunkAbsStartZ ? p1[2] - chunkAbsStartZ : 0
                    ];

                    const relEndPoint = [
                        p2[0] <= chunkAbsEndX ? p2[0] % this.scale : this.scale - 1,
                        p2[1] <= chunkAbsEndY ? p2[1] % this.scale : this.scale - 1,
                        p2[2] <= chunkAbsEndZ ? p2[2] % this.scale : this.scale - 1
                    ];

					this.chunks[map3D1D(x, y, z)].modify(relStartPoint, relEndPoint, value);
				}
			}
		}

	}

	workExample(p1: number[], p2: number[], value: number) {
		this.queue.push({p1, p2, value});
		this.balanceWork();
	}

}