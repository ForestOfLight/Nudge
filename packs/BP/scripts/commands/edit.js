import { system, CommandPermissionLevel, CustomCommandStatus, Player, GameMode } from '@minecraft/server';
import { Builders } from '../classes/Builders';
import { Feedback } from '../classes/Feedback';

system.beforeEvents.startup.subscribe((event) => {
    const command = {
        name: 'nudge:edit',
        description: 'nudge.command.edit',
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
        if (success)
            player.sendMessage({ translate: 'nudge.command.edit.given', with: { rawtext: [Feedback.hitIcon(player), Feedback.useIcon(player)] } });
        else
            player.sendMessage({ translate: 'nudge.command.edit.fail' });
    });
    return { status: CustomCommandStatus.Success };
}
