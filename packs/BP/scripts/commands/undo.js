import { system, CommandPermissionLevel, CustomCommandStatus, CustomCommandParamType, Player } from '@minecraft/server';
import { Builders } from '../classes/Builders';

system.beforeEvents.startup.subscribe((event) => {
    const command = {
        name: 'nudge:undo',
        description: 'nudge.command.undo',
        optionalParameters: [{ name: 'number', type: CustomCommandParamType.Integer }],
        permissionLevel: CommandPermissionLevel.Admin
    };
    event.customCommandRegistry.registerCommand(command, undoLastEdit);
});

function undoLastEdit(origin, number = 1) {
    const player = origin.sourceEntity;
    if (player instanceof Player === false)
        return { status: CustomCommandStatus.Failure, message: 'nudge.command.generic.invalidsource' };
    system.run(() => {
        const builder = Builders.get(player.id);
        builder.undo(number);
    });
    return { status: CustomCommandStatus.Success };
}
