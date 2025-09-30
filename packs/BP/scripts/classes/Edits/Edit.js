import { world, StructureSaveMode } from "@minecraft/server";
import { BlockVolume } from "@minecraft/server";
import { StructureIDGenerator } from "../StructureIDGenerator";
import { Vector } from "../../lib/Vector";

export class Edit {
    dimension;

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
        throw new Error('getSuccessFeedback() must be implemented');
    }

    createStructure(min, max) {
        this.replaceBlockInArea(min, max, 'minecraft:air', 'minecraft:structure_void');
        const structureID = StructureIDGenerator.getNext();
        const structureSaveOptions = { saveMode: StructureSaveMode.Memory, includeEntities: false };
        const structure = world.structureManager.createFromWorld(structureID, this.dimension, min, max, structureSaveOptions);
        this.replaceBlockInArea(min, max, 'minecraft:structure_void', 'minecraft:air');
        return structure;
    }

    pasteStructure(structure, location, mirrorAxis = void 0, rotation = void 0) {
        const structurePlaceOptions = { mirror: mirrorAxis, rotation: rotation };
        world.structureManager.place(structure.id, this.dimension, location, structurePlaceOptions);
        const max = Vector.from(location).add(structure.size);
        this.replaceBlockInArea(location, max, 'minecraft:structure_void', 'minecraft:air');
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

    replaceBlockInArea(min, max, replaceBlock, newBlock) {
        const blockVolume = new BlockVolume(min, max);
        const blockFillOptions = { blockFilter: { includeTypes: [replaceBlock] } };
        this.dimension.fillBlocks(blockVolume, newBlock, blockFillOptions);
    }
}