import {Worker, spawn, ModuleThread} from "threads/dist";
import {IndexWorker} from "./worker";


const queue = [];

async function main() {

    let pool: { free: boolean, thread: ModuleThread<IndexWorker>}[] = [];


    for( let i = 0; i < navigator.hardwareConcurrency; i++) {

        const thread = await spawn<IndexWorker>(new Worker("./worker"));
        await thread.init();

        pool.push({
            free: true,
            thread
        });
    }

    for (let i = 0; i < 8; ++i) {
        pool[i].thread.getIndex().then((result) => {
            console.log(result);
        });
    }
}

main().then(() => {

});