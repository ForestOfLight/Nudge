import { system, EntityComponentTypes, ItemStack, CommandPermissionLevel, CustomCommandStatus, Player } from '@minecraft/server';
import { Feedback } from '../classes/Feedback';

system.beforeEvents.startup.subscribe((event) => {
    const command = {
        name: 'nudge:edit',
        description: 'Gives you the Nudge item. Use it to select your build.',
        permissionLevel: CommandPermissionLevel.Any
    };
    event.customCommandRegistry.registerCommand(command, givePlayerMenuItem);
});

function givePlayerMenuItem(origin) {
    const player = origin.sourceEntity;
    if (player instanceof Player === false)
        return { status: CustomCommandStatus.Failure, message: 'This command can only be used by players.' };
    system.run(() => {
        const inventoryContainer = player.getComponent(EntityComponentTypes.Inventory)?.container;
        const givenItemStack = inventoryContainer?.addItem(new ItemStack('nudge:move'));
        if (givenItemStack)
            player.sendMessage('§cFailed to give you the Nudge item.');
        else
            player.sendMessage(`§aYou recieved the Nudge item! ${Feedback.hitIcon(player)} to select your build or ${Feedback.useIcon(player)} to change your editing mode.`);
    });
    return { status: CustomCommandStatus.Success };
}
