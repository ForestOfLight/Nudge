import { Edit } from "./Edit";

export class MoveEdit extends Edit {
    cutLocation;
    pasteLocation;
    size;
    cutStructure;
    replacedStructure;
    shouldExitAfterConfirm = true;

    constructor(selection) {
        super(selection);
        const { min, max } = selection.getBounds();
        this.cutLocation = min;
        this.pasteLocation = min.add(selection.minOffset);
        this.size = selection.getSize();
    }

    do() {
        this.cutStructure = this.createStructure(this.cutLocation, this.cutLocation.add(this.size));
        this.replacedStructure = this.createStructure(this.pasteLocation, this.pasteLocation.add(this.size));
        this.clearArea(this.cutLocation, this.cutLocation.add(this.size));
        this.pasteStructure(this.cutStructure, this.pasteLocation);
    }

    undo() {
        this.clearArea(this.pasteLocation, this.pasteLocation.add(this.size));
        this.pasteStructure(this.replacedStructure, this.pasteLocation);
        this.pasteStructure(this.cutStructure, this.cutLocation);
    }

    getSuccessFeedback() {
        return `§aMoved selection to ${this.pasteLocation.floor()}.`;
    }
}