import { system } from "@minecraft/server";
import { PlayerMovement } from "./PlayerMovement";

export class BuildNudger {
    player;
    selection;
    #runner;

    constructor(player, selection) {
        this.player = player;
        this.selection = selection;
        this.playerMovement = new PlayerMovement(this.player);
        this.selection.startNudge(this.playerMovement);
        this.#runner = system.runInterval(this.onNudgeTick.bind(this));
    }

    destroy() {
        system.clearRun(this.#runner); 
        this.selection.endNudge();
    }

    onNudgeTick() {
        const { minOffset, maxOffset } = this.getOffset();
        this.selection.nudgeOffset(minOffset, maxOffset);
    }

    getOffset() {
        throw new Error('getNewBounds() must be implemented.');
    }
}
