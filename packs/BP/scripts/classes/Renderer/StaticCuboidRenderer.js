import { DebugBox, debugDrawer } from "@minecraft/debug-utilities";
import { CuboidRenderer } from "./CuboidRenderer";

export class StaticCuboidRenderer extends CuboidRenderer {
    shape;
    color = { red: 1, green: 1, blue: 1 };

    constructor(min, max, rgbColor) {
        super(min, max);
        this.color = rgbColor;
        this.drawCuboid();
    }

    destroy() {
        debugDrawer.removeShape(this.shape);
    }

    drawCuboid() {
        if (this.shape)
            this.shape.remove();
        const boundingBox = new DebugBox(this.blockVolume.getMin());
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