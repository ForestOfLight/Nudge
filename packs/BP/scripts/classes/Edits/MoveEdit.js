import { Vector } from "../../lib/Vector";
import { Edit } from "./Edit";

export class MoveEdit extends Edit {
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
        this.loadArea(this.cutBounds.min, this.cutBounds.max);
        await this.loadArea(this.pasteBounds.min, this.pasteBounds.max);
        this.cutStructure = this.createPartitionedStructure(this.cutBounds.min, this.cutBounds.max);
        this.replacedStructure = this.createPartitionedStructure(this.pasteBounds.min, this.pasteBounds.max);
        this.clearArea(this.cutBounds.min, this.cutBounds.max);
        this.pastePartitionedStructure(this.cutStructure, this.pasteBounds.min, this.mirrorAxis, this.rotation);
        this.unloadArea();
    }

    async undo() {
        this.loadArea(this.cutBounds.min, this.cutBounds.max);
        await this.loadArea(this.pasteBounds.min, this.pasteBounds.max);
        this.clearArea(this.pasteBounds.min, this.pasteBounds.max);
        this.pastePartitionedStructure(this.replacedStructure, this.pasteBounds.min);
        this.pastePartitionedStructure(this.cutStructure, this.cutBounds.min);
        this.unloadArea();
    }

    getSuccessFeedback() {
        return `§aMoved selection to ${this.pasteBounds.min.floor()}.`;
    }
}