import {setContext} from "@foxel_fox/glib";

export const pixelRatio = window.devicePixelRatio || 1;
export const canvas = document.createElement("canvas");

export const gl = canvas.getContext("webgl2", {
	antialias: false,
	alpha: false,
	premultipliedAlpha: false
}) as WebGL2RenderingContext;
setContext(gl);

gl.getExtension("EXT_color_buffer_float");
gl.enable(gl.CULL_FACE);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
//gl.cullFace(gl.FRONT_FACE);


const cursor = document.createElement("div");
cursor.style.width = "10px";
cursor.style.height = "20px";
cursor.style.color = "white";
cursor.style.position = "absolute";
cursor.style.margin = "auto";
cursor.style.left = "0";
cursor.style.right = "0";
cursor.style.top = "0";
cursor.style.bottom = "0";
cursor.innerText = "+";


canvas.style.width = "100vw";
canvas.style.height = "100vh";
canvas.style.display = "block";

document.body.style.margin = "0";
document.body.appendChild(cursor);
document.body.appendChild(canvas);







