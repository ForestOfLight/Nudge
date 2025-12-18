import { EntityComponentTypes, system, HeldItemOption, EntitySwingSource } from "@minecraft/server";
import { Builders } from "./Builders";
import { Feedback } from "./Feedback";
import { world } from '@minecraft/server';
import { playerChangeHotbarSlotEvent } from "../events/PlayerChangeHotbarSlotEvent";
import { EditModes } from "./Modes/EditModes";

export class PlayerInteractions {
    static onPlayerBreakBlock(event) {
        const player = event.player;
        if (!PlayerInteractions.isHoldingNudgeItem(player))
            return;
        event.cancel = true;
        system.run(() => PlayerInteractions.onHit(player, event.block));
    }

    static onPlayerAttack(event) {
        const player = event.player;
        if (!PlayerInteractions.isHoldingNudgeItem(player))
            return;
        const blockRaycast = player.getBlockFromViewDirection({ maxDistance: 1000, includePassableBlocks: true, includeLiquidBlocks: false });
        if (!blockRaycast) {
            Feedback.send(player, { translate: 'nudge.tip.noblock' });
            return;
        }
        PlayerInteractions.onHit(player, blockRaycast.block);
    }

    static onItemUse(event) {
        const player = event.source;
        if (!PlayerInteractions.isHoldingNudgeItem(player))
            return;
        event.cancel = true;
        system.run(() => PlayerInteractions.onUse(player));
    }
    
    static onPlayerChangeHotbarSlot(event) {
        const player = event.player;
        const builder = Builders.get(player.id);
        if (PlayerInteractions.isHoldingNudgeItem(player))
            builder.onStartHoldNudgeItem();
        system.run(() => builder.deselect());
    }

    static onHit(player, block) {
        if (!block) {
            Feedback.send(player, { translate: 'nudge.tip.noblock' });
            return;
        }
        const builder = Builders.get(player.id);
        builder.onHit(block);
    }

    static onUse(player) {
        const builder = Builders.get(player.id);
        builder.onUse();
    }

    static isHoldingNudgeItem(player) {
        if (!player)
            return false;
        return PlayerInteractions.nudgeItemInSlot(player, player.selectedSlotIndex)
    }

    static nudgeItemInSlot(player, slotIndex) {
        const inventoryContainer = player.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!inventoryContainer)
            return false;
        const slotItem = inventoryContainer.getItem(slotIndex);
        const validModeItemIds = Object.values(EditModes).map(modeData => modeData.itemId);
        return validModeItemIds.includes(slotItem?.typeId);
    }
}

world.beforeEvents.playerBreakBlock.subscribe(PlayerInteractions.onPlayerBreakBlock);
world.afterEvents.playerSwingStart.subscribe(PlayerInteractions.onPlayerAttack, { heldItemOption: HeldItemOption.AnyItem, swingSource: EntitySwingSource.Attack })
world.beforeEvents.itemUse.subscribe(PlayerInteractions.onItemUse);
playerChangeHotbarSlotEvent.subscribe(PlayerInteractions.onPlayerChangeHotbarSlot);