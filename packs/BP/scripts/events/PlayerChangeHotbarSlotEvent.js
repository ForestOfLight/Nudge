import { world } from '@minecraft/server';
import { Event } from './Event';

class PlayerChangeHotbarSlotEvent extends Event {
    playerHotbarSlotsLastTick = {};
    playerHotbarSlotsThisTick = {};

    constructor() {
        super();
        this.playerHotbarSlotsLastTick = {};
        this.playerHotbarSlotsThisTick = {};
    }

    provideEvents() {
        this.updatePlayerHotbarSlots();
        return this.getPlayersWhoChangedHotbarSlots().map(player => ({
            player: player,
            lastSelectedSlotIndex: this.playerHotbarSlotsLastTick[player.id]
        }));
    }

    updatePlayerHotbarSlots() {
        this.playerHotbarSlotsLastTick = { ...this.playerHotbarSlotsThisTick };
        this.playerHotbarSlotsThisTick = {};
        world.getAllPlayers().forEach(player => {
            if (!player)
                return;
            this.playerHotbarSlotsThisTick[player.id] = player.selectedSlotIndex;
        });
    }

    getPlayersWhoChangedHotbarSlots() {
        const changedPlayers = [];
        const allPlayers = world.getAllPlayers();
        for (const playerId in this.playerHotbarSlotsThisTick) {
            if (this.playerHotbarSlotsLastTick[playerId] === void 0)
                continue;
            if (this.playerHotbarSlotsLastTick[playerId] !== this.playerHotbarSlotsThisTick[playerId])
                changedPlayers.push(allPlayers.find(player => player?.id === playerId));
        }
        return changedPlayers;
    }
}

const playerChangeHotbarSlotEvent = new PlayerChangeHotbarSlotEvent();

export { PlayerChangeHotbarSlotEvent, playerChangeHotbarSlotEvent };