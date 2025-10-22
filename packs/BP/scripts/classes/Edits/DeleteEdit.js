import { Feedback } from "../Feedback";
import { Edit } from "./Edit";

export class DeleteEdit extends Edit {
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
        await this.loadArea(this.deleteMin, this.deleteMax);
        this.replacedStructure = this.createStructure(this.deleteMin, this.deleteMax);
        this.clearArea(this.deleteMin, this.deleteMax);
    }

    async undo() {
        await this.loadArea(this.deleteMin, this.deleteMax);
        this.clearArea(this.deleteMin, this.deleteMax);
        this.pasteStructure(this.replacedStructure, this.deleteMin);
    }

    getSuccessFeedback() {
        return `§aDeleted from ${this.deleteMin} to ${this.deleteMax}.`;
    }
}