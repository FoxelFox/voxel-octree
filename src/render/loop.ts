import {Pipeline} from "./pipeline";
import {canvas, gl, pixelRatio} from "./context";
import {resizeDrawingBuffer} from "@foxel_fox/glib";
import GLBench from "gl-bench/dist/gl-bench";
import { resolve } from "dns";

let bench;

function resize() {
	// Lookup the size the browser is displaying the canvas.
	let displayWidth = document.documentElement.clientWidth;
	let displayHeight = document.documentElement.clientHeight;

	// Check if the canvas is not the same size.
	if (
		canvas.width !== displayWidth * pixelRatio ||
		canvas.height !== displayHeight * pixelRatio
	) {
		canvas.width = displayWidth * pixelRatio;
		canvas.height = displayHeight * pixelRatio;

		canvas.style.width = displayWidth + "px";
		canvas.style.height = displayHeight + "px";

		resizeDrawingBuffer();
	}
}

export function init() {
	return new Promise(resolve => {
		bench = new GLBench(gl);

		setTimeout(() => {
			resolve();
		}, 16 * 4);
	});
}

export function start(grid) {

	const pipeline = new Pipeline(grid);
	
	requestAnimationFrame(loop);

	function loop() {
		bench.nextFrame();
		bench.begin();
		resize();
		pipeline.run();
		bench.end();
		requestAnimationFrame(loop);
	}
}
