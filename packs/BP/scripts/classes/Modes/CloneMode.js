import { CloneEdit } from "../Edits/CloneEdit";
import { Feedback } from "../Feedback";
import { BuildNudgerMove } from "../Nudges/BuildNudgerMove";
import { Mode } from "./Mode";

export class CloneMode extends Mode {
    isNudging = false;
    nudger;
    copyStructure;

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
        this.copyStructure = void 0;
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
        const edit = super.confirmEdit();
        this.copyStructure = edit.copyStructure;
    }

    createNewEdit() {
        return new CloneEdit(this.builder.selection, this.copyStructure);
    }

    getItemId() {
        return 'simpleaxiom:clone';
    }

    getDuringSelectionFeedback() {
        return `§a${Feedback.useIcon(this.player)} to extend.\n`
            + `${Feedback.sneakIcon(this.player)} + ${Feedback.useIcon(this.player)} to move structure.`;
    }
}