import {OctreeGrid} from "./octree/grid";


async function main() {
    const grid = new OctreeGrid(1024);
    await grid.initThreads();
    grid.modify([0, 0, 0], [1024, 1024, 1024], 1)

}

const canvas = document.createElement("canvas");
canvas.id = "canvas";
document.body.appendChild(canvas);


main().then(() => {

});