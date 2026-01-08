import { system, CommandPermissionLevel, CustomCommandStatus, CustomCommandParamType, Player, GameMode } from '@minecraft/server';
import { Builders } from '../classes/Builders';

system.beforeEvents.startup.subscribe((event) => {
    const command = {
        name: 'nudge:redo',
        description: 'nudge.command.redo',
        optionalParameters: [{ name: 'number', type: CustomCommandParamType.Integer }],
        permissionLevel: CommandPermissionLevel.Admin
    };
    event.customCommandRegistry.registerCommand(command, redoLastEdit);
});

function redoLastEdit(origin, number = 1) {
    const player = origin.sourceEntity;
    if (player instanceof Player === false)
        return { status: CustomCommandStatus.Failure, message: 'nudge.command.generic.invalidsource' };
    if (player.getGameMode() !== GameMode.Creative)
        return player.sendMessage({ translate: 'nudge.command.generic.creative' });
    system.run(() => {
        const builder = Builders.get(player.id);
        builder.redo(number);
    });
    return { status: CustomCommandStatus.Success };
}
