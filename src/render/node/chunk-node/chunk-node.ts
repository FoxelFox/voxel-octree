import {Shader, SimpleNode, ArrayBuffer, FrameBuffer, Texture} from "@foxel_fox/glib";
import {gl} from "../../context";
import {mat4} from "gl-matrix";
import {Camera} from "../../camera";
import {OctreeGrid} from "../../../octree/grid";

export class ChunkNode extends SimpleNode {

	constructor (
		private camera: Camera,
		private grid: OctreeGrid
	) {

		super(
			new Shader(
				require("./chunk-node.vs.glsl"),
				require("./chunk-node.fs.glsl")
			), {
				position: new ArrayBuffer([
					1,0,0,
					0, 1, 0,
					0,0,1,
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

		let model = mat4.create();
		mat4.translate(model, model, [0, 0, 0]);

		let mvp = mat4.create();
		mat4.mul(mvp, this.camera.view, model);
		mat4.mul(mvp, this.camera.perspective, mvp);
		gl.uniformMatrix4fv(this.shader.getUniformLocation("mvp"), false, mvp);

		gl.bindVertexArray(this.vao);
		gl.drawArrays(gl.POINTS, 0, 3);
	}

}