import { world, StructureSaveMode } from "@minecraft/server";
import { BlockVolume } from "@minecraft/server";
import { StructureIDGenerator } from "../StructureIDGenerator";

export class Edit {
    dimension;
    shouldExitAfterConfirm = true;

    constructor(selection) {
        this.dimension = selection.dimension;
    }

    do() {
        throw new Error('do() must be implemented');
    }

    undo() {
        throw new Error('undo() must be implemented');
    }

    getSuccessFeedback() {
        throw new Error('undo() must be implemented');
    }

    createStructure(min, max) {
        const structureID = StructureIDGenerator.getNext();
        return world.structureManager.createFromWorld(structureID, this.dimension, min, max, { saveMode: StructureSaveMode.Memory });
    }

    clearArea(min, max) {
        const blockVolume = new BlockVolume(min, max);
        this.dimension.fillBlocks(blockVolume, 'minecraft:air');
        const entities = this.dimension.getEntities({ location: min, volume: blockVolume.getSpan() });
        entities.forEach(entity => {
            try {
                entity.remove();
            } catch {
                /* pass */
            }
        });
    }
}