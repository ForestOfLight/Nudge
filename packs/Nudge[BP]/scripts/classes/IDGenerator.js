import { world } from "@minecraft/server";

export class IDGenerator {
    static nextId = 0;
    static base = 'nudge:';

    static getNext() {
        if (this.nextId === 0)
            this.#tossGarbageIds();
        const newId = this.base + this.nextId;
        this.nextId++;
        return newId;
    }

    static #tossGarbageIds() {
        const structureManager = world.structureManager;
        const garbageIds = structureManager.getWorldStructureIds().filter((id) => {
            return id.startsWith(this.base);
        });
        garbageIds.forEach((id) => {
            structureManager.delete(id);
        });
    }
}