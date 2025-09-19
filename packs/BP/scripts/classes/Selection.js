import { Vector } from "../lib/Vector";
import { SelectionRenderer } from "./Renderer/SelectionRenderer";

export class Selection {
    dimension;
    from;
    to;
    renderer;

    constructor(dimension, from, to = void 0) {
        this.dimension = dimension;
        this.from = Vector.from(from);
        this.to = Vector.from(to || from);
        const { min, max } = this.getBounds();
        this.renderer = new SelectionRenderer(dimension, min, max);
        this.renderer.startDraw();
    }

    destroy() {
        this.renderer.stopDraw();
    }

    setFrom(location) {
        this.from = Vector.from(location);
        this.updateRendererLocation();
    }

    setTo(location) {
        this.to = Vector.from(location);
        this.updateRendererLocation();
    }

    extendTo(location) {
        this.from = Vector.from({
            x: Math.min(this.from.x, location.x),
            y: Math.min(this.from.y, location.y),
            z: Math.min(this.from.z, location.z)
        });
        this.to = Vector.from({
            x: Math.max(this.to.x, location.x),
            y: Math.max(this.to.y, location.y),
            z: Math.max(this.to.z, location.z)
        });
        this.updateRendererLocation();
    }

    getBounds() {
        const min = Vector.from({
            x: Math.min(this.to.x, this.from.x),
            y: Math.min(this.to.y, this.from.y),
            z: Math.min(this.to.z, this.from.z)
        });
        const max = Vector.from({
            x: Math.max(this.to.x, this.from.x),
            y: Math.max(this.to.y, this.from.y),
            z: Math.max(this.to.z, this.from.z)
        });
        return { min, max };
    }

    getSize() {
        const { min, max } = this.getBounds();
        return max.subtract(min);
    }

    updateRendererLocation() {
        const { min, max } = this.getBounds();
        this.renderer.setLocation(this.dimension, min, max);
    }
}