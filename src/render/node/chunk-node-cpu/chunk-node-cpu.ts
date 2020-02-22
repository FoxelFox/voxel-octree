import {Camera} from "../../camera";
import {OctreeGrid} from "../../../octree/grid";
import {Quad, Shader, SimpleNode, Texture} from "@foxel_fox/glib";
import {canvas, gl} from "../../context";
import {Pool, spawn, Transfer, Worker} from "threads/dist";
import {MeshGeneratorWorker} from "../../../octree/worker/mesh-generator";
import {ChunkWorker} from "./chunk-worker";
import {bench} from "../../loop";

export class ChunkNodeCpu extends SimpleNode {


    texture: Texture;
    raw: SharedArrayBuffer[] = [];
    dataView: Uint8Array[] = [];
    threads: ChunkWorker[] = [];
    sync = [0, 0];
    syncIndex = 0;

    ready: boolean = false;
    lastTime;

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
    }

    async createThreads() {
        const maxWorkerThreads = Math.max(1, navigator.hardwareConcurrency);
        for (let i = 0; i < maxWorkerThreads; i++) {
            const t = await spawn<ChunkWorker>(new Worker("./chunk-worker"));
            await t.create().subscribe((s: number) => {
                this.sync[s - 1]++;
            });
            this.threads.push(t)
        }
    }

    initData() {
        for (let i = 0; i < this.sync.length; i++) {
            this.raw[i] = new SharedArrayBuffer(canvas.width * canvas.height * 4);
            this.dataView[i] = new Uint8Array(this.raw[i]);
        }
        this.texture.resize(canvas.width, canvas.height);
    }

    rt() {
        return new Promise(( async resolve => {

            let firstTime = false;

            if (!this.threads.length) {
                await this.createThreads();
                firstTime = true;
            }

            let updateWorker = false;
            if (this.raw[0].byteLength !== canvas.width * canvas.height * 4) {
                this.initData();
                updateWorker = true;
            }

            const w = canvas.width;
            const h = canvas.height;

            const range = Math.floor(h / this.threads.length);

            for (let i = 0; i < this.threads.length; i++) {
                if (updateWorker) {
                    await this.threads[i].init(this.raw);
                }


                if (firstTime) {
                    for (let s = 0; s < this.sync.length; s++) {
                        this.threads[i].work(i * range, (i + 1) * range, w);
                    }
                }
            }


            if (this.sync[this.syncIndex] === this.threads.length) {

                let offset = 0;


                this.texture.update(this.dataView[this.syncIndex]);
                this.sync[this.syncIndex] = 0;

                this.syncIndex++;
                if (this.syncIndex === this.sync.length) {
                    this.syncIndex = 0;
                }

                for (let i = 0; i < this.threads.length; i++) {
                    this.threads[i].work(i * range, (i + 1) * range, w);
                }


                const last = this.lastTime;
                const now = Date.now();
                //console.log(1000 / (last - now) + " FPS");
                bench.end();
                bench.nextFrame();
                bench.begin();

                this.lastTime = now;

            }

            resolve();


            //await this.pool.completed();
            //await this.pool.terminate();
        }));

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

