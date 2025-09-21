import { world } from "@minecraft/server";
import { Selection } from "./Selection";
import { PlayerMovement } from "./PlayerMovement";
import { BuildNudgerMove } from "./Nudges/BuildNudgerMove";
import { Feedback } from "./Feedback";
import { MoveEdit } from "./Edits/MoveEdit";
import { EditLog } from "./EditLog";
import { CloneEdit } from "./Edits/CloneEdit";

export class Builder {
    playerId;
    selection = void 0;
    isNudging = false;
    editLog;

    constructor(playerId) {
        this.playerId = playerId;
        this.editLog = new EditLog();
    }

    getPlayer() {
        return world.getEntity(this.playerId);
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

    confirmNudge() {
        const edit = new MoveEdit(this.selection);
        edit.do(this.selection);
        this.editLog.save(edit);
        Feedback.send(this.getPlayer(), edit.getSuccessFeedback());
        return edit.shouldExitAfterConfirm;
    }
}