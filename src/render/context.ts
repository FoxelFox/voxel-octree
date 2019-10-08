import {setContext} from "@foxel_fox/glib";

export const pixelRatio = window.devicePixelRatio || 1;
export const canvas = document.createElement("canvas");

export const gl = canvas.getContext("webgl2", {
	antialias: false,
	alpha: false,
	premultipliedAlpha: false
}) as WebGL2RenderingContext;
setContext(gl);

gl.enable(gl.CULL_FACE);
//gl.cullFace(gl.FRONT_FACE);

canvas.style.width = "100vw";
canvas.style.height = "100vh";
canvas.style.display = "block";

document.body.style.margin = "0";
document.body.appendChild(canvas);
