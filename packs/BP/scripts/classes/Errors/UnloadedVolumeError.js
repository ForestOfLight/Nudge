export class UnloadedVolumeError extends Error {
    constructor(message) {
        super(message);
        this.name = "UnloadedVolumeError";
    }
}