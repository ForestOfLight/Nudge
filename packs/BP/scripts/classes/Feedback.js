import { InputMode } from "@minecraft/server";

export class Feedback {
    static send(player, message) {
        player.onScreenDisplay.setActionBar(message);
    }

    static jumpIcon(player) {
        const inputMode = player.inputInfo.lastInputModeUsed;
        switch (inputMode) {
            case InputMode.KeyboardAndMouse:
                return 'Jump';
            case InputMode.Touch:
            default:
                return ':touch_jump:';
        }
    }
    
    static sneakIcon(player) {
        const inputMode = player.inputInfo.lastInputModeUsed;
        switch (inputMode) {
            case InputMode.KeyboardAndMouse:
                return 'Sneak';
            case InputMode.Touch:
            default:
                return ':touch_sneak:';
        }
    }

    static useIcon(player) {
        const inputMode = player.inputInfo.lastInputModeUsed;
        switch (inputMode) {
            case InputMode.KeyboardAndMouse:
                return ':light_mouse_right_button:';
            case InputMode.Touch:
            default:
                return 'Use';
        }
    }
}
