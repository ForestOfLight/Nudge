import { StructureMirrorAxis, StructureRotation } from "@minecraft/server";
import { CloneEdit } from "../Edits/CloneEdit";
import { Feedback } from "../Feedback";
import { BuildNudgerMove } from "../Nudges/BuildNudgerMove";
import { NudgeableMode } from "./NudgableMode";

export class CloneMode extends NudgeableMode {
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
        const playerMovement = this.builder.getPlayerMovement();
        if (this.nudger?.isSuspended) {
            this.unsuspendNudge();
        } else {
            if (this.#shouldMirrorOrRotateForward())
                this.mirrorOrRotate();
            else if (this.#shouldMirrorOrRotateBack())
                this.mirrorOrRotate(false);
            else if (playerMovement.isJumping())
                this.suspendNudge();
            else
                this.confirmEdit();
        }
    }

    #shouldMirrorOrRotateForward() {
        const playerMovement = this.builder.getPlayerMovement();
        return (playerMovement.useSixDirectionMovement && playerMovement.isPressingRight()) || (!playerMovement.useSixDirectionMovement && (playerMovement.isSneaking()));
    }

    #shouldMirrorOrRotateBack() {
        const playerMovement = this.builder.getPlayerMovement();
        return playerMovement.useSixDirectionMovement && playerMovement.isPressingLeft();
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
        const edit = new CloneEdit(this.selection, { mirrorAxis: this.mirrorAxis, rotation: this.rotation }, this.copyStructure);
        const success = await super.confirmEdit(edit);
        if (success)
            this.copyStructure = edit.copyStructure;
        else
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
        const feedback = { rawtext: [
            { translate: 'nudge.tip.clone.confirm', with: { rawtext: [Feedback.useIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.nudge.cursor', with: { rawtext: [Feedback.hitIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.freemove', with: { rawtext: [Feedback.jumpIcon(this.player), Feedback.useIcon(this.player)] } }, { text: '\n' }
        ]};
        const playerMovement = this.builder.getPlayerMovement();
        if (playerMovement.useSixDirectionMovement)
            feedback.rawtext.push({ translate: 'nudge.tip.nudge.mirrororrotate.sixdirection', with: { rawtext: [Feedback.leftIcon(this.player), Feedback.rightIcon(this.player), Feedback.useIcon(this.player)] } });
        else
            feedback.rawtext.push({ translate: 'nudge.tip.nudge.mirrororrotate.natural', with: { rawtext: [Feedback.sneakIcon(this.player), Feedback.jumpIcon(this.player), Feedback.useIcon(this.player)] } });
        return feedback;
    }

    getFreeMovementFeedback() {
        return { rawtext: [
            { translate: 'nudge.tip.nudge.resume', with: { rawtext: [Feedback.useIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.nudge.cursor', with: { rawtext: [Feedback.hitIcon(this.player)] } }
        ]};
    }
}