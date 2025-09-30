import { UndoError } from "./Errors/UndoError";
import { RedoError } from "./Errors/RedoError";

export class EditLog {
    recentEdits = [];
    undoneEdits = [];

    save(edit) {
        this.recentEdits.push(edit);
        this.undoneEdits.length = 0;
    }

    undo() {
        const editToUndo = this.recentEdits.pop();
        if (!editToUndo)
            throw new UndoError('No edits left to undo.');
        try {
            editToUndo.undo();
        } catch(error) {
            this.recentEdits.push(editToUndo);
            throw error;
        }
        this.undoneEdits.push(editToUndo);
    }

    undoMany(num) {
        for (let numUndone = 0; numUndone < num; numUndone++) {
            try {
                this.undo();
            } catch(error) {
                if (error instanceof UndoError)
                    return numUndone;
                throw error;
            }
        }
        return num;
    }

    redo() {
        const editToRedo = this.undoneEdits.pop();
        if (!editToRedo)
            throw new RedoError('No edits left to redo.');
        try {
            editToRedo.do();
        } catch(error) {
            this.undoneEdits.push(editToRedo);
            throw error;
        }
        this.recentEdits.push(editToRedo);
    }

    redoMany(num) {
        for (let numRedone = 0; numRedone < num; numRedone++) {
            try {
                this.redo();
            } catch(error) {
                if (error instanceof RedoError)
                    return numRedone;
                throw error;
            }
        }
        return num;
    }
}