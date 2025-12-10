import { type Player } from "./main";
import { D } from "./calc";
import { resetTheWholeGame, saveTheFrickingGame } from "./saving";

export const updatePlayerData = (player: Player): Player => {

    if (player.version === undefined) {
        player.version = -1
    }
    if (player.version < 47) {
        player.version = 47;
    }
    if (player.version === 47) {

        player.displayVersion = 'v2.0.0.0 - Nov-11-2025';
        player.version = 48;
    }
    if (player.version === 48) {
        if (player.prog === undefined) {
            player.prog = player.gameProgress
        }

        player.version = 49;
    }
    if (player.version === 49) {
        // saves are way too broken to fix :c
        console.log(`SAVE RESET: v2.0.0.0!`)
        resetTheWholeGame(false)

        // player.displayVersion = 'v2.0.0.0 - Nov-11-2025';
        player.version = 50;
        saveTheFrickingGame(true)
    }
    if (player.version === 50) {
        player.offlineTime = D(0);
        player.displayVersion = 'v2.0.1.0 - Dec-07-2025';
        player.version = 51;
    }
    if (player.version === 51) {

        // player.displayVersion = 'v2.0.0.0 - Nov-11-2025';
        // player.version = 52;
    }
    if (player.version === 52) {

        // player.displayVersion = 'v2.0.0.0 - Nov-11-2025';
        // player.version = 53;
    }

    return player;
};