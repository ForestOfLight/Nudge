import { Vector } from "../../lib/Vector";
import { Edit } from "./Edit";

export class CloneEdit extends Edit {
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

    do() {
        if (!this.copyStructure)
            this.copyStructure = this.createStructure(this.copyBounds.min, this.copyBounds.max);
        this.replacedStructure = this.createStructure(this.pasteBounds.min, this.pasteBounds.max);
        this.pasteStructure(this.copyStructure, this.pasteBounds.min, this.mirrorAxis, this.rotation);
    }

    undo() {
        this.clearArea(this.pasteBounds.min, this.pasteBounds.max);
        this.pasteStructure(this.replacedStructure, this.pasteBounds.min);
    }

    getSuccessFeedback() {
        return `§aPasted selection at ${this.pasteBounds.min.floor()}.`;
    }
}