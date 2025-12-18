import { MagicEdit } from "./MagicEdit";
import { Vector } from "../../lib/Vector";

export class DeleteConnectedEdit extends MagicEdit {
    replacedBlockStructures = [];
    maxBlocks = 254;
    chunkAreaToSearch = 3;

    constructor(block) {
        super(block.dimension, block.location);
    }
    
    async do() {
        const searchDistance = new Vector(this.chunkAreaToSearch, 0, this.chunkAreaToSearch).multiply(16);
        const maxLoadLocation = Vector.from(this.initialLocation).add(searchDistance);
        const minLoadLocation = Vector.from(this.initialLocation).subtract(searchDistance);
        await this.loadArea(maxLoadLocation, minLoadLocation);
        this.listBlockVolume = this.getConnectedBlocks(this.initialLocation);
        this.replacedBlockStructures = this.getBlocksAsStructures();
        this.clearConnectedBlocks();
        this.unloadArea();
    }

    async undo() {
        await this.loadArea(this.listBlockVolume.getMin(), this.listBlockVolume.getMax());
        this.pasteBlockStructures(this.replacedStructure, this.deleteMin);
        this.unloadArea();
    }

    getDoingFeedback() {
        return { translate: 'nudge.tip.deleteconnected.doing', with: [String(this.deleteMin), String(this.deleteMax)] };
    }

    getSuccessFeedback() {
        return { translate: 'nudge.tip.deleteconnected.success', with: [String(this.deleteMin), String(this.deleteMax)] };
    }

    isSameType(block) {
        return block.typeId === this.initialBlockType;
    }
}