import { ActionFormData, CustomForm } from '@minecraft/server-ui';
import { forceShow } from '../../utils';
import { EditModes } from '../Modes/EditModes';
import { SymmetryForm } from './SymmetryForm';
import { OptionsForm } from './OptionsForm';
import { system } from '@minecraft/server';

export class ModeSelectionForm {
    #title = 'nudge.menu.title';
    builder;

    constructor(builder) {
        this.builder = builder;
        this.show();
    }

    show() {
        const player = this.builder.getPlayer();
        const form = new CustomForm(player, { translate: this.#title });
        for (const modeData of Object.values(EditModes))
            form.button({ translate: modeData.translatableString }, () => {
                form.close();
                this.builder.setEditMode(modeData.id);
            });
        form.button({ translate: 'nudge.menu.undo' }, () => this.builder.undo());
        form.button({ translate: 'nudge.menu.redo' }, () => this.builder.redo());
        if (this.builder.hasSymmetry()) {
            form.button({ translate: 'nudge.menu.symmetry.modify' }, () => {
                form.close();
                system.run(() => {
                    new SymmetryForm(this.builder);
                });
            });
        } else {
            form.button({ translate: 'nudge.menu.symmetry.new' }, () => {
                form.close();
                system.run(() => {
                    new SymmetryForm(this.builder);
                });
            });
        }
        form.button({ translate: 'nudge.menu.options' }, () => {
            form.close();
            system.run(() => {
                new OptionsForm(this.builder);
            });
        });
        form.show().catch(error => {
            console.error(error);
        });
    }
}