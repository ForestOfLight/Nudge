import { ButtonState, InputButton, InputMode, InputPermissionCategory, system } from "@minecraft/server";
import { Vector } from "../lib/Vector";

export class PlayerMovement {
    player;
    inputInfo;
    inputPermissions;
    movementStartedTick;
    runner = void 0;

    constructor(player) {
        this.player = player;
        this.inputInfo = player.inputInfo;
        this.inputPermissions = player.inputPermissions;
        this.movementStartedTick = system.currentTick;
        this.runner = system.runInterval(this.onTick.bind(this));
    }

    freeze() {
        this.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, false);
    }

    unfreeze() {
        this.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, true);
    }

    isJumping() {
        return this.inputInfo.getButtonState(InputButton.Jump) === ButtonState.Pressed;
    }

    isSneaking() {
        if (this.inputInfo.lastInputModeUsed === InputMode.Touch)
            return this.player.isSneaking;
        return this.inputInfo.getButtonState(InputButton.Sneak) === ButtonState.Pressed;
    }

    getMovementVector() {
        return Vector.from(this.inputInfo.getMovementVector());
    }

    getMajorDirectionFacing() {
        const { x, y, z } = this.player.getViewDirection();
        const xzAngle = Math.atan2(z, x) * (180 / Math.PI);
        if (xzAngle >= -45 && xzAngle < 45)
            return new Vector(1, 0, 0);
        else if (xzAngle >= 45 && xzAngle < 135)
            return new Vector(0, 0, 1);
        else if (xzAngle >= 135 || xzAngle < -135)
            return new Vector(-1, 0, 0);
        return new Vector(0, 0, -1);
    }

    distance(vector) {
        return Vector.distance(this.player.location, vector);
    }

    getElapsedMovementTicks() {
        return system.currentTick - this.movementStartedTick;
    }

    onTick() {
        if (this.getMovementVector().distance(Vector.zero) === 0 && !this.isSneaking() && !this.isJumping())
            this.movementStartedTick = system.currentTick;
    }
}