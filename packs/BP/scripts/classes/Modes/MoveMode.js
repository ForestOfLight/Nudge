import { StructureMirrorAxis, StructureRotation } from "@minecraft/server";
import { MoveEdit } from "../Edits/MoveEdit";
import { Feedback } from "../Feedback";
import { BuildNudgerMove } from "../Nudges/BuildNudgerMove";
import { Mode } from "./Mode";
import { Vector } from "../../lib/Vector";

export class MoveMode extends Mode {
    isNudging = false;
    nudger;
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
    }

    confirmSelection() {
        this.enterNudgeMode();
        Feedback.send(this.player, 
            `§a${Feedback.useIcon(this.player)} to confirm.\n`
            + `${Feedback.sneakIcon(this.player)} + ${Feedback.useIcon(this.player)} to mirror/rotate.\n`
            + `${Feedback.jumpIcon(this.player)} + ${Feedback.useIcon(this.player)} to cancel.`
        );
    }

    confirmEdit() {
        super.confirmEdit();
        this.builder.deselect();
    }

    createNewEdit() {
        return new MoveEdit(this.builder.selection, { mirrorAxis: this.mirrorAxis, rotation: this.rotation });
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
        return 'simpleaxiom:move';
    }

    getDuringSelectionFeedback() {
        return `§a${Feedback.useIcon(this.player)} to extend.\n`
            + `${Feedback.sneakIcon(this.player)} + ${Feedback.useIcon(this.player)} to move structure.`;
    }
}