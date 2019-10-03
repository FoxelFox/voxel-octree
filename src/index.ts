import {OctreeGrid} from "./octree/grid";
import "./render/context";
import {Pipeline} from "./render/pipeline";
import {start} from "./render/loop";

async function main() {
    const grid = new OctreeGrid(1024);
    await grid.initThreads();
    grid.modify([-2000, -2000, -2000], [2000, 2000, 2000], 1);

    start(grid);
}

main().then(() => {

});