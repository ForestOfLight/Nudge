import { ExtrudeEdit } from "../Edits/ExtrudeEdit";
import { IntrudeEdit } from "../Edits/IntrudeEdit";
import { Feedback } from "../Feedback";
import { PlayerMovement } from "../PlayerMovement";
import { NudgeableMode } from "./NudgableMode";

export class ExtrudeMode extends NudgeableMode {
    onUse() {
        const playerMovement = new PlayerMovement(this.player);
        if (playerMovement.isSneaking())
            this.builder.changeEditMode();
        else
            this.confirmExtrude();
    }

    onHit() {
        this.confirmIntrude();
    }

    confirmExtrude() {
        const blockRaycastHit = this.player.getBlockFromViewDirection({ maxDistance: 1000, includePassableBlocks: true, includeLiquidBlocks: false });
        const edit = new ExtrudeEdit(blockRaycastHit);
        super.confirmEdit(edit);
    }

    confirmIntrude() {
        const blockRaycastHit = this.player.getBlockFromViewDirection({ maxDistance: 1000, includePassableBlocks: true, includeLiquidBlocks: false });
        const edit = new IntrudeEdit(blockRaycastHit);
        super.confirmEdit(edit);
    }

    getHoldItemFeedback() {
        return { rawtext: [
            { translate: 'nudge.tip.extrude.extrude', with: { rawtext: [Feedback.useIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.extrude.intrude', with: { rawtext: [Feedback.hitIcon(this.player)] } }, { text: '\n' },
            { translate: 'nudge.tip.extrude.changemode', with: { rawtext: [Feedback.sneakIcon(this.player), Feedback.useIcon(this.player)] } }
        ]};
    }
}