import { MagicEdit } from "./MagicEdit";
import { Vector } from "../../lib/Vector";
import { TickingAreaUtils } from "../TickingAreaUtils";
import { getVectorByDirection } from "../../utils";

export class IntrudeEdit extends MagicEdit {
    replacedBlockStructures = [];
    maxBlocks = 10000;
    chunkRadiusToSearch = 3;
    intrudeDirection;

    constructor(raycastHit) {
        const block = raycastHit.block;
        super(block.dimension, block.location);
        this.intrudeDirection = Vector.from(getVectorByDirection(raycastHit.face));
    }
    
    async do() {
        const tickingArea = await TickingAreaUtils.loadChunkRadius(this.dimension, this.initialLocation, this.chunkRadiusToSearch);
        this.populateConnectedBlocks(this.initialLocation, { corners: false, maxBlocks: this.maxBlocks });
        this.intrudedBlockStructures = this.getBlocksAsStructures();
        this.clearConnectedBlocks();
        TickingAreaUtils.unloadArea(tickingArea);
    }
    
    async undo() {
        const tickingArea = await TickingAreaUtils.loadArea(this.dimension, this.connectedBlocksVolume.getMin(), this.connectedBlocksVolume.getMax());
        this.pasteBlockStructures(this.intrudedBlockStructures);
        TickingAreaUtils.unloadArea(tickingArea);
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
}