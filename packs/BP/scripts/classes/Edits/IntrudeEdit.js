import { MagicEdit } from "./MagicEdit";
import { Vector } from "../../lib/Vector";
import { Direction } from "@minecraft/server";

export class IntrudeEdit extends MagicEdit {
    replacedBlockStructures = [];
    maxBlocks = 10000;
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
        await this.loadArea(this.connectedBlocksVolume.getMin(), this.connectedBlocksVolume.getMax());
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
        const offsetBlock = block.offset(this.intrudeDirection)
        return !block.isAir && (offsetBlock?.isAir || offsetBlock?.isLiquid)
            && block.typeId === this.initialBlockType;
    }

    getIntrudeDirectionVector(face) {
        switch (face) {
            case Direction.Up:
                return Vector.up;
            case Direction.Down:
                return Vector.down;
            case Direction.North:
                return Vector.backward;
            case Direction.South:
                return Vector.forward;
            case Direction.East:
                return Vector.right;
            case Direction.West:
                return Vector.left;
            default:
                throw new Error('Invalid block face found for Intrusion:' + face);
        }
    }
}