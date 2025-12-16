import { EntityComponentTypes, system, HeldItemOption, EntitySwingSource } from "@minecraft/server";
import { Builders } from "./Builders";
import { Feedback } from "./Feedback";
import { world } from '@minecraft/server';
import { playerChangeHotbarSlotEvent } from "../events/PlayerChangeHotbarSlotEvent";
import { PlayerMovement } from "./PlayerMovement";
import { EditModes } from "./Modes/EditModes";
import { Vector } from "../lib/Vector";

export class SelectionInteractor {
    static onPlayerBreakBlock(event) {
        const player = event.player;
        if (!SelectionInteractor.isHoldingNudgeItem(player))
            return;
        event.cancel = true;
        SelectionInteractor.onHit(player, event.block);
    }

    static onPlayerAttack(event) {
        const player = event.player;
        if (!SelectionInteractor.isHoldingNudgeItem(player))
            return;
        const blockRaycast = player.getBlockFromViewDirection({ maxDistance: 1000, includePassableBlocks: true });
        if (!blockRaycast) {
            Feedback.send(player, '§cNo block found in view.');
            return;
        }
        SelectionInteractor.onHit(player, blockRaycast.block);
    }

    static onItemUse(event) {
        const player = event.source;
        if (!SelectionInteractor.isHoldingNudgeItem(player))
            return;
        event.cancel = true;
        system.run(() => SelectionInteractor.onUse(player));
    }
    
    static onPlayerChangeHotbarSlot(event) {
        const player = event.player;
        const builder = Builders.get(player.id);
        if (SelectionInteractor.isHoldingNudgeItem(player))
            builder.detectHeldItemForEditMode();
        system.run(() => builder.deselect());
    }

    static onHereCommand(player) {
        const builder = Builders.get(player.id);
        if (!SelectionInteractor.isHoldingNudgeItem(player)) {
            player.sendMessage('§cPlease hold the Nudge item to use this command.');
            return;
        }
        const location = new Vector.from(player.location).floor();
        if (builder.isNudging()) {
            builder.setNudgeLocation(location);
            return;
        }
        if (builder.hasSelection())
            builder.extendSelect(location);
        else
            builder.startSelection(player.dimension, location);
    }

    static onHit(player, block) {
        if (!block) {
            Feedback.send(player, '§cNo block found in view.');
            return;
        }
        const builder = Builders.get(player.id);
        if (builder.isNudging()) {
            builder.setNudgeLocation(block.location);
        } else if (builder.hasSelection()) {
            builder.extendSelect(block.location);
            Feedback.send(player, builder.getDuringSelectionFeedback());
        } else {
            builder.startSelection(block.dimension, block.location);
            Feedback.send(player, builder.getDuringSelectionFeedback());
        }
    }

    static onUse(player) {
        const builder = Builders.get(player.id);
        if (builder.isNudging())
            SelectionInteractor.handleUseWhileNudging(player, builder);
        else if (builder.hasSelection())
            builder.confirmSelection();
        else
            builder.changeEditMode();
    }
    
    static handleUseWhileNudging(player, builder) {
        const playerMovement = new PlayerMovement(player);
        if (builder.isNudgingSuspended()) {
            builder.unsuspendNudge();
        } else {
            if (playerMovement.isSneaking())
                builder.mirrorOrRotate();
            else if (playerMovement.isJumping())
                builder.suspendNudge();
            else
                builder.confirmEdit();
        }
    }

    static isHoldingNudgeItem(player) {
        if (!player)
            return false;
        return SelectionInteractor.selectionItemInSlot(player, player.selectedSlotIndex)
    }

    static selectionItemInSlot(player, slotIndex) {
        const inventoryContainer = player.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!inventoryContainer)
            return false;
        const slotItem = inventoryContainer.getItem(slotIndex);
        const validModeItems = Object.keys(EditModes).map((type) => 'nudge:' + type.toLowerCase());
        return validModeItems.includes(slotItem?.typeId);
    }
}

world.beforeEvents.playerBreakBlock.subscribe(SelectionInteractor.onPlayerBreakBlock);
world.afterEvents.playerSwingStart.subscribe(SelectionInteractor.onPlayerAttack, { heldItemOption: HeldItemOption.AnyItem, swingSource: EntitySwingSource.Attack })
world.beforeEvents.itemUse.subscribe(SelectionInteractor.onItemUse);
playerChangeHotbarSlotEvent.subscribe(SelectionInteractor.onPlayerChangeHotbarSlot);