import { MagicEdit } from "./MagicEdit";
import { Vector } from "../../lib/Vector";
import { Direction } from "@minecraft/server";

export class ExtrudeEdit extends MagicEdit {
    replacedBlockStructures = [];
    maxBlocks = 254;
    chunkRadiusToSearch = 3;
    extrudeDirection;
    extrudeLocation;

    constructor(blockRaycastHit) {
        const block = blockRaycastHit.block;
        super(block.dimension, block.location);
        this.extrudeDirection = this.getExtrudeDirectionVector(blockRaycastHit.face);
        this.extrudeLocation = Vector.from(this.initialLocation.add(this.extrudeDirection));
    }
    
    async do() {
        await this.loadChunkRadius(this.initialLocation, this.chunkRadiusToSearch);
        this.populateConnectedBlocks(this.initialLocation, { corners: false, maxBlocks: this.maxBlocks });
        const extrudedBlockStructures = this.getBlocksAsStructures();
        this.pasteBlockStructures(extrudedBlockStructures, this.extrudeLocation);
        this.unloadArea();
    }
    
    async undo() {
        await this.loadArea(this.connectedBlockListVolume.getMin(), this.connectedBlockListVolume.getMax());
        this.clearConnectedBlocks(this.extrudeLocation);
        this.unloadArea();
    }

    getDoingFeedback() {
        return { translate: 'nudge.tip.extrude.extrude.doing' };
    }

    getSuccessFeedback() {
        return { translate: 'nudge.tip.extrude.extrude.success' };
    }

    matchesSearch(block) {
        return !block.isAir && block.offset(this.extrudeDirection)?.isAir;
    }

    getExtrudeDirectionVector(face) {
        switch (face) {
            case Direction.Up:
                return Vector.up;
            case Direction.Down:
                return Vector.down;
            case Direction.North:
                return Vector.forward;
            case Direction.South:
                return Vector.backward
            case Direction.East:
                return Vector.left;
            case Direction.West:
                return Vector.right;
            default:
                throw new Error('Invalid block face found for Extrusion:' + face);
        }
    }
}