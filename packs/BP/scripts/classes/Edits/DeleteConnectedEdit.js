import { TickingAreaUtils } from "../TickingAreaUtils";
import { MagicEdit } from "./MagicEdit";

export class DeleteConnectedEdit extends MagicEdit {
    replacedBlockStructures = [];
    maxBlocks = 254;
    chunkRadiusToSearch = 3;

    constructor(block) {
        super(block.dimension, block.location);
    }
    
    async do() {
        const tickingArea = await TickingAreaUtils.loadChunkRadius(this.dimension, this.initialLocation, this.chunkRadiusToSearch);
        this.populateConnectedBlocks(this.initialLocation, { corners: true, maxBlocks: this.maxBlocks });
        this.replacedBlockStructures = this.getBlocksAsStructures();
        this.clearConnectedBlocks();
        TickingAreaUtils.unloadArea(tickingArea);
    }

    async undo() {
        const tickingArea = await TickingAreaUtils.loadArea(this.dimension, this.connectedBlocksVolume.getMin(), this.connectedBlocksVolume.getMax());
        this.pasteBlockStructures(this.replacedBlockStructures);
        TickingAreaUtils.unloadArea(tickingArea);
    }

    getDoingFeedback() {
        return { translate: 'nudge.tip.deleteconnected.doing' };
    }

    getSuccessFeedback() {
        return { translate: 'nudge.tip.deleteconnected.success' };
    }

    matchesSearch(block) {
        return block.typeId === this.initialBlockType;
    }
}