import { MoveEdit } from "../Edits/MoveEdit";
import { Feedback } from "../Feedback";
import { BuildNudgerMove } from "../Nudges/BuildNudgerMove";
import { Mode } from "./Mode";

export class MoveMode extends Mode {
    isNudging = false;
    nudger;

    constructor(builder) {
        super(builder);
        this.nudger = new BuildNudgerMove(this.player);
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
            + `${Feedback.sneakIcon(this.player)} + ${Feedback.useIcon(this.player)} to flip/rotate.\n`
            + `${Feedback.jumpIcon(this.player)} + ${Feedback.useIcon(this.player)} to cancel.`
        );
    }

    confirmEdit() {
        super.confirmEdit();
        this.builder.deselect();
    }

    createNewEdit() {
        return new MoveEdit(this.builder.selection);
    }

    getItemId() {
        return 'simpleaxiom:move';
    }

    getDuringSelectionFeedback() {
        return `§a${Feedback.useIcon(this.player)} to extend.\n`
            + `${Feedback.sneakIcon(this.player)} + ${Feedback.useIcon(this.player)} to move structure.`;
    }
}