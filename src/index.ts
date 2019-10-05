import {OctreeGrid} from "./octree/grid";
import "./render/context";
import {Pipeline} from "./render/pipeline";
import {start} from "./render/loop";

async function main() {
    const grid = new OctreeGrid(1024);
    await grid.initThreads();
    grid.modify([0, 0, 0], [1, 1, 1], 1);
    //grid.modify([1024, 1024, 1024], [1025, 1025, 1025], 1);

    start(grid);
}

main().then(() => {

});