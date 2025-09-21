import { world } from "@minecraft/server";
import { Edit } from "./Edit";

export class DeleteEdit extends Edit {
    deleteMin;
    deleteMax;
    replacedStructure;
    shouldExitAfterConfirm = true;

    constructor(selection) {
        super(selection);
        const { min, max } = selection.getBounds();
        this.deleteMin = min;
        this.deleteMax = max;
    }

    do() {
        this.replacedStructure = this.createStructure(this.deleteMin, this.deleteMax);
        this.clearArea(this.deleteMin, this.deleteMax);
    }

    undo() {
        this.clearArea(this.deleteMin, this.deleteMax);
        world.structureManager.place(this.replacedStructure.id, this.dimension, this.deleteMin);
    }

    getSuccessFeedback() {
        return `§aDeleted from ${this.deleteMin} to ${this.deleteMax}.`;
    }
}