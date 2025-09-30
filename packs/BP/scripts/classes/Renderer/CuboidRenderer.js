import { BlockVolume } from "@minecraft/server";
import { Vector } from "../../lib/Vector";

export class CuboidRenderer {
    blockVolume;

    constructor(min, max) {
        this.blockVolume = new BlockVolume(min, max);
    }

    destroy() {
        throw new Error('destroy() must be implemented.');
    }

    setLocation(min, max) {
        this.blockVolume.from = min;
        this.blockVolume.to = max;
        this.drawCuboid();
    }

    drawCuboid() {
        throw new Error('drawCuboid() must be implemented.');
    }

    getVertexIndexes(min, max) {
        return [
            new Vector(min.x, min.y, min.z),
            new Vector(max.x, min.y, min.z),
            new Vector(max.x, max.y, min.z),
            new Vector(min.x, max.y, min.z),
            new Vector(min.x, min.y, max.z),
            new Vector(max.x, min.y, max.z),
            new Vector(max.x, max.y, max.z),
            new Vector(min.x, max.y, max.z)
        ];
    }

    getEdges() {
        return [ // Arranged in pairs of smaller (closer to min) and larger (closer to max) vertices
            [0, 1], [0, 3], [0, 4],
            [1, 2], [3, 2], [4, 5],
            [5, 6], [7, 6], [4, 7],
            [1, 5], [2, 6], [3, 7]
        ];
    }

    getFaceIndexes() {
        return [ // Arranged in pairs of smaller (closer to min) and larger (closer to max) vertices
            [0, 5], [0, 2], [0, 7],
            [1, 6], [4, 6], [3, 6]
        ];
    }
}