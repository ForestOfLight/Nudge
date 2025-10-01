import { EntityComponentTypes, world } from "@minecraft/server";
import { Selection } from "./Selection";
import { EditLog } from "./EditLog";
import { EditModes } from "./Modes/EditModes";
import { ModeSelectionForm } from "./Modes/ModeSelectionForm";
import { MoveMode } from "./Modes/MoveMode";
import { DeleteMode } from "./Modes/DeleteMode";
import { CloneMode } from "./Modes/CloneMode";
import { StackMode } from "./Modes/StackMode";

export class Builder {
    playerId;
    player = void 0;
    selection = void 0;
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
        this.deselect();
    }

    select(dimension, from, to) {
        this.selection?.destroy();
        this.selection = new Selection(dimension, from, to);
    }

    deselect() {
        if (this.editMode.isNudging)
            this.exitNudgeMode();
        this.selection?.destroy();
        this.selection = void 0;
    }

    startSelection(dimension, from) {
        this.select(dimension, from);
    }

    selectFrom(from) {
        this.selection.setFrom(from);
    }

    selectTo(to) {
        this.selection.setTo(to);
    }

    extendSelect(to) {
        this.selection.extendTo(to);
    }

    hasSelection() {
        return this.selection !== void 0;
    }

    confirmSelection() {
        this.editMode.confirmSelection();
    }

    enterNudgeMode() {
        this.editMode.enterNudgeMode();
    }

    exitNudgeMode() {
        this.editMode.exitNudgeMode();
    }

    setNudgeLocation(min) {
        this.editMode.setNudgeLocation(min);
    }

    confirmEdit() {
        this.editMode.confirmEdit();
    }

    changeEditMode() {
        new ModeSelectionForm(this.getPlayer());
    }

    mirrorOrRotate() {
        this.editMode.mirrorOrRotate();
    }

    detectHeldItemForEditMode() {
        const player = this.getPlayer();
        const inventoryContainer = player.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!inventoryContainer)
            return false;
        const slotItem = inventoryContainer.getItem(player.selectedSlotIndex);
        const validModes = Object.keys(EditModes);
        const newMode = validModes.find((mode) => ('simpleaxiom:' + mode.toLowerCase()) === slotItem?.typeId);
        this.setEditMode(EditModes[newMode]);
    }

    setEditMode(editMode) {
        switch (editMode) {
            case EditModes.Move:
                this.editMode = new MoveMode(this);
                break;
            case EditModes.Clone:
                this.editMode = new CloneMode(this);
                break;
            case EditModes.Delete:
                this.editMode = new DeleteMode(this);
                break;
            case EditModes.Stack:
                this.editMode = new StackMode(this);
                break;
            default:
                this.editMode = new MoveMode(this);
                break;
        }
    }

    undo(num = 1) {
        const numUndone = this.editLog.undoMany(num);
        this.getPlayer().sendMessage(`§aSuccessfully undid ${numUndone} edits.`);
    }
    
    redo(num = 1) {
        const numRedone = this.editLog.redoMany(num);
        this.getPlayer().sendMessage(`§aSuccessfully redid ${numRedone} edits.`);
    }

    getDuringSelectionFeedback() {
        return this.editMode.getDuringSelectionFeedback();
    }

    isNudging() {
        return this.editMode.isNudging;
    }
}