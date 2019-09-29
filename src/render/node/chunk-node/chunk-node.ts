import {Shader, SimpleNode, ArrayBuffer, FrameBuffer, Texture} from "@foxel_fox/glib";
import {gl} from "../../context";
import {mat4} from "gl-matrix";
import {Camera} from "../../camera";

export class ChunkNode extends SimpleNode {

	constructor (
		private camera: Camera
	) {

		super(
			new Shader(
				require("./chunk-node.vs.glsl"),
				require("./chunk-node.fs.glsl")
			), {
				position: new ArrayBuffer([
					0,0,0,
					0.5, 0.5, 0,5,
					1,1,1,
				], 3, gl.FLOAT)
			}
		)
	}

	init(): void {
		const output = new Texture();
		this.frameBuffer = new FrameBuffer([output], false, true);
	}

	run() {
		this.frameBuffer.bind();
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(this.shader.program);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		gl.uniformMatrix4fv(this.shader.getUniformLocation("view"), true, this.camera.combined);
		gl.uniform3fv(this.shader.getUniformLocation("offset"), [0, 0, 10]);

		gl.bindVertexArray(this.vao);
		gl.drawArrays(gl.POINTS, 0, 3);
	}

}