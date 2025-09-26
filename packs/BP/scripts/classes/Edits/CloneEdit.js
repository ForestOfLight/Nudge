import { Edit } from "./Edit";

export class CloneEdit extends Edit {
    copyLocation;
    pasteLocation;
    size;
    copyStructure;
    replacedStructure;

    constructor(selection, copyStructure = void 0) {
        super(selection);
        const { min, max } = selection.getBounds();
        this.copyLocation = min;
        this.pasteLocation = min.add(selection.minOffset);
        this.size = selection.getSize();
        this.copyStructure = copyStructure;
    }

    do() {
        if (!this.copyStructure)
            this.copyStructure = this.createStructure(this.copyLocation, this.copyLocation.add(this.size));
        this.replacedStructure = this.createStructure(this.pasteLocation, this.pasteLocation.add(this.size));
        this.pasteStructure(this.copyStructure, this.pasteLocation);
    }

    undo() {
        this.clearArea(this.pasteLocation, this.pasteLocation.add(this.size));
        this.pasteStructure(this.replacedStructure, this.pasteLocation);
    }

    getSuccessFeedback() {
        return `§aPasted selection at ${this.pasteLocation.floor()}.`;
    }
}