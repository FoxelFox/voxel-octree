import {FrameBuffer, SimpleNode} from "@foxel_fox/glib"
import {Shader} from "@foxel_fox/glib";
import {Quad} from "@foxel_fox/glib";
import {canvas, gl} from "../../context";
import {Texture} from "@foxel_fox/glib";
import {Camera} from "../../camera";
import {mat4} from "gl-matrix";
import {ChunkNode} from "../chunk-node/chunk-node";

export class RTLightNode extends SimpleNode {

    size = undefined;

    constructor(
        private diffuse: Texture,
        private normal: Texture,
        private position: Texture,
        private camera: Camera,
        private chunks: Texture,
        private chunkNode: ChunkNode,
    ) {
        super(new Shader(require("./rt-light.vs.glsl"), require("./rt-light.fs.glsl")), new Quad() as {});
    }

    init() {

        const output = new Texture(this.size, this.size);
        const normal = new Texture(this.size, this.size, null, gl.RGBA16F, gl.RGBA, gl.FLOAT);
        const position = new Texture(this.size, this.size, null, gl.RGBA32F, gl.RGBA, gl.FLOAT);

        this.frameBuffer = new FrameBuffer([output, normal, position], false, false);

    }

    run() {
        this.frameBuffer.bind();
        gl.viewport(0, 0, canvas.width, canvas.height);
        //gl.viewport(0, 0, this.size, this.size);

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

        gl.activeTexture(gl.TEXTURE3);
        gl.uniform1i(this.shader.getUniformLocation("tChunks"), 3);
        gl.bindTexture(gl.TEXTURE_2D, this.chunks.webGLTexture);

        gl.uniform3fv(this.shader.getUniformLocation("cameraPosition"), this.camera.position);
        gl.uniform3fv(this.shader.getUniformLocation("cameraRotation"), [this.camera.rotX, this.camera.rotY, 0 ]);

        gl.uniform1i(this.shader.getUniformLocation("rtBlocks"), this.chunkNode.chunkRTBlocks);

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