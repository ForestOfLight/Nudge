import { system } from "@minecraft/server";
import { PlayerMovement } from "./PlayerMovement";

export class BuildNudger {
    player;
    selection;
    #runner;

    constructor(player, selection) {
        this.player = player;
        this.selection = selection;
        this.selection.startNudge();
        this.#runner = system.runInterval(this.onNudgeTick.bind(this));
    }

    destroy() {
        system.clearRun(this.#runner); 
        this.selection.endNudge();
    }

    onNudgeTick() {
        const playerMovement = new PlayerMovement(this.player);
        const { minOffset, maxOffset } = this.getOffset(playerMovement);
        this.selection.nudgeOffset(minOffset, maxOffset);
    }

    getOffset(playerMovement) {
        throw new Error('getNewBounds() must be implemented.');
    }
}
