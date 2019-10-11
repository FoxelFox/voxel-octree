export interface OctreeNode {
    data: number;
    children?: {[key: number]: OctreeNode};
}

export interface TraversalInfo {
    size: number,
    depth: number,
    position?: number[]
    node: OctreeNode
}



export function modify(info: TraversalInfo, p1: number[], p2: number[], value: number) {
    // check merge
    if (
        p1[0] === 0 && p1[1] === 0 && p1[2] === 0 &&
        p2[0] === (info.size -1) && p2[1] === (info.size -1) && p2[2] === (info.size -1)
    ) {
        // can merged
        info.node.data = value;
        delete info.node.children; // TODO recycling of Nodes can improve the gc performance.
        return
    } else {
        // update
        // if (info.size === 2) {
        //     info.node.data = value;
        //     return;
        // }

        if (!info.node.children) {
            info.node.children = {
                0: { data: info.node.data },
                1: { data: info.node.data },
                2: { data: info.node.data },
                3: { data: info.node.data },
                4: { data: info.node.data },
                5: { data: info.node.data },
                6: { data: info.node.data },
                7: { data: info.node.data }
            };
        }

        // cut update down
        const childSize = info.size / 2;
        const x0 = lowerRange(p1[0], p2[0], childSize);
        const y0 = lowerRange(p1[1], p2[1], childSize);
        const z0 = lowerRange(p1[2], p2[2], childSize);

        const x1 = upperRange(p1[0], p2[0], childSize);
        const y1 = upperRange(p1[1], p2[1], childSize);
        const z1 = upperRange(p1[2], p2[2], childSize);

        const childInfo: TraversalInfo = {
            node: undefined,
            size: childSize,
            depth: info.depth + 1
        };


        // TODO Simplify

        if (x0) {
            if (y0) {
                if (z0) {
                    // const cIndex = childIndex([0, 0, 0]);
                    const cIndex = 0;

                    childInfo.node = info.node.children[cIndex];
                    modify(childInfo, [x0[0], y0[0], z0[0]], [x0[1], y0[1], z0[1]], value);
                }

                if (z1) {
                    // const cIndex = childIndex([0, 0, 1]);
                    const cIndex = 4;
                    childInfo.node = info.node.children[cIndex];
                    modify(childInfo, [x0[0], y0[0], z1[0]], [x0[1], y0[1], z1[1]], value);
                }
            }

            if (y1) {
                if (z0) {
                    // const cIndex = childIndex([0, 1, 0]);
                    const cIndex = 2;
                    childInfo.node = info.node.children[cIndex];
                    modify(childInfo, [x0[0], y1[0], z0[0]], [x0[1], y1[1], z0[1]], value);
                }

                if (z1) {
                    // const cIndex = childIndex([0, 1, 1]);
                    const cIndex = 6;
                    childInfo.node = info.node.children[cIndex];
                    modify(childInfo, [x0[0], y1[0], z1[0]], [x0[1], y1[1], z1[1]], value);
                }
            }
        }

        if (x1) {
            if (y0) {
                if (z0) {
                    // const cIndex = childIndex([1, 0, 0]);
                    const cIndex = 1;
                    childInfo.node = info.node.children[cIndex];
                    modify(childInfo, [x1[0], y0[0], z0[0]], [x1[1], y0[1], z0[1]], value);
                }

                if (z1) {
                    // const cIndex = childIndex([1, 0, 1]);
                    const cIndex = 5;
                    childInfo.node = info.node.children[cIndex];
                    modify(childInfo, [x1[0], y0[0], z1[0]], [x1[1], y0[1], z1[1]], value);
                }
            }

            if (y1) {
                if (z0) {
                    // const cIndex = childIndex([1, 1, 0]);
                    const cIndex = 3;
                    childInfo.node = info.node.children[cIndex];
                    modify(childInfo, [x1[0], y1[0], z0[0]], [x1[1], y1[1], z0[1]], value);
                }
                if (z1) {
                    // const cIndex = childIndex([1, 1, 1]);
                    const cIndex = 7;
                    childInfo.node = info.node.children[cIndex];
                    modify(childInfo, [x1[0], y1[0], z1[0]], [x1[1], y1[1], z1[1]], value);
                }
            }
        }
        const childKeys = Object.keys(info.node.children);
        const same = info.node.children[childKeys[0]].data;

        if (childKeys.length === 8) {
            let canMerge = true;
            for (const key of childKeys) {
                if (info.node.children[key].children || info.node.children[key].data !== info.node.data) {
                    canMerge = false;
                    break;
                }
            }

            if (canMerge) {
                // info.node.data = value;
                delete info.node.children;
                console.log("merged")
            }
        }
    }


}

function lowerRange(n1, n2, mid) {
    if (n1 < mid) {
        return [n1, n2 >= mid ? mid -1 : n2]
    }
}

function upperRange(n1, n2, mid) {
    if (n2 >= mid) {
        return [n1 >= mid ? n1 - mid : 0, n2 - mid]
    }
}

export function getData(info: TraversalInfo, p1: number[]) {

    if (!info.node.children || info.size === 1) {
        return info.node.data;
    } else {
        const childID = [
            p1[0] < info.size ? 0 : 1,
            p1[1] < info.size ? 0 : 1,
            p1[2] < info.size ? 0 : 1
        ];

        const childInfo: TraversalInfo = {
            node: info.node.children[childIndex(childID)],
            size: info.size / 2,
            depth: info.depth + 1
        };

        return getData(childInfo, p1);
    }




}

export function childIndex(p: number[]): number {
    return p[0] + 2 * (p[1] + 2 * p[2]);
}

