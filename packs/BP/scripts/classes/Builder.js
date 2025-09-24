import { world } from "@minecraft/server";
import { Selection } from "./Selection";
import { PlayerMovement } from "./PlayerMovement";
import { BuildNudgerMove } from "./Nudges/BuildNudgerMove";
import { Feedback } from "./Feedback";
import { EditLog } from "./EditLog";
import { EditTypes } from "./Edits/EditTypes";
import { MoveEdit } from "./Edits/MoveEdit";
import { CloneEdit } from "./Edits/CloneEdit";
import { DeleteEdit } from "./Edits/DeleteEdit";
import { EditTypeSelectionForm } from "./EditTypeSelectionForm";

export class Builder {
    playerId;
    player = void 0;
    selection = void 0;
    isNudging = false;
    editType;
    editLog;

    constructor(playerId) {
        this.playerId = playerId;
        this.setEditType();
        this.editLog = new EditLog();
    }

    getPlayer() {
        if (this.player === void 0)
            this.player = world.getEntity(this.playerId);
        return this.player;
    }

    onLeave() {
        this.deselect();
    }

    select(dimension, from, to) {
        this.selection?.destroy();
        this.selection = new Selection(dimension, from, to);
    }

    deselect() {
        if (this.isNudging)
            this.exitNudgeMode();
        this.selection?.destroy();
        this.selection = void 0;
    }

    startSelection(dimension, from) {
        this.select(dimension, from);
    }

    selectFrom(from) {
        this.selection.setFrom(from);
    }

    selectTo(to) {
        this.selection.setTo(to);
    }

    extendSelect(to) {
        this.selection.extendTo(to);
    }

    hasSelection() {
        return this.selection !== void 0;
    }

    confirmSelection() {
        if (this.editType === DeleteEdit) {
            this.confirmEdit();
            this.deselect();
        } else {
            this.enterNudgeMode();
            const player = this.getPlayer();
            Feedback.send(this.getPlayer(), `§a${Feedback.useIcon(player)} to confirm.\n${Feedback.sneakIcon(player)} + ${Feedback.useIcon(player)} to flip/rotate.\n${Feedback.jumpIcon(player)} + ${Feedback.useIcon(player)} to cancel.`);
        }
    }

    enterNudgeMode() {
        this.isNudging = true;
        const player = this.getPlayer();
        const playerMovement = new PlayerMovement(player);
        playerMovement.freeze();
        this.buildNudger = new BuildNudgerMove(player, this.selection);
    }

    exitNudgeMode() {
        this.isNudging = false;
        const playerMovement = new PlayerMovement(this.getPlayer());
        playerMovement.unfreeze();
        this.buildNudger?.destroy();
    }

    confirmEdit() {
        const edit = new this.editType(this.selection);
        edit.do(this.selection);
        this.editLog.save(edit);
        Feedback.send(this.getPlayer(), edit.getSuccessFeedback());
        return edit.shouldExitAfterConfirm;
    }

    changeEditType() {
        new EditTypeSelectionForm(this.getPlayer());
    }

    getEditType() {
        return this.editType;
    }

    setEditType(editType) {
        switch (editType) {
            case EditTypes.Move:
                this.editType = MoveEdit;                
                break;
            case EditTypes.Clone:
                this.editType = CloneEdit;
                break;
            case EditTypes.Delete:
                this.editType = DeleteEdit;
                break;
            default:
                this.editType = MoveEdit;
                break;
        }
        // If you'd like to change the item texture, do so here.
    }

    undo(num = 1) {
        const numUndone = this.editLog.undoMany(num);
        this.getPlayer().sendMessage(`§aSuccessfully undid ${numUndone} edits.`);
    }
    
    redo(num = 1) {
        const numRedone = this.editLog.redoMany(num);
        this.getPlayer().sendMessage(`§aSuccessfully redid ${numRedone} edits.`);
    }

    getDuringSelectionFeedback() {
        return this.editType.getDuringSelectionFeedback(this.getPlayer());
    }
}