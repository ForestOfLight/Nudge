import { system } from "@minecraft/server";
import { PlayerMovement } from "../PlayerMovement";

export class BuildNudger {
    player;
    playerMovement;
    selection;
    #runner;

    constructor(player) {
        this.player = player;
        this.playerMovement = new PlayerMovement(this.player);
    }
    
    start() {
        if (!this.selection)
            throw new Error('No selection to nudge. Please set the selection before starting nudge.');
        this.selection.startNudge(this.playerMovement);
        this.#runner = system.runInterval(this.onNudgeTick.bind(this));
    }

    stop() {
        system.clearRun(this.#runner); 
        this.selection.endNudge();
    }

    setSelection(selection) {
        this.selection = selection;
        this.selection = selection;
    }

    onNudgeTick() {
        const { minOffset, maxOffset } = this.getOffset();
        this.selection.nudgeOffset(minOffset, maxOffset);
    }

    getOffset() {
        throw new Error('getNewBounds() must be implemented.');
    }
}
