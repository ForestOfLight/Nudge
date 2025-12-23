import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
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
            this.handleResponse(response.formValues);
        });
    }

    buildForm() {
        if (this.builder.hasSymmetry())
            return this.buildModifySymmetryForm();
        else
            return this.buildSetupSymmetryForm();
    }

    buildSetupSymmetryForm() {
        return new ModalFormData()
            .title({ translate: 'nudge.menu.symmetry.new' })
            .label({ translate: 'nudge.menu.symmetry.description' })
            .toggle({ translate: 'nudge.menu.symmetry.mirror.x' }, { defaultValue: false })
            .toggle({ translate: 'nudge.menu.symmetry.mirror.z' }, { defaultValue: false })
            .toggle({ translate: 'nudge.menu.symmetry.rotate' }, { defaultValue: false })
            .submitButton({ translate: 'nudge.menu.symmetry.new' });
    }

    buildModifySymmetryForm() {
        const symmetry = this.builder.getSymmetry();
        return new ModalFormData()
            .title({ translate: 'nudge.menu.symmetry.modify' })
            .label({ translate: 'nudge.menu.symmetry.location', with: { rawtext: [
                { text: String(Vector.from(symmetry.location)) },
                { translate: symmetry.dimension.localizationKey }]
            } })
            .toggle({ translate: 'nudge.menu.symmetry.mirror.x' }, { defaultValue: symmetry.isMirroringX() })
            .toggle({ translate: 'nudge.menu.symmetry.mirror.z' }, { defaultValue: symmetry.isMirroringZ() })
            .toggle({ translate: 'nudge.menu.symmetry.rotate' }, { defaultValue: symmetry.isRotating() })
            .submitButton({ translate: 'nudge.menu.symmetry.modify' });
    }

    handleResponse(formValues) {
        let mirrorAxis = void 0;
        if (formValues[1] && formValues[2])
            mirrorAxis = StructureMirrorAxis.XZ;
        else if (formValues[1])
            mirrorAxis = StructureMirrorAxis.X;
        else if (formValues[2])
            mirrorAxis = StructureMirrorAxis.Z;
        else
            mirrorAxis = StructureMirrorAxis.None;
        const rotation = formValues[3];
        if (this.builder.hasSymmetry()) {
            const symmetry = this.builder.getSymmetry();
            symmetry.setMirrorAxis(mirrorAxis);
            symmetry.setRotation(rotation);
        } else {
            const symmetry = new Symmetry(this.builder, mirrorAxis, rotation);
            this.builder.setSymmetry(symmetry);
        }
    }
}