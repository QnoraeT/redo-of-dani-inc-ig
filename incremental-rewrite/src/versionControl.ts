import type { Player } from "./main";

export const versionName = [
    'v1.2.0'
]

export const updatePlayerData = (player: Player): Player => {
    player.version = player.version || -1;
    if (player.version < 0) {
        player.version = 0;
    }
    if (player.version === 0) {

        // player.version = 1;
    }
    if (player.version === 1) {

        // player.version = 2;
    }
    return player;
};