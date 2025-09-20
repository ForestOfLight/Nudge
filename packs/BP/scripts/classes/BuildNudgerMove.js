import { Vector } from "../lib/Vector";
import { BuildNudger } from "./BuildNudger";

export class BuildNudgerMove extends BuildNudger {
    movementSpeed = 0.5;

    getOffset(playerMovement) {
        const velocity = this.getVelocityFromMovement(playerMovement);
        return { minOffset: velocity, maxOffset: velocity };
    }

    getVelocityFromMovement(playerMovement) {
        const viewDir = playerMovement.getMajorDirectionFacing();
        const forward = new Vector(viewDir.x, viewDir.y, viewDir.z);
        const right = new Vector(forward.z, 0, -forward.x);
        const moveInput = playerMovement.getMovementVector();
        const velocity = forward.multiply(moveInput.y).add(right.multiply(moveInput.x));
        if (playerMovement.isJumping())
            velocity.y += 1;
        if (playerMovement.isSneaking())
            velocity.y -= 1;
        return velocity.multiply(this.movementSpeed);
    }
}