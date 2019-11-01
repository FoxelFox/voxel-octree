import {FrameBuffer, Quad, Shader, SimpleNode, Texture} from "@foxel_fox/glib";
import {ChunkNode} from "../chunk-node/chunk-node";
import {RTLightNode} from "../rt-light/rt-light";
import {canvas, gl} from "../../context";
import {mat4} from "gl-matrix";

export class RTGINode extends SimpleNode {
	constructor (
		private chunkNode: ChunkNode,
		private rtLightNode: RTLightNode
	) {
		super(new Shader(require("./rt-gi.vs.glsl"), require("./rt-gi.fs.glsl")), new Quad() as {});
	}

	init(): void {
		const output = new Texture();
		this.frameBuffer = new FrameBuffer([output], true, false);
	}

	run(): void {
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

		gl.uniform2f(this.shader.getUniformLocation("sampleSize"), 1 / canvas.width, 1 / canvas.height);
		gl.uniform1i(this.shader.getUniformLocation("rtBlocks"), this.chunkNode.chunkRTBlocks);
		gl.uniformMatrix4fv(this.shader.getUniformLocation("oldMVP"), false, this.chunkNode.oldMVP);

		gl.bindVertexArray(this.vao);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		this.frameBuffer.flip();
	}
}