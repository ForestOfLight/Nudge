import { StructureMirrorAxis, StructureRotation } from "@minecraft/server";
import { CloneEdit } from "../Edits/CloneEdit";
import { Feedback } from "../Feedback";
import { BuildNudgerMove } from "../Nudges/BuildNudgerMove";
import { NudgeableMode } from "./NudgableMode";
import { PlayerMovement } from "../PlayerMovement";

export class CloneMode extends NudgeableMode {
    isNudging = false;
    nudger;
    copyStructure;
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
        if (this.nudger?.isSuspended) {
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

    exitNudgeMode() {
        super.exitNudgeMode();
        this.copyStructure = void 0;
    }

    confirmSelection() {
        this.enterNudgeMode();
        Feedback.send(this.player, this.getStartNudgingFeedback());
    }

    async confirmEdit() {
        const edit = await super.confirmEdit();
        if (edit)
            this.copyStructure = edit.copyStructure;
        else
            this.deselect();
    }

    createNewEdit() {
        return new CloneEdit(this.selection, { mirrorAxis: this.mirrorAxis, rotation: this.rotation }, this.copyStructure);
    }

    getHoldItemFeedback() {
        return { rawtext: [
            { translate: 'nudge.tip.start', with: { rawtext: [Feedback.hitIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.changemode', with: { rawtext: [Feedback.useIcon(this.player)] } }
        ]}
    }

    getDuringSelectionFeedback() {
        return { rawtext: [
            { translate: 'nudge.tip.extend', with: { rawtext: [Feedback.hitIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.nudge.start', with: { rawtext: [Feedback.useIcon(this.player)] } }
        ]};
    }

    getStartNudgingFeedback() {
        return { rawtext: [
            { translate: 'nudge.tip.clone.confirm', with: { rawtext: [Feedback.useIcon(this.player)] } }, { text: '\n' },
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