import { system, CommandPermissionLevel, CustomCommandStatus, Player, GameMode, InputMode } from '@minecraft/server';
import { Builders } from '../classes/Builders';
import { Feedback } from '../classes/Feedback';

system.beforeEvents.startup.subscribe((event) => {
    const command = {
        name: 'nudge:nudge',
        description: 'nudge.command.nudge',
        permissionLevel: CommandPermissionLevel.Any
    };
    event.customCommandRegistry.registerCommand(command, givePlayerMenuItem);
});

function givePlayerMenuItem(origin) {
    const player = origin.sourceEntity;
    if (player instanceof Player === false)
        return { status: CustomCommandStatus.Failure, message: 'nudge.command.generic.invalidsource' };
    if (player.getGameMode() !== GameMode.Creative)
        return player.sendMessage({ translate: 'nudge.command.generic.creative' });
    system.run(() => {
        const builder = Builders.get(player.id);
        const success = builder?.addNudgeItem();
        if (success) {
            player.sendMessage({ translate: 'nudge.command.nudge.given', with: { rawtext: [Feedback.hitIcon(player), Feedback.useIcon(player)] } });
            if (player.inputInfo.lastInputModeUsed === InputMode.Touch)
                player.sendMessage({ translate: 'nudge.command.nudge.touchsuggestion' });
        } else {
            player.sendMessage({ translate: 'nudge.command.nudge.fail' });
        }
    });
    return { status: CustomCommandStatus.Success };
}
