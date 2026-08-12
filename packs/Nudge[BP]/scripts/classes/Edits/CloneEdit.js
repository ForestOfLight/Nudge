import { Vector } from "../../lib/Vector";
import { TickingAreaUtils } from "../TickingAreaUtils";
import { VolumeEdit } from "./VolumeEdit";

export class CloneEdit extends VolumeEdit {
    copyBounds;
    pasteBounds;
    copyStructure;
    replacedStructure;
    mirrorAxis;
    rotation;

    constructor(selection, mirrorRotateOptions, copyStructure = void 0) {
        super(selection);
        const { min, max } = selection.getBounds();
        this.copyBounds = {
            min: Vector.from(min),
            max: Vector.from(max)
        };
        this.pasteBounds = {
            min: Vector.from(min).add(selection.minOffset),
            max: Vector.from(max).add(selection.maxOffset)
        };
        this.mirrorAxis = mirrorRotateOptions.mirrorAxis;
        this.rotation = mirrorRotateOptions.rotation;
        this.copyStructure = copyStructure;
    }

    async do() {
        const copyTickingArea = TickingAreaUtils.loadArea(this.dimension, this.copyBounds.min, this.copyBounds.max);
        const pasteTickingArea = await TickingAreaUtils.loadArea(this.dimension, this.pasteBounds.min, this.pasteBounds.max);
        if (!this.copyStructure)
            this.copyStructure = this.createPartitionedStructure(this.copyBounds.min, this.copyBounds.max);
        this.replacedStructure = this.createPartitionedStructure(this.pasteBounds.min, this.pasteBounds.max);
        this.pastePartitionedStructure(this.copyStructure, this.pasteBounds.min, this.mirrorAxis, this.rotation);
        TickingAreaUtils.unloadAreas([copyTickingArea, pasteTickingArea]);
    }

    async undo() {
        const copyTickingArea = TickingAreaUtils.loadArea(this.dimension, this.copyBounds.min, this.copyBounds.max);
        const pasteTickingArea = await TickingAreaUtils.loadArea(this.dimension, this.pasteBounds.min, this.pasteBounds.max);
        this.clearArea(this.pasteBounds.min, this.pasteBounds.max);
        this.pastePartitionedStructure(this.replacedStructure, this.pasteBounds.min);
        TickingAreaUtils.unloadAreas([copyTickingArea, pasteTickingArea]);
    }

    getDoingFeedback() {
        return { translate: 'nudge.tip.clone.doing', with: [String(this.pasteBounds.min.floor())] };
    }

    getSuccessFeedback() {
        return { translate: 'nudge.tip.clone.success', with: [String(this.pasteBounds.min.floor())] };
    }
}