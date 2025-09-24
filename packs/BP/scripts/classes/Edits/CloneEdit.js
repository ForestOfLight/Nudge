import { Feedback } from "../Feedback";
import { Edit } from "./Edit";

export class CloneEdit extends Edit {
    copyLocation;
    pasteLocation;
    size;
    copyStructure;
    replacedStructure;
    shouldExitAfterConfirm = false;

    constructor(selection) {
        super(selection);
        const { min, max } = selection.getBounds();
        this.copyLocation = min;
        this.pasteLocation = min.add(selection.minOffset);
        this.size = selection.getSize();
    }

    do() {
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

    static getDuringSelectionFeedback(player) {
        return `§a${Feedback.useIcon(player)} to extend.\n${Feedback.sneakIcon(player)} + ${Feedback.useIcon(player)} to clone structure.`;
    }
}