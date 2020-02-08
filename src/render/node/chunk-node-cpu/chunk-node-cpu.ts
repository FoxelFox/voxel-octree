import {Camera} from "../../camera";
import {OctreeGrid} from "../../../octree/grid";
import {Quad, Shader, SimpleNode, Texture} from "@foxel_fox/glib";
import {canvas, gl} from "../../context";
import {Pool, spawn, Transfer, Worker} from "threads/dist";
import {MeshGeneratorWorker} from "../../../octree/worker/mesh-generator";
import {ChunkWorker} from "./chunk-worker";

export class ChunkNodeCpu extends SimpleNode {


    texture: Texture;
    rawData: SharedArrayBuffer;
    dataView: Uint8Array;
    pool;

    constructor (
        private camera: Camera,
        private grid: OctreeGrid
    ) {
        super(
            new Shader(require("./chunk-node-cpu.vs.glsl"), require("./chunk-node-cpu.fs.glsl")),
            new Quad() as {}
        );
    }

    init() {
        this.texture = new Texture();
        this.initData();


        const maxWorkerThreads = Math.max(1, navigator.hardwareConcurrency);
        this.pool = Pool(() => spawn<ChunkWorker>(new Worker("./chunk-worker")), maxWorkerThreads)

    }

    initData() {
        this.rawData = new SharedArrayBuffer(canvas.width * canvas.height * 4);
        this.dataView = new Uint8Array(this.rawData);
        this.texture.resize(canvas.width, canvas.height);
    }

    async rt() {

        if (this.rawData.byteLength !== canvas.width * canvas.height * 4) {
            this.initData();
        }

        const w = canvas.width;
        const h = canvas.height;
        const threads = navigator.hardwareConcurrency;
        const range = Math.floor(h / navigator.hardwareConcurrency);

        for (let thread = 0; thread < threads; thread++) {
            this.pool.queue(async worker => {
                const result = await worker.work(thread * range, (thread + 1) * range, w, this.rawData);
            });
        }

        await this.pool.completed();

        this.texture.update(this.dataView);
    }

    async run(): Promise<void> {

        await this.rt();

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.useProgram(this.shader.program);

        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(this.shader.getUniformLocation("tFinal"), 0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture.webGLTexture);


        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

    }
}

