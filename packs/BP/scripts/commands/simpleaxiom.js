import { world, system, EntityComponentTypes, ItemStack, CommandPermissionLevel, CustomCommandStatus, Player } from '@minecraft/server';

export const SELECTION_ITEM = 'simpleaxiom:selector';

system.beforeEvents.startup.subscribe((event) => {
    const command = {
        name: 'simpleaxiom:select',
        description: 'Gives you the SimpleAxiom Selector. Use it to select your build.',
        permissionLevel: CommandPermissionLevel.Admin
    };
    event.customCommandRegistry.registerCommand(command, givePlayerMenuItem);
});

function givePlayerMenuItem(origin) {
    const player = origin.sourceEntity;
    if (player instanceof Player === false)
        return { status: CustomCommandStatus.Failure, message: 'This command can only be used by players.' };
    system.run(() => {
        const givenItemStack = player.getComponent(EntityComponentTypes.Inventory)?.container?.addItem(new ItemStack(SELECTION_ITEM));
        if (givenItemStack)
            player.sendMessage('§cFailed to give you the SimpleAxiom Selector.');
        else
            player.sendMessage('§aYou recieved the SimpleAxiom Selector! Use it to select your build.');
    });
    return { status: CustomCommandStatus.Success };
}
