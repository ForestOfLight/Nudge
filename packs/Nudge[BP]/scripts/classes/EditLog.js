import { UndoError } from "./Errors/UndoError";
import { RedoError } from "./Errors/RedoError";
import { system } from "@minecraft/server";

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
        num = Math.min(num, this.recentEdits.length)
        const runners = [];
        for (let numUndone = 0; numUndone < num; numUndone++) {
            const runner = system.runTimeout(() => {
                this.undo();
            }, numUndone);
            runners.push(runner);
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
        num = Math.min(num, this.undoneEdits.length);
        const runners = [];
        for (let numRedone = 0; numRedone < num; numRedone++) {
            const runner = system.runTimeout(() => {
                this.redo();
            }, numRedone);
            runners.push(runner);
        }
        return num;
    }
}