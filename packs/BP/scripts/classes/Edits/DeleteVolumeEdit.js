import { TickingAreaUtils } from "../TickingAreaUtils";
import { VolumeEdit } from "./VolumeEdit";

export class DeleteVolumeEdit extends VolumeEdit {
    deleteMin;
    deleteMax;
    replacedStructure;

    constructor(selection) {
        super(selection);
        const { min, max } = selection.getBounds();
        this.deleteMin = min;
        this.deleteMax = max;
    }

    async do() {
        const tickingArea = await TickingAreaUtils.loadArea(this.dimension, this.deleteMin, this.deleteMax);
        this.replacedStructure = this.createPartitionedStructure(this.deleteMin, this.deleteMax);
        this.clearArea(this.deleteMin, this.deleteMax);
        TickingAreaUtils.unloadArea(tickingArea);
    }

    async undo() {
        const tickingArea = await TickingAreaUtils.loadArea(this.dimension, this.deleteMin, this.deleteMax);
        this.clearArea(this.deleteMin, this.deleteMax);
        this.pastePartitionedStructure(this.replacedStructure, this.deleteMin);
        TickingAreaUtils.unloadArea(tickingArea);
    }

    getDoingFeedback() {
        return { translate: 'nudge.tip.deletevolume.doing', with: [String(this.deleteMin), String(this.deleteMax)] };
    }

    getSuccessFeedback() {
        return { translate: 'nudge.tip.deletevolume.success', with: [String(this.deleteMin), String(this.deleteMax)] };
    }
}