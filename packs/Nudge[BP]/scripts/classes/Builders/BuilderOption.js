import { BuilderOptions } from "./BuilderOptions";
import { world } from "@minecraft/server";

export class BuilderOption {
    identifier;
    translatableName;
    description;
    #onEnable;
    #onDisable;
    #DP_NAMESPACE = "builderOptions";

    constructor({ identifier, translatableName, description, onEnableCallback = () => {}, onDisableCallback = () => {} }) {
        this.identifier = identifier;
        this.translatableName = translatableName;
        this.description = description;
        this.#onEnable = onEnableCallback;
        this.#onDisable = onDisableCallback;
        BuilderOptions.add(this);
    }

    isEnabled(playerId) {
        return world.getDynamicProperty(`${this.#DP_NAMESPACE}:${playerId}:${this.identifier}`) === true;
    }
    
    setValue(playerId, value) {
        if (this.isEnabled(playerId) !== value) {
            this.save(playerId, value);
            if (value)
                this.#onEnable(playerId);
            else
                this.#onDisable(playerId);
            return value;
        }
        this.save(playerId, value);
        return void 0;
    }

    save(playerId, value) {
        world.setDynamicProperty(`${this.#DP_NAMESPACE}:${playerId}:${this.identifier}`, value);
    }

    isInitialized(playerId) {
        return world.getDynamicProperty(`${this.#DP_NAMESPACE}:${playerId}:${this.identifier}`) !== void 0;
    }
}