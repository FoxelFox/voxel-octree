import {OctreeGrid} from "./octree/grid";
import "./render/context";
import {Pipeline} from "./render/pipeline";
import {start} from "./render/loop";

async function main() {
    const grid = new OctreeGrid(1024);
    await grid.initThreads();
    grid.modify([-1024, -1024, 0], [2047, 2047, 63], 1);


    let i = 0;



    start(grid);
}

main().then(() => {

});