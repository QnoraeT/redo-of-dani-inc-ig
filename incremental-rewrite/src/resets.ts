import Decimal, { type DecimalSource } from "break_eternity.js";
import { NaNCheck, tmp, updateAllTotal } from "./main";
import { player } from "./main";
import { setAchievement } from "./components/Game/Game_Achievements/Game_Achievements";
import { D, scale } from "./calc";
import { updateAllStart } from "./components/Game/Game_Progress/Game_Main/Game_Main";
import { format } from "./format";
import { getSCSLAttribute, setSCSLEffectDisp } from "./softcapScaling";
import { updateAllCol } from "./components/Game/Game_Progress/Game_Colosseum/Game_Colosseum";
import { KUA_PROOF_UPGS, type KuaProofUpgTypes } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_KuaProofs/Game_KuaProofs";
import { KUA_PROOF_AUTO, type KuaProofAutoTypes } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_KuaProofs/Game_KuaProofAuto/Game_KuaProofAuto";
import { KUA_BLESS_UPGS } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_KuaBlessings/Game_KuaBlessings";
import { updateAllKua } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_Kuaraniai";
import { getStrangeKPExp } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_KuaProofs/Game_KuaProofStrange/Game_KuaProofStrange";
import { getFinickyKPExp, getFinickyKPExpGain, getFinickySeconds } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_KuaProofs/Game_KuaProofFinicky/Game_KuaProofFinicky";
import { updateAllLayer4 } from "./components/Game/Game_Progress/Game_Layer4/Game_Layer4";
import { COL_RESEARCH } from "./components/Game/Game_Progress/Game_Colosseum/Game_ColResearches/Game_ColResearches";
import { COL_CHALLENGES, type challengeIDList } from "./components/Game/Game_Progress/Game_Colosseum/Game_ColChallenges/Game_ColChalData";
import { inChallenge } from "./components/Game/Game_Progress/Game_Colosseum/Game_ColChallenges/Game_ColChalHandler";
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

    const len = {
        prai: 0,
        pr2: 1,
        kua: 2,
        col: 3,
        tax: 4,
        growan: 4
    }[resets]
    for (let j = len; j >= 0; j--) {
        for (let i = 0; i < player.value.gameProgress.main.upgrades.length; i++) {
            player.value.gameProgress.main.upgrades[i].boughtInReset[j] = D(0);
        }
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
            }
            for (let j = 0; j < MAIN_UPG_DATA.length; j++) {
                player.value.gameProgress.main.upgrades[j].accumulated = D(0);
            }
            break;
        case 1:
            player.value.gameProgress.main.prai.times = D(0);
            player.value.gameProgress.main.prai.amount = Decimal.min(10, player.value.gameProgress.main.pr2.amount);
            break;
        case 2:
            player.value.gameProgress.main.prai.times = D(0);
            player.value.gameProgress.main.prai.amount = D(0);
            player.value.gameProgress.kua.timeInKua = D(0);
            if (Decimal.lt(player.value.gameProgress.main.pr2.amount, 25) && !hasGrowanMilestone(0)) {
                player.value.gameProgress.main.oneUpgrades = [];
            }
            for (let i = 0; i < player.value.gameProgress.main.upgrades.length; i++) {
                player.value.gameProgress.main.upgrades[i].boughtInReset[layer] = D(0);
            }
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

            if (!hasGrowanMilestone(0)) {
                player.value.gameProgress.main.pr2.amount = D(0);
                player.value.gameProgress.main.prai.auto = false;
            }

            for (let i = 0; i < MAIN_UPG_DATA.length; i++) {
                player.value.gameProgress.main.upgrades[i].auto = false;
            }
            player.value.gameProgress.kua.auto = false;

            for (let i = 0; i < MAIN_UPG_DATA.length; i++) {
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

            if (!hasGrowanMilestone(1)) {
                player.value.gameProgress.kua.blessings.amount = D(0);
                for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
                    player.value.gameProgress.kua.blessings.upgrades[i] = D(0);
                }
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
                    player.value.gameProgress.kua.proofs.automationEnabled[i as KuaProofAutoTypes][j] = false;
                }
            }

            player.value.gameProgress.col.timeInCol = D(0);
            break;
        case 4:
            // TODO: add an extra setting where col power and time do not reset on layer 1+ col challenges
            // both colPower and colTime
            // colTime should automatically exit all challenges
            player.value.gameProgress.col.power = D(0);
            player.value.gameProgress.col.time = D(0);
            // this is to actually leave the challenge because doing it with recursive reset 3 will not reset the data and put the game in a buggy state
            updateAllCol(0);

            for (const i in COL_CHALLENGES) {
                if (COL_CHALLENGES[i as challengeIDList].layer === 0) {
                    player.value.gameProgress.col.completed[i as challengeIDList] = D(0);
                    player.value.gameProgress.inChallenge[i as challengeIDList].optionalDiff = D(0);
                }
            }
            for (let i = 0; i < COL_RESEARCH.length; i++) {
                player.value.gameProgress.col.research.xpTotal[i] = D(0);
                player.value.gameProgress.col.research.enabled[i] = false;
            }

            // milestone 1
            player.value.gameProgress.main.oneUpgrades = [];
            player.value.gameProgress.main.pr2.amount = D(0);

            // milestone 2
            player.value.gameProgress.kua.blessings.amount = D(0);
            for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
                player.value.gameProgress.kua.blessings.upgrades[i] = D(0);
            }
            break;
        default:
            throw new Error(`uhh i don't think ${layer} is resettable`);
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

export const resetFromSKP = (reset = true, addTimes: boolean, addExp: boolean, delta: DecimalSource) => {
    if (reset) {
        delta = D(1);
    }
    if (Decimal.gte(player.value.gameProgress.kua.proofs.amount, 1e24) && (Decimal.lt(player.value.gameProgress.kua.proofs.strange.cooldown, 0) || !reset)) {
        if (reset) { player.value.gameProgress.kua.proofs.strange.cooldown = 1; }
        if (addExp) {
            player.value.gameProgress.kua.proofs.strange.hiddenExp = Decimal.add(player.value.gameProgress.kua.proofs.strange.hiddenExp, Decimal.log10(player.value.gameProgress.kua.proofs.amount).div(2).mul(delta));
        }
        if (addTimes) {
            player.value.gameProgress.kua.proofs.strange.times = Decimal.add(player.value.gameProgress.kua.proofs.strange.times, delta);
        }

        tmp.value.kua.proofs.skpExp = getStrangeKPExp(player.value.gameProgress.kua.proofs.strange.hiddenExp, false);
        let data = Decimal.max(player.value.gameProgress.kua.proofs.strange.amount, 0).add(1).root(tmp.value.kua.proofs.skpExp).add(tmp.value.kua.proofs.skpSpeed.mul(delta)).pow(tmp.value.kua.proofs.skpExp).sub(1);
        let calc = Decimal.max(player.value.gameProgress.kua.proofs.strange.amount, 0).add(1).root(tmp.value.kua.proofs.skpExp).add(tmp.value.kua.proofs.skpSpeed).pow(tmp.value.kua.proofs.skpExp).sub(1);

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

        if (inChallenge("df")) {
            data = scale(data, 2.1, true, 10, 1, 0.75);
            calc = scale(calc, 2.1, true, 10, 1, 0.75);
            player.value.gameProgress.kua.proofs.strange.amount = scale(player.value.gameProgress.kua.proofs.strange.amount, 2.1, true, 10, 1, 0.75);
        }

        player.value.gameProgress.kua.proofs.strange.amount = Decimal.max(player.value.gameProgress.kua.proofs.strange.amount, 0).add(1).root(tmp.value.kua.proofs.skpExp).add(tmp.value.kua.proofs.skpSpeed.mul(delta)).pow(tmp.value.kua.proofs.skpExp).sub(1);

        if (inChallenge("df")) {
            data = scale(data, 2.1, false, 10, 1, 0.75);
            calc = scale(calc, 2.1, false, 10, 1, 0.75);
            player.value.gameProgress.kua.proofs.strange.amount = scale(player.value.gameProgress.kua.proofs.strange.amount, 2.1, false, 10, 1, 0.75);
        }

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

        if (reset && !hasGrowanMilestone(1)) {
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
    if (Decimal.gte(player.value.gameProgress.kua.proofs.strange.amount, 1e7) && (Decimal.lt(player.value.gameProgress.kua.proofs.finicky.cooldown, 0) || !reset)) {
        if (reset) { player.value.gameProgress.kua.proofs.finicky.cooldown = 1; }
        if (addExp) {
            player.value.gameProgress.kua.proofs.finicky.hiddenExp = Decimal.add(player.value.gameProgress.kua.proofs.finicky.hiddenExp, getFinickyKPExpGain(player.value.gameProgress.kua.proofs.strange.amount).mul(delta));
        }
        if (addTimes) {
            player.value.gameProgress.kua.proofs.finicky.times = Decimal.add(player.value.gameProgress.kua.proofs.finicky.times, delta);
        }

        tmp.value.kua.proofs.fkpExp = getFinickyKPExp(player.value.gameProgress.kua.proofs.finicky.hiddenExp, false);

        if (inChallenge("df")) {
            player.value.gameProgress.kua.proofs.finicky.amount = scale(player.value.gameProgress.kua.proofs.finicky.amount, 2.1, true, 10, 1, 0.75);
        }

        player.value.gameProgress.kua.proofs.finicky.amount = Decimal.max(player.value.gameProgress.kua.proofs.finicky.amount, 0).add(1).root(tmp.value.kua.proofs.fkpExp).add(gain.mul(delta)).pow(tmp.value.kua.proofs.fkpExp).sub(1);

        if (inChallenge("df")) {
            player.value.gameProgress.kua.proofs.finicky.amount = scale(player.value.gameProgress.kua.proofs.finicky.amount, 2.1, false, 10, 1, 0.75);
        }

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