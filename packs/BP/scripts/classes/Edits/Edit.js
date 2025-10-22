import { world, StructureSaveMode, StructureRotation, system } from "@minecraft/server";
import { BlockVolume } from "@minecraft/server";
import { IDGenerator } from "../IDGenerator";
import { Vector } from "../../lib/Vector";
import { TickingArea } from "../TickingArea";

export class Edit {
    dimension;

    constructor(selection) {
        this.dimension = selection.dimension;
    }

    async do() {
        throw new Error('do() must be implemented');
    }

    async undo() {
        throw new Error('undo() must be implemented');
    }

    getSuccessFeedback() {
        throw new Error('getSuccessFeedback() must be implemented');
    }

    createStructure(min, max) {
        this.replaceBlockInArea(min, max, 'minecraft:air', 'minecraft:structure_void');
        const structureID = IDGenerator.getNext();
        const structureSaveOptions = { saveMode: StructureSaveMode.Memory, includeEntities: false };
        const structure = world.structureManager.createFromWorld(structureID, this.dimension, min, max, structureSaveOptions);
        this.replaceBlockInArea(min, max, 'minecraft:structure_void', 'minecraft:air');
        return structure;
    }

    pasteStructure(structure, location, mirrorAxis = void 0, rotation = void 0) {
        const max = Vector.from(location).add(this.getRotatedSize(structure, rotation));
        const structurePlaceOptions = { mirror: mirrorAxis, rotation: rotation };
        world.structureManager.place(structure.id, this.dimension, location, structurePlaceOptions);
        this.replaceBlockInArea(location, max, 'minecraft:structure_void', 'minecraft:air');
    }

    clearArea(min, max) {
        const blockVolume = new BlockVolume(min, max);
        this.dimension.fillBlocks(blockVolume, 'minecraft:air');
    }

    replaceBlockInArea(min, max, replaceBlock, newBlock) {
        const blockVolume = new BlockVolume(min, max);
        const blockFillOptions = { blockFilter: { includeTypes: [replaceBlock] } };
        this.dimension.fillBlocks(blockVolume, newBlock, blockFillOptions);
    }

    getRotatedSize(structure, rotation) {
        const size = structure.size;
        if (rotation === StructureRotation.Rotate90 || rotation === StructureRotation.Rotate270)
            return new Vector(size.z - size.x, 0, size.x - size.z);
        return Vector.from(size);
    }

    async loadArea(min, max) {
        const tickingArea = new TickingArea(this.dimension, min, max);
        system.runTimeout(() => tickingArea.unload(), 50);
        await tickingArea.load();
    }
}