import { BuildNudger } from "./BuildNudger";
import { Vector } from "../../lib/Vector";
import { TicksPerSecond } from "@minecraft/server";

export class BuildNudgerMove extends BuildNudger {
    movementSpeed = 0.5;

    getOffset() {
        const velocity = this.getVelocityFromMovement();
        return { minOffset: velocity, maxOffset: velocity };
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
}