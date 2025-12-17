import { StructureMirrorAxis, StructureRotation } from "@minecraft/server";
import { CloneEdit } from "../Edits/CloneEdit";
import { Feedback } from "../Feedback";
import { BuildNudgerMove } from "../Nudges/BuildNudgerMove";
import { Mode } from "./Mode";
import { Vector } from "../../lib/Vector";

export class CloneMode extends Mode {
    isNudging = false;
    nudger;
    copyStructure;
    mirrorAxis = StructureMirrorAxis.None;
    rotation = StructureRotation.None;

    constructor(builder) {
        super(builder);
        this.nudger = new BuildNudgerMove(this.player);
    }

    enterNudgeMode() {
        this.isNudging = true;
        this.mirrorAxis = StructureMirrorAxis.None;
        this.rotation = StructureRotation.None;
        this.allowPlayerMovement(false);
        this.nudger.setSelection(this.builder.selection);
        this.nudger.start();
    }

    exitNudgeMode() {
        this.isNudging = false;
        this.allowPlayerMovement(true);
        this.nudger?.stop();
        this.copyStructure = void 0;
    }

    suspendNudge() {
        this.allowPlayerMovement(true);
        this.nudger?.suspend();
    }

    unsuspendNudge() {
        this.allowPlayerMovement(false);
        this.nudger?.unsuspend();
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
            this.builder.deselect();
    }

    createNewEdit() {
        return new CloneEdit(this.builder.selection, { mirrorAxis: this.mirrorAxis, rotation: this.rotation }, this.copyStructure);
    }

    mirrorOrRotate() {
        const mirrorOrRotation = this.getNextMirrorOrRotation();
        if (Object.values(StructureMirrorAxis).includes(mirrorOrRotation))
            this.mirrorAxis = mirrorOrRotation;
        else
            this.mirrorAxis = StructureMirrorAxis.None;
        if (Object.values(StructureRotation).includes(mirrorOrRotation))
            this.rotation = mirrorOrRotation;
        else
            this.rotation = StructureRotation.None;
        const selection = this.builder.selection;
        selection.renderer.setMirrorAxis(this.mirrorAxis);
        selection.renderer.setRotation(this.rotation);

        if (Object.values(StructureRotation).includes(mirrorOrRotation) || mirrorOrRotation === void 0) {
            const { min, max } = selection.getBounds();
            const nudgedMin = min.add(selection.minOffset);
            const nudgedMax = max.add(selection.maxOffset);
            const size = Vector.from(nudgedMax).subtract(nudgedMin);
            selection.nudgeOffset(new Vector(), new Vector(size.z - size.x, 0, size.x - size.z));
        }
    }

    getNextMirrorOrRotation() {
        const queue = [
            StructureMirrorAxis.X,
            StructureMirrorAxis.Z,
            StructureMirrorAxis.XZ,
            StructureRotation.Rotate90,
            StructureRotation.Rotate180,
            StructureRotation.Rotate270
        ];
        const currMirrorOrRotation = queue.findIndex(mirrorOrRotation => 
            mirrorOrRotation === this.mirrorAxis || mirrorOrRotation === this.rotation
        );
        return queue[currMirrorOrRotation + 1];
    }

    getItemId() {
        return 'nudge:clone';
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
    
    isNudgingSuspended() {
        return this.nudger?.isSuspended;
    }
}