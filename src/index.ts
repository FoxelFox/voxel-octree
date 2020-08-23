import {OctreeGrid} from "./octree/grid";
import "./render/context";
import {start, init} from "./render/loop";
import {spawn, Worker} from "threads/dist";
import {generateStartScene} from "./generator/start-scene";

async function main() {

    const grid = await spawn<OctreeGrid>(new Worker("./octree/grid"));
    await grid.initThreads();
    await init();
    generateStartScene(grid);
    start(grid);
}

main().then(() => {

});