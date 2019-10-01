import {Pipeline} from "./pipeline";
import {canvas, pixelRatio} from "./context";
import {resizeDrawingBuffer} from "@foxel_fox/glib";


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

export function start(grid) {

	const pipeline = new Pipeline(grid);
	requestAnimationFrame(loop);

	function loop() {
		resize();
		pipeline.run();
		requestAnimationFrame(loop);
	}
}