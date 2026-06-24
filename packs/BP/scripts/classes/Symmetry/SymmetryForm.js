import { CustomForm, ObservableBoolean, ObservableUIRawMessage } from '@minecraft/server-ui';
import { Symmetry } from './Symmetry';
import { StructureMirrorAxis } from '@minecraft/server';

export class SymmetryForm {
    builder;

    constructor(builder) {
        this.builder = builder;
        this.show();
    }

    show() {
        const symmetry = this.builder.getSymmetry();
        const mirrorX = new ObservableBoolean(symmetry?.isMirroringX() || false, { clientWritable: true });
        const mirrorZ = new ObservableBoolean(symmetry?.isMirroringZ() || false, { clientWritable: true });
        const rotate = new ObservableBoolean(symmetry?.isRotating() || false, { clientWritable: true });
        const title = new ObservableUIRawMessage({ translate: 'nudge.menu.symmetry' });
        const form = new CustomForm(this.builder.getPlayer(), title)
            .label({ translate: 'nudge.menu.symmetry.description' })
            .spacer()
            .toggle({ translate: 'nudge.menu.symmetry.mirror.x' }, mirrorX)
            .toggle({ translate: 'nudge.menu.symmetry.mirror.z' }, mirrorZ)
            .toggle({ translate: 'nudge.menu.symmetry.rotate' }, rotate)
            .spacer()
            .button({ translate: 'nudge.menu.symmetry.move' }, () => this.moveSymmetryToBuilder())
            .button({ translate: 'nudge.menu.symmetry.remove' }, () => this.builder.removeSymmetry())
            .show()
            .catch(error => {
                console.error(error);
            });

        this.handleToggleChanges(mirrorX, mirrorZ, rotate);
    }

    handleToggleChanges(mirrorX, mirrorZ, rotate) {
        mirrorX.subscribe((isEnabled) => this.setMirroringAndRotation(isEnabled, mirrorZ.getData(), rotate.getData()));
        mirrorZ.subscribe((isEnabled) => this.setMirroringAndRotation(mirrorX.getData(), isEnabled, rotate.getData()));
        rotate.subscribe((isEnabled) => this.setMirroringAndRotation(mirrorX.getData(), mirrorZ.getData(), isEnabled));
    }

    createSymmetryAtBuilder(mirrorAxis, rotation) {
        const symmetry = new Symmetry(this.builder, mirrorAxis, rotation);
        this.builder.setSymmetry(symmetry);
        return symmetry;
    }

    setMirroringAndRotation(mirrorX, mirrorZ, rotation) {
        let mirrorAxis = void 0;
        if (mirrorX && mirrorZ)
            mirrorAxis = StructureMirrorAxis.XZ;
        else if (mirrorX)
            mirrorAxis = StructureMirrorAxis.X;
        else if (mirrorZ)
            mirrorAxis = StructureMirrorAxis.Z;
        else
            mirrorAxis = StructureMirrorAxis.None;
        if (this.builder.hasSymmetry()) {
            const symmetry = this.builder.getSymmetry();
            symmetry.setMirrorAxis(mirrorAxis);
            symmetry.setRotation(rotation);
        } else {
            this.createSymmetryAtBuilder(mirrorAxis, rotation);
        }
    }

    moveSymmetryToBuilder() {
        let symmetry = this.builder.getSymmetry()
        if (!symmetry)
            symmetry = this.createSymmetryAtBuilder(StructureMirrorAxis.None, false);
        const player = this.builder.getPlayer();
        const location = player.location;
        symmetry.move(location);
    }
}