import { type Player } from "./main";
import { D, linearAdd } from "./calc";
import { resetTheWholeGame, saveTheFrickingGame } from "./saving";
import Decimal from "break_eternity.js";
import { COL_RESEARCH } from "./components/Game/Game_Progress/Game_Colosseum/Game_ColResearches/Game_ColResearches";

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
        player.displayVersion = 'v2.0.0.0 - Dec-07-2025';
        player.version = 51;
    }
    if (player.version === 51) {
        player.prog.kua.blessings.upgrades[4] = D(0);
        player.displayVersion = 'v2.0.0.0 - Dec-23-2025';
        player.version = 52;
    }
    if (player.version === 52) {
        player.prog.kua.kshards.totalInCol = D(0);
        player.prog.kua.kpower.totalInCol = D(0);

        player.displayVersion = 'v2.0.0.0 - Dec-23-2025';
        player.version = 53;
    }
    if (player.version === 53) {
        // change formulae of researches
        const RES_LEVEL = linearAdd(player.prog.col.research.xpTotal[3], 40, 40, true);
        const exp = D(14.75)
        const effect = Decimal.div(RES_LEVEL, exp).add(1).ln().add(1).mul(exp).sqrt().mul(exp.sqrt()).sub(exp).mul(2).pow_base(1.1);

        player.prog.col.research.xpTotal[3] = COL_RESEARCH[3].levelToScore(effect.sub(1).div(0.095));

        player.displayVersion = 'v2.0.0.0 - Jan-31-2026';
        player.version = 54;
    }
    if (player.version === 54) {

        // player.displayVersion = 'v2.0.0.0 - Nov-11-2025';
        // player.version = 55;
    }
    if (player.version === 55) {

        // player.displayVersion = 'v2.0.0.0 - Nov-11-2025';
        // player.version = 56;
    }
    if (player.version === 56) {

        // player.displayVersion = 'v2.0.0.0 - Nov-11-2025';
        // player.version = 57;
    }
    if (player.version === 57) {

        // player.displayVersion = 'v2.0.0.0 - Nov-11-2025';
        // player.version = 58;
    }

    return player;
};