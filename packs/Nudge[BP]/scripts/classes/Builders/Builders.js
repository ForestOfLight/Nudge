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
        try {
            this.get(playerId)?.onLeave();
        } finally {
            this.remove(playerId);
        }
    }
}

world.afterEvents.playerJoin.subscribe((event) => Builders.onJoin(event.playerId));
world.beforeEvents.playerLeave.subscribe((event) => {
    if (!event.player)
        return;
    Builders.onLeave(event.player.id);
});
// Backstop for when the before-event is skipped because its player handle is
// already gone, which would otherwise strand the builder and its runners.
world.afterEvents.playerLeave.subscribe((event) => Builders.onLeave(event.playerId));
world.afterEvents.worldLoad.subscribe(() => {
    for (const player of world.getAllPlayers()) {
        if (!player)
            continue;
        Builders.onJoin(player.id);
    }
});