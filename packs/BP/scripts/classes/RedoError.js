export class RedoError extends Error {
    constructor(message) {
        super(message);
        this.name = "RedoError";
    }
}