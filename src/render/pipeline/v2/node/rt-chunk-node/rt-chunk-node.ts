import {Shader, SimpleNode, ArrayBufferNative, FrameBuffer, Texture, Quad} from "@foxel_fox/glib";
import {canvas, gl} from "../../../../context";
import {mat4} from "gl-matrix";
import {Camera} from "../../../../camera";
import {OctreeGrid} from "../../../../../octree/grid";
import {map3D1D} from "../../../../../octree/util";

interface Model {
	vao: WebGLVertexArrayObject
	position: ArrayBufferNative
	matrix: mat4
	vertexCount: number
}

export class RTChunkNode extends SimpleNode {

	chunks: Texture;
	colors: Texture;
	uploadQueue = [];
	frame = 0;
	oldMVP: mat4;
	currentMVP: mat4;

	constructor (
		private camera: Camera,
		private grid: OctreeGrid
	) {
		super(new Shader(
			require("./rt-chunk-node.vs.glsl"),
			require("./rt-chunk-node.fs.glsl")
		), new Quad() as {});

	}

	init(): void {
		const diffuse = new Texture(undefined, undefined, null, undefined, undefined, undefined, gl.LINEAR);
		const normal = new Texture(undefined, undefined, null, gl.RGBA16F, gl.RGBA, gl.FLOAT, gl.LINEAR);
		const position = new Texture(undefined, undefined, null, gl.RGBA32F, gl.RGBA, gl.FLOAT);
		const albedo = new Texture(undefined, undefined, null, undefined, undefined, undefined, gl.LINEAR);

		this.chunks = new Texture(4096, 1, undefined, gl.RGBA32F, gl.RGBA, gl.FLOAT);
		this.colors = new Texture(4096, 1);

		this.frameBuffer = new FrameBuffer([diffuse, normal, position, albedo], true, true);
	}

	run() {
		this.render();
	}

	upload() {
		if (this.uploadQueue[0]) {
			const chunk = this.uploadQueue.shift();
			const chunkID = map3D1D(chunk.id);

			this.chunks.update(new Float32Array(chunk.rt));

			this.grid.meshUploaded(chunkID)
		}
	}

	render() {
		this.upload();
		//this.frameBuffer.bind();

		gl.enable(gl.DEPTH_TEST);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(this.shader.program);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


		let mvp = mat4.create();
		let modelMatrix = mat4.create();
		mat4.fromTranslation(modelMatrix, [0 , 0, 0]);

		mat4.identity(mvp);
		mat4.mul(mvp, this.camera.view, modelMatrix);
		mat4.mul(mvp, this.camera.perspective, mvp);
		mat4.invert(mvp, mvp);

		this.oldMVP = this.currentMVP;
		this.currentMVP = mat4.clone(mvp);

		gl.uniformMatrix4fv(this.shader.getUniformLocation("inverseMVP"), false, mvp);
		gl.uniform3fv(this.shader.getUniformLocation("cameraPosition"), this.camera.position);
		gl.uniform3fv(this.shader.getUniformLocation("cameraRotation"), [0, this.camera.rotY, this.camera.rotX ]);
		gl.uniform2fv(this.shader.getUniformLocation("iResolution"), [canvas.width, canvas.height]);
		gl.uniform1f(this.shader.getUniformLocation("iTime"), Date.now());
		gl.uniform2fv(this.shader.getUniformLocation("iMouse"), [Math.floor(Math.abs(this.camera.rotX)) * 10, Math.floor(Math.abs(this.camera.rotY)) * 10]);

		gl.uniform1ui(this.shader.getUniformLocation("iFrame"), this.frame);
		this.frame++;



		gl.uniform1i(this.shader.getUniformLocation("chunks"), 0);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.chunks.webGLTexture);

		gl.bindVertexArray(this.vao);
		gl.drawArrays(gl.TRIANGLES, 0, 6);



	}
}