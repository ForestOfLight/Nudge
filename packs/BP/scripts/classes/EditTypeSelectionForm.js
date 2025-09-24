import { ActionFormData } from '@minecraft/server-ui';
import { forceShow } from '../utils';
import { EditTypes } from './Edits/EditTypes';
import { Builders } from './Builders';

export class EditTypeSelectionForm {
    #title = 'Select Edit Type'
    #buttons = [...Object.keys(EditTypes)];

    constructor(player) {
        this.player = player;
        this.show();
    }

    show() {
        forceShow(this.player, this.buildForm()).then((response) => {
            if (response.cancelled)
                return;
            this.handleSelection(response.selection);
        });
    }

    buildForm() {
        const form = new ActionFormData()
            .title(this.#title);
        this.#buttons.forEach((buttonName) => {
            form.button(buttonName);
        });
        form.button('Undo');
        form.button('Redo');
        return form;
    }

    handleSelection(selection) {
        const builder = Builders.get(this.player.id);
        if (selection === this.#buttons.length)
            builder.undo();
        if (selection === this.#buttons.length + 1)
            builder.redo();
        builder.setEditType(selection);
    }
}