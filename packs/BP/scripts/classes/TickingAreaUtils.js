import { world } from "@minecraft/server";
import { UnloadedVolumeError } from "./Errors/UnloadedVolumeError";
import { IDGenerator } from "./IDGenerator";
import { Vector } from "../lib/Vector";

export class TickingAreaUtils {
    static async loadArea(dimension, min, max) {
        const tickingAreaID = IDGenerator.getNext().replace(':', '-');
        const tickingAreaOptions = { dimension: dimension, from: min, to: max };
        if (!world.tickingAreaManager.hasCapacity(tickingAreaOptions))
            throw new UnloadedVolumeError("TickingArea could not be added. The area is too large or there are already too many ticking chunks.");
        return await world.tickingAreaManager.createTickingArea(tickingAreaID, tickingAreaOptions);
    }

    static async loadChunkRadius(dimension, location, chunkRadius) {
        const searchDistance = new Vector(chunkRadius, 0, chunkRadius).multiply(16);
        const maxLoadLocation = Vector.from(location).add(searchDistance);
        const minLoadLocation = Vector.from(location).subtract(searchDistance);
        return await TickingAreaUtils.loadArea(dimension, maxLoadLocation, minLoadLocation);
    }

    static async unloadArea(tickingArea) {
        world.tickingAreaManager.removeTickingArea(await tickingArea);
    }

    static unloadAreas(tickingAreas) {
        for (const tickingArea of tickingAreas)
            TickingAreaUtils.unloadArea(tickingArea);
    }

    static assertFullyLoaded(tickingAreas) {
        for (const tickingArea of tickingAreas) {
            if (!tickingArea.isFullyLoaded)
                throw new UnloadedVolumeError('The area is not completely loaded.');
        }
        return true;
    }
}