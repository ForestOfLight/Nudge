import { world } from "@minecraft/server";
import { Selection } from "./Selection";
import { PlayerMovement } from "./PlayerMovement";
import { BuildNudgerMove } from "./BuildNudgerMove";
import { Feedback } from "./Feedback";
import { BuildMover } from "./BuildMover";
import { EditLog } from "./EditLog";

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
        this.buildNudger = new BuildNudgerMove(player,this.selection);
        Feedback.send(player, '§aUse to confirm.\nSneak + Use to cancel.');
    }

    exitNudgeMode() {
        this.isNudging = false;
        const playerMovement = new PlayerMovement(this.getPlayer());
        playerMovement.unfreeze();
        this.buildNudger?.destroy();
    }

    confirmNudge() {
        const buildMover = new BuildMover(this.selection);
        buildMover.do(this.selection);
        this.editLog.save(buildMover);
        const { min, max } = this.selection.getBounds();
        const newLocation = min.add(this.selection.minOffset).floor();
        Feedback.send(this.getPlayer(), `§aMoved selection to ${newLocation}.`);
    }
}