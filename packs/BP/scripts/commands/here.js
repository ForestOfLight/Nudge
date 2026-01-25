import { system, CommandPermissionLevel, CustomCommandStatus, Player, GameMode } from '@minecraft/server';
import { PlayerInteractions } from '../classes/PlayerInteractions';
import { Builders } from '../classes/Builders';
import { Vector } from '../lib/Vector';

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
    if (player.getGameMode() !== GameMode.Creative)
        return player.sendMessage({ translate: 'nudge.command.generic.creative' });
    system.run(() => {
        const builder = Builders.get(player.id);
        if (!PlayerInteractions.isHoldingNudgeItem(player)) {
            player.sendMessage({ translate: 'nudge.command.here.holditem' });
            return;
        }
        const block = player.dimension.getBlock(new Vector.from(player.location).floor());
        builder.onHit(block);
    });
    return { status: CustomCommandStatus.Success };
}
