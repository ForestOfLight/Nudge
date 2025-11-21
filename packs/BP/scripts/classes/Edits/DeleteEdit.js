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
        this.replacedStructure = this.createPartitionedStructure(this.deleteMin, this.deleteMax);
        this.clearArea(this.deleteMin, this.deleteMax);
        this.unloadArea();
    }

    async undo() {
        await this.loadArea(this.deleteMin, this.deleteMax);
        this.clearArea(this.deleteMin, this.deleteMax);
        this.pastePartitionedStructure(this.replacedStructure, this.deleteMin);
        this.unloadArea();
    }

    getSuccessFeedback() {
        return `§aDeleted from ${this.deleteMin} to ${this.deleteMax}.`;
    }
}