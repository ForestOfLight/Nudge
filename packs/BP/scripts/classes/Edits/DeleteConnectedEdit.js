import { MagicEdit } from "./MagicEdit";

export class DeleteConnectedEdit extends MagicEdit {
    replacedBlockStructures = [];
    maxBlocks = 254;
    chunkRadiusToSearch = 3;

    constructor(block) {
        super(block.dimension, block.location);
    }
    
    async do() {
        await this.loadChunkRadius(this.initialLocation, this.chunkRadiusToSearch);
        this.populateConnectedBlocks(this.initialLocation, { corners: true, maxBlocks: this.maxBlocks });
        this.replacedBlockStructures = this.getBlocksAsStructures();
        this.clearConnectedBlocks();
        this.unloadArea();
    }

    async undo() {
        await this.loadArea(this.connectedBlocksVolume.getMin(), this.connectedBlocksVolume.getMax());
        this.pasteBlockStructures(this.replacedBlockStructures);
        this.unloadArea();
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