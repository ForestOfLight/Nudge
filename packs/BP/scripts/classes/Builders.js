import { system, world } from "@minecraft/server";
import { Builder } from "./Builder";

export class Builders {
    static builders = {};

    static add(playerId) {
        if (this.builders[playerId])
            return;
        this.builders[playerId] = new Builder(playerId);
    }

    static remove(playerId) {
        delete this.builders[playerId];
    }

    static get(id) {
        return this.builders[id];
    }

    static onJoin(playerId) {
        system.run(() => {
            if (world.getEntity(playerId))
                this.add(playerId);
        });
    }

    static onLeave(playerId) {
        this.get(playerId).onLeave();
        this.remove(playerId);
    }
}

world.afterEvents.playerJoin.subscribe((event) => Builders.onJoin(event.playerId));
world.beforeEvents.playerLeave.subscribe((event) => {
    if (!event.player)
        return;
    Builders.onLeave(event.player.id);
});
world.afterEvents.worldLoad.subscribe((event) => {
    for (const player of world.getAllPlayers()) {
        if (!player)
            return;
        Builders.onJoin(player.id);
    }
});