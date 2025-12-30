import { MagicEdit } from "./MagicEdit";
import { Vector } from "../../lib/Vector";
import { TickingAreaUtils } from "../TickingAreaUtils";
import { getVectorByDirection } from "../../utils";

export class ExtrudeEdit extends MagicEdit {
    replacedBlockStructures = [];
    maxBlocks = 10000;
    chunkRadiusToSearch = 3;
    extrudeDirection;
    extrudeLocation;

    constructor(blockRaycastHit) {
        const block = blockRaycastHit.block;
        super(block.dimension, block.location);
        this.extrudeDirection = Vector.from(getVectorByDirection(blockRaycastHit.face));
        this.extrudeLocation = Vector.from(this.initialLocation).add(this.extrudeDirection);
    }
    
    async do() {
        const tickingArea = await TickingAreaUtils.loadChunkRadius(this.dimension, this.initialLocation, this.chunkRadiusToSearch);
        this.populateConnectedBlocks(this.initialLocation, { corners: false, maxBlocks: this.maxBlocks });
        const extrudedBlockStructures = this.getBlocksAsStructures();
        this.pasteBlockStructures(extrudedBlockStructures, this.extrudeLocation);
        TickingAreaUtils.unloadArea(tickingArea);
    }
    
    async undo() {
        const min = this.extrudeDirection.add(this.connectedBlocksVolume.getMin());
        const max = this.extrudeDirection.add(this.connectedBlocksVolume.getMax());
        const tickingArea = await TickingAreaUtils.loadArea(this.dimension, min, max);
        this.clearConnectedBlocks(this.extrudeLocation);
        TickingAreaUtils.unloadArea(tickingArea);
    }

    getDoingFeedback() {
        return { translate: 'nudge.tip.extrude.extrude.doing' };
    }

    getSuccessFeedback() {
        return { translate: 'nudge.tip.extrude.extrude.success' };
    }

    matchesSearch(block) {
        const offsetBlock = block.offset(this.extrudeDirection);
        return !block.isAir && (offsetBlock?.isAir || offsetBlock?.isLiquid)
            && block.typeId === this.initialBlockType;
    }
}