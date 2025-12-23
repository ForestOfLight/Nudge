import { Vector } from "../../lib/Vector";
import { TickingAreaUtils } from "../TickingAreaUtils";
import { VolumeEdit } from "./VolumeEdit";

export class MoveEdit extends VolumeEdit {
    cutBounds;
    pasteBounds;
    cutStructure;
    replacedStructure;
    mirrorAxis;
    rotation;

    constructor(selection, mirrorRotateOptions) {
        super(selection);
        const { min, max } = selection.getBounds();
        this.cutBounds = {
            min: Vector.from(min),
            max: Vector.from(max)
        };
        this.pasteBounds = {
            min: Vector.from(min).add(selection.minOffset),
            max: Vector.from(max).add(selection.maxOffset)
        };
        this.mirrorAxis = mirrorRotateOptions.mirrorAxis;
        this.rotation = mirrorRotateOptions.rotation;
    }

    async do() {
        const cutTickingArea = TickingAreaUtils.loadArea(this.dimension, this.cutBounds.min, this.cutBounds.max);
        const pasteTickingArea = await TickingAreaUtils.loadArea(this.dimension, this.pasteBounds.min, this.pasteBounds.max);
        this.cutStructure = this.createPartitionedStructure(this.cutBounds.min, this.cutBounds.max);
        this.replacedStructure = this.createPartitionedStructure(this.pasteBounds.min, this.pasteBounds.max);
        this.clearArea(this.cutBounds.min, this.cutBounds.max);
        this.pastePartitionedStructure(this.cutStructure, this.pasteBounds.min, this.mirrorAxis, this.rotation);
        TickingAreaUtils.unloadAreas([cutTickingArea, pasteTickingArea]);
    }

    async undo() {
        const cutTickingArea = TickingAreaUtils.loadArea(this.dimension, this.cutBounds.min, this.cutBounds.max);
        const pasteTickingArea = await TickingAreaUtils.loadArea(this.dimension, this.pasteBounds.min, this.pasteBounds.max);
        this.clearArea(this.pasteBounds.min, this.pasteBounds.max);
        this.pastePartitionedStructure(this.replacedStructure, this.pasteBounds.min);
        this.pastePartitionedStructure(this.cutStructure, this.cutBounds.min);
        TickingAreaUtils.unloadAreas([cutTickingArea, pasteTickingArea]);
    }

    getDoingFeedback() {
        return { translate: 'nudge.tip.move.doing', with: [String(this.pasteBounds.min.floor())] };
    }

    getSuccessFeedback() {
        return { translate: 'nudge.tip.move.success', with: [String(this.pasteBounds.min.floor())] };
    }
}