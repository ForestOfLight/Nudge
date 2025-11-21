import { BlockVolume } from "@minecraft/server";
import { Vector } from "../../lib/Vector";
import { Edit } from "./Edit";

export class StackEdit extends Edit {
    copyBounds;
    pasteBounds;
    completeBounds;
    stackableSize;
    copyStructure;
    replacedStructure;

    constructor(selection) {
        super(selection);
        const { min, max } = selection.getBounds();
        this.copyBounds = { min, max };
        const nudgedMin = min.add(selection.minOffset);
        const nudgedMax = max.add(selection.maxOffset);
        const minVolume = new BlockVolume(min, nudgedMin);
        const maxVolume = new BlockVolume(max, nudgedMax);
        this.completeBounds = { min: minVolume.getMin(), max: maxVolume.getMax() };
        const maxPasteLocation = nudgedMax.subtract(selection.getSize());
        const [pasteMin, pasteMax] = Vector.sort(min, maxPasteLocation);
        this.pasteBounds = { min: pasteMin, max: pasteMax };
        this.stackableSize = selection.getSize().add(new Vector(1, 1, 1));
    }

    async do() {
        await this.loadArea(this.completeBounds.min, this.completeBounds.max);
        this.copyStructure = this.createPartitionedStructure(this.copyBounds.min, this.copyBounds.max);
        this.replacedStructure = this.createPartitionedStructure(this.completeBounds.min, this.completeBounds.max);
        for (let y = this.pasteBounds.min.y; y <= this.pasteBounds.max.y; y += this.stackableSize.y) {
            for (let x = this.pasteBounds.min.x; x <= this.pasteBounds.max.x; x += this.stackableSize.x) {
                for (let z = this.pasteBounds.min.z; z <= this.pasteBounds.max.z; z += this.stackableSize.z) {
                    const pasteLocation = new Vector(x, y, z);
                    if (pasteLocation.distance(this.copyBounds.min) === 0)
                        continue;
                    this.pastePartitionedStructure(this.copyStructure, pasteLocation);
                }
            }
        }
        this.unloadArea();
    }

    async undo() {
        await this.loadArea(this.completeBounds.min, this.completeBounds.max);
        this.clearArea(this.completeBounds.min, this.completeBounds.max);
        this.pastePartitionedStructure(this.replacedStructure, this.completeBounds.min);
        this.unloadArea();
    }

    getSuccessFeedback() {
        return `§aStacked selection from ${this.pasteBounds.min.floor()} to ${this.pasteBounds.max.floor()}.`;
    }
}