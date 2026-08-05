import { BuilderOption } from "../classes/Builders/BuilderOption";
import { InputMode } from "@minecraft/server";
import { Builders } from "../classes/Builders/Builders";

export class NaturalNudgingOption {
    constructor() {
        this.option = new BuilderOption({
            identifier: 'naturalNudging',
            translatableName: 'nudge.option.naturalNudging',
            description: { translate: 'nudge.option.naturalNudging.description' },
            onEnableCallback: (playerId) => {
                const builder = Builders.get(playerId);
                builder.getPlayerMovement().useSixDirectionMovement = false;
            },
            onDisableCallback: (playerId) => {
                const builder = Builders.get(playerId);
                builder.getPlayerMovement().useSixDirectionMovement = true;
            }
        });
    }

    shouldDisableToggle(playerId) {
        const builder = Builders.get(playerId);
        const playerMovement = builder.getPlayerMovement();
        if (playerMovement.getInputMode() === InputMode.Touch)
            return true;
        return false;
    }
}

export const naturalNudgingOption = new NaturalNudgingOption();