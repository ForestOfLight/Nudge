import { BuildNudger } from "./BuildNudger";

export class BuildNudgerStack extends BuildNudger {
    movementSpeed = 0.5;

    getNewBounds(playerMovement) {
        const velocity = this.getVelocityFromMovement(playerMovement);
        const { min, max } = this.selection.getBounds();
        const size = this.selection.getSize();
        return { min: min.add(size.multiply(velocity)), max: max.add(size.multiply(velocity)) };
    }

    getVelocityFromMovement(playerMovement) {
        const viewDir = playerMovement.getMajorDirectionFacing();
        const forward = new Vector(viewDir.x, viewDir.y, viewDir.z);
        const right = new Vector(forward.z, 0, -forward.x);
        const moveInput = playerMovement.getMovementVector();
        const velocity = forward.multiply(moveInput.y).add(right.multiply(moveInput.x));
        return velocity.multiply(this.movementSpeed);
    }
}