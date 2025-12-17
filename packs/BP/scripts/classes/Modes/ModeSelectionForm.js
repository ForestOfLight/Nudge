import { ActionFormData } from '@minecraft/server-ui';
import { forceShow } from '../../utils';
import { Builders } from '../Builders';
import { EditModeTranslatableStrings } from './EditModeTranslatableStrings';

export class ModeSelectionForm {
    #title = 'nudge.menu.title';
    #buttons = EditModeTranslatableStrings;

    constructor(player) {
        this.player = player;
        this.show();
    }

    show() {
        forceShow(this.player, this.buildForm()).then((response) => {
            if (response.canceled)
                return;
            this.handleSelection(response.selection);
        });
    }

    buildForm() {
        const form = new ActionFormData()
            .title({ translate: this.#title });
        for (const [modeName, buttonName] of Object.entries(EditModeTranslatableStrings))
            form.button(buttonName, 'textures/items/' + modeName.toLowerCase());
        form.button({ translate: 'nudge.menu.undo' }, 'textures/items/undo');
        form.button({ translate: 'nudge.menu.redo' }, 'textures/items/redo');
        return form;
    }

    handleSelection(selection) {
        const builder = Builders.get(this.player.id);
        const buttons = Object.keys(EditModeTranslatableStrings);
        if (selection === buttons.length)
            builder.undo();
        if (selection === buttons.length + 1)
            builder.redo();
        if (selection < buttons.length)
            builder.setEditMode(selection);
    }
}