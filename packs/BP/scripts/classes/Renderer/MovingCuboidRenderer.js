import { Vector } from "../../lib/Vector";
import { CuboidRenderer } from "./CuboidRenderer";

export class MovingCuboidRenderer extends CuboidRenderer {
    staticCuboidRenderer;

    constructor(dimension, min, max, staticCuboidRenderer) {
        super(dimension, min, max, 1, 1);
        this.staticCuboidRenderer = staticCuboidRenderer;
    }

    getColorForParticle(location) {
        const rgb = this.getRGBByAxis(location);
        return { ...rgb, alpha: 1 };
    }

    shouldIgnoreParticle(location) {
        const staticParticles = this.staticCuboidRenderer.particlesToDraw;
        if (staticParticles.some((staticParticle) => {
            const staticLocation = Vector.from(staticParticle[1]);
            return staticLocation.distance(location) < 0.001;
        }))
            return true;
        return false;
    }

    getRGBByAxis(location) {
        const tolerance = 0.001;
        const isClose = (a, b) => Math.abs(a - b) < tolerance;

        if (!isClose(location.x, this.min.x) && isClose(location.y, this.min.y) && isClose(location.z, this.min.z))
            return { red: 1, green: 0, blue: 0 };
        else if (!isClose(location.y, this.min.y) && isClose(location.x, this.min.x) && isClose(location.z, this.min.z))
            return { red: 0, green: 1, blue: 0 };
        else if (!isClose(location.z, this.min.z) && isClose(location.x, this.min.x) && isClose(location.y, this.min.y))
            return { red: 0, green: 0, blue: 1 };
        return { red: 1, green: 1, blue: 1 };
    }
}