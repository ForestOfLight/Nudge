import { Direction, system } from '@minecraft/server';
import { FormCancelationReason } from '@minecraft/server-ui';
import { Vector } from './lib/Vector';

export async function forceShow(player, form, timeout = Infinity) {
    const startTick = system.currentTick;
    while ((system.currentTick - startTick) < timeout) {
        const response = await form.show(player);
        if (startTick + 1 === system.currentTick && response.cancelationReason === FormCancelationReason.UserBusy)
            player.sendMessage({ translate: 'nudge.menu.closechat' });
        if (response.cancelationReason !== FormCancelationReason.UserBusy)
            return response;
    }
    throw new Error("Menu timed out.");
};

export function getVectorByDirection(direction) {
    switch (direction) {
        case Direction.Up:
            return Vector.up;
        case Direction.Down:
            return Vector.down;
        case Direction.North:
            return Vector.backward;
        case Direction.South:
            return Vector.forward;
        case Direction.East:
            return Vector.right;
        case Direction.West:
            return Vector.left;
        default:
            throw new Error('Invalid block face found:' + direction);
    }
}