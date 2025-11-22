import { DebugBox, debugDrawer } from "@minecraft/debug-utilities";
import { CuboidRenderer } from "./CuboidRenderer";

export class StaticCuboidRenderer extends CuboidRenderer {
    shape;
    color;

    constructor(dimension, min, max, rgbColor) {
        super(dimension, min, max);
        this.color = rgbColor;
        this.drawCuboid();
    }

    destroy() {
        debugDrawer.removeShape(this.shape);
    }

    drawCuboid() {
        if (this.shape)
            this.shape.remove();
        const min = this.blockVolume.getMin();
        min.dimension = this.dimension;
        const boundingBox = new DebugBox(min);
        boundingBox.bound = this.blockVolume.getSpan();
        boundingBox.color = this.color;
        this.shape = boundingBox;
        debugDrawer.addShape(boundingBox);
    }

    setColor(rgb) {
        this.color = rgb;
        this.drawCuboid();
    }
}