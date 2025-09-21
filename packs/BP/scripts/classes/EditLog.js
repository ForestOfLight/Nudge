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
        this.undoneEdits.push(editToUndo);
        editToUndo.undo();
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
        this.recentEdits.push(editToRedo);
        editToRedo.do();
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