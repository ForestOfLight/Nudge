import { StackEdit } from "../Edits/StackEdit";
import { Feedback } from "../Feedback";
import { BuildNudgerStack } from "../Nudges/BuildNudgerStack";
import { PlayerMovement } from "../PlayerMovement";
import { NudgeableMode } from "./NudgableMode";

export class StackMode extends NudgeableMode {
    constructor(builder) {
        super(builder);
        this.nudger = new BuildNudgerStack(builder);
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
            this.setNudgeLocation(block.location);
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
            if (playerMovement.isJumping())
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
        const edit = new StackEdit(this.selection);
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
            { translate: 'nudge.tip.stack.start', with: { rawtext: [Feedback.useIcon(this.player)] } }
        ]};
    }

    getStartNudgingFeedback() {
        return { rawtext: [
            { translate: 'nudge.tip.stack.confirm', with: { rawtext: [Feedback.useIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.nudge.cursor', with: { rawtext: [Feedback.hitIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.freemove', with: { rawtext: [Feedback.jumpIcon(this.player), Feedback.useIcon(this.player)] } }
        ]};
    }

    getFreeMovementFeedback() {
        return { rawtext: [
            { translate: 'nudge.tip.nudge.resume', with: { rawtext: [Feedback.useIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.nudge.cursor', with: { rawtext: [Feedback.hitIcon(this.player)] } }
        ]};
    }
    
    isNudgingSuspended() {
        return this.nudger?.isSuspended;
    }

    setNudgeLocation(location) {
        const snappedLocation = this.nudger.snapToStackingGrid(location);
        this.selection.setNudgeLocation(snappedLocation);
        this.nudger.refreshStackingRenderer();
    }
}