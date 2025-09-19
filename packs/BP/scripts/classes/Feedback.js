export class Feedback {
    static send(player, message) {
        player.onScreenDisplay.setActionBar(message);
    }
}