import {FrameBuffer, SimpleNode} from "@foxel_fox/glib"
import {Shader} from "@foxel_fox/glib";
import {Quad} from "@foxel_fox/glib";
import {canvas, gl} from "../../context";
import {Texture} from "@foxel_fox/glib";
import {Camera} from "../../camera";
import {mat4} from "gl-matrix";
import {ChunkNode} from "../chunk-node/chunk-node";
import { RTChunkNode } from "../rt-chunk-node/rt-chunk-node";

export class RTLightNode extends SimpleNode {

    size = undefined;
    frame = 1;

    constructor(
        private diffuse: Texture,
        private normal: Texture,
        private position: Texture,
        private camera: Camera,
        private chunks: Texture,
        private colors: Texture,
        private chunkNode: ChunkNode,
    ) {
        super(new Shader(require("./rt-light.vs.glsl"), require("./rt-light.fs.glsl")), new Quad() as {});
    }

    init() {

        const output = new Texture(this.size, this.size);

        this.frameBuffer = new FrameBuffer([output], true, false);

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

        gl.activeTexture(gl.TEXTURE4);
        gl.uniform1i(this.shader.getUniformLocation("tLastRT"), 4);
        gl.bindTexture(gl.TEXTURE_2D, this.frameBuffer.textures[0].webGLTexture);

        gl.activeTexture(gl.TEXTURE5);
        gl.uniform1i(this.shader.getUniformLocation("tColors"), 5);
        gl.bindTexture(gl.TEXTURE_2D, this.colors.webGLTexture);

        gl.uniform3fv(this.shader.getUniformLocation("cameraPosition"), this.camera.position);
        gl.uniform3fv(this.shader.getUniformLocation("cameraRotation"), [this.camera.rotX, this.camera.rotY, 0 ]);

        gl.uniform1i(this.shader.getUniformLocation("rtBlocks"), this.chunkNode.chunkRTBlocks);
        gl.uniform2f(this.shader.getUniformLocation("sampleSize"), 1 / canvas.width, 1 / canvas.height);
        gl.uniform1f(this.shader.getUniformLocation("frame"), this.frame);
        gl.uniformMatrix4fv(this.shader.getUniformLocation("oldMVP"), false, this.chunkNode.oldMVP);

        if (++this.frame > 10000) {
            this.frame = 1;
        }


        let mvp = mat4.create();
        let modelMatrix = mat4.create();

        mat4.identity(mvp);
        mat4.mul(mvp, this.camera.view, modelMatrix);
        mat4.mul(mvp, this.camera.perspective, mvp);
        mat4.invert(mvp, mvp);
        gl.uniformMatrix4fv(this.shader.getUniformLocation("inverseMVP"), false, mvp);



        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        this.frameBuffer.flip();
    }
}