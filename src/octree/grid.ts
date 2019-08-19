import {ModuleThread, spawn, Worker} from "threads/dist";
import {IndexWorker} from "./worker";

import Chart from 'chart.js';


export class OctreeGrid {

    pool: ModuleThread<IndexWorker>[] = [];
    queue = [];
    finishedWork = 0;
    start: number;
    max: number = 0;
    activeThreads = 0;
    outOfWorkListener;
    scores = new Array(navigator.hardwareConcurrency);
    myChart;

    constructor () {
        this.createChart();
    }

    // async initThreads() {
    //     for( let i = 0; i < navigator.hardwareConcurrency; i++) {
    //         const thread = await spawn<IndexWorker>(new Worker("./worker"));
    //         await thread.init();
    //         this.pool.push(thread);
    //     }
    // }

    async addThread() {
        const thread = await spawn<IndexWorker>(new Worker("./worker"));
        await thread.init();

        this.start = Date.now();
        this.pool.push(thread);
        this.activeThreads++;
        this.finishedWork = 0;


        const span = document.createElement("span");
        span.id = "points" + this.activeThreads;
        document.body.appendChild(span);
    }

    balanceWork() {
        while (this.queue[0] && this.pool[0]) {
            const work = this.queue.shift();
            const worker = this.pool.shift();

            worker.getIndex().then(() => {
                const score = ++this.finishedWork / (Date.now() - this.start) * 1000;
                if (score > this.max) {
                    this.max = score;
                    this.scores[this.activeThreads - 1] = this.max;

                    // find best score
                    let max = 0;
                    let thread = 0;
                    let i = 0;
                    for (let t of this.scores) {
                        ++i;
                        if (t > max) {
                            max = t;
                            thread = i;
                        }
                    }
                    document.getElementById("threads").innerText = max.toFixed(0) + " Points";

                    this.updateChart();

                }
                this.pool.push(worker);
                this.balanceWork();
            });
        }

        if (this.queue.length === 0 && this.pool.length === this.activeThreads) {
            this.outOfWorkListener();

        }
    }

    add() {
        this.queue.push({});
        this.balanceWork();
    }

    createChart() {
        // @ts-ignore
        const ctx = document.getElementById("canvas").getContext('2d');

        const absoluteData = [];
        const labels = [];
        let i = 0;
        for (const score of this.scores) {
            ++i;
            labels.push(i + (i === 1 ? " Thread" : " Threads"));
            absoluteData.push({ x: i, y: score === undefined ? 0 : score.toFixed(0)});
        }

        this.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: "Points",
                    data: absoluteData,
                    backgroundColor: 'rgba(32, 128, 255, 0.1)',
                    borderColor: 'rgba(32, 128, 255, 1.0)'
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        stacked: true
                    }]
                },
                animation: {
                    duration: 0
                },
                hover: {
                    animationDuration: 0
                },
                // responsiveAnimationDuration: 0
            }
        });
    }

    updateChart() {
        const absoluteData = [];
        const labels = [];
        let i = 0;
        for (const score of this.scores) {
            ++i;
            labels.push(i + (i === 1 ? " Thread" : " Threads"));
            absoluteData.push({ x: i, y: score === undefined ? 0 : score.toFixed(0)});
        }

        this.myChart.data.datasets = [{
            label: "Points",
            data: absoluteData,
            backgroundColor: 'rgba(32, 128, 255, 0.1)',
            borderColor: 'rgba(32, 128, 255, 1.0)'
        }]

        this.myChart.update();
    }

    sub() {

    }
}