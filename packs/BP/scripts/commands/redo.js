import { system, CommandPermissionLevel, CustomCommandStatus, CustomCommandParamType, Player } from '@minecraft/server';
import { Builders } from '../classes/Builders';

system.beforeEvents.startup.subscribe((event) => {
    const command = {
        name: 'simpleaxiom:redo',
        description: 'Redo your last edit, or several.',
        optionalParameters: [{ name: 'number', type: CustomCommandParamType.Integer }],
        permissionLevel: CommandPermissionLevel.Admin
    };
    event.customCommandRegistry.registerCommand(command, redoLastEdit);
});

function redoLastEdit(origin, number = 1) {
    const player = origin.sourceEntity;
    if (player instanceof Player === false)
        return { status: CustomCommandStatus.Failure, message: 'This command can only be used by players.' };
    system.run(() => {
        const builder = Builders.get(player.id);
        const numRedone = builder.editLog.redoMany(number);
        player.sendMessage(`§aSuccessfully redid ${numRedone} edits.`);
    });
    return { status: CustomCommandStatus.Success };
}
