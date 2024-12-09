import Decimal, { type DecimalSource } from "break_eternity.js";
import { NaNCheck, tmp, updateAllTotal } from "./main";
import { player } from "./main";
import { setAchievement } from "./components/Game/Game_Achievements/Game_Achievements";
import { D, scale } from "./calc";
import { updateAllStart } from "./components/Game/Game_Progress/Game_Main/Game_Main";
import { getFinickyKPExp, getFinickyKPExpGain, getFinickySeconds, getStrangeKPExp, KUA_BLESS_UPGS, KUA_PROOF_AUTO, KUA_PROOF_UPGS, updateAllKua, type KuaProofAutoTypes, type KuaProofUpgTypes } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_Kuaraniai";
import { format } from "./format";
import { getSCSLAttribute, setSCSLEffectDisp } from "./softcapScaling";


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
                    player.value.gameProgress.main.prai.amount = Decimal.add(player.value.gameProgress.main.prai.amount, tmp.value.main.prai.pending);
                    updateAllTotal(player.value.gameProgress.main.prai.totals, tmp.value.main.prai.pending);
                    player.value.gameProgress.main.prai.totalEver = Decimal.add(player.value.gameProgress.main.prai.totalEver, tmp.value.main.prai.pending);
                    player.value.gameProgress.main.prai.times = Decimal.add(player.value.gameProgress.main.prai.times, 1);
                    setAchievement(0, 7);
                }

                reset(0);
            }
            break;
        case "pr2":
            if (tmp.value.main.pr2.canDo || override) {
                if (!override) {
                    player.value.gameProgress.main.pr2.amount = Decimal.add(player.value.gameProgress.main.pr2.amount, 1);
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
                    updateAllTotal(player.value.gameProgress.kua.totals, tmp.value.kua.pending);
                    player.value.gameProgress.kua.totalEver = Decimal.add(player.value.gameProgress.kua.totalEver, tmp.value.kua.pending);
                    player.value.gameProgress.kua.times = Decimal.add(player.value.gameProgress.kua.times, 1);
                }

                reset(2);
            }
            break;
        case "col":
            // there isn't anything to gain directly by doing a col reset
            reset(3);
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
            player.value.gameProgress.main.prai.timeInPRai = D(0);
            player.value.gameProgress.main.points = D(0);

            for (let j = 0; j < 3; j++) {
                player.value.gameProgress.main.upgrades[j].bought = D(0);
                player.value.gameProgress.main.upgrades[j].accumulated = D(0);
            }

            updateAllStart(0);
            updateAllStart(0);
            break;
        case 1:
            player.value.gameProgress.main.prai.times = D(0);
            player.value.gameProgress.main.prai.amount = Decimal.min(10, player.value.gameProgress.main.pr2.amount);

            updateAllStart(0);
            break;
        case 2:
            player.value.gameProgress.main.prai.times = D(0);
            player.value.gameProgress.main.prai.amount = D(0);
            player.value.gameProgress.kua.timeInKua = D(0);
            if (Decimal.lt(player.value.gameProgress.main.pr2.amount, 25)) {
                player.value.gameProgress.main.oneUpgrades = [];
            }
            for (let i = 0; i < player.value.gameProgress.main.upgrades.length; i++) {
                player.value.gameProgress.main.upgrades[i].boughtInReset[layer] = D(0);
            }

            updateAllStart(0);
            updateAllKua(0);
            break;
        case 3:
            player.value.gameProgress.kua.amount = D(0);
            player.value.gameProgress.kua.times = D(0);
            player.value.gameProgress.kua.timeInKua = D(0);
            player.value.gameProgress.kua.upgrades = 0;
            player.value.gameProgress.kua.kshards.amount = D(0);
            player.value.gameProgress.kua.kshards.upgrades = 0;
            player.value.gameProgress.kua.kpower.amount = D(0);
            player.value.gameProgress.kua.kpower.upgrades = 0;
            player.value.gameProgress.main.pr2.amount = D(0);
            for (let i = 0; i < 9; i++) {
                player.value.gameProgress.main.upgrades[i].auto = false;
            }
            player.value.gameProgress.main.prai.auto = false;
            player.value.gameProgress.kua.auto = false;

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

            player.value.gameProgress.kua.blessings.amount = D(0);
            for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
                player.value.gameProgress.kua.blessings.upgrades[i] = D(0);
            }

            player.value.gameProgress.kua.proofs.amount = D(0);

            player.value.gameProgress.kua.proofs.strange.amount = D(0);
            player.value.gameProgress.kua.proofs.strange.cooldown = D(0);
            player.value.gameProgress.kua.proofs.strange.hiddenExp = D(0);
            player.value.gameProgress.kua.proofs.strange.times = D(0);

            player.value.gameProgress.kua.proofs.finicky.amount = D(0);
            player.value.gameProgress.kua.proofs.finicky.cooldown = D(0);
            player.value.gameProgress.kua.proofs.finicky.hiddenExp = D(0);
            player.value.gameProgress.kua.proofs.finicky.times = D(0);

            player.value.gameProgress.kua.proofs.finicky.powers.cyan.alloc = D(0);
            player.value.gameProgress.kua.proofs.finicky.powers.cyan.amount = D(0);
            player.value.gameProgress.kua.proofs.finicky.powers.cyan.upgrades = D(0);
            player.value.gameProgress.kua.proofs.finicky.powers.yellow.alloc = D(0);
            player.value.gameProgress.kua.proofs.finicky.powers.yellow.amount = D(0);
            player.value.gameProgress.kua.proofs.finicky.powers.yellow.upgrades = D(0);
            player.value.gameProgress.kua.proofs.finicky.powers.white.alloc = D(0);
            player.value.gameProgress.kua.proofs.finicky.powers.white.amount = D(0);
            player.value.gameProgress.kua.proofs.finicky.powers.white.upgrades = D(0);

            for (const i in KUA_PROOF_UPGS) {
                for (let j = 0; j < KUA_PROOF_UPGS[i as KuaProofUpgTypes].length; j++) {
                    player.value.gameProgress.kua.proofs.upgrades[i as KuaProofUpgTypes][j] = D(0);
                }
            }
        
            for (const i in KUA_PROOF_AUTO) {
                for (let j = 0; j < KUA_PROOF_AUTO[i as KuaProofAutoTypes].length; j++) {
                    player.value.gameProgress.kua.proofs.automationBought[i as KuaProofAutoTypes][j] = false;
                }
            }

            updateAllKua(0);
            updateAllKua(0);
            break;
        // case 4:
        //     if (tmp.value.tax.canDo || override) {
        //         if (!override) {
        //             player.value.gameProgress.tax.amount = Decimal.add(player.value.gameProgress.tax.amount, tmp.value.tax.pending);
        //             player.value.gameProgress.tax.times = Decimal.add(player.value.gameProgress.tax.times, 1);
        //         }

        //         player.value.gameProgress.col.power = D(0);
        //         player.value.gameProgress.col.time = D(0);
        //         for (const i in COL_CHALLENGES) {
        //             player.value.gameProgress.col.completed[i as challengeIDList] = D(0);
        //         }
        //         for (let i = 0; i < COL_RESEARCH.length; i++) {
        //             player.value.gameProgress.col.research.xpTotal[i] = D(0);
        //             player.value.gameProgress.col.research.enabled[i] = false;
        //         }
        //         updateAllCol(0);
        //     }
        //     break;
        default:
            throw new Error(`uhh i don't think ${layer} is resettable`);
    }

    for (let i = 0; i < player.value.gameProgress.main.upgrades.length; i++) {
        player.value.gameProgress.main.upgrades[i].boughtInReset[layer] = D(0);
    }

    resetTotalBestArray(player.value.gameProgress.main.totals, D(0), layer);
    resetTotalBestArray(player.value.gameProgress.main.best, D(0), layer);
    resetTotalBestArray(player.value.gameProgress.main.prai.totals, Decimal.min(10, player.value.gameProgress.main.pr2.amount), layer);
    resetTotalBestArray(player.value.gameProgress.main.prai.best, Decimal.min(10, player.value.gameProgress.main.pr2.amount), layer);
    resetTotalBestArray(player.value.gameProgress.main.pr2.best, D(0), layer);
    resetTotalBestArray(player.value.gameProgress.kua.kpower.best, D(0), layer);
    resetTotalBestArray(player.value.gameProgress.kua.kpower.totals, D(0), layer);
    resetTotalBestArray(player.value.gameProgress.kua.kshards.best, D(0), layer);
    resetTotalBestArray(player.value.gameProgress.kua.kshards.totals, D(0), layer);
    resetTotalBestArray(player.value.gameProgress.kua.best, D(0), layer);
    resetTotalBestArray(player.value.gameProgress.kua.totals, D(0), layer);
    resetTotalBestArray(player.value.gameProgress.kua.blessings.best, D(0), layer);
    resetTotalBestArray(player.value.gameProgress.kua.blessings.totals, D(0), layer);
    resetTotalBestArray(player.value.gameProgress.kua.proofs.best, D(0), layer);
    resetTotalBestArray(player.value.gameProgress.kua.proofs.totals, D(0), layer);
    resetTotalBestArray(player.value.gameProgress.kua.proofs.strange.best, D(0), layer);
    resetTotalBestArray(player.value.gameProgress.kua.proofs.strange.totals, D(0), layer);
    resetTotalBestArray(player.value.gameProgress.col.best, D(0), layer);
    resetTotalBestArray(player.value.gameProgress.col.totals, D(0), layer);

    reset(layer - 1);
};

export const resetFromSKP = (reset = true, addTimes: boolean, addExp: boolean, delta: DecimalSource) => {
    if (reset) {
        delta = D(1);
    }
    if (tmp.value.kua.proofs.exp.gte(12) && (Decimal.lt(player.value.gameProgress.kua.proofs.strange.cooldown, 0) || !reset)) {
        if (reset) { player.value.gameProgress.kua.proofs.strange.cooldown = 1; }
        if (addExp) {
            player.value.gameProgress.kua.proofs.strange.hiddenExp = Decimal.add(player.value.gameProgress.kua.proofs.strange.hiddenExp, tmp.value.kua.proofs.exp.mul(delta));
        }
        if (addTimes) {
            player.value.gameProgress.kua.proofs.strange.times = Decimal.add(player.value.gameProgress.kua.proofs.strange.times, delta);
        }

        tmp.value.kua.proofs.skpExp = getStrangeKPExp(player.value.gameProgress.kua.proofs.strange.hiddenExp, false);
        let data = Decimal.add(player.value.gameProgress.kua.proofs.strange.amount, 1).root(tmp.value.kua.proofs.skpExp).add(delta).pow(tmp.value.kua.proofs.skpExp).sub(1);
        let calc = Decimal.add(player.value.gameProgress.kua.proofs.strange.amount, 1).root(tmp.value.kua.proofs.skpExp).add(1).pow(tmp.value.kua.proofs.skpExp).sub(1);

        const softcaps = {
            prevEff: calc,
            scal: getSCSLAttribute('skp', false)
        }

        if (data.gte(softcaps.scal[1].start)) {
            data = scale(data, 2, true, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
            calc = scale(calc, 2, true, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
            player.value.gameProgress.kua.proofs.strange.amount = scale(player.value.gameProgress.kua.proofs.strange.amount, 2, true, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
            setSCSLEffectDisp('skp', false, 1, `${format(calc.log(softcaps.prevEff), 3)}√`);
        }

        if (data.gte(softcaps.scal[0].start)) {
            data = scale(data, 0, true, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
            calc = scale(calc, 0, true, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
            player.value.gameProgress.kua.proofs.strange.amount = scale(player.value.gameProgress.kua.proofs.strange.amount, 0, true, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
            setSCSLEffectDisp('skp', false, 0, `/${format(calc.div(softcaps.prevEff), 3)}`);
        }

        player.value.gameProgress.kua.proofs.strange.amount = Decimal.add(player.value.gameProgress.kua.proofs.strange.amount, 1).root(tmp.value.kua.proofs.skpExp).add(delta).pow(tmp.value.kua.proofs.skpExp).sub(1);

        if (data.gte(softcaps.scal[0].start)) {
            data = scale(data, 0, false, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
            player.value.gameProgress.kua.proofs.strange.amount = scale(player.value.gameProgress.kua.proofs.strange.amount, 0, false, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
        }

        if (data.gte(softcaps.scal[1].start)) {
            data = scale(data, 2, false, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
            player.value.gameProgress.kua.proofs.strange.amount = scale(player.value.gameProgress.kua.proofs.strange.amount, 2, false, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
        }

        NaNCheck(data);
        NaNCheck(player.value.gameProgress.kua.proofs.strange.amount);

        if (reset) {
            player.value.gameProgress.kua.proofs.amount = D(0);
            for (let i = 0; i < KUA_PROOF_UPGS.kp.length; i++) {
                player.value.gameProgress.kua.proofs.upgrades.kp[i] = D(0);
            }
        }
    }
}

export const resetFromFKP = (reset = true, addTimes: boolean, addExp: boolean, delta: DecimalSource) => {
    const gain = getFinickySeconds(player.value.gameProgress.kua.proofs.strange.amount);
    if (reset) {
        delta = D(1);
    }
    if (Decimal.gte(player.value.gameProgress.kua.proofs.strange.amount, 1e10) && (Decimal.lt(player.value.gameProgress.kua.proofs.finicky.cooldown, 0) || !reset)) {
        if (reset) { player.value.gameProgress.kua.proofs.finicky.cooldown = 1; }
        if (addExp) {
            player.value.gameProgress.kua.proofs.finicky.hiddenExp = Decimal.add(player.value.gameProgress.kua.proofs.finicky.hiddenExp, getFinickyKPExpGain(player.value.gameProgress.kua.proofs.strange.amount).mul(delta));
        }
        if (addTimes) {
            player.value.gameProgress.kua.proofs.finicky.times = Decimal.add(player.value.gameProgress.kua.proofs.finicky.times, delta);
        }

        tmp.value.kua.proofs.fkpExp = getFinickyKPExp(player.value.gameProgress.kua.proofs.finicky.hiddenExp, false);

        player.value.gameProgress.kua.proofs.finicky.amount = Decimal.add(player.value.gameProgress.kua.proofs.finicky.amount, 1).root(tmp.value.kua.proofs.fkpExp).add(gain.mul(delta)).pow(tmp.value.kua.proofs.fkpExp).sub(1);
        NaNCheck(player.value.gameProgress.kua.proofs.finicky.amount);

        if (reset) {
            for (let j = 0; j < 2; j++) {
                player.value.gameProgress.kua.proofs.amount = D(0);
                player.value.gameProgress.kua.proofs.strange.amount = D(0);
                player.value.gameProgress.kua.proofs.strange.hiddenExp = D(0);
                player.value.gameProgress.kua.proofs.strange.times = D(0);
                for (let i = 0; i < KUA_PROOF_UPGS.kp.length; i++) {
                    player.value.gameProgress.kua.proofs.upgrades.kp[i] = D(0);
                }
                for (let i = 0; i < KUA_PROOF_UPGS.skp.length; i++) {
                    player.value.gameProgress.kua.proofs.upgrades.skp[i] = D(0);
                }
                updateAllKua(0);
            }
        }
    }
}