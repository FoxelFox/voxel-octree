import {OctreeGrid} from "./octree/grid";


async function main() {
    const grid = new OctreeGrid();
    let threadIndex = 0;

    grid.outOfWorkListener = async () => {

        if (threadIndex < navigator.hardwareConcurrency) {
            await grid.addThread();
            for (let i = 0; i < 128 * (threadIndex + 1); i++) {
                grid.add();
            }
            threadIndex++;
        }
    };

    await grid.outOfWorkListener();
}


const h4 = document.createElement("h4");
const threads = document.createElement("p");
const canvas = document.createElement("canvas");

h4.innerText = "WebAssembly with Threads Benchmark";
threads.id = "threads";
canvas.id = "canvas";

document.body.appendChild(h4);
document.body.appendChild(threads);
document.body.appendChild(canvas);


main().then(() => {

});