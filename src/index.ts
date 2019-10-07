import {OctreeGrid} from "./octree/grid";
import "./render/context";
import {Pipeline} from "./render/pipeline";
import {start} from "./render/loop";

async function main() {
    const grid = new OctreeGrid(1024);
    await grid.initThreads();
    grid.modify([512, -700, 512], [512, -700, 512], 1);


    let i = 0;



    start(grid);
}

main().then(() => {

});