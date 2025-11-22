import { NudgingCuboidRenderer } from "./NudgingCuboidRenderer";
import { RGBColor } from "./RGBColor";
import { StaticCuboidRenderer } from "./StaticCuboidRenderer";

export class SelectionRenderer {
    dimension;
    min;
    max;
    staticRenderer;
    movingRenderer;

    constructor(dimension, min, max) {
        this.dimension = dimension;
        this.min = min;
        this.max = max;
        this.staticRenderer = new StaticCuboidRenderer(this.dimension, this.min, this.max, RGBColor.White);
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
        this.staticRenderer.setColor(RGBColor.Grey);
        this.movingRenderer = new NudgingCuboidRenderer(this.dimension, this.min, this.max, playerMovement);
    }

    disableMovementMode() {
        this.movingRenderer.destroy();
        this.staticRenderer.setColor(RGBColor.White);
    }
    
    setMovementLocation(nudgedMin, nudgedMax) {
        this.movingRenderer.setLocation(nudgedMin.floor(), nudgedMax.floor());
    }

    setMirrorAxis(mirrorAxis) {
        this.movingRenderer.setMirrorAxis(mirrorAxis);
    }

    setRotation(rotation) {
        this.movingRenderer.setRotation(rotation);
    }
}