import { InputMode } from "@minecraft/server";

export class Feedback {
    static send(player, message) {
        player.onScreenDisplay.setActionBar(message);
    }

    static jumpIcon(player) {
        const inputMode = player.inputInfo.lastInputModeUsed;
        switch (inputMode) {
            case InputMode.KeyboardAndMouse:
                return { translate: 'nudge.missingicon.jump' };
            case InputMode.Touch:
            default:
                return { text: ':touch_jump:' };
        }
    }
    
    static sneakIcon(player) {
        const inputMode = player.inputInfo.lastInputModeUsed;
        switch (inputMode) {
            case InputMode.KeyboardAndMouse:
                return { translate: 'nudge.missingicon.sneak' };
            case InputMode.Touch:
            default:
                return { text: ':touch_sneak:' };
        }
    }

    static useIcon(player) {
        const inputMode = player.inputInfo.lastInputModeUsed;
        switch (inputMode) {
            case InputMode.KeyboardAndMouse:
                return { text: ':light_mouse_right_button:' };
            case InputMode.Touch:
            default:
                return { translate: 'nudge.missingicon.use' };
        }
    }

    static hitIcon(player) {
        const inputMode = player.inputInfo.lastInputModeUsed;
        switch (inputMode) {
            case InputMode.KeyboardAndMouse:
                return { text: ':light_mouse_left_button:' };
            case InputMode.Touch:
            default:
                return { translate: 'nudge.missingicon.hit' };
        }
    }
}
