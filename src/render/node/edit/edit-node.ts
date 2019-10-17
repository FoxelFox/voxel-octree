import {ArrayBuffer, Quad, Shader, SimpleNode, Texture} from "@foxel_fox/glib";
import {canvas, gl} from "../../context";
import {mat4} from "gl-matrix";
import {Camera} from "../../camera";
import {OctreeGrid} from "../../../octree/grid";

export class EditNode extends SimpleNode {

	readPixelPosition = new Float32Array(4);
	readPixelNormal = new Float32Array(4);

	size = 64;
	scale = 0.0625;

	constructor (
		private position: Texture,
		private camera: Camera,
		private grid: OctreeGrid
	) {
		super(new Shader(require("./edit-node.vs.glsl"), require("./edit-node.fs.glsl")), {
			position: new ArrayBuffer( [
				-0.5, -0.5, -0.5,	   0.5, -0.5, -0.5,
				-0.5, -0.5, -0.5,     -0.5,  0.5, -0.5,
				-0.5, -0.5, -0.5,     -0.5, -0.5,  0.5,

				 0.5,  0.5,  0.5,	  -0.5,  0.5,  0.5,
				 0.5,  0.5,  0.5,      0.5, -0.5,  0.5,
				 0.5,  0.5,  0.5,      0.5,  0.5, -0.5,

				-0.5, -0.5,  0.5,      0.5, -0.5,  0.5,
				-0.5,  0.5,  0.5,     -0.5, -0.5,  0.5,
				-0.5,  0.5, -0.5,      0.5,  0.5, -0.5,
				 0.5,  0.5, -0.5,      0.5, -0.5, -0.5,

				-0.5,  0.5, -0.5,     -0.5,  0.5,  0.5,
				 0.5, -0.5, -0.5,      0.5, -0.5,  0.5,

			], 3, gl.FLOAT)
		});
	}

	init() {
		document.addEventListener("wheel", (e) => {
			if (e.deltaY > 0) {
				this.size *= 2;
			} else {
				this.size /= 2;
			}

			if (this.size > 512) {
				this.size = 512;
			}

			if (this.size < 1) {
				this.size = 1;
			}

			this.scale = this.size / 1024;
		});


		document.addEventListener("click", (e) => {
			if (document.pointerLockElement) {


				const start = [this.readPixelPosition[0] * 1024 + 1024 * 0.5 - this.size * 0.5, this.readPixelPosition[1] * 1024 + 1024 * 0.5 - this.size * 0.5,this.readPixelPosition[2] * 1024 + 1024 * 0.5 - this.size * 0.5];
				const end = [start[0] + this.size -1, start[1] + this.size -1, start[2] + this.size -1];


				switch (e.button) {
					case 2:
						this.grid.modify([
							start[0] + this.size * this.readPixelNormal[0] * -1,
							start[1] + this.size * this.readPixelNormal[1] * -1,
							start[2] + this.size * this.readPixelNormal[2] * -1,
						], [
							end[0] + this.size * this.readPixelNormal[0] * -1,
							end[1] + this.size * this.readPixelNormal[1] * -1,
							end[2] + this.size * this.readPixelNormal[2] * -1,
						], 0);

						break;

					case 0:
						this.grid.modify(start, end, 1);
						break;
				}


			}
		})
	}

	handleUserInput() {
		gl.readBuffer(gl.COLOR_ATTACHMENT1);
		gl.readPixels(canvas.width / 2, canvas.height / 2 , 1, 1, gl.RGBA, gl.FLOAT, this.readPixelNormal);

		gl.readBuffer(gl.COLOR_ATTACHMENT2);
		gl.readPixels(canvas.width / 2, canvas.height / 2 , 1, 1, gl.RGBA, gl.FLOAT, this.readPixelPosition);



		let cx = Math.floor(Math.floor(this.readPixelPosition[0] * 1024) / this.size ) * this.size;
		let cy = Math.floor(Math.floor(this.readPixelPosition[1] * 1024) / this.size ) * this.size;
		let cz = Math.floor(Math.floor(this.readPixelPosition[2] * 1024) / this.size ) * this.size;

		// grid snapping
		let x = cx - 0.5 * this.size * (Math.abs(this.readPixelNormal[0]) -1) + this.readPixelNormal[0] * 0.5 * this.size;
		let y = cy - 0.5 * this.size * (Math.abs(this.readPixelNormal[1]) -1) + this.readPixelNormal[1] * 0.5 * this.size;
		let z = cz - 0.5 * this.size * (Math.abs(this.readPixelNormal[2]) -1) + this.readPixelNormal[2] * 0.5 * this.size;


		this.readPixelPosition[0] = x / 1024;
		this.readPixelPosition[1] = y / 1024;
		this.readPixelPosition[2] = z / 1024;


	}

	run() {

		gl.useProgram(this.shader.program);

		this.handleUserInput();

		const matrix = mat4.create();


		mat4.fromTranslation(matrix, [
			this.readPixelPosition[0] - this.scale * this.readPixelNormal[0],
			this.readPixelPosition[1] - this.scale * this.readPixelNormal[1],
			this.readPixelPosition[2] - this.scale * this.readPixelNormal[2]
		]);



		mat4.scale(matrix, matrix, [this.scale, this.scale, this.scale]);

		let mvp = mat4.create();

		mat4.identity(mvp);
		mat4.mul(mvp, this.camera.view, matrix);
		mat4.mul(mvp, this.camera.perspective, mvp);
		gl.uniformMatrix4fv(this.shader.getUniformLocation("mvp"), false, mvp);



		gl.useProgram(this.shader.program);
		gl.bindVertexArray(this.vao);

		gl.enable(gl.BLEND);

		gl.drawArrays(gl.LINES, 0, 24);

		gl.disable(gl.BLEND);
		// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}
}