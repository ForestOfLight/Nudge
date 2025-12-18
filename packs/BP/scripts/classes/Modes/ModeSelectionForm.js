import { ActionFormData } from '@minecraft/server-ui';
import { forceShow } from '../../utils';
import { Builders } from '../Builders';
import { EditModes } from './EditModes';

export class ModeSelectionForm {
    #title = 'nudge.menu.title';

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
        for (const [modeName, modeData] of Object.entries(EditModes))
            form.button(modeData.translatableString, 'textures/items/' + modeData.itemId.split(':')[1]);
        form.button({ translate: 'nudge.menu.undo' }, 'textures/items/undo');
        form.button({ translate: 'nudge.menu.redo' }, 'textures/items/redo');
        return form;
    }

    handleSelection(selection) {
        const builder = Builders.get(this.player.id);
        const numModes = Object.keys(EditModes).length;
        if (selection === numModes)
            builder.undo();
        if (selection === numModes + 1)
            builder.redo();
        if (selection < numModes)
            builder.setEditMode(selection);
    }
}