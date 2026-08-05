import { BlockVolume } from "@minecraft/server";
import { Vector } from "../../lib/Vector";
import { BuildNudger } from "./BuildNudger";
import { StackingRenderer } from "../Renderer/StackingRenderer";

export class BuildNudgerStack extends BuildNudger {
    movementSpeed = 0.33;
    buildup = {
        min: new Vector(),
        max: new Vector()
    };
    stackingRenderer;

    start() {
        super.start();
        this.refreshStackingRenderer();
    }

    stop() {
        super.stop()
        this.stackingRenderer.destroy();
    }

    getOffset() {
        let velocity = this.playerMovement.getVelocityFromMovement();
        velocity = velocity.scale(this.movementSpeed);
        this.buildup.min = this.buildup.min.add(velocity);
        this.buildup.max = this.buildup.max.add(velocity);

        const minOffset = this.clampToSize(this.buildup.min);
        const maxOffset = this.clampToSize(this.buildup.max);
        if (this.shouldMove(minOffset, maxOffset)) {
            this.buildup.min = new Vector();
            this.buildup.max = new Vector();
            this.refreshStackingRenderer(minOffset, maxOffset);
        }
        return { minOffset, maxOffset };
    }

    clampToSize(vector) {
        const size = this.selection.getSize().add(new Vector(1, 1, 1));
        if (vector.x > 1)
            return new Vector(size.x, 0, 0);
        if (vector.x < -1)
            return new Vector(-size.x, 0, 0);
        if (vector.y > 1)
            return new Vector(0, size.y, 0);
        if (vector.y < -1)
            return new Vector(0, -size.y, 0);
        if (vector.z > 1)
            return new Vector(0, 0, size.z);
        if (vector.z < -1)
            return new Vector(0, 0, -size.z);
        return new Vector();
    }

    shouldMove(minOffset, maxOffset) {
        return minOffset.length !== 0 || maxOffset.length !== 0;
    }

    refreshStackingRenderer(minOffset = new Vector(), maxOffset = new Vector()) {
        this.stackingRenderer?.destroy();
        const selection = this.builder.getSelection();
        const { min, max } = selection.getBounds();
        const nudgedMin = min.add(selection.minOffset.add(minOffset));
        const nudgedMax = max.add(selection.maxOffset.add(maxOffset));
        const minVolume = new BlockVolume(min, nudgedMin);
        const maxVolume = new BlockVolume(max, nudgedMax);
        this.stackingRenderer = new StackingRenderer(selection.dimension, minVolume.getMin(), maxVolume.getMax(), selection.getSize());
    }

    snapToStackingGrid(location) {
        const selectionMin = this.selection.getBounds().min;
        const offset = Vector.from(location).subtract(selectionMin);
        const size = this.selection.getSize().add(new Vector(1, 1, 1));
        const snappedOffset = new Vector(
            Math.floor(offset.x / size.x) * size.x,
            Math.floor(offset.y / size.y) * size.y,
            Math.floor(offset.z / size.z) * size.z
        );
        return Vector.from(selectionMin).add(snappedOffset);
    }
}