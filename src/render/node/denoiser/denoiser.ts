import {FrameBuffer, Quad, Shader, SimpleNode, Texture} from "@foxel_fox/glib";
import {ChunkNode} from "../chunk-node/chunk-node";
import {RTLightNode} from "../rt-light/rt-light";
import {canvas, gl} from "../../context";
import {mat4} from "gl-matrix";
import { Camera } from "../../camera";

export class RTGINode extends SimpleNode {

	reset = 0;

	constructor (
		private chunkNode: ChunkNode,
		private rtLightNode: RTLightNode,
		private camera: Camera,
	) {
		super(new Shader(require("./denoiser.vs.glsl"), require("./denoiser.fs.glsl")), new Quad() as {});
	}

	init(): void {
		const output = new Texture(undefined, undefined, null, gl.RGBA32F, gl.RGBA, gl.FLOAT);
		
		this.frameBuffer = new FrameBuffer([output], true, false);

		document.addEventListener("click", (e) => {
			this.reset = 0;
		});

		document.addEventListener("mousemove", (e) => {
			if(document.pointerLockElement) {
				this.reset = 0;
			}
		});
	}

	run(): void {

		if (this.camera.backward || this.camera.forward || this.camera.left || this.camera.right) {
			this.reset = 0;
		}


		this.frameBuffer.bind();
		gl.viewport(0, 0, canvas.width, canvas.height);

		gl.useProgram(this.shader.program);

		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(this.shader.getUniformLocation("tDiffuse"), 0);
		gl.bindTexture(gl.TEXTURE_2D, this.chunkNode.frameBuffer.textures[0].webGLTexture);

		gl.activeTexture(gl.TEXTURE1);
		gl.uniform1i(this.shader.getUniformLocation("tNormal"), 1);
		gl.bindTexture(gl.TEXTURE_2D, this.chunkNode.frameBuffer.textures[1].webGLTexture);

		gl.activeTexture(gl.TEXTURE2);
		gl.uniform1i(this.shader.getUniformLocation("tPosition"), 2);
		gl.bindTexture(gl.TEXTURE_2D, this.chunkNode.frameBuffer.textures[2].webGLTexture);

		gl.activeTexture(gl.TEXTURE3);
		gl.uniform1i(this.shader.getUniformLocation("tRTLight"), 3);
		gl.bindTexture(gl.TEXTURE_2D, this.rtLightNode.frameBuffer.textures[0].webGLTexture);

		gl.activeTexture(gl.TEXTURE4);
		gl.uniform1i(this.shader.getUniformLocation("tChunks"), 4);
		gl.bindTexture(gl.TEXTURE_2D, this.chunkNode.chunks.webGLTexture);

		gl.activeTexture(gl.TEXTURE5);
		gl.uniform1i(this.shader.getUniformLocation("tRTFiltered"), 5);
		gl.bindTexture(gl.TEXTURE_2D, this.frameBuffer.textures[0].webGLTexture);


		gl.activeTexture(gl.TEXTURE6);
		gl.uniform1i(this.shader.getUniformLocation("tDiffuseL"), 6);
		gl.bindTexture(gl.TEXTURE_2D, this.chunkNode.frameBuffer.textures[0].webGLTexture2);

		gl.activeTexture(gl.TEXTURE7);
		gl.uniform1i(this.shader.getUniformLocation("tNormalL"), 7);
		gl.bindTexture(gl.TEXTURE_2D, this.chunkNode.frameBuffer.textures[1].webGLTexture2);

		gl.activeTexture(gl.TEXTURE8);
		gl.uniform1i(this.shader.getUniformLocation("tPositionL"), 8);
		gl.bindTexture(gl.TEXTURE_2D, this.chunkNode.frameBuffer.textures[2].webGLTexture2);

		gl.activeTexture(gl.TEXTURE9);
		gl.uniform1i(this.shader.getUniformLocation("tRTLightL"), 9);
		gl.bindTexture(gl.TEXTURE_2D, this.rtLightNode.frameBuffer.textures[0].webGLTexture2);


		gl.uniform2f(this.shader.getUniformLocation("sampleSize"), 1 / canvas.width, 1 / canvas.height);
		
	
		gl.uniform2f(this.shader.getUniformLocation("sampleRTSize"), 1 / this.rtLightNode.frameBuffer.textures[0].x, 1 / this.rtLightNode.frameBuffer.textures[0].y);

		gl.uniform1i(this.shader.getUniformLocation("rtBlocks"), this.chunkNode.chunkRTBlocks);
		gl.uniform1f(this.shader.getUniformLocation("reset"), this.reset);
		gl.uniformMatrix4fv(this.shader.getUniformLocation("oldMVP"), false, this.chunkNode.oldMVP);

		gl.bindVertexArray(this.vao);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		this.frameBuffer.flip();
		this.reset += 0.01;
		if (this.reset > 1) {
			this.reset = 1;
		}
	}
}