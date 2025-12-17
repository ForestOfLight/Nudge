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

    getDoingFeedback() {
        return { translate: 'nudge.tip.delete.doing', with: [String(this.deleteMin), String(this.deleteMax)] };
    }

    getSuccessFeedback() {
        return { translate: 'nudge.tip.delete.success', with: [String(this.deleteMin), String(this.deleteMax)] };
    }
}