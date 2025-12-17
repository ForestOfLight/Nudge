import { DeleteEdit } from "../Edits/DeleteEdit";
import { Feedback } from "../Feedback";
import { Mode } from "./Mode";

export class DeleteMode extends Mode {
    confirmSelection() {
        this.confirmEdit();
    }

    confirmEdit() {
        super.confirmEdit();
        this.builder.deselect();
    }

    createNewEdit() {
        return new DeleteEdit(this.builder.selection);
    }

    getItemId() {
        return 'nudge:delete';
    }
    
    getDuringSelectionFeedback() {
        return { rawtext: [
            { translate: 'nudge.tip.extend', with: { rawtext: [Feedback.hitIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.delete', with: { rawtext: [Feedback.useIcon(this.player)] } }
        ]};
    }
}