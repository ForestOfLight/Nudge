import { ButtonState, InputButton, InputMode, InputPermissionCategory, system, TicksPerSecond } from "@minecraft/server";
import { Vector } from "../../lib/Vector";
import { naturalNudgingOption } from "../../options/NaturalNudgingOption";

export class BuilderMovement {
    player;
    inputInfo;
    inputPermissions;
    movementStartedTick;
    useSixDirectionMovement;
    runner = void 0;

    constructor(player) {
        this.player = player;
        this.inputInfo = player.inputInfo;
        this.inputPermissions = player.inputPermissions;
        this.movementStartedTick = system.currentTick;
        this.useSixDirectionMovement = !naturalNudgingOption.option.isEnabled(player.id);
        this.runner = system.runInterval(this.onTick.bind(this));
        this.unfreeze();
    }

    destroy() {
        if (this.runner !== void 0)
            system.clearRun(this.runner);
        this.runner = void 0;
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

    isPressingRight() {
        return this.getMovementVector().x < 0;
    }

    isPressingLeft() {
        return this.getMovementVector().x > 0;
    }

    getMajorDirectionFacing() {
        const { x, z } = this.player.getViewDirection();
        const xzAngle = Math.atan2(z, x) * (180 / Math.PI);
        if (xzAngle >= -45 && xzAngle < 45)
            return new Vector(1, 0, 0);
        else if (xzAngle >= 45 && xzAngle < 135)
            return new Vector(0, 0, 1);
        else if (xzAngle >= 135 || xzAngle < -135)
            return new Vector(-1, 0, 0);
        return new Vector(0, 0, -1);
    }

    getSixDirectionFacing() {
        const { x, y, z } = this.player.getViewDirection();
        const absX = Math.abs(x);
        const absY = Math.abs(y);
        const absZ = Math.abs(z);
        if (absX > absY && absX > absZ)
            return new Vector(Math.sign(x), 0, 0);
        else if (absY > absX && absY > absZ)
            return new Vector(0, Math.sign(y), 0);
        return new Vector(0, 0, Math.sign(z));
    }

    getVelocityFromMovement() {
        let velocity;
        if (this.useSixDirectionMovement)
            velocity = this.#getVelocityFromSixDirectionMovement();
        else
            velocity = this.#getVelocityFromNaturalMovement();
        velocity = this.#scaleByButtonHold(velocity);
        return velocity;
    }

    #getVelocityFromNaturalMovement() {
        const viewDir = this.getMajorDirectionFacing();
        const forward = new Vector(viewDir.x, 0, viewDir.z);
        const right = new Vector(forward.z, 0, -forward.x);
        const moveInput = this.getMovementVector();
        let velocity = forward.scale(moveInput.y).add(right.scale(moveInput.x));
        if (this.isJumping())
            velocity.y += 1;
        if (this.isSneaking())
            velocity.y -= 1;
        return velocity;
    }

    #getVelocityFromSixDirectionMovement() {
        const viewDir = this.getSixDirectionFacing();
        const forward = new Vector(viewDir.x, 0, viewDir.z);
        const moveInput = this.getMovementVector();
        const velocity = forward.scale(moveInput.y);
        if (viewDir.y !== 0)
            velocity.y = Math.max(-0.7, Math.min(0.7, moveInput.y)) * viewDir.y;
        return velocity;
    }

    #scaleByButtonHold(velocity) {
        const elapsedTicks = this.getElapsedMovementTicks();
        const scale = Math.min(Math.max(elapsedTicks / (2 * TicksPerSecond), 1), 4);
        velocity = velocity.scale(scale);
        return velocity;
    }

    distance(vector) {
        return Vector.distance(this.player.location, vector);
    }

    getElapsedMovementTicks() {
        return system.currentTick - this.movementStartedTick;
    }

    onTick() {
        if (this.getVelocityFromMovement().length === 0)
            this.movementStartedTick = system.currentTick;
    }

    getInputMode() {
        return this.inputInfo.lastInputModeUsed;
    }
}