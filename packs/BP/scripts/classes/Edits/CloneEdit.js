import { world } from "@minecraft/server";
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
        world.structureManager.place(this.copyStructure.id, this.dimension, this.pasteLocation);
    }

    undo() {
        this.clearArea(this.pasteLocation, this.pasteLocation.add(this.size));
        world.structureManager.place(this.replacedStructure.id, this.dimension, this.pasteLocation);
    }

    getSuccessFeedback() {
        return `§aPasted selection at ${this.pasteLocation.floor()}.`;
    }
}