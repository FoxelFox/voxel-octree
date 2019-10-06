import {OctreeGrid} from "./octree/grid";
import "./render/context";
import {Pipeline} from "./render/pipeline";
import {start} from "./render/loop";

async function main() {
    const grid = new OctreeGrid(1024);
    await grid.initThreads();
    grid.modify([0, 0, 0], [1023, 1023, 1], 1);
    //grid.modify([2000, 400, 200], [2128, 800, 201], 1);

    let i = 0;



    start(grid);
}

main().then(() => {

});