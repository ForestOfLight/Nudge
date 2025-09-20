import { EntityComponentTypes, system } from "@minecraft/server";
import { SELECTION_ITEM } from "../commands/select";
import { Builders } from "./Builders";
import { Feedback } from "./Feedback";
import { world } from '@minecraft/server';
import { playerChangeHotbarSlotEvent } from "../events/PlayerChangeHotbarSlotEvent";
import { PlayerMovement } from "./PlayerMovement";

export class BuildSelector {
    static onPlayerBreakBlock(event) {
        const player = event.player;
        if (!player || event.itemStack?.typeId !== SELECTION_ITEM)
            return;
        event.cancel = true;
        BuildSelector.onHit(player, event.block);
    }

    static onItemUse(event) {
        const player = event.source;
        if (!player || event.itemStack.typeId !== SELECTION_ITEM)
            return;
        event.cancel = true;
        system.run(() => BuildSelector.onUse(player));
    }

    static onHit(player, block) {
        const builder = Builders.get(player.id);
        builder.startSelection(block.dimension, block.location);
    }

    static onUse(player) {
        const builder = Builders.get(player.id);
        if (builder.isNudging)
            BuildSelector.handleUseWhileNudging(player, builder);
        else
            BuildSelector.handleUseWhileSelecting(player, builder)
    }

    static onPlayerChangeHotbarSlot(event) {
        const player = event.player;
        if (!BuildSelector.selectionItemInSlot(player, player.selectedSlotIndex)) {
            const builder = Builders.get(player.id);
            builder.deselect();
        }
    }

    static handleUseWhileNudging(player, builder) {
        const playerMovement = new PlayerMovement(player);
        if (playerMovement.isSneaking())
            builder.exitNudgeMode();
        else {
            builder.confirmNudge();
            builder.deselect();
        }
    }

    static handleUseWhileSelecting(player, builder) {
        const playerMovement = new PlayerMovement(player);
        if (playerMovement.isSneaking() && builder.hasSelection()) {
            builder.enterNudgeMode();
            return;
        }
        const blockRaycast = player.getBlockFromViewDirection({ maxDistance: 100, includePassableBlocks: true });
        if (!blockRaycast) {
            Feedback.send(player, '§cNo block found in view.');
            return;
        }
        const block = blockRaycast.block;
        if (builder.hasSelection()) {
            builder.extendSelect(block.location);
        } else {
            builder.startSelection(block.dimension, block.location);
        }
        Feedback.send(player, '§aUse to extend.\nSneak + Use to begin nudging.');
    }

    static selectionItemInSlot(player, slotIndex) {
        const inventoryContainer = player.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!inventoryContainer)
            return false;
        const slotItem = inventoryContainer.getItem(slotIndex);
        return slotItem?.typeId === SELECTION_ITEM;
    }
}

world.beforeEvents.playerBreakBlock.subscribe(BuildSelector.onPlayerBreakBlock);
world.beforeEvents.itemUse.subscribe(BuildSelector.onItemUse);
playerChangeHotbarSlotEvent.subscribe(BuildSelector.onPlayerChangeHotbarSlot);
