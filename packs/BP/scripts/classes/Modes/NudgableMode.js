import { StructureMirrorAxis, StructureRotation } from "@minecraft/server";
import { Feedback } from "../Feedback";
import { Selection } from "../Selection";
import { Vector } from "../../lib/Vector";

export class NudgeableMode {
    builder;
    player;
    selection;
    isNudging = false;
    nudger;
    
    constructor(builder) {
        this.builder = builder;
        this.player = builder.getPlayer();
    }

    onUse() {
        throw new Error('onUse() must be implemented.');
    }

    onHit(block) {
        throw new Error('onHit() must be implemented.');
    }

    select(dimension, from, to) {
        this.selection?.destroy();
        this.selection = new Selection(dimension, from, to);
    }

    deselect() {
        if (this.isNudging)
            this.exitNudgeMode();
        this.selection?.destroy();
        this.selection = void 0;
    }

    hasSelection() {
        return this.selection !== void 0;
    }

    startSelection() {
        throw new Error('startSelection() must be implemented.');
    }

    extendSelection(to) {
        this.selection.extendTo(to);
        Feedback.send(this.player, this.getDuringSelectionFeedback());
    }

    confirmSelection() {
        throw new Error('confirmSelection() must be implemented.');
    }

    async confirmEdit(edit) {
        Feedback.send(this.player, edit.getDoingFeedback());
        try {
            await edit.do();
        } catch (error) {
            if (error.name === 'UnloadedVolumeError') {
                Feedback.send(this.player, { translate: 'nudge.tip.unloadedvolume' });
                return false;
            } else if (error.name === 'OutOfBoundsVolumeError') {
                Feedback.send(this.player, { translate: 'nudge.tip.outofbounds' });
                return false;
            }
            throw error;
        }
        this.builder.editLog.save(edit);
        Feedback.send(this.player, edit.getSuccessFeedback());
        return true;
    }

    createNewEdit() {
        throw new Error('createNewEdit() must be implemented.');
    }

    enterNudgeMode() {
        this.isNudging = true;
        this.mirrorAxis = StructureMirrorAxis.None;
        this.rotation = StructureRotation.None;
        this.builder.allowMovement(false);
        this.nudger.setSelection(this.selection);
        this.nudger.start();
    }

    exitNudgeMode() {
        this.isNudging = false;
        this.builder.allowMovement(true);
        this.nudger?.stop();
    }

    suspendNudge() {
        this.builder.allowMovement(true);
        this.nudger?.suspend();
        Feedback.send(this.player, this.getFreeMovementFeedback());
    }

    unsuspendNudge() {
        this.builder.allowMovement(false);
        this.nudger?.unsuspend();
        Feedback.send(this.player, this.getStartNudgingFeedback());
    }
   
    isNudgingSuspended() {
        return this.nudger?.isSuspended;
    }

    getHoldItemFeedback() {
        throw new Error('getHoldItemFeedback() must be implemented.');
    }

    getDuringSelectionFeedback() {
        throw new Error('getDuringSelectionFeedback() must be implemented.');
    }

    getStartNudgingFeedback() {
        throw new Error('getStartNudgingFeedback() must be implemented.');
    }

    getFreeMovementFeedback() {
        throw new Error('getFreeMovementFeedback() must be implemented.');
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
        const selection = this.selection;
        selection.renderer.setMirrorAxis(this.mirrorAxis);
        selection.renderer.setRotation(this.rotation);
        Feedback.send(this.player, this.getMirrorOrRotationFeedback(mirrorOrRotation));

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

    getMirrorOrRotationFeedback(mirrorOrRotation) {
        switch (mirrorOrRotation) {
            case StructureMirrorAxis.X:
                return { translate: 'nudge.tip.nudge.mirrororrotate.x' };
            case StructureMirrorAxis.Z:
                return { translate: 'nudge.tip.nudge.mirrororrotate.z' };
            case StructureMirrorAxis.XZ:
                return { translate: 'nudge.tip.nudge.mirrororrotate.xz' };
            default:
                break;
        }
        switch (mirrorOrRotation) {
            case StructureRotation.Rotate90:
                return { translate: 'nudge.tip.nudge.mirrororrotate.90' };
            case StructureRotation.Rotate180:
                return { translate: 'nudge.tip.nudge.mirrororrotate.180' };
            case StructureRotation.Rotate270:
                return { translate: 'nudge.tip.nudge.mirrororrotate.270' };
            default:
                break;
        }
        return { translate: 'nudge.tip.nudge.mirrororrotate.reset' };
    }
}