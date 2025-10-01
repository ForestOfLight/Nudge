import { system, CommandPermissionLevel, CustomCommandStatus, Player } from '@minecraft/server';
import { SelectionInteractor } from '../classes/SelectionInteractor';

system.beforeEvents.startup.subscribe((event) => {
    const command = {
        name: 'simpleaxiom:here',
        description: 'Starts, extends, or moves your selection to your current location.',
        permissionLevel: CommandPermissionLevel.Any
    };
    event.customCommandRegistry.registerCommand(command, hereCommand);
});

function hereCommand(origin) {
    const player = origin.sourceEntity;
    if (player instanceof Player === false)
        return { status: CustomCommandStatus.Failure, message: 'This command can only be used by players.' };
    system.run(() => {
        SelectionInteractor.onHereCommand(player);
    });
    return { status: CustomCommandStatus.Success };
}
