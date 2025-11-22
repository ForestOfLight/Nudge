import { world, StructureSaveMode, StructureRotation, system, UnloadedChunksError } from "@minecraft/server";
import { BlockVolume } from "@minecraft/server";
import { IDGenerator } from "../IDGenerator";
import { Vector } from "../../lib/Vector";
import { TickingArea } from "../TickingArea";
import { VolumePartitioner } from "../VolumePartitioner";
import { UnloadedVolumeError } from "../Errors/UnloadedVolumeError";

const MAX_FILL_VOLUME = 31;
const MAX_STRUCTURE_SIZE = 63;

export class Edit {
    dimension;
    tickingAreas = [];

    constructor(selection) {
        this.dimension = selection.dimension;
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

    createPartitionedStructure(min, max) {
        const blockVolume = new BlockVolume(min, max);
        if (!TickingArea.isVolumeLoaded(this.dimension, blockVolume))
            throw new UnloadedVolumeError(`The area ${Vector.from(min)} to ${Vector.from(max)} is not completely loaded.`);
        this.replaceBlockInArea(min, max, 'minecraft:air', 'minecraft:structure_void');
        const structureSaveOptions = { saveMode: StructureSaveMode.Memory, includeEntities: false };
        const structurePartitioner = new VolumePartitioner(blockVolume, MAX_STRUCTURE_SIZE);
        const structures = [];
        for (const partition of structurePartitioner.getPartitions()) {
            const structureID = IDGenerator.getNext();
            const structure = world.structureManager.createFromWorld(structureID, this.dimension, partition.getMin(), partition.getMax(), structureSaveOptions);
            structures.push(structure);
        }
        this.replaceBlockInArea(min, max, 'minecraft:structure_void', 'minecraft:air');
        return { structures, blockVolume };
    }

    pastePartitionedStructure(partitionedStructure, location, mirrorAxis = void 0, rotation = void 0) {
        const size = Vector.from(partitionedStructure.blockVolume.getSpan()).subtract(new Vector(1, 1, 1));
        const max = Vector.from(location).add(this.getRotatedSize(size, rotation));
        const blockVolume = new BlockVolume(location, max);
        if (!TickingArea.isVolumeLoaded(this.dimension, blockVolume))
            throw new UnloadedVolumeError(`The area ${Vector.from(location)} to ${Vector.from(max)} is not completely loaded.`);
        const structures = partitionedStructure.structures;
        const structurePartitioner = new VolumePartitioner(blockVolume, MAX_STRUCTURE_SIZE);
        const partitions = structurePartitioner.getPartitions();
        if (structures.length !== partitions.length)
            throw new Error("Structures and partitions do not match.");
        for (let i = 0; i < structures.length; i++) {
            const structure = structures[i];
            const partition = partitions[i];
            this.pasteSingleStructure(structure, partition.getMin(), mirrorAxis, rotation);
        }
        this.replaceBlockInArea(location, max, 'minecraft:structure_void', 'minecraft:air');
    }
    
    pasteSingleStructure(structure, location, mirrorAxis = void 0, rotation = void 0) {
        const structurePlaceOptions = { mirror: mirrorAxis, rotation: rotation };
        world.structureManager.place(structure.id, this.dimension, location, structurePlaceOptions);
    }

    clearArea(min, max) {
        const blockVolume = new BlockVolume(min, max);
        if (!TickingArea.isVolumeLoaded(this.dimension, blockVolume))
            throw new UnloadedVolumeError(`The area ${Vector.from(min)} to ${Vector.from(max)} is not completely loaded.`);
        const fillPartitioner = new VolumePartitioner(blockVolume, MAX_FILL_VOLUME);
        for (const partition of fillPartitioner.getPartitions())
            this.dimension.fillBlocks(partition, 'minecraft:air');
    }

    replaceBlockInArea(min, max, replaceBlock, newBlock) {
        const blockVolume = new BlockVolume(min, max);
        if (!TickingArea.isVolumeLoaded(this.dimension, blockVolume))
            throw new UnloadedVolumeError(`The area ${Vector.from(min)} to ${Vector.from(max)} is not completely loaded.`);
        const fillPartitioner = new VolumePartitioner(blockVolume, MAX_FILL_VOLUME);
        const blockFillOptions = { blockFilter: { includeTypes: [replaceBlock] } };
        for (const partition of fillPartitioner.getPartitions())
            this.dimension.fillBlocks(partition, newBlock, blockFillOptions);
    }

    getRotatedSize(structureSize, rotation) {
        if (rotation === StructureRotation.Rotate90 || rotation === StructureRotation.Rotate270)
            return new Vector(structureSize.z, structureSize.y, structureSize.x);
        return Vector.from(structureSize);
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
}