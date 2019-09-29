import {quat, mat4} from "gl-matrix";
import {canvas} from "./context";

export class Camera {

	private viewQuaternion: quat = quat.create();

	view: mat4 = mat4.create();
	perspective: mat4 = mat4.create();
	combined: mat4 = mat4.create();


	constructor () {
		mat4.fromQuat(this.view, this.viewQuaternion);
	}


	update() {
		const ar = canvas.width / canvas.height;
		mat4.perspective(this.perspective, 1.5, ar, 0.01, 128);
		mat4.multiply(this.combined, this.view, this.perspective);
	}

}