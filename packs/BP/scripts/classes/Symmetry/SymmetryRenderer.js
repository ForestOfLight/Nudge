import { DebugBox, debugDrawer } from "@minecraft/debug-utilities";
import { MirrorRotateRenderer } from "../Renderer/MirrorRotateRenderer";
import { Vector } from "../../lib/Vector";

export class SymmetryRenderer {
    dimension;
    location;
    boxSize = 0.25;
    shape = void 0;
    mirrorRenderer = void 0;

    constructor(dimension, location, { mirrorAxis, rotation } = {}) {
        this.dimension = dimension;
        this.location = location;
        this.drawMarker();
        this.mirrorRenderer = new MirrorRotateRenderer(dimension, location, { mirrorAxis, rotation });
    }

    destroy() {
        debugDrawer.removeShape(this.shape);
        this.shape = void 0;
        this.mirrorRenderer?.destroy();
    }

    drawMarker() {
        if (this.shape)
            this.shape.remove();
        const dimensionLocation = this.location;
        dimensionLocation.dimension = this.dimension;
        const markerBox = new DebugBox(dimensionLocation);
        markerBox.bound = new Vector(this.boxSize, this.boxSize, this.boxSize);
        this.shape = markerBox;
        debugDrawer.addShape(markerBox);
    }
}