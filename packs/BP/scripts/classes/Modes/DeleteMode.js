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

    getSuccessFeedback() {
        const bounds = this.selection.getBounds();
        return `§aDeleted from ${bounds.min} to ${bounds.max}.`;
    }
    
    getDuringSelectionFeedback() {
        return `§a${Feedback.useIcon(this.player)} to extend.\n${Feedback.sneakIcon(this.player)} + ${Feedback.useIcon(this.player)} to delete.`;
    }
}