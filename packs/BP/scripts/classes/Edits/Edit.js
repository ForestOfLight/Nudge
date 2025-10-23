import { world, StructureSaveMode, StructureRotation, system } from "@minecraft/server";
import { BlockVolume } from "@minecraft/server";
import { IDGenerator } from "../IDGenerator";
import { Vector } from "../../lib/Vector";
import { TickingArea } from "../TickingArea";
import { VolumePartitioner } from "../VolumePartitioner";

const MAX_FILL_VOLUME = 31;
const MAX_STRUCTURE_SIZE = 63;

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

    createPartitionedStructure(min, max) {
        this.replaceBlockInArea(min, max, 'minecraft:air', 'minecraft:structure_void');
        const structureSaveOptions = { saveMode: StructureSaveMode.Memory, includeEntities: false };
        const blockVolume = new BlockVolume(min, max);
        const structurePartitioner = new VolumePartitioner(blockVolume, MAX_STRUCTURE_SIZE);
        const structures = [];
        structurePartitioner.getPartitions().forEach((partition) => {
            const structureID = IDGenerator.getNext();
            const structure = world.structureManager.createFromWorld(structureID, this.dimension, partition.getMin(), partition.getMax(), structureSaveOptions);
            structures.push(structure);
        });
        this.replaceBlockInArea(min, max, 'minecraft:structure_void', 'minecraft:air');
        return { structures, blockVolume };
    }

    pastePartitionedStructure(partitionedStructure, location, mirrorAxis = void 0, rotation = void 0) {
        const max = Vector.from(location).add(this.getRotatedSize(partitionedStructure.blockVolume.getSpan(), rotation)).add(new Vector(-1, -1, -1));
        const structures = partitionedStructure.structures;
        const structurePartitioner = new VolumePartitioner(new BlockVolume(location, max), MAX_STRUCTURE_SIZE);
        const partitions = structurePartitioner.getPartitions();
        if (structures.length !== partitions.length)
            throw new Error("Structures and partitions do not match.");
        for (let i = 0; i < structures.length; i++) {
            const structure = structures[i];
            const partition = partitions[i];
            this.pasteSingleStructure(structure, partition.getMin(), mirrorAxis, rotation);
        }
    }
    
    pasteSingleStructure(structure, location, mirrorAxis = void 0, rotation = void 0) {
        const max = Vector.from(location).add(this.getRotatedSize(structure.size, rotation));
        const structurePlaceOptions = { mirror: mirrorAxis, rotation: rotation };
        world.structureManager.place(structure.id, this.dimension, location, structurePlaceOptions);
        this.replaceBlockInArea(location, max, 'minecraft:structure_void', 'minecraft:air');
    }

    clearArea(min, max) {
        const blockVolume = new BlockVolume(min, max);
        const fillPartitioner = new VolumePartitioner(blockVolume, MAX_FILL_VOLUME);
        fillPartitioner.getPartitions().forEach((partition) => {
            this.dimension.fillBlocks(partition, 'minecraft:air');
        });
    }

    replaceBlockInArea(min, max, replaceBlock, newBlock) {
        const blockVolume = new BlockVolume(min, max);
        const fillPartitioner = new VolumePartitioner(blockVolume, MAX_FILL_VOLUME);
        const blockFillOptions = { blockFilter: { includeTypes: [replaceBlock] } };
        fillPartitioner.getPartitions().forEach((partition) => {
            this.dimension.fillBlocks(partition, newBlock, blockFillOptions);
        });
    }

    getRotatedSize(structureSize, rotation) {
        if (rotation === StructureRotation.Rotate90 || rotation === StructureRotation.Rotate270)
            return new Vector(structureSize.z - structureSize.x, 0, structureSize.x - structureSize.z);
        return Vector.from(structureSize);
    }

    async loadArea(min, max) {
        const tickingArea = new TickingArea(this.dimension, min, max);
        system.runTimeout(() => tickingArea.unload(), 50);
        await tickingArea.load();
    }
}