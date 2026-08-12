import { EntityComponentTypes, EquipmentSlot, GameMode, InputMode, ItemStack, world } from "@minecraft/server";
import { EditLog } from "../EditLog";
import { EditModes } from "../Modes/EditModes";
import { ModeSelectionForm } from "../Forms/ModeSelectionForm";
import { Feedback } from "../Feedback";
import { BuilderMovement } from "./BuilderMovement";
import { PlayerInteractions } from "../PlayerInteractions";

import { MoveMode } from "../Modes/MoveMode";
import { CloneMode } from "../Modes/CloneMode";
import { StackMode } from "../Modes/StackMode";
import { DeleteVolumeMode } from "../Modes/DeleteVolumeMode";
import { DeleteConnectedMode } from "../Modes/DeleteConnectedMode";
import { ExtrudeMode } from "../Modes/ExtrudeMode";
import { BuilderOptions } from "./BuilderOptions";
import { naturalNudgingOption } from "../../options/NaturalNudgingOption";

export class Builder {
    playerId;
    player = void 0;
    playerMovement;
    editMode;
    editLog;
    symmetry;
    nudgeItemSlotDP = 'nudgeItemSlot';

    constructor(playerId) {
        this.playerId = playerId;
        this.setEditModeByHeldItemId();
        this.setNaturalNudgingOption();
        this.editLog = new EditLog();
    }

    getPlayer() {
        if (this.player?.isValid !== true)
            this.player = world.getEntity(this.playerId);
        return this.player;
    }

    onLeave() {
        this.playerMovement?.destroy();
        this.deselect();
        this.removeSymmetry();
        this.playerMovement = void 0;
    }

    onUse() {
        this.editMode.onUse();
    }

    onHit(block) {
        this.editMode.onHit(block);
    }

    onStartHoldNudgeItem() {
        this.setEditModeByHeldItemId();
    }

    onGameModeChange(fromGameMode, toGameMode) {
        if (fromGameMode === GameMode.Creative && toGameMode !== GameMode.Creative) {
            this.onLeave();
            this.updateShouldHaveNudgeItem();
            this.removeNudgeItem();
        } else if (this.shouldHaveNudgeItem() && toGameMode === GameMode.Creative && fromGameMode !== GameMode.Creative) {
            this.addNudgeItem();
        }
    }

    getPlayerMovement() {
        if (this.playerMovement === void 0 || this.playerMovement.isDestroyed())
            this.playerMovement = new BuilderMovement(this.playerId);
        return this.playerMovement;
    }

    allowMovement(enable) {
        const playerMovement = this.getPlayerMovement();
        if (enable)
            playerMovement.unfreeze();
        else
            playerMovement.freeze();
    }

    getSelection() {
        return this.editMode.selection;
    }
    
    changeEditMode() {
        new ModeSelectionForm(this);
    }

    deselect() {
        this.editMode.deselect();
    }

