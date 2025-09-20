import { Vector } from "../../lib/Vector";
import { OutlineRenderer } from "./OutlineRenderer";

export class SelectionRenderer {
    dimension;
    min;
    max;
    drawFrequencyTicks = 5;
    particleLifetimeTicks = 10;
    outlineRenderer;
    movementRenderer;

    constructor(dimension, min, max) {
        this.dimension = dimension;
        this.min = min;
        this.max = max.add(new Vector(1, 1, 1));
        this.outlineRenderer = new OutlineRenderer(this.dimension, this.min, this.max, this.drawFrequencyTicks, this.particleLifetimeTicks);
    }

    startDraw() {
        this.outlineRenderer.startDraw();
    }

    stopDraw() {
        this.outlineRenderer.stopDraw();
        this.movementRenderer?.stopDraw();
    }

    setOutlineLocation(dimension, min, max) {
        this.dimension = dimension;
        this.min = min;
        this.max = max.add(new Vector(1, 1, 1));
        this.outlineRenderer.setVertices(this.dimension, this.min, this.max);
    }

    enableMovementMode() {
        this.movementRenderer = new OutlineRenderer(this.dimension, this.min, this.max, 1, 1);
        this.movementRenderer.startDraw();
        this.outlineRenderer.setColor({ red: 0.75, green: 0.75, blue: 0.75 });
    }

    disableMovementMode() {
        this.movementRenderer.stopDraw();
        this.outlineRenderer.setColor();
    }
    
    setMovementLocation(minOffset, maxOffset) {
        this.movementRenderer.setVertices(this.dimension, minOffset.floor(), maxOffset.floor().add(new Vector(1, 1, 1)));
    }
}