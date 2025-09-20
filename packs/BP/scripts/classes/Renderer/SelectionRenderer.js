import { Vector } from "../../lib/Vector";
import { MovingCuboidRenderer } from "./MovingCuboidRenderer";
import { StaticCuboidRenderer } from "./StaticCuboidRenderer";

export class SelectionRenderer {
    dimension;
    min;
    max;
    drawFrequencyTicks = 5;
    particleLifetimeTicks = 10;
    staticRenderer;
    movingRenderer;

    constructor(dimension, min, max) {
        this.dimension = dimension;
        this.min = min;
        this.max = max.add(new Vector(1, 1, 1));
        this.staticRenderer = new StaticCuboidRenderer(this.dimension, this.min, this.max, { red: 1, green: 1, blue: 1 });
    }

    startDraw() {
        this.staticRenderer.startDraw();
    }

    stopDraw() {
        this.staticRenderer.stopDraw();
        this.movingRenderer?.stopDraw();
    }

    setOutlineLocation(dimension, min, max) {
        this.dimension = dimension;
        this.min = min;
        this.max = max.add(new Vector(1, 1, 1));
        this.staticRenderer.setVertices(this.dimension, this.min, this.max);
    }

    enableMovementMode() {
        this.movingRenderer = new MovingCuboidRenderer(this.dimension, this.min, this.max, this.staticRenderer);
        this.movingRenderer.startDraw();
        this.staticRenderer.setColor({ red: 0.5, green: 0.5, blue: 0.5 });
    }

    disableMovementMode() {
        this.movingRenderer.stopDraw();
        this.staticRenderer.setColor({ red: 1, green: 1, blue: 1 });
    }
    
    setMovementLocation(minOffset, maxOffset) {
        this.movingRenderer.setVertices(this.dimension, minOffset.floor(), maxOffset.floor().add(new Vector(1, 1, 1)));
    }
}