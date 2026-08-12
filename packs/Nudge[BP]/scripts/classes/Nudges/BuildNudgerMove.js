import { BuildNudger } from "./BuildNudger";
import { Vector } from "../../lib/Vector";

export class BuildNudgerMove extends BuildNudger {
    movementSpeed = 0.5;

    getOffset() {
        let velocity = this.playerMovement.getVelocityFromMovement();
        velocity = velocity.scale(this.movementSpeed);
        return { minOffset: velocity, maxOffset: velocity };
    }
}