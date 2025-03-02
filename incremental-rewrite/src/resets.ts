import Decimal, { type DecimalSource } from "break_eternity.js";
import { NaNCheck, tmp } from "./main";
import { player } from "./main";
import { setAchievement } from "./components/Game/Game_Achievements/Game_Achievements";
import { D } from "./calc";
import { updateAllStart } from "./components/Game/Game_Progress/Game_Main/Game_Main";
import { updateAllCol } from "./components/Game/Game_Progress/Game_Colosseum/Game_Colosseum";
import { KUA_BLESS_UPGS } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_KuaBlessings/Game_KuaBlessings";
import { updateAllKua } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_Kuaraniai";
import { updateAllLayer4 } from "./components/Game/Game_Progress/Game_Layer4/Game_Layer4";
import { COL_RESEARCH } from "./components/Game/Game_Progress/Game_Colosseum/Game_ColResearches/Game_ColResearches";
import { hasGrowanMilestone } from "./components/Game/Game_Progress/Game_Layer4/Game_Growan/Game_Growan";
import { MAIN_UPG_DATA } from "./components/Game/Game_Progress/Game_Main/Game_MainUpgrades/Game_MainUpgrades";

export const resetTotalBestArray = (
    array: Array<null | DecimalSource>,
    defaultt: Decimal,
    clear: number
) => {
    if (clear > array.length) {
        console.warn(
            `[resetTotalBestArray]: Clear (${clear}) is larger than the array (${array.length})!`
        );
        console.warn(array);
    }
    if (array[clear] !== null) {
        array[clear] = defaultt;
    }
};

export const resetStage = (resets: "prai" | "pr2" | "kua" | "col" | "tax" | "growan", override = false) => {
    switch (resets) {
        case "prai":
            if (tmp.value.main.prai.canDo || override) {
                if (!override) {
                    player.value.gameProgress.prai.amount = Decimal.add(player.value.gameProgress.prai.amount, tmp.value.main.prai.pending);
                    player.value.gameProgress.prai.times = Decimal.add(player.value.gameProgress.prai.times, 1);
                    setAchievement(0, 7);
                }

                reset(0);
            }
            break;
        case "pr2":
            if (tmp.value.main.pr2.canDo || override) {
                if (!override) {
                    player.value.gameProgress.pr2.amount = Decimal.add(player.value.gameProgress.pr2.amount, 1);
                }

                reset(1);
            }
            break;
        case "kua":
            if (tmp.value.kua.canDo || override) {
                if (!override) {
                    setAchievement(0, 3);
                    setAchievement(0, 17);
                    setAchievement(1, 4);
                    setAchievement(1, 6);
                    setAchievement(1, 8);
                    setAchievement(1, 9);
                    setAchievement(1, 10);
                    setAchievement(1, 11);
                    setAchievement(1, 12);
                    setAchievement(1, 18);
                    player.value.gameProgress.kua.amount = Decimal.add(player.value.gameProgress.kua.amount, tmp.value.kua.pending);
                    player.value.gameProgress.kua.times = Decimal.add(player.value.gameProgress.kua.times, 1);
                }

                reset(2);
            }
            break;
        case "col":
            // there isn't anything to gain directly by doing a col reset
            reset(3);
            break;
        case "growan":
            if (!tmp.value.layer4.growan.canDo) {
                if (!confirm('Are you sure you want to do a layer 4 reset? You will not gain anything!')) {
                    return;
                }
            }
            if (!override) {
                NaNCheck(tmp.value.layer4.growan.pending, `You are gaining NaN grōwan`)
                player.value.gameProgress.layer4.gro.totalAmt = Decimal.add(player.value.gameProgress.layer4.gro.totalAmt, tmp.value.layer4.growan.pending);
                player.value.gameProgress.layer4.gro.amount = Decimal.add(player.value.gameProgress.layer4.gro.amount, tmp.value.layer4.growan.pending);

                player.value.gameProgress.layer4.timeInL4R = D(0);
                if (player.value.gameProgress.layer4.pickedFirst === 0) {
                    player.value.gameProgress.layer4.pickedFirst = 1;
                }
            }

            reset(4);
            break;
        default:
            throw new Error(`uhh i don't think ${resets} is resettable`);
    }
}

export const reset = (layer: number) => {
    if (layer < 0) {
        return;
    }

    switch (layer) {
        case 0:
            player.value.gameProgress.prai.timeInPRai = D(0);
            player.value.gameProgress.points = D(0);
            player.value.gameProgress.totalPointsInPrai = D(0);

            for (let j = 0; j < 3; j++) {
                player.value.gameProgress.upgrades[j].bought = D(0);
            }
            for (let j = 0; j < MAIN_UPG_DATA.length; j++) {
                player.value.gameProgress.upgrades[j].accumulated = D(0);
            }
            break;
        case 1:
            player.value.gameProgress.prai.times = D(0);
            player.value.gameProgress.prai.amount = Decimal.min(10, player.value.gameProgress.pr2.amount);
            break;
        case 2:
            player.value.gameProgress.prai.times = D(0);
            player.value.gameProgress.prai.amount = D(0);
            player.value.gameProgress.kua.timeInKua = D(0);
            if (Decimal.lt(player.value.gameProgress.pr2.amount, 25) && !hasGrowanMilestone(0)) {
                player.value.gameProgress.oneUpgrades = [];
            }
            for (let i = 0; i < player.value.gameProgress.upgrades.length; i++) {
                player.value.gameProgress.upgrades[i].boughtInKua = D(0);
            }
            break;
        case 3:
            player.value.gameProgress.kua.amount = D(0);
            player.value.gameProgress.kua.times = D(0);
            player.value.gameProgress.kua.timeInKua = D(0);
            player.value.gameProgress.kua.upgrades = [0, 0, 0];
            player.value.gameProgress.kua.kshards = D(0);
            player.value.gameProgress.kua.kpower = D(0);
            player.value.gameProgress.kua.totalKSInCol = D(0);
            player.value.gameProgress.kua.totalKPInCol = D(0);
            player.value.gameProgress.kua.blessings.totalKBInCol = D(0);
            

            if (!hasGrowanMilestone(0)) {
                player.value.gameProgress.pr2.amount = D(0);
                player.value.gameProgress.prai.auto = false;
            }

            for (let i = 0; i < MAIN_UPG_DATA.length; i++) {
                player.value.gameProgress.upgrades[i].auto = false;
            }
            player.value.gameProgress.kua.auto = false;

            for (let i = 0; i < MAIN_UPG_DATA.length; i++) {
                player.value.gameProgress.upgrades[i].bought = D(0);
            }

            if (!hasGrowanMilestone(1)) {
                player.value.gameProgress.kua.blessings.amount = D(0);
                for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
                    player.value.gameProgress.kua.blessings.upgrades[i] = D(0);
                }
            }

            player.value.gameProgress.kua.proofs.amount = D(0);

            player.value.gameProgress.col.timeInCol = D(0);
            break;
        case 4:
            // both colPower and colTime
            // colTime should automatically exit all challenges
            player.value.gameProgress.col.power = D(0);
            player.value.gameProgress.col.timeLeft = D(0);
            // this is to actually leave the challenge because doing it with recursive reset 3 will not reset the data and put the game in a buggy state
            updateAllCol(0);

            // for (let i = 0; i < COL_CHALLENGES.length; i++) {
            //     player.value.gameProgress.col.completed[i] = D(0);
            // }
            for (let i = 0; i < COL_RESEARCH.length; i++) {
                player.value.gameProgress.col.research.xpTotal[i] = D(0);
                player.value.gameProgress.col.research.enabled[i] = false;
            }

            // milestone 1
            player.value.gameProgress.oneUpgrades = [];
            player.value.gameProgress.pr2.amount = D(0);

            // milestone 2
            player.value.gameProgress.kua.blessings.amount = D(0);
            for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
                player.value.gameProgress.kua.blessings.upgrades[i] = D(0);
            }
            break;
        default:
            throw new Error(`uhh i don't think ${layer} is resettable`);
    }

    switch (layer) {
        case 0:
            updateAllStart(0);
            break;
        case 1:
            updateAllStart(0);
            break;
        case 2:
            updateAllKua(0);
            break;
        case 3:
            updateAllCol(0);
            break;
        case 4:
            updateAllLayer4(0);
            break;
        default:
            throw new Error(`uhh i don't think ${layer} is resettable`);
    }

    reset(layer - 1);
};