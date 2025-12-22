import { ActionFormData } from '@minecraft/server-ui';
import { forceShow } from '../../utils';
import { Symmetry } from './Symmetry';
import { StructureMirrorAxis } from '@minecraft/server';
import { Vector } from '../../lib/Vector';

export class SymmetryForm {
    builder;

    constructor(builder) {
        this.builder = builder;
        this.show();
    }

    show() {
        forceShow(this.builder.getPlayer(), this.buildForm()).then((response) => {
            if (response.canceled)
                return;
            this.handleResponse(response.selection);
        });
    }

    buildForm() {
        if (this.builder.hasSymmetry())
            return this.buildEditSymmetryForm();
        else
            return this.buildSetupSymmetryForm();
    }

    buildSetupSymmetryForm() {
        return new ActionFormData()
            .title({ translate: 'nudge.menu.symmetry.new' })
            .button({ translate: 'nudge.menu.symmetry.mirror.x' })
            .button({ translate: 'nudge.menu.symmetry.mirror.z' })
            .button({ translate: 'nudge.menu.symmetry.mirror.xz' });
    }

    buildEditSymmetryForm() {
        const symmetry = this.builder.getSymmetry();
        return new ActionFormData()
            .title({ translate: 'nudge.menu.symmetry.modify' })
            .body({ translate: 'nudge.menu.symmetry.location', with: { rawtext: [
                { text: String(Vector.from(symmetry.location)) },
                { translate: symmetry.dimension.localizationKey }]
            } })
            .button({ translate: 'nudge.menu.symmetry.mirror.x' })
            .button({ translate: 'nudge.menu.symmetry.mirror.z' })
            .button({ translate: 'nudge.menu.symmetry.mirror.xz' })
            .button({ translate: 'nudge.menu.symmetry.remove' });
    }

    handleResponse(selection) {
        if (this.builder.hasSymmetry())
            this.handleEditSymmetryResponse(selection);
        else
            this.handleSetupSymmetryResponse(selection);
    }

    handleSetupSymmetryResponse(seletion) {
        const player = this.builder.getPlayer();
        let mirrorAxis = StructureMirrorAxis.X;
        switch (seletion) {
            case 0:
                mirrorAxis = StructureMirrorAxis.X;
                break;
            case 1:
                mirrorAxis = StructureMirrorAxis.Z;
                break;
            case 2:
                mirrorAxis = StructureMirrorAxis.XZ;
                break;
            default:
                mirrorAxis = StructureMirrorAxis.X;
        }
        if (this.builder.hasSymmetry()) {
            const symmetry = this.builder.getSymmetry();
            symmetry.setMirrorAxis(mirrorAxis);
        } else {
            const symmetry = new Symmetry(this.builder, mirrorAxis);
            this.builder.setSymmetry(symmetry);
        }
    }

    handleEditSymmetryResponse(selection) {
        if (selection < 3)
            this.handleSetupSymmetryResponse(selection);
        else
            this.builder.removeSymmetry();
    }
}