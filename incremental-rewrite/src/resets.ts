import Decimal, { type DecimalSource } from "break_eternity.js";
import { tmp, updateAllTotal } from "./main";
import { player } from "./main";
import { setAchievement } from "./components/Game/Game_Achievements/Game_Achievements";
import { D } from "./calc";
import { updateAllStart, updateStart } from "./components/Game/Game_Progress/Game_Main/Game_Main";
import { updateAllKua } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_Kuaraniai";
import { COL_CHALLENGES, COL_RESEARCH, updateAllCol, type challengeIDList } from "./components/Game/Game_Progress/Game_Colosseum/Game_Colosseum";


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

export const reset = (layer: number, override = false) => {
    if (layer <= -1) {
        return;
    }

    let resetSuccessful = false;
    switch (layer) {
        case 0:
            if (tmp.value.main.prai.canDo || override) {
                resetSuccessful = true;
                if (!override) {
                    player.value.gameProgress.main.prai.amount = Decimal.add(
                        player.value.gameProgress.main.prai.amount,
                        tmp.value.main.prai.pending
                    );
                    updateAllTotal(
                        player.value.gameProgress.main.prai.totals,
                        tmp.value.main.prai.pending
                    );
                    player.value.gameProgress.main.prai.totalEver = Decimal.add(
                        player.value.gameProgress.main.prai.totalEver,
                        tmp.value.main.prai.pending
                    );
                    player.value.gameProgress.main.prai.times = Decimal.add(
                        player.value.gameProgress.main.prai.times,
                        1
                    );
                    setAchievement(0, 7);
                }

                for (let i = 0; i < 2; i++) {
                    player.value.gameProgress.main.prai.timeInPRai = D(0);
                    player.value.gameProgress.main.points = D(0);

                    for (let i = 0; i < 3; i++) {
                        player.value.gameProgress.main.upgrades[i].bought = D(0);
                    }

                    updateStart(0, 0);
                    updateStart(-3, 0);
                    updateStart(-2, 0);
                    updateStart(-1, 0);
                }
            }
            break;
        case 1:
            if (tmp.value.main.pr2.canDo || override) {
                resetSuccessful = true;
                if (!override) {
                    player.value.gameProgress.main.pr2.amount = Decimal.add(player.value.gameProgress.main.pr2.amount, 1);
                }

                player.value.gameProgress.main.prai.amount = Decimal.min(10, player.value.gameProgress.main.pr2.amount);

                updateStart(1, 0);
            }
            break;
        case 2:
            if (tmp.value.kua.canDo || override) {
                resetSuccessful = true;
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
                    player.value.gameProgress.kua.amount = Decimal.add(
                        player.value.gameProgress.kua.amount,
                        tmp.value.kua.pending
                    );
                    updateAllTotal(player.value.gameProgress.kua.totals, tmp.value.kua.pending);
                    player.value.gameProgress.kua.totalEver = Decimal.add(
                        player.value.gameProgress.kua.totalEver,
                        tmp.value.kua.pending
                    );
                    player.value.gameProgress.kua.times = Decimal.add(
                        player.value.gameProgress.kua.times,
                        1
                    );
                }

                player.value.gameProgress.main.prai.times = D(0);
                player.value.gameProgress.main.prai.amount = D(0);
                player.value.gameProgress.kua.timeInKua = D(0);
                if (Decimal.lt(player.value.gameProgress.main.pr2.amount, 25)) {
                    player.value.gameProgress.main.oneUpgrades = [];
                }

                updateAllKua(0);
                updateAllStart(0);
            }
            break;
        case 3:
            resetSuccessful = true;
            player.value.gameProgress.kua.amount = D(0);
            player.value.gameProgress.kua.times = D(0);
            player.value.gameProgress.kua.timeInKua = D(0);
            player.value.gameProgress.kua.kshards.amount = D(0);
            player.value.gameProgress.kua.kshards.upgrades = 0;
            player.value.gameProgress.kua.kpower.amount = D(0);
            player.value.gameProgress.kua.kpower.upgrades = 0;
            player.value.gameProgress.main.pr2.amount = D(0);
            for (let i = 0; i < 9; i++) {
                player.value.gameProgress.main.upgrades[i].auto = false;
            }
            player.value.gameProgress.main.prai.auto = false;

            for (let i = 0; i < 9; i++) {
                player.value.gameProgress.main.upgrades[i].bought = D(0);
                player.value.gameProgress.main.upgrades[i].boughtInReset[3] = D(0);
            }

            player.value.gameProgress.kua.enhancers.sources = [D(0), D(0), D(0)];
            player.value.gameProgress.kua.enhancers.enhancers = [D(0), D(0), D(0), D(0), D(0), D(0), D(0)];
            player.value.gameProgress.kua.enhancers.enhanceXP = [D(0), D(0), D(0), D(0), D(0), D(0), D(0)];
            player.value.gameProgress.kua.enhancers.enhancePow = [D(0), D(0), D(0), D(0), D(0), D(0), D(0)];
            player.value.gameProgress.kua.enhancers.xpSpread = D(1);
            player.value.gameProgress.kua.enhancers.inExtraction = 0;
            player.value.gameProgress.kua.enhancers.extractionXP = [D(0), D(0), D(0)];
            player.value.gameProgress.kua.enhancers.upgrades = [];
            updateAllKua(0);
            break;
        case 4:
            if (tmp.value.tax.canDo || override) {
                resetSuccessful = true;
                if (!override) {
                    player.value.gameProgress.tax.amount = Decimal.add(
                        player.value.gameProgress.tax.amount,
                        tmp.value.tax.pending
                    );
                    player.value.gameProgress.tax.times = Decimal.add(
                        player.value.gameProgress.tax.times,
                        1
                    );
                }

                player.value.gameProgress.col.power = D(0);
                player.value.gameProgress.col.time = D(0);
                for (const i in COL_CHALLENGES) {
                    player.value.gameProgress.col.completed[i as challengeIDList] = D(0);
                }
                for (let i = 0; i < COL_RESEARCH.length; i++) {
                    player.value.gameProgress.col.research.xpTotal[i] = D(0);
                    player.value.gameProgress.col.research.enabled[i] = false;
                }
                updateAllCol(0);
            }
            break;
        default:
            throw new Error(`uhh i don't think ${layer} is resettable`);
    }

    if (resetSuccessful) {
        for (let i = 0; i < player.value.gameProgress.main.upgrades.length; i++) {
            player.value.gameProgress.main.upgrades[i].boughtInReset[layer] = D(0);
        }

        resetTotalBestArray(player.value.gameProgress.main.totals, D(0), layer);
        resetTotalBestArray(player.value.gameProgress.main.best, D(0), layer);
        resetTotalBestArray(
            player.value.gameProgress.main.prai.totals,
            Decimal.min(10, player.value.gameProgress.main.pr2.amount),
            layer
        );
        resetTotalBestArray(
            player.value.gameProgress.main.prai.best,
            Decimal.min(10, player.value.gameProgress.main.pr2.amount),
            layer
        );
        resetTotalBestArray(player.value.gameProgress.main.pr2.best, D(0), layer);
        resetTotalBestArray(player.value.gameProgress.kua.kpower.best, D(0), layer);
        resetTotalBestArray(player.value.gameProgress.kua.kpower.totals, D(0), layer);
        resetTotalBestArray(player.value.gameProgress.kua.kshards.best, D(0), layer);
        resetTotalBestArray(player.value.gameProgress.kua.kshards.totals, D(0), layer);
        resetTotalBestArray(player.value.gameProgress.kua.best, D(0), layer);
        resetTotalBestArray(player.value.gameProgress.kua.totals, D(0), layer);
        resetTotalBestArray(player.value.gameProgress.col.best, D(0), layer);
        resetTotalBestArray(player.value.gameProgress.col.totals, D(0), layer);

        reset(layer - 1, true);
    }
};