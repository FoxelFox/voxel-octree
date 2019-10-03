export interface OctreeNode {
    data: number;
    children?: OctreeNode[];
}

export interface TraversalInfo {
    size: number,
    depth: number,
    position: number[]
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
    } else {
        // update
        if (!info.node.children) {
            info.node.children = [
                { data: info.node.data },
                { data: info.node.data },
                { data: info.node.data },
                { data: info.node.data },
                { data: info.node.data },
                { data: info.node.data },
                { data: info.node.data },
                { data: info.node.data }
            ]
        }

        // cut update down


    }
}