import {TraversalInfo} from "./node";
import {childDirections} from "../util";

export function createMesh(out: Float32Array, info: TraversalInfo, vertexIndex: number): number {
	if (info.node.children) {
		for (const childID in info.node.children) {
			const childDirection = childDirections[childID];
			const childSize = info.size / 2;
			const childInfo: TraversalInfo = {
				node: info.node.children[childID],
				size: childSize,
				depth: info.depth + 1,
				position: [
					info.position[0] + childDirection[0] * childSize,
					info.position[1] + childDirection[1] * childSize,
					info.position[2] + childDirection[2] * childSize
				]
			};
			vertexIndex = createMesh(out, childInfo, vertexIndex);
		}
		return vertexIndex;

	} else {


		if (info.node.data === 0) {
			return vertexIndex;
		}

		const offset = info.size;

		const relPositionStart = [
			(info.position[0] - offset + 0.5) * 1024,
			(info.position[1] - offset + 0.5) * 1024,
			(info.position[2] - offset + 0.5) * 1024
		];

		const relPositionEnd = [
			(info.position[0] + offset + 0.5) * 1024,
			(info.position[1] + offset + 0.5) * 1024,
			(info.position[2] + offset + 0.5) * 1024
		];

		// top 1
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;

		// top 2
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;


		// bottom 1

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		// bottom 2
		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;


		// Front 1
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		// Front 2
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		// back 1
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;

		// back 2
		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;


		// right 1
		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		// right 2

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] + offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		// left 1
		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;

		// left 2

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] + offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] + offset;
		out[vertexIndex++] = info.position[2] - offset;

		out[vertexIndex++] = info.position[0] - offset;
		out[vertexIndex++] = info.position[1] - offset;
		out[vertexIndex++] = info.position[2] + offset;


		return vertexIndex;
	}
}