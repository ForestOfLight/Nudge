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

    confirmSelection() {
        this.enterNudgeMode();
        Feedback.send(this.player,
            `§a${Feedback.useIcon(this.player)} to confirm.\n`
            + `${Feedback.jumpIcon(this.player)} + ${Feedback.useIcon(this.player)} to cancel.`
        );
    }

    confirmEdit() {
        super.confirmEdit();
        this.builder.deselect();
    }
    
    createNewEdit() {
        return new StackEdit(this.builder.selection);
    }

    setNudgeLocation(min) {
        return;
    }

    getItemId() {
        return 'simpleaxiom:stack';
    }

    mirrorOrRotate() {
        return void 0;
    }

    getDuringSelectionFeedback() {
        return `§a${Feedback.useIcon(this.player)} to extend.\n`
            + `${Feedback.sneakIcon(this.player)} + ${Feedback.useIcon(this.player)} to start stacking structure.`;
    }
}