import { Vector } from "../../lib/Vector";
import { NudgingCuboidRenderer } from "./NudgingCuboidRenderer";
import { StaticCuboidRenderer } from "./StaticCuboidRenderer";

export class SelectionRenderer {
    min;
    max;
    drawFrequencyTicks = 5;
    particleLifetimeTicks = 10;
    staticRenderer;
    movingRenderer;

    constructor(min, max) {
        this.min = min;
        this.max = max;
        this.staticRenderer = new StaticCuboidRenderer(this.min, this.max, { red: 1, green: 1, blue: 1 });
    }

    startDraw() {
        this.staticRenderer.drawCuboid();
    }

    stopDraw() {
        this.staticRenderer.destroy();
        this.movingRenderer?.destroy();
    }

    setOutlineLocation(min, max) {
        this.min = min;
        this.max = max;
        this.staticRenderer.setLocation(this.min, this.max);
    }

    enableMovementMode(playerMovement) {
        this.staticRenderer.setColor({ red: 0.5, green: 0.5, blue: 0.5 });
        this.movingRenderer = new NudgingCuboidRenderer(this.min, this.max, playerMovement);
    }

    disableMovementMode() {
        this.movingRenderer.destroy();
        this.staticRenderer.setColor({ red: 1, green: 1, blue: 1 });
    }
    
    setMovementLocation(minOffset, maxOffset) {
        this.movingRenderer.setLocation(minOffset.floor(), maxOffset.floor());
    }
}