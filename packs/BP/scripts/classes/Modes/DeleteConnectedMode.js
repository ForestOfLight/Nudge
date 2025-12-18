import { DeleteConnectedEdit } from "../Edits/DeleteConnectedEdit";
import { Feedback } from "../Feedback";
import { NudgeableMode } from "./NudgableMode";

export class DeleteConnectedMode extends NudgeableMode {
    initialBlock;

    confirmSelection() {
        super.confirmEdit();
        this.builder.deselect();
    }

    onUse() {
        this.builder.changeEditMode();
    }

    onHit(block) {
        this.initialBlock = block;
        this.confirmEdit();
    }

    createNewEdit() {
        return new DeleteConnectedEdit(this.initialBlock);
    }

    getHoldItemFeedback() {
        return { rawtext: [
            { translate: 'nudge.tip.deleteconnected', with: { rawtext: [Feedback.hitIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.changemode', with: { rawtext: [Feedback.useIcon(this.player)] } }
        ]}
    }
}