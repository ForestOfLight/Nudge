import { CuboidRenderer } from "./CuboidRenderer";

export class StaticCuboidRenderer extends CuboidRenderer {
    color;

    constructor(dimension, min, max, rgbColor) {
        super(dimension, min, max, 10, 20);
        this.setColor(rgbColor);
    }

    setColor(rgb) {
        this.color = { ...rgb, alpha: 1 };
    }

    getColorForParticle(location) {
        return this.color;
    }
}