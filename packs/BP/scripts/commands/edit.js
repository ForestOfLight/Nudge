import { system, EntityComponentTypes, ItemStack, CommandPermissionLevel, CustomCommandStatus, Player } from '@minecraft/server';
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
    system.run(() => {
        const inventoryContainer = player.getComponent(EntityComponentTypes.Inventory)?.container;
        const givenItemStack = inventoryContainer?.addItem(new ItemStack('nudge:move'));
        if (givenItemStack)
            player.sendMessage({ translate: 'nudge.command.edit.fail' });
        else
            player.sendMessage({ translate: 'nudge.command.edit.given', with: { rawtext: [Feedback.hitIcon(player), Feedback.useIcon(player)] } });
    });
    return { status: CustomCommandStatus.Success };
}
