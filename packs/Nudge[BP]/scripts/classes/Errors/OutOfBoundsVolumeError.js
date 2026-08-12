export class OutOfBoundsVolumeError extends Error {
    constructor(message) {
        super(message);
        this.name = "OutOfBoundsVolumeError";
    }
}