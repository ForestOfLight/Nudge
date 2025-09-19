import { Selection } from "./Selection";

export class Builder {
    playerId;
    selection = void 0;
    isNudgingStructure = false;

    constructor(playerId) {
        this.playerId = playerId;
    }

    select(dimension, from, to) {
        this.selection?.destroy();
        this.selection = new Selection(dimension, from, to);
    }

    startSelection(dimension, from) {
        this.selection?.destroy();
        this.selection = new Selection(dimension, from);
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

    deselect() {
        if (!this.hasSelection())
            return;
        this.selection.destroy();
        this.selection = void 0;
    }

    isNudging() {
        return this.isNudgingStructure;
    }
}