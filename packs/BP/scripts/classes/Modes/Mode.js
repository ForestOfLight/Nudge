import { EntityComponentTypes, EquipmentSlot, ItemStack } from "@minecraft/server";
import { Feedback } from "../Feedback";
import { PlayerMovement } from "../PlayerMovement";
import { SelectionInteractor } from "../SelectionInteractor";

export class Mode {
    builder;
    player;
    
    constructor(builder) {
        this.builder = builder;
        this.player = builder.getPlayer();
        this.replaceModeItemInHand();
    }

    confirmSelection() {
        throw new Error('confirmSelection() must be implemented.');
    }

    async confirmEdit() {
        const edit = this.createNewEdit();
        Feedback.send(this.player, edit.getDoingFeedback());
        try {
            await edit.do();
        } catch (error) {
            if (error.name === 'UnloadedVolumeError') {
                Feedback.send(this.player, `§cThe selected area spans too many chunks.`);
                return false;
            }
            throw error;
        }
        this.builder.editLog.save(edit);
        Feedback.send(this.player, edit.getSuccessFeedback());
        return edit;
    }

    allowPlayerMovement(enable) {
        const playerMovement = new PlayerMovement(this.player);
        if (enable)
            playerMovement.unfreeze();
        else
            playerMovement.freeze();
    }

    createNewEdit() {
        throw new Error('createNewEdit() must be implemented.');
    }

    mirrorOrRotate() {
        throw new Error('mirrorOrRotate() must be implemented.');
    }

    setNudgeLocation(min) {
        this.builder.selection.setNudgeLocation(min);
    }

    getItemId() {
        throw new Error('getItemId() must be implemented.');
    }

    getDuringSelectionFeedback() {
        throw new Error('getDuringSelectionFeedback() must be implemented.');
    }

    replaceModeItemInHand() {
        const equippable = this.player.getComponent(EntityComponentTypes.Equippable);
        const mainhandSlot = equippable.getEquipmentSlot(EquipmentSlot.Mainhand);
        if (SelectionInteractor.isHoldingSimpleAxiomItem(this.player))
            mainhandSlot.setItem(new ItemStack(this.getItemId(), 1));
    }
}