import { EntityComponentTypes, EquipmentSlot, ItemStack, world } from "@minecraft/server";
import { EditLog } from "./EditLog";
import { EditModes } from "./Modes/EditModes";
import { ModeSelectionForm } from "./Modes/ModeSelectionForm";
import { Feedback } from "./Feedback";
import { PlayerMovement } from "./PlayerMovement";
import { PlayerInteractions } from "./PlayerInteractions";

import { MoveMode } from "./Modes/MoveMode";
import { CloneMode } from "./Modes/CloneMode";
import { StackMode } from "./Modes/StackMode";
import { DeleteVolumeMode } from "./Modes/DeleteVolumeMode";
import { DeleteConnectedMode } from "./Modes/DeleteConnectedMode";

export class Builder {
    playerId;
    player = void 0;
    editMode;
    editLog;

    constructor(playerId) {
        this.playerId = playerId;
        this.setEditMode();
        this.editLog = new EditLog();
    }

    getPlayer() {
        if (this.player === void 0)
            this.player = world.getEntity(this.playerId);
        return this.player;
    }

    onLeave() {
        this.editMode.deselect();
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

    allowMovement(enable) {
        const playerMovement = new PlayerMovement(this.player);
        if (enable)
            playerMovement.unfreeze();
        else
            playerMovement.freeze();
    }

    changeEditMode() {
        new ModeSelectionForm(this.getPlayer());
    }

    getSelection() {
        return this.editMode.selection;
    }

    deselect() {
        this.editMode.deselect();
    }

    setEditModeByHeldItemId() {
        const player = this.getPlayer();
        const inventoryContainer = player.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!inventoryContainer)
            return false;
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
            default:
                this.editMode = new MoveMode(this);
                newEditMode = 0;
                break;
        }
        this.replaceModeItemInHand(newEditMode);
    }
    
    replaceModeItemInHand(newEditMode) {
        const equippable = this.player.getComponent(EntityComponentTypes.Equippable);
        const mainhandSlot = equippable.getEquipmentSlot(EquipmentSlot.Mainhand);
        if (PlayerInteractions.isHoldingNudgeItem(this.player)) {
            const modeItemId = Object.values(EditModes).find(mode => mode.id === newEditMode)?.itemId;
            mainhandSlot.setItem(new ItemStack(modeItemId, 1));
        }
        Feedback.send(this.getPlayer(), this.editMode.getHoldItemFeedback());
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
}