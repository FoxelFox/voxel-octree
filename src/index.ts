import {OctreeGrid} from "./octree/grid";


async function main() {
    const grid = new OctreeGrid();

    for (let i = 0; i < 1024; i++) {
        grid.add();
    }
}


const h4 = document.createElement("h4");
const p = document.createElement("p");
h4.innerText = "WebAssembly with Threads Benchmark";
p.id = "points";

document.body.appendChild(h4);
document.body.appendChild(p);

main().then(() => {

});