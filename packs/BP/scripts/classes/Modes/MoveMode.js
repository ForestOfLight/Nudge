import { StructureMirrorAxis, StructureRotation } from "@minecraft/server";
import { MoveEdit } from "../Edits/MoveEdit";
import { Feedback } from "../Feedback";
import { BuildNudgerMove } from "../Nudges/BuildNudgerMove";
import { NudgeableMode } from "./NudgableMode";
import { PlayerMovement } from "../PlayerMovement";

export class MoveMode extends NudgeableMode {
    isNudging = false;
    nudger;
    mirrorAxis = StructureMirrorAxis.None;
    rotation = StructureRotation.None;

    constructor(builder) {
        super(builder);
        this.nudger = new BuildNudgerMove(builder);
    }

    onUse() {
        if (this.isNudging)
            this.onUseWhileNudging();
        else if (this.hasSelection())
            this.confirmSelection();
        else
            this.builder.changeEditMode();
    }

    onHit(block) {
        if (this.isNudging)
            this.selection.setNudgeLocation(block.location);
        else if (this.hasSelection())
            this.extendSelection(block.location);
        else
            this.startSelection(block.dimension, block.location);
    }

    onUseWhileNudging() {
        const playerMovement = new PlayerMovement(this.player);
        if (this.isNudgingSuspended()) {
            this.unsuspendNudge();
        } else {
            if (playerMovement.isSneaking())
                this.mirrorOrRotate();
            else if (playerMovement.isJumping())
                this.suspendNudge();
            else
                this.confirmEdit();
        }
    }

    startSelection(dimension, location) {
        this.select(dimension, location, location);
        Feedback.send(this.player, this.getDuringSelectionFeedback());
    }

    confirmSelection() {
        this.enterNudgeMode();
        Feedback.send(this.player, this.getStartNudgingFeedback());
    }

    async confirmEdit() {
        const edit = new MoveEdit(this.selection, { mirrorAxis: this.mirrorAxis, rotation: this.rotation });
        const success = await super.confirmEdit(edit);
        if (success)
            this.deselect();
    }

    getHoldItemFeedback() {
        return { rawtext: [
            { translate: 'nudge.tip.start', with: { rawtext: [Feedback.hitIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.changemode', with: { rawtext: [Feedback.useIcon(this.player)] } }
        ]};
    }
    
    getDuringSelectionFeedback() {
        return { rawtext: [
            { translate: 'nudge.tip.extend', with: { rawtext: [Feedback.hitIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.nudge.start', with: { rawtext: [Feedback.useIcon(this.player)] } }
        ]};
    }

    getStartNudgingFeedback() {
        return { rawtext: [
            { translate: 'nudge.tip.move.confirm', with: { rawtext: [Feedback.useIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.nudge.cursor', with: { rawtext: [Feedback.hitIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.freemove', with: { rawtext: [Feedback.jumpIcon(this.player), Feedback.useIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.nudge.mirrororrotate', with: { rawtext: [Feedback.sneakIcon(this.player), Feedback.jumpIcon(this.player), Feedback.useIcon(this.player)] } }
        ]};
    }

    getFreeMovementFeedback() {
        return { rawtext: [
            { translate: 'nudge.tip.nudge.resume', with: { rawtext: [Feedback.useIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.nudge.cursor', with: { rawtext: [Feedback.hitIcon(this.player)] } }
        ]};
    }
}