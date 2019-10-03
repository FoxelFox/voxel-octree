import {ModuleThread, spawn, Worker, Transfer} from "threads/dist";
import {IndexWorker} from "./worker";
import {modify, OctreeNode} from "./node";
import {map3D1D} from "./util";
import {Chunk, Mesh} from "./chunk";



export class OctreeGrid {

	pool: ModuleThread<IndexWorker>[] = [];
	queue: Chunk[] = [];
	chunks: { [key: number]: Chunk } = {};
	meshes: { [key: number]: Mesh } = {};

	constructor (
		public scale: number
	) {
		const id = [0, 0, 0];
		this.chunks[map3D1D(id)] = {
			id,
			tree: { data: 0},
		};
	}

	async initThreads() {
		const maxWorkerThreads = Math.max(1, navigator.hardwareConcurrency -1);
		for (let i = 0; i < maxWorkerThreads; i++) {
			const thread = await spawn<IndexWorker>(new Worker("./worker"));
			this.pool.push(thread);
		}
	}

	balanceWork() {
		while (this.queue[0] && this.pool[0]) {
			const chunk = this.queue.shift();
			const worker = this.pool.shift();

			worker.work(chunk.id, this.chunks).then((mesh) => {
				const chunkMesh = this.meshes[map3D1D(chunk.id)];
				chunkMesh.mesh = mesh;
				chunkMesh.meshUpdated = true;
				this.pool.push(worker);
				this.queue.push(chunk); // REMOVE
				this.balanceWork();
			});
		}
	}

	modify(p1: number[], p2: number[], value: number) {

		const startChunkIDCoords = this.getChunkID(p1);
		const endChunkIDCoords = this.getChunkID(p2);

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

                    const id = [x, y, z];
                    let chunk = this.chunks[map3D1D(id)];

                    if (!chunk) {
						let tree = { data: 0 };
						chunk = this.chunks[map3D1D(id)] = {
							id,
							tree
						};

						this.meshes[map3D1D(id)] = {
							id,
							meshUpdated: false
						}
					}

                    const info = {
						size: this.scale,
						node: chunk.tree,
						position: [0, 0, 0],
						depth: 0
					};

                    modify(info, relStartPoint, relEndPoint, value);

					this.updateMesh(chunk);
				}
			}
		}
	}

	getChunkID(position: number[]): number[] {
		return [
			Math.floor(position[0] / this.scale),
			Math.floor(position[1] / this.scale),
			Math.floor(position[2] / this.scale)
		];
	}

	getChuckByID(chunkID: number[]): Chunk {
		return this.chunks[map3D1D(chunkID)];
	}

	updateMesh(chunk: Chunk) {
		this.queue.push(chunk);
		this.balanceWork();
	}

}