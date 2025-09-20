export class UndoError extends Error {
    constructor(message) {
        super(message);
        this.name = "UndoError";
    }
}