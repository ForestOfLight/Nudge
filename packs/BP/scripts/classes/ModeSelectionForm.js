import { ActionFormData } from '@minecraft/server-ui';
import { forceShow } from '../utils';
import { EditModes } from './Modes/EditModes';
import { SymmetryForm } from './Symmetry/SymmetryForm';

export class ModeSelectionForm {
    #title = 'nudge.menu.title';
    builder;

    constructor(builder) {
        this.builder = builder;
        this.show();
    }

    show() {
        forceShow(this.builder.getPlayer(), this.buildForm()).then((response) => {
            if (response.canceled)
                return;
            this.handleSelection(response.selection);
        });
    }

    buildForm() {
        const form = new ActionFormData()
            .title({ translate: this.#title });
        for (const [_, modeData] of Object.entries(EditModes))
            form.button(modeData.translatableString, 'textures/items/' + modeData.itemId.split(':')[1]);
        form.button({ translate: 'nudge.menu.undo' }, 'textures/items/undo');
        form.button({ translate: 'nudge.menu.redo' }, 'textures/items/redo');
        if (this.builder.hasSymmetry()) {
            form.button({ translate: 'nudge.menu.symmetry.modify' });
            form.button({ translate: 'nudge.menu.symmetry.remove' });
        } else {
            form.button({ translate: 'nudge.menu.symmetry.new' });
        }
        return form;
    }

    handleSelection(selection) {
        const numModes = Object.keys(EditModes).length;
        if (selection < numModes) {
            this.builder.setEditMode(selection);
            return;
        }
        selection -= numModes;
        switch (selection) {
            case 0:
                this.builder.undo();
                break;
            case 1:
                this.builder.redo();
                break;
            case 2:
                new SymmetryForm(this.builder);
                break;
            case 3:
                this.builder.removeSymmetry();
                break;
            default:
                throw new Error('Undefined selection hit.');
        }
    }
}