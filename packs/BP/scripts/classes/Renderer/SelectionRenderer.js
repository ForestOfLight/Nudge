import { Vector } from "../../lib/Vector";
import { OutlineRenderer } from "./OutlineRenderer";
import { VolumeRenderer } from "./VolumeRenderer";

export class SelectionRenderer {
    dimension;
    min;
    max;
    drawFrequency = 5;
    particleLifetime = 10;
    outlineRenderer;
    volumeRenderer;

    constructor(dimension, min, max) {
        this.dimension = dimension;
        this.min = min;
        this.max = max.add(new Vector(1, 1, 1));
        this.outlineRenderer = new OutlineRenderer(this.dimension, this.min, this.max, this.drawFrequency, this.particleLifetime);
        this.volumeRenderer = new VolumeRenderer(this.dimension, this.min, this.max, this.drawFrequency, this.particleLifetime);
    }

    startDraw() {
        this.outlineRenderer.startDraw();
        this.volumeRenderer.startDraw();
    }

    stopDraw() {
        this.outlineRenderer.stopDraw();
        this.volumeRenderer.stopDraw();
    }

    setLocation(dimension, min, max) {
        this.dimension = dimension;
        this.min = min;
        this.max = max.add(new Vector(1, 1, 1));
        this.outlineRenderer.setVertices(this.dimension, this.min, this.max);
        this.volumeRenderer.setVertices(this.dimension, this.min, this.max);
    }
}