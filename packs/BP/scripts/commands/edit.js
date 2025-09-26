import { system, EntityComponentTypes, ItemStack, CommandPermissionLevel, CustomCommandStatus, Player } from '@minecraft/server';
import { Feedback } from '../classes/Feedback';
import { Builders } from '../classes/Builders';

system.beforeEvents.startup.subscribe((event) => {
    const command = {
        name: 'simpleaxiom:edit',
        description: 'Gives you the SimpleAxiom item. Use it to select your build.',
        permissionLevel: CommandPermissionLevel.Any
    };
    event.customCommandRegistry.registerCommand(command, givePlayerMenuItem);
});

function givePlayerMenuItem(origin) {
    const player = origin.sourceEntity;
    if (player instanceof Player === false)
        return { status: CustomCommandStatus.Failure, message: 'This command can only be used by players.' };
    system.run(() => {
        const builder = Builders.get(player.id);
        const inventoryContainer = player.getComponent(EntityComponentTypes.Inventory)?.container;
        const givenItemStack = inventoryContainer?.addItem(new ItemStack('simpleaxiom:move'));
        if (givenItemStack)
            player.sendMessage('§cFailed to give you the SimpleAxiom item.');
        else
            player.sendMessage(`§aYou recieved the SimpleAxiom item! ${Feedback.useIcon(player)} to select your build.`);
    });
    return { status: CustomCommandStatus.Success };
}
