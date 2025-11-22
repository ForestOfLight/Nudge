import { BlockVolume, TicksPerSecond } from "@minecraft/server";
import { Vector } from "../../lib/Vector";
import { Builders } from "../Builders";
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
        const velocity = this.getVelocityFromMovement();
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

    getVelocityFromMovement() {
        const viewDir = this.playerMovement.getMajorDirectionFacing();
        const forward = new Vector(viewDir.x, 0, viewDir.z);
        const right = new Vector(forward.z, 0, -forward.x);
        const moveInput = this.playerMovement.getMovementVector();
        let velocity = forward.multiply(moveInput.y).add(right.multiply(moveInput.x));
        if (this.playerMovement.isJumping())
            velocity.y += 1;
        if (this.playerMovement.isSneaking())
            velocity.y -= 1;
        return this.scaleByButtonHold(velocity).multiply(this.movementSpeed);
    }

    scaleByButtonHold(velocity) {
        const elapsedTicks = this.playerMovement.getElapsedMovementTicks();
        const scale = Math.min(Math.max(elapsedTicks / (2 * TicksPerSecond), 1), 4);
        return velocity.multiply(scale);
    }

    clampToSize(vector) {
        const size = this.selection.getSize().add(new Vector(1, 1, 1));
        let clamped = new Vector();
        if (vector.x > 1)
            clamped = clamped.add(new Vector(size.x, 0, 0));
        if (vector.x < -1)
            clamped = clamped.add(new Vector(-size.x, 0, 0));
        if (vector.y > 1)
            clamped = clamped.add(new Vector(0, size.y, 0));
        if (vector.y < -1)
            clamped = clamped.add(new Vector(0, -size.y, 0));
        if (vector.z > 1)
            clamped = clamped.add(new Vector(0, 0, size.z));
        if (vector.z < -1)
            clamped = clamped.add(new Vector(0, 0, -size.z));
        return clamped;
    }

    shouldMove(minOffset, maxOffset) {
        return minOffset.length !== 0 || maxOffset.length !== 0;
    }

    refreshStackingRenderer(minOffset = new Vector(), maxOffset = new Vector()) {
        this.stackingRenderer?.destroy();
        const selection = Builders.get(this.player.id).selection;
        const { min, max } = selection.getBounds();
        const nudgedMin = min.add(selection.minOffset.add(minOffset));
        const nudgedMax = max.add(selection.maxOffset.add(maxOffset));
        const minVolume = new BlockVolume(min, nudgedMin);
        const maxVolume = new BlockVolume(max, nudgedMax);
        this.stackingRenderer = new StackingRenderer(selection.dimension, minVolume.getMin(), maxVolume.getMax(), selection.getSize());
    }
}