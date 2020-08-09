import {Shader, SimpleNode, ArrayBufferNative, FrameBuffer, Texture, ArrayBuffer} from "@foxel_fox/glib";
import {gl} from "../../../../context";
import {mat4, vec3} from "gl-matrix";
import {Camera} from "../../../../camera";
import {OctreeGrid} from "../../../../../octree/grid";
import {map3D1D} from "../../../../../octree/util";
import {Chunk, VoxelsOnGPU} from "../../../../../octree/chunk";
import {Transfer} from "threads/worker";


interface Model {
	vao: WebGLVertexArrayObject
	position: ArrayBufferNative
	matrix: mat4
	vertexCount: number
}

export class ChunkNode {

	shader: Shader;
	frameBuffer!: FrameBuffer;
	models: { [key: number]: Model } = {};
	uploadQueue = [];
	chunks: Texture;
	colors: Texture;
	chunkRTBlocks: number = 0;
	oldMVP: mat4;
	currentMVP: mat4 = mat4.create();

	constructor (
		private camera: Camera,
		private grid: OctreeGrid
	) {
		this.shader = new Shader(
			require("./chunk-node.vs.glsl"),
			require("./chunk-node.fs.glsl")
		);
	}

	init(): void {
		const output = new Texture(undefined, undefined, null, undefined, undefined, undefined, gl.LINEAR);
		const normal = new Texture(undefined, undefined, null, gl.RGBA16F, gl.RGBA, gl.FLOAT, gl.LINEAR);
		const position = new Texture(undefined, undefined, null, gl.RGBA32F, gl.RGBA, gl.FLOAT);
		this.chunks = new Texture(4096, 1, undefined, gl.RGBA16F, gl.RGBA, gl.FLOAT);
		this.colors = new Texture(4096, 1);

		this.frameBuffer = new FrameBuffer([output, normal, position], true, true);
		this.grid.getNext().then(n => {
			if (n) {
				this.uploadQueue.push(n);
			}
		})
	}

	run() {
		this.render();
	}

	createMeshGPU(chunk: VoxelsOnGPU): Model {
		const vao = gl.createVertexArray() as WebGLVertexArrayObject;
		const position = new ArrayBufferNative(chunk.v, 4 * chunk.index.v * 2, 3, gl.FLOAT);
		const positionAttribute = this.shader.getAttributeLocation("position");
		const normalAttribute = this.shader.getAttributeLocation("normal");
		const colorAttribute = this.shader.getAttributeLocation("color");
		const matrix = mat4.create();

		gl.bindVertexArray(vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, position.buffer);

		gl.enableVertexAttribArray(positionAttribute);
		gl.vertexAttribPointer(positionAttribute, 3, position.type, position.normalize, 4*3*2 + 4 , 0);

		gl.enableVertexAttribArray(normalAttribute);
		gl.vertexAttribPointer(normalAttribute, 3, position.type, position.normalize, 4*3*2 + 4, 4*3);

		gl.enableVertexAttribArray(colorAttribute);
		gl.vertexAttribPointer(colorAttribute, 4, gl.UNSIGNED_BYTE, true, 4*3*2 + 4, 4*3*2);

		gl.bindVertexArray(null);

		mat4.fromTranslation(matrix, chunk.id as vec3);

		return { vao, position, matrix, vertexCount: chunk.index.v };
	}

	upload() {
		if (this.uploadQueue[0]) {
			const chunk = this.uploadQueue.shift();
			const chunkID = map3D1D(chunk.id);

			if (!this.models[chunkID] && chunk.index && chunk.index.v) {
				this.models[chunkID] = this.createMeshGPU(chunk);
				this.chunks.update(new Float32Array(chunk.rt));
				this.chunkRTBlocks = chunk.index.rt;
			} else {
				if (chunk.index && chunk.index.v) {
					this.models[chunkID].position.updateBuffer(chunk.v, 4 * chunk.index.v * 2);
					this.chunks.update(new Float32Array(chunk.rt));
					this.colors.update(new Uint8Array(chunk.colors));
					this.chunkRTBlocks = chunk.index.rt;
				}

				if (this.models[chunkID]) {
					this.models[chunkID].vertexCount = chunk.index.v;
					this.chunkRTBlocks = chunk.index.rt;
				}
			}
			this.grid.meshUploaded(chunkID)
		}
		this.grid.getNext().then(n => {
			if (n) {
				this.uploadQueue.push(n);
			}
		})
	}

	render() {
		this.upload();
		this.frameBuffer.bind();
		
		gl.enable(gl.DEPTH_TEST);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(this.shader.program);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		let mvp = mat4.create();
		let model: Model;

		mat4.mul(mvp, this.camera.view, mat4.create());
		mat4.mul(mvp, this.camera.perspective, mvp);

		this.oldMVP = this.currentMVP;

		this.currentMVP = mat4.clone(mvp);

		for (const key in this.models) {
			model = this.models[key];

			if (model.vertexCount) {
				mat4.identity(mvp);
				mat4.mul(mvp, this.camera.view, model.matrix);
				mat4.mul(mvp, this.camera.perspective, mvp);
				gl.uniformMatrix4fv(this.shader.getUniformLocation("mvp"), false, mvp);
				gl.uniform3fv(this.shader.getUniformLocation("offset"), [model.matrix[12], model.matrix[13], model.matrix[14]])

				gl.bindVertexArray(model.vao);
				gl.drawArrays(gl.TRIANGLES, 0, model.vertexCount);
			}
		}

		this.frameBuffer.flip();
	}
}