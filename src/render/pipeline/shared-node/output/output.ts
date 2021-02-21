import {Quad, Shader, SimpleNode} from "@foxel_fox/glib";
import {ChunkNode} from "../../v1/node/chunk-node/chunk-node";
import {RTLightNode} from "../../v1/node/rt-light/rt-light";
import {canvas, gl} from "../../../context";
import {mat4} from "gl-matrix";
import {Denoiser} from "../denoiser/denoiser";

export class OutputNode extends SimpleNode {

	constructor (
		private output: Denoiser
	) {
		super(new Shader(require("./output.vs.glsl"), require("./output.fs.glsl")), new Quad() as {});
	}

	init(): void {

	}

	run(): void {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, canvas.width, canvas.height);

		gl.useProgram(this.shader.program);

		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(this.shader.getUniformLocation("tFinal"), 0);
		gl.bindTexture(gl.TEXTURE_2D, this.output.frameBuffer.textures[0].webGLTexture);


		gl.bindVertexArray(this.vao);
		gl.drawArrays(gl.TRIANGLES, 0, 6);

	}
}