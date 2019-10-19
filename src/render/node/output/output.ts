import {SimpleNode} from "@foxel_fox/glib"
import {Shader} from "@foxel_fox/glib";
import {Quad} from "@foxel_fox/glib";
import {canvas, gl} from "../../context";
import {Texture} from "@foxel_fox/glib";
import {Camera} from "../../camera";
import {mat4} from "gl-matrix";

export class OutputNode extends SimpleNode {

    constructor(
        private diffuse: Texture,
        private normal: Texture,
        private position: Texture,
        private camera: Camera
    ) {
        super(new Shader(require("./output.vs.glsl"), require("./output.fs.glsl")), new Quad() as {});
    }

    init() {

        // texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.diffuse.webGLTexture);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    run() {


        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);


        gl.useProgram(this.shader.program);

        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(this.shader.getUniformLocation("tDiffuse"), 0);
        gl.bindTexture(gl.TEXTURE_2D, this.diffuse.webGLTexture);


        gl.activeTexture(gl.TEXTURE1);
        gl.uniform1i(this.shader.getUniformLocation("tNormal"), 1);
        gl.bindTexture(gl.TEXTURE_2D, this.normal.webGLTexture);

        gl.activeTexture(gl.TEXTURE2);
        gl.uniform1i(this.shader.getUniformLocation("tPosition"), 2);
        gl.bindTexture(gl.TEXTURE_2D, this.position.webGLTexture);

        gl.uniform3fv(this.shader.getUniformLocation("cameraPosition"), this.camera.position);
        gl.uniform3fv(this.shader.getUniformLocation("cameraRotation"), [this.camera.rotX, this.camera.rotY, 0 ]);

        let mvp = mat4.create();
        let modelMatrix = mat4.create();

        mat4.identity(mvp);
        mat4.mul(mvp, this.camera.view, modelMatrix);
        mat4.mul(mvp, this.camera.perspective, mvp);
        mat4.invert(mvp, mvp);
        gl.uniformMatrix4fv(this.shader.getUniformLocation("inverseMVP"), false, mvp);



        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);


    }
}