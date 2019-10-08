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
		// const id = [0, 0, 0];
		// this.chunks[map3D1D(id)] = {
		// 	id,
		// 	tree: { data: 0},
		// };
	}

	async initThreads() {
		const maxWorkerThreads = Math.max(1, navigator.hardwareConcurrency -1);
		for (let i = 0; i < maxWorkerThreads; i++) {
			const thread = await spawn<IndexWorker>(new Worker("./worker"));
			this.pool.push(thread);
		}
	}

	balanceWork() {
		while (this.pool[0]) {

			// find chunk in queue that is save to update
			const index = this.queue.findIndex(c => {
				const mesh = this.meshes[map3D1D(c.id)];
				return mesh.mesh !== undefined && !mesh.meshUpdated
			});
			let chunk;
			if (~index){
				chunk = this.queue.splice(index, 1)[0];
			} else {
				break;
			}

			const worker = this.pool.shift();
			const chunkMesh = this.meshes[map3D1D(chunk.id)];

			worker.work(chunk.id, JSON.stringify(this.chunks), chunkMesh.mesh ? Transfer(chunkMesh.mesh) : undefined).then((mesh) => {
				chunkMesh.mesh = mesh.buffer.send;
				chunkMesh.vertexCount = mesh.vertexCount;
				chunkMesh.meshUpdated = true;
				this.pool.push(worker);
				this.balanceWork();
			});
			chunkMesh.mesh = undefined;
		}
	}

	modify(p1: number[], p2: number[], value: number) {

		const startChunkIDCoords = this.getChunkID(p1);
		const endChunkIDCoords = this.getChunkID(p2);

		for (let x = startChunkIDCoords[0]; x <= endChunkIDCoords[0]; x++) {
			for (let y = startChunkIDCoords[1]; y <= endChunkIDCoords[1]; y++) {
				for (let z = startChunkIDCoords[2]; z <= endChunkIDCoords[2]; z++) {

				    const chunkAbsStartX = x * this.scale;
				    const chunkAbsEndX = (x + 1) * this.scale -1;
                    const chunkAbsStartY = y * this.scale;
                    const chunkAbsEndY = (y + 1) * this.scale -1;
                    const chunkAbsStartZ = z * this.scale;
                    const chunkAbsEndZ = (z + 1) * this.scale -1;

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

					relEndPoint[0] = relEndPoint[0] < 0 ? 1024 + relEndPoint[0] : relEndPoint[0]
					relEndPoint[1] = relEndPoint[1] < 0 ? 1024 + relEndPoint[1] : relEndPoint[1]
					relEndPoint[2] = relEndPoint[2] < 0 ? 1024 + relEndPoint[2] : relEndPoint[2]

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
							meshUpdated: false,
							mesh: null
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
		if (this.queue.findIndex(c =>
			c.id[0] === chunk.id[0] &&
			c.id[1] === chunk.id[1] &&
			c.id[2] === chunk.id[2]
		) === -1) {
			this.queue.push(chunk);
		}

		// this.balanceWork();
	}

}
