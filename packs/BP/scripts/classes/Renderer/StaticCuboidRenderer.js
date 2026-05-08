import { DebugBox, debugDrawer } from "@minecraft/debug-utilities";
import { CuboidRenderer } from "./CuboidRenderer";
import { Vector } from "../../lib/Vector";

export class StaticCuboidRenderer extends CuboidRenderer {
    shape;
    color;

    constructor(dimension, min, max, RGBAColor) {
        super(dimension, min, max);
        this.color = RGBAColor;
        this.drawCuboid();
    }

    destroy() {
        debugDrawer.removeShape(this.shape);
    }

    drawCuboid() {
        if (this.shape)
            this.shape.remove();
        const dimensionLocation = Vector.from(this.blockVolume.getSpan()).multiply(0.5).add(this.blockVolume.getMin());
        dimensionLocation.dimension = this.dimension;
        const boundingBox = new DebugBox(dimensionLocation);
        boundingBox.bound = this.blockVolume.getSpan();
        boundingBox.color = this.color;
        this.shape = boundingBox;
        debugDrawer.addShape(boundingBox);
    }

    setColor(rgba) {
        this.color = rgba;
        this.drawCuboid();
    }
}