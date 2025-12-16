import { StackEdit } from "../Edits/StackEdit";
import { Feedback } from "../Feedback";
import { BuildNudgerStack } from "../Nudges/BuildNudgerStack";
import { Mode } from "./Mode";

export class StackMode extends Mode {
    isNudging = false;
    nudger;

    constructor(builder) {
        super(builder);
        this.nudger = new BuildNudgerStack(this.player);
    }

    enterNudgeMode() {
        this.isNudging = true;
        this.allowPlayerMovement(false);
        this.nudger.setSelection(this.builder.selection);
        this.nudger.start();
    }

    exitNudgeMode() {
        this.isNudging = false;
        this.allowPlayerMovement(true);
        this.nudger?.stop();
    }

    suspendNudge() {
        this.allowPlayerMovement(true);
        this.nudger?.suspend();
    }

    unsuspendNudge() {
        this.allowPlayerMovement(false);
        this.nudger?.unsuspend();
    }

    confirmSelection() {
        this.enterNudgeMode();
        Feedback.send(this.player, this.getStartNudgingFeedback());
    }

    async confirmEdit() {
        const success = await super.confirmEdit();
        if (success)
            this.builder.deselect();
    }
    
    createNewEdit() {
        return new StackEdit(this.builder.selection);
    }

    setNudgeLocation(min) {
        return;
    }

    getItemId() {
        return 'nudge:stack';
    }

    mirrorOrRotate() {
        return void 0;
    }

    getDuringSelectionFeedback() {
        return `§a${Feedback.useIcon(this.player)} to extend.\n`
            + `${Feedback.sneakIcon(this.player)} + ${Feedback.useIcon(this.player)} to stack.`;
    }

    getStartNudgingFeedback() {
        return `§a${Feedback.useIcon(this.player)} to confirm stack.\n`
            + `${Feedback.jumpIcon(this.player)} + ${Feedback.useIcon(this.player)} to move freely.`;
    }

    getFreeMovementFeedback() {
        return `§a${Feedback.useIcon(this.player)} to resume nudge.`;
    }
    
    isNudgingSuspended() {
        return this.nudger?.isSuspended;
    }
}