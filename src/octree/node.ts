export interface OctreeNode {
    data: number;
    children?: OctreeNode[];
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
        const childSize = info.size / 2;

        if (p1[0] < childSize && p1[1] < childSize && p1[2] < childSize) {
            // info.node.children[0]
            const childInfo: TraversalInfo = {
                node: info.node.children[0],
                size: childSize,
                // position: [-0.5, -0.5, -0.5], // TODO
                depth: info.depth + 1
            };
            modify(childInfo, p1, p2, value);
        }
    }
}

export function childIndex(p: number[]): number {
    return p[0] + 2 * (p[1] + 2 * p[2]);
}

