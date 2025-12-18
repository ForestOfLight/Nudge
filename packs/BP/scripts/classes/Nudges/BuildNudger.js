import { system } from "@minecraft/server";
import { PlayerMovement } from "../PlayerMovement";

export class BuildNudger {
    builder;
    playerMovement;
    selection;
    isSuspended = false;
    #runner;

    constructor(builder) {
        this.builder = builder;
        this.playerMovement = new PlayerMovement(builder.getPlayer());
    }
    
    start() {
        if (!this.selection)
            throw new Error('No selection to nudge. Please set the selection before starting nudge.');
        this.selection.startNudge(this.playerMovement);
        this.isSuspended = false;
        this.#runner = system.runInterval(this.onNudgeTick.bind(this));
    }

    stop() {
        if (this.#runner)
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
