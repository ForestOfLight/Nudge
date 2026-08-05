import { CustomForm, ObservableBoolean, ObservableUIRawMessage } from '@minecraft/server-ui';
import { StructureMirrorAxis } from '@minecraft/server';
import { BuilderOptions } from '../Builders/BuilderOptions';
import { naturalNudgingOption } from '../../options/NaturalNudgingOption';

export class OptionsForm {
    #title = 'nudge.menu.options';
    builder;
    options = [naturalNudgingOption];

    constructor(builder) {
        this.builder = builder;
        this.show();
    }

    show() {
        const player = this.builder.getPlayer();
        const observables = [];
        const title = new ObservableUIRawMessage({ translate: this.#title });
        const form = new CustomForm(this.builder.getPlayer(), title);
        for (const option of this.options) {
            const observable = new ObservableBoolean(option.option.isEnabled(player.id), { clientWritable: true });
            observables.push(observable);
            form.toggle({ translate: option.option.translatableName }, observable, { description: option.option.description, disabled: naturalNudgingOption.shouldDisableToggle(player.id) });
        }
        form.show().catch(error => {
            console.error(error);
        });
        this.handleToggleChanges(observables);
    }

    handleToggleChanges(observables) {
        const player = this.builder.getPlayer();
        for (let i = 0; i < observables.length; i++) {
            const observable = observables[i];
            observable.subscribe((isEnabled) => {
                const option = this.options[i].option;
                option.setValue(player.id, isEnabled);
            });
        }
    }
}