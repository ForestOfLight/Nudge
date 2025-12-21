import { DeleteConnectedEdit } from "../Edits/DeleteConnectedEdit";
import { Feedback } from "../Feedback";
import { MagicMode } from "./MagicMode";

export class DeleteConnectedMode extends MagicMode {
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