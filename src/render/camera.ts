import {quat, mat4, vec4, vec3} from "gl-matrix";
import {canvas} from "./context";

export class Camera {

	view: mat4 = mat4.create();
	perspective: mat4 = mat4.create();

	rotX: number = -Math.PI / 2;
	rotY: number = 0;
	matX: mat4 = mat4.create();
	matY: mat4 = mat4.create();
	matRotation: mat4 = mat4.create();
	matPosition: mat4 = mat4.create();

	forward: boolean = false;
	backward: boolean = false;
	left: boolean = false;
	right: boolean = false;
	lastUpdateTime: number = Date.now();

	constructor () {
		mat4.translate(this.matPosition, this.matPosition, [0, 10, 0]);
		mat4.rotateX(this.matX, this.matX, this.rotX);
		mat4.mul(this.matRotation, this.matX, this.matY);

		document.addEventListener("click", (event) => {
			if (!document.pointerLockElement) {
				document.body.requestPointerLock();
			}
		});

		document.addEventListener('mousemove', (event: any) => {

			if (!document.pointerLockElement) {
				return
			}

			this.rotY += event.movementX * 0.0025;
			this.rotX += event.movementY * 0.00251;


			mat4.identity(this.matX);
			mat4.identity(this.matY);


			if (this.rotX > 0) {
				this.rotX = 0;
			}

			if (this.rotX < -Math.PI) {
				this.rotX = -Math.PI;
			}

			if (this.rotY > Math.PI) {
				this.rotY -= 2 * Math.PI;
			}

			if (this.rotY < -Math.PI) {
				this.rotY += 2 * Math.PI;
			}

			mat4.rotateX(this.matX, this.matX, this.rotX);
			mat4.rotateZ(this.matY, this.matY, this.rotY);

			mat4.mul(this.matRotation, this.matX, this.matY);
		}, false);

		document.addEventListener('keydown', (element) => {
			switch (element.key) {
				case "w": this.forward = true; break;
				case "s": this.backward = true; break;
				case "a": this.left = true; break;
				case "d": this.right = true; break;
			}
		});

		document.addEventListener('keyup', (element) => {
			switch (element.key) {
				case "w": this.forward = false; break;
				case "s": this.backward = false; break;
				case "a": this.left = false; break;
				case "d": this.right = false; break;
			}
		});
	}


	update() {
		const now = Date.now();
		const speed = (now - this.lastUpdateTime) * 0.01;
		this.lastUpdateTime = now;

		const ar = canvas.width / canvas.height;
		mat4.perspective(this.perspective, 1.5, ar, 0.01, 128);

		let inverseRotation = mat4.create();
		mat4.invert(inverseRotation,this.matRotation);


		if (this.forward) {
			let forward = vec3.fromValues(0 , 0, 0.1 * speed);
			vec3.transformMat4(forward, forward, inverseRotation);
			mat4.translate(this.matPosition, this.matPosition, forward)
		}

		if (this.backward) {
			let backward = vec3.fromValues(0 , 0, -0.1 * speed);
			vec3.transformMat4(backward, backward, inverseRotation);
			mat4.translate(this.matPosition, this.matPosition, backward)
		}

		if (this.left) {
			let left = vec3.fromValues(0.1 * speed, 0, 0);
			vec3.transformMat4(left, left, inverseRotation);
			mat4.translate(this.matPosition, this.matPosition, left)
		}

		if (this.right) {
			let right = vec3.fromValues(-0.1 * speed, 0, 0);
			vec3.transformMat4(right, right, inverseRotation);
			mat4.translate(this.matPosition, this.matPosition, right)
		}

		mat4.mul(this.view, this.matRotation, this.matPosition);
	}

}