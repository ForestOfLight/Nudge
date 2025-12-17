import { system, CommandPermissionLevel, CustomCommandStatus, Player } from '@minecraft/server';
import { SelectionInteractor } from '../classes/SelectionInteractor';
import { Builders } from '../classes/Builders';

system.beforeEvents.startup.subscribe((event) => {
    const command = {
        name: 'nudge:here',
        description: 'nudge.command.here',
        permissionLevel: CommandPermissionLevel.Any
    };
    event.customCommandRegistry.registerCommand(command, hereCommand);
});

function hereCommand(origin) {
    const player = origin.sourceEntity;
    if (player instanceof Player === false)
        return { status: CustomCommandStatus.Failure, message: 'nudge.command.generic.invalidsource' };
    system.run(() => {
        const builder = Builders.get(player.id);
        if (!SelectionInteractor.isHoldingNudgeItem(player)) {
            player.sendMessage({ translate: 'nudge.command.here.holditem' });
            return;
        }
        const location = new Vector.from(player.location).floor();
        if (builder.isNudging()) {
            builder.setNudgeLocation(location);
            return;
        }
        if (builder.hasSelection())
            builder.extendSelect(location);
        else
            builder.startSelection(player.dimension, location);
    });
    return { status: CustomCommandStatus.Success };
}
