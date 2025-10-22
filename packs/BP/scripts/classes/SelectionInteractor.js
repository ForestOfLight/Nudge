import { EntityComponentTypes, system } from "@minecraft/server";
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
        if (!player || !SelectionInteractor.isHoldingSimpleAxiomItem(player))
            return;
        event.cancel = true;
        SelectionInteractor.onHit(player, event.block);
    }

    static onItemUse(event) {
        const player = event.source;
        if (!player || !SelectionInteractor.isHoldingSimpleAxiomItem(player))
            return;
        event.cancel = true;
        system.run(() => SelectionInteractor.onUse(player));
    }
    
    static onPlayerChangeHotbarSlot(event) {
        const player = event.player;
        const builder = Builders.get(player.id);
        if (SelectionInteractor.isHoldingSimpleAxiomItem(player))
            builder.detectHeldItemForEditMode();
        system.run(() => builder.deselect());
    }

    static onHereCommand(player) {
        const builder = Builders.get(player.id);
        if (!SelectionInteractor.isHoldingSimpleAxiomItem(player)) {
            player.sendMessage('§cPlease hold the SimpleAxiom item to use this command.');
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
        const builder = Builders.get(player.id);
        if (builder.isNudging())
            builder.setNudgeLocation(block.location);
        else
            builder.startSelection(block.dimension, block.location);
    }

    static onUse(player) {
        const builder = Builders.get(player.id);
        if (builder.isNudging())
            SelectionInteractor.handleUseWhileNudging(player, builder);
        else
            SelectionInteractor.handleUseWhileSelecting(player, builder);
    }
    
    static handleUseWhileNudging(player, builder) {
        const playerMovement = new PlayerMovement(player);
        if (playerMovement.isSneaking())
            builder.mirrorOrRotate();
        else if (playerMovement.isJumping())
            builder.exitNudgeMode();
        else
            builder.confirmEdit();
    }

    static handleUseWhileSelecting(player, builder) {
        const playerMovement = new PlayerMovement(player);
        if (playerMovement.isSneaking() && builder.hasSelection()) {
            builder.confirmSelection();
            return;
        } else if (playerMovement.isSneaking()) {
            builder.changeEditMode();
            return;
        }
        const blockRaycast = player.getBlockFromViewDirection({ maxDistance: 1000, includePassableBlocks: true });
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
        Feedback.send(player, builder.getDuringSelectionFeedback());
    }

    static isHoldingSimpleAxiomItem(player) {
        return SelectionInteractor.selectionItemInSlot(player, player.selectedSlotIndex)
    }

    static selectionItemInSlot(player, slotIndex) {
        const inventoryContainer = player.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!inventoryContainer)
            return false;
        const slotItem = inventoryContainer.getItem(slotIndex);
        const validModeItems = Object.keys(EditModes).map((type) => 'simpleaxiom:' + type.toLowerCase());
        return validModeItems.includes(slotItem?.typeId);
    }
}

world.beforeEvents.playerBreakBlock.subscribe(SelectionInteractor.onPlayerBreakBlock);
world.beforeEvents.itemUse.subscribe(SelectionInteractor.onItemUse);
playerChangeHotbarSlotEvent.subscribe(SelectionInteractor.onPlayerChangeHotbarSlot);