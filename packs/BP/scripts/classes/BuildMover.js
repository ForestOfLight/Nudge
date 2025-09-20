import { BlockVolume, StructureSaveMode, world } from "@minecraft/server";
import { StructureIDGenerator } from "./StructureIDGenerator";

export class BuildMover {
    dimension;
    oldLocation;
    newLocation;
    size;
    movedStructure;
    replacedStructure;

    constructor(selection) {
        this.dimension = selection.dimension;
        const { min, max } = selection.getBounds();
        this.oldLocation = min;
        this.newLocation = min.add(selection.minOffset);
        this.size = selection.getSize();
    }

    do() {
        this.movedStructure = this.#createStructure(this.oldLocation, this.oldLocation.add(this.size));
        this.replacedStructure = this.#createStructure(this.newLocation, this.newLocation.add(this.size));
        this.#clearArea(this.oldLocation, this.oldLocation.add(this.size));
        world.structureManager.place(this.movedStructure.id, this.dimension, this.newLocation);
    }

    undo() {
        this.#clearArea(this.newLocation, this.newLocation.add(this.size));
        world.structureManager.place(this.replacedStructure.id, this.dimension, this.newLocation);
        world.structureManager.place(this.movedStructure.id, this.dimension, this.oldLocation);
    }

    #createStructure(min, max) {
        const structureID = StructureIDGenerator.getNext();
        return world.structureManager.createFromWorld(structureID, this.dimension, min, max, { saveMode: StructureSaveMode.Memory });
    }

    #clearArea(min, max) {
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