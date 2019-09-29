import {SimpleNode} from "@foxel_fox/glib"
import {Shader} from "@foxel_fox/glib";
import {Quad} from "@foxel_fox/glib";
import {canvas, gl} from "../../context";
import {Texture} from "@foxel_fox/glib";

export class OutputNode extends SimpleNode {

    constructor(
        private texture: Texture
    ) {
        super(new Shader(require("./output.vs.glsl"), require("./output.fs.glsl")), new Quad() as {});
    }

    init() {

        // texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture.webGLTexture);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    run() {


        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);


        gl.useProgram(this.shader.program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture.webGLTexture);


        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);


    }
}