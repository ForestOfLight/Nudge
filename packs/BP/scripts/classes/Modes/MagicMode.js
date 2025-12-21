import { Feedback } from "../Feedback";
import { Selection } from "../Selection";

export class MagicMode {
    builder;
    player;
    selection;
    
    constructor(builder) {
        this.builder = builder;
        this.player = builder.getPlayer();
    }

    onUse() {
        throw new Error('onUse() must be implemented.');
    }

    onHit(block) {
        throw new Error('onHit() must be implemented.');
    }

    select(dimension, from, to) {
        this.selection?.destroy();
        this.selection = new Selection(dimension, from, to);
    }

    deselect() {
        this.selection?.destroy();
        this.selection = void 0;
    }

    hasSelection() {
        return this.selection !== void 0;
    }

    startSelection() {
        throw new Error('startSelection() must be implemented.');
    }

    extendSelection(to) {
        this.selection.extendTo(to);
        Feedback.send(this.player, this.getDuringSelectionFeedback());
    }

    confirmSelection() {
        throw new Error('confirmSelection() must be implemented.');
    }

    async confirmEdit(edit) {
        Feedback.send(this.player, edit.getDoingFeedback());
        try {
            await edit.do();
        } catch (error) {
            if (error.name === 'UnloadedVolumeError') {
                Feedback.send(this.player, { translate: 'nudge.tip.unloadedvolume' });
                return false;
            } else if (error.name === 'OutOfBoundsVolumeError') {
                Feedback.send(this.player, { translate: 'nudge.tip.outofbounds' });
                return false;
            }
            throw error;
        }
        this.builder.editLog.save(edit);
        Feedback.send(this.player, edit.getSuccessFeedback());
        return true;
    }

    createNewEdit() {
        throw new Error('createNewEdit() must be implemented.');
    }

    getHoldItemFeedback() {
        throw new Error('getHoldItemFeedback() must be implemented.');
    }

    getDuringSelectionFeedback() {
        throw new Error('getDuringSelectionFeedback() must be implemented.');
    }
}