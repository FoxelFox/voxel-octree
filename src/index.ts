import {OctreeGrid} from "./octree/grid";
import "./render/context";
import {start} from "./render/loop";
import {spawn, Worker} from "threads/dist";

async function main() {

    const grid = await spawn<OctreeGrid>(new Worker("./octree/grid"));
    await grid.initThreads();
    start(grid);
}

main().then(() => {

});