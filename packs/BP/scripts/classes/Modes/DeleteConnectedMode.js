import { DeleteConnectedEdit } from "../Edits/DeleteConnectedEdit";
import { Feedback } from "../Feedback";
import { NudgeableMode } from "./NudgableMode";

export class DeleteConnectedMode extends NudgeableMode {
    initialBlock;

    onUse() {
        this.builder.changeEditMode();
    }

    onHit(block) {
        this.initialBlock = block;
        this.confirmEdit();
    }

    confirmEdit() {
        const edit = new DeleteConnectedEdit(this.initialBlock);
        super.confirmEdit(edit);
    }

    getHoldItemFeedback() {
        return { rawtext: [
            { translate: 'nudge.tip.deleteconnected', with: { rawtext: [Feedback.hitIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.changemode', with: { rawtext: [Feedback.useIcon(this.player)] } }
        ]};
    }
}