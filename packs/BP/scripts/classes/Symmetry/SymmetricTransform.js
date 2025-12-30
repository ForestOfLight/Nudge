import { StructureSaveMode, system, world } from "@minecraft/server";
import { TickingAreaUtils } from "../TickingAreaUtils";
import { Vector } from "../../lib/Vector";
import { IDGenerator } from "../IDGenerator";

export class SymmetricTransform {
    constructor(symmetryLocation, block) {
        this.symmetryLocation = symmetryLocation;
        this.interactionLocation = block.location;
        this.dimension = block.dimension;
        this.interactionOffset = Vector.from(this.interactionLocation).subtract(this.symmetryLocation);
    }

    async transform() {
        const interactionTickingArea = await TickingAreaUtils.loadArea(this.dimension, this.interactionLocation, this.interactionLocation);
        const structure = this.createSingleBlockStructure();
        const transforms = this.getTransforms();
        for (const { newLocation, mirrorAxis, rotation } of transforms) {
            if (Vector.distance(this.interactionLocation, newLocation) === 0)
                continue;
            system.run(async () => {
                const tickingArea = await TickingAreaUtils.loadArea(this.dimension, newLocation, newLocation);
                this.pasteSingleStructure(structure, newLocation, { mirror: mirrorAxis, rotation });
                TickingAreaUtils.unloadArea(tickingArea);
            });
        }
        TickingAreaUtils.unloadArea(interactionTickingArea);
    }

    getTransforms(location) {
        throw new Error("Method 'getTransforms' must be implemented.");
    }

    createSingleBlockStructure() {
        const structureID = IDGenerator.getNext();
        const structureSaveOptions = { saveMode: StructureSaveMode.Memory };
        return world.structureManager.createFromWorld(structureID, this.dimension, this.interactionLocation, this.interactionLocation, structureSaveOptions);
    }

    pasteSingleStructure(structure, location, structurePlaceOptions = {}) {
        world.structureManager.place(structure.id, this.dimension, location, structurePlaceOptions);
    }
}