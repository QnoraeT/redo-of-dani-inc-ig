import { type Player } from "./main";
import { D } from "./calc";

export const updatePlayerData = (player: Player): Player => {
    player.version = player.version || -1;
    if (player.version < 0) {
        player.version = 0;
    }
    if (player.version === 0) {
        for (let i = 0; i < 9; i++) {
            if (player.gameProgress.main.upgrades[i] === undefined) {
                player.gameProgress.main.upgrades[i] = {
                    bought: D(0),
                    best: D(0),
                    auto: false,
                    boughtInReset: [D(0), D(0), D(0), D(0), D(0)]
                };
            }
        }
        player.displayVersion = '1.0.1';
        player.version = 1;
    }
    if (player.version === 1) {

        // player.version = 2;
    }
    if (player.version === 2) {

        // player.version = 3;
    }
    if (player.version === 3) {

        // player.version = 4;
    }
    if (player.version === 4) {

        // player.version = 5;
    }
    if (player.version === 5) {

        // player.version = 6;
    }
    if (player.version === 6) {

        // player.version = 7;
    }
    if (player.version === 7) {
        // player.version = 8;
    }
    if (player.version === 8) {
        // player.version = 9;
    }
    if (player.version === 9) {
        // player.version = 10;
    }

    return player;
};