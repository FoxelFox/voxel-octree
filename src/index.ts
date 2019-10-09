import {OctreeGrid} from "./octree/grid";
import "./render/context";
import {Pipeline} from "./render/pipeline";
import {start} from "./render/loop";
import {spawn, Worker} from "threads/dist";
import {IndexWorker} from "./octree/worker/worker";

async function main() {

    const grid = await spawn<OctreeGrid>(new Worker("./octree/grid"));
    await grid.initThreads();
    start(grid);
}

main().then(() => {

});