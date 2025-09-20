import { BlockVolume } from "@minecraft/server";

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
}