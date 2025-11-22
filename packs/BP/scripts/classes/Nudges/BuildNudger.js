import { system } from "@minecraft/server";
import { PlayerMovement } from "../PlayerMovement";

export class BuildNudger {
    player;
    playerMovement;
    selection;
    isSuspended = false;
    #runner;

    constructor(player) {
        this.player = player;
        this.playerMovement = new PlayerMovement(this.player);
    }
    
    start() {
        if (!this.selection)
            throw new Error('No selection to nudge. Please set the selection before starting nudge.');
        this.selection.startNudge(this.playerMovement);
        this.isSuspended = false;
        this.#runner = system.runInterval(this.onNudgeTick.bind(this));
    }

    stop() {
        system.clearRun(this.#runner);
        this.selection.endNudge();
    }

    suspend() {
        this.isSuspended = true;
    }

    unsuspend() {
        this.isSuspended = false;
    }

    setSelection(selection) {
        this.selection = selection;
    }

    onNudgeTick() {
        if (this.isSuspended)
            return;
        const { minOffset, maxOffset } = this.getOffset();
        this.selection.nudgeOffset(minOffset, maxOffset);
    }

    getOffset() {
        throw new Error('getOffset() must be implemented.');
    }
}
