import {PipelineV1} from "./pipeline/v1/pipeline-v1";
import {canvas, gl, pixelRatio} from "./context";
import {resizeDrawingBuffer} from "@foxel_fox/glib";
import GLBench from "gl-bench/dist/gl-bench";
import {Camera} from "./camera";
import {PipelineV2} from "./pipeline/v2/pipeline-v2";
import {generateStartScene} from "../generator/start-scene";


export let bench;

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
			resolve(undefined);
		}, 16 * 4);
	});
}

export function start(grid) {

	const camera = new Camera();
	let pipeline = new PipelineV1(grid, camera);

	generateStartScene(grid);
	requestAnimationFrame(loop);

	function loop() {
		bench.nextFrame();
		bench.begin();
		resize();

		grid.getNext().then(n => {
			if (n) {
				pipeline.chunkNode.uploadQueue.push(n);
			}
		})

		pipeline.run();
		bench.end();
		requestAnimationFrame(loop);
	}
}