    setEditModeByHeldItemId() {
        const player = this.getPlayer();
        const inventoryContainer = player?.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!inventoryContainer) {
            this.setEditMode();
            return;
        }
        const slotItem = inventoryContainer.getItem(player.selectedSlotIndex);
        const newModeId = Object.values(EditModes).find(modeData => modeData.itemId === slotItem?.typeId)?.id;
        this.setEditMode(newModeId);
    }

    setEditMode(newEditMode) {
        switch (newEditMode) {
            case EditModes.Move.id:
                this.editMode = new MoveMode(this);
                break;
            case EditModes.Clone.id:
                this.editMode = new CloneMode(this);
                break;
            case EditModes.Stack.id:
                this.editMode = new StackMode(this);
                break;
            case EditModes.DeleteVolume.id:
                this.editMode = new DeleteVolumeMode(this);
                break;
            case EditModes.DeleteConnected.id:
                this.editMode = new DeleteConnectedMode(this);
                break;
            case EditModes.Extrude.id:
                this.editMode = new ExtrudeMode(this);
                break;
            default:
                this.editMode = new MoveMode(this);
                newEditMode = 0;
                break;
        }
        this.replaceModeItemInHand(newEditMode);
    }
    
    replaceModeItemInHand(newEditMode) {
        const player = this.getPlayer();
        const equippable = player?.getComponent(EntityComponentTypes.Equippable);
        if (!equippable)
            return;
        const mainhandSlot = equippable.getEquipmentSlot(EquipmentSlot.Mainhand);
        if (PlayerInteractions.isHoldingNudgeItem(player)) {
            const modeItemId = Object.values(EditModes).find(mode => mode.id === newEditMode)?.itemId;
            mainhandSlot.setItem(new ItemStack(modeItemId, 1));
            Feedback.send(this.getPlayer(), this.editMode.getHoldItemFeedback());
        }
    }

    undo(num = 1) {
        const numUndone = this.editLog.undoMany(num);
        if (numUndone === 0)
            Feedback.send(this.getPlayer(), { translate: 'nudge.tip.undo.none' });
        else
            Feedback.send(this.getPlayer(), { translate: 'nudge.tip.undo', with: [String(numUndone)] });
    }
    
    redo(num = 1) {
        const numRedone = this.editLog.redoMany(num);
        if (numRedone === 0)
            Feedback.send(this.getPlayer(), { translate: 'nudge.tip.redo.none' });
        else
            Feedback.send(this.getPlayer(), { translate: 'nudge.tip.redo', with: [String(numRedone)] });
    }

    getSymmetry() {
        return this.symmetry;
    }

    setSymmetry(symmetry) {
        this.symmetry?.destroy();
        this.symmetry = symmetry;
    }

    removeSymmetry() {
        this.symmetry?.destroy();
        this.symmetry = void 0;
    }

    hasSymmetry() {
        return this.symmetry !== void 0;
    }

    updateShouldHaveNudgeItem() {
        const player = this.getPlayer();
        const inventoryContainer = player?.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!inventoryContainer)
            return;
        const nudgeItemTypes = Object.values(EditModes).map(mode => mode.itemId);
        for (const nudgeItemType of nudgeItemTypes) {
            const nudgeItemSlot = inventoryContainer.find(new ItemStack(nudgeItemType));
            if (nudgeItemSlot !== void 0) {
                player.setDynamicProperty(this.nudgeItemSlotDP, nudgeItemSlot);
                return true;
            }
        }
        player.setDynamicProperty(this.nudgeItemSlotDP, void 0);
        return false;
    }

    shouldHaveNudgeItem() {
        const player = this.getPlayer();
        return player?.getDynamicProperty(this.nudgeItemSlotDP) !== void 0;
    }

    addNudgeItem() {
        if (this.hasNudgeItem())
            return this.updateShouldHaveNudgeItem();
        const player = this.getPlayer();
        const inventoryContainer = player?.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!inventoryContainer)
            return;
        const mainNudgeItemType = Object.values(EditModes)[0].itemId;
        const nudgeItemSlotNumber = player.getDynamicProperty(this.nudgeItemSlotDP) || 8;
        const nudgeItemSlot = inventoryContainer.getItem(nudgeItemSlotNumber);
        if (nudgeItemSlot) {
            const givenItemStack = inventoryContainer?.addItem(new ItemStack(mainNudgeItemType));
            if (givenItemStack)
                Feedback.send(player, { translate: 'nudge.tip.inventory.full' });
        } else {
            inventoryContainer.setItem(nudgeItemSlotNumber, new ItemStack(mainNudgeItemType));
        }
        return this.updateShouldHaveNudgeItem();
    }

    removeNudgeItem() {
        const player = this.getPlayer();
        const inventoryContainer = player?.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!inventoryContainer)
            return;
        for (let slotIndex = 0; slotIndex < inventoryContainer.size; slotIndex++) {
            const hasNudgeItem = inventoryContainer.getItem(slotIndex)?.typeId.startsWith('nudge:');
            if (hasNudgeItem)
                inventoryContainer.setItem(slotIndex, void 0);
        }
    }

    hasNudgeItem() {
        const player = this.getPlayer();
        const inventoryContainer = player?.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!inventoryContainer)
            return;
        for (let slotIndex = 0; slotIndex < inventoryContainer.size; slotIndex++) {
            const isNudgeItem = inventoryContainer.getItem(slotIndex)?.typeId.startsWith('nudge:');
            if (isNudgeItem)
                return true;
        }
        return false;
    }

    setNaturalNudgingOption() {
        const playerMovement = this.getPlayerMovement();
        const naturalNudging = naturalNudgingOption.option;
        if (playerMovement.getInputMode() === InputMode.Touch)
            naturalNudging.setValue(this.playerId, false);
        if (!naturalNudging.isInitialized(this.playerId))
            naturalNudging.setValue(this.playerId, true);
    }
}