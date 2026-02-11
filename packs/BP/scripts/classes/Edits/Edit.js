import { world, StructureSaveMode } from "@minecraft/server";
import { IDGenerator } from "../IDGenerator";
import { OutOfBoundsVolumeError } from "../Errors/OutOfBoundsVolumeError";
import { UnloadedVolumeError } from "../Errors/UnloadedVolumeError";

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
    
    pasteSingleStructure(structure, location, structurePlaceOptions = {}) {
        world.structureManager.place(structure.id, this.dimension, location, structurePlaceOptions);
    }

    assertFullyLoaded(min, max) {
        for (let x = min.x; x <= max.x; x += 16) {
            for (let z = min.z; z <= max.z; z += 16) {
                if (!this.dimension.isChunkLoaded({ x, y: min.y, z }))
                    throw new UnloadedVolumeError('The area is not completely loaded.');
            }
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