import { MagicEdit } from "./MagicEdit";
import { Vector } from "../../lib/Vector";
import { Direction } from "@minecraft/server";

export class IntrudeEdit extends MagicEdit {
    replacedBlockStructures = [];
    maxBlocks = 254;
    chunkRadiusToSearch = 3;
    intrudeDirection;

    constructor(raycastHit) {
        const block = raycastHit.block;
        super(block.dimension, block.location);
        this.intrudeDirection = this.getIntrudeDirectionVector(raycastHit.face);
    }
    
    async do() {
        await this.loadChunkRadius(this.initialLocation, this.chunkRadiusToSearch);
        this.populateConnectedBlocks(this.initialLocation, { corners: false, maxBlocks: this.maxBlocks });
        this.intrudedBlockStructures = this.getBlocksAsStructures();
        this.clearConnectedBlocks();
        this.unloadArea();
    }
    
    async undo() {
        await this.loadArea(this.connectedBlockListVolume.getMin(), this.connectedBlockListVolume.getMax());
        this.pasteBlockStructures(this.intrudedBlockStructures);
        this.unloadArea();
    }

    getDoingFeedback() {
        return { translate: 'nudge.tip.extrude.intrude.doing' };
    }

    getSuccessFeedback() {
        return { translate: 'nudge.tip.extrude.intrude.success' };
    }

    matchesSearch(block) {
        return !block.isAir && block.offset(this.intrudeDirection)?.isAir;
    }

    getIntrudeDirectionVector(face) {
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
                throw new Error('Invalid block face found for Intrusion:' + face);
        }
    }
}