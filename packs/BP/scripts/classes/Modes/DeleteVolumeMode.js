import { DeleteVolumeEdit } from "../Edits/DeleteVolumeEdit";
import { Feedback } from "../Feedback";
import { NudgeableMode } from "./NudgableMode";

export class DeleteVolumeMode extends NudgeableMode {
    onUse() {
        if (this.hasSelection())
            this.confirmEdit();
        else
            this.builder.changeEditMode();
    }

    onHit(block) {
        if (this.hasSelection())
            this.extendSelection(block.location);
        else
            this.startSelection(block.dimension, block.location);
    }

    startSelection(dimension, location) {
        this.select(dimension, location, location);
        Feedback.send(this.player, this.getDuringSelectionFeedback());
    }

    confirmEdit() {
        const edit = new DeleteVolumeEdit(this.selection);
        super.confirmEdit(edit);
        this.builder.deselect();
    }

    getHoldItemFeedback() {
        return { rawtext: [
            { translate: 'nudge.tip.start', with: { rawtext: [Feedback.hitIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.changemode', with: { rawtext: [Feedback.useIcon(this.player)] } }
        ]};
    }
    
    getDuringSelectionFeedback() {
        return { rawtext: [
            { translate: 'nudge.tip.extend', with: { rawtext: [Feedback.hitIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.deletevolume', with: { rawtext: [Feedback.useIcon(this.player)] } }
        ]};
    }
}