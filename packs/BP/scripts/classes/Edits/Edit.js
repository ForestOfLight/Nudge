import { world, StructureSaveMode, system } from "@minecraft/server";
import { IDGenerator } from "../IDGenerator";
import { UnloadedVolumeError } from "../Errors/UnloadedVolumeError";
import { OutOfBoundsVolumeError } from "../Errors/OutOfBoundsVolumeError";

export class Edit {
    dimension;
    tickingAreas = [];

    constructor(dimension) {
        this.dimension = dimension;
    }

    async do() {
        throw new Error('do() must be implemented');
    }

    async undo() {
        throw new Error('undo() must be implemented');
    }

    getDoingFeedback() {
        throw new Error('getDoingFeedback() must be implemented');
    }

    getSuccessFeedback() {
        throw new Error('getSuccessFeedback() must be implemented');
    }

    createSingleStructure(min, max, { includeEntities = true } = {}) {
        this.assertInDimensionBounds(min, max);
        const structureID = IDGenerator.getNext();
        const structureSaveOptions = { saveMode: StructureSaveMode.Memory, includeEntities: includeEntities };
        return world.structureManager.createFromWorld(structureID, this.dimension, min, max, structureSaveOptions);
    }
    
    pasteSingleStructure(structure, location, mirrorAxis = void 0, rotation = void 0) {
        const structurePlaceOptions = { mirror: mirrorAxis, rotation: rotation };
        world.structureManager.place(structure.id, this.dimension, location, structurePlaceOptions);
    }

    async loadArea(min, max) {
        const tickingAreaID = IDGenerator.getNext().replace(':', '-');
        const tickingAreaOptions = { dimension: this.dimension, from: min, to: max };
        if (!world.tickingAreaManager.hasCapacity(tickingAreaOptions))
            throw new UnloadedVolumeError("TickingArea could not be added. The area is too large or there are already too many ticking chunks.");
        this.tickingAreas.push(await world.tickingAreaManager.createTickingArea(tickingAreaID, tickingAreaOptions));
    }

    unloadArea() {
        system.run(() => {
            this.tickingAreas.forEach(tickingArea => world.tickingAreaManager.removeTickingArea(tickingArea));
            this.tickingAreas.length = 0;
        });
    }

    assertFullyLoaded() {
        for (const tickingArea of this.tickingAreas) {
            if (!tickingArea.isFullyLoaded)
                throw new UnloadedVolumeError('The area is not completely loaded.');
        }
        return true;
    }

    assertInDimensionBounds(min, max) {
        const bounds = this.dimension.heightRange;
        if (min.y < bounds.min || max.y > bounds.max)
            throw new OutOfBoundsVolumeError('The area is partially outside of the dimension\'s height boundaries.');
        return true;
    }
}