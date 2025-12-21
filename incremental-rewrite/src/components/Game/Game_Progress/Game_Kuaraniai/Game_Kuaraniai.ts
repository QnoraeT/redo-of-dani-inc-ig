import Decimal, { type DecimalSource } from "break_eternity.js";
import { NaNCheck, player, tmp } from "@/main";
import { format } from "@/format";
import { D, scale } from "@/calc";
import { ACHIEVEMENT_DATA, setAchievement } from "../../Game_Achievements/Game_Achievements";
import { pushFactor, resetFactor, setFactor } from "../../Game_Stats/Game_Stats";
import { getSCSLAttribute, setSCSLEffectDisp } from "@/softcapScaling";
import { resetFromSKP } from "@/resets";
import { KUA_BLESS_TIER, KUA_BLESS_UPGS } from "./Game_KuaBlessings/Game_KuaBlessings";
import { KUA_PROOF_UPGS, type KuaProofUpgTypes } from "./Game_KuaProofs/Game_KuaProofs";
import { challengeDepth, inChallenge, timesCompleted } from "../Game_Colosseum/Game_ColChallenges/Game_ColChalHandler";
import { KUA_PROOF_AUTO, type KuaProofAutoTypes } from "./Game_KuaProofs/Game_KuaProofAuto/Game_KuaProofAuto";
import { getStrangeKPExp } from "./Game_KuaProofs/Game_KuaProofStrange/Game_KuaProofStrange";
import { getFinickyKPExp } from "./Game_KuaProofs/Game_KuaProofFinicky/Game_KuaProofFinicky";
import { getColResEffect } from "../Game_Colosseum/Game_ColResearches/Game_ColResearches";
import { getKuaUpgrade, KUA_UPGRADES } from "./Game_KuaUpgrades/Game_KuaUpgrades";
import { KUA_ENHANCERS } from "./Game_KuaEnhancers/Game.KuaEnhancers";
import { GROWAN_UPGS } from "../Game_Layer4/Game_Growan/Game_Growan";

export const updateAllKua = (delta: DecimalSource) => {
    tmp.value.kua.canBuyUpg = false;
    updateKuaActivity();

    updateKuaProofs(delta);
    updateKuaBlessings(delta);
    updateKuaEnhancers(delta);
    updateKuaBasics(delta);

    if (Decimal.gt(delta, 0)) { // prevent instant achievement gets from not reaching condition
        updateKuaAchievements();
    }
};

export const updateKuaActivity = () => {
    const tempKuaObj = tmp.value.kua;
    tempKuaObj.active.blessings.gain = true;
    tempKuaObj.active.blessings.effects = true;
    tempKuaObj.active.blessings.ranks.rank = true;
    tempKuaObj.active.blessings.ranks.tier = true;
    tempKuaObj.active.blessings.ranks.tetr = true;
    for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
        tempKuaObj.active.blessings.upgrades[i] = true;
    }
    tempKuaObj.active.proofs.gain = true;
    for (const i in KUA_PROOF_UPGS) {
        for (let j = 0; j < KUA_PROOF_UPGS[i as KuaProofUpgTypes].length; j++) {
            tempKuaObj.active.proofs.upgrades[i as KuaProofUpgTypes][j] = true;
        }
    }
    tempKuaObj.active.kpower.upgrades = true;
    tempKuaObj.active.kpower.effects = true;
    tempKuaObj.active.kpower.gain = true;
    tempKuaObj.active.kshards.upgrades = true;
    tempKuaObj.active.kshards.effects = true;
    tempKuaObj.active.kshards.gain = true;
    tempKuaObj.active.upgrades = true;
    tempKuaObj.active.effects = true;
    tempKuaObj.active.gain = true;

    if (inChallenge("nk")) {
        tempKuaObj.active.blessings.gain = false;
        tempKuaObj.active.blessings.effects = false;
        tempKuaObj.active.blessings.ranks.rank = false;
        tempKuaObj.active.blessings.ranks.tier = false;
        tempKuaObj.active.blessings.ranks.tetr = false;
        for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
            tempKuaObj.active.blessings.upgrades[i] = false;
        }
        tempKuaObj.active.proofs.gain = false;
        for (const i in KUA_PROOF_UPGS) {
            for (let j = 0; j < KUA_PROOF_UPGS[i as KuaProofUpgTypes].length; j++) {
                tempKuaObj.active.proofs.upgrades[i as KuaProofUpgTypes][j] = false;
            }
        }
        tempKuaObj.active.kpower.upgrades = false;
        tempKuaObj.active.kpower.effects = false;
        tempKuaObj.active.kpower.gain = false;
        tempKuaObj.active.kshards.upgrades = false;
        tempKuaObj.active.kshards.effects = false;
        tempKuaObj.active.kshards.gain = false;
        tempKuaObj.active.upgrades = false;
        tempKuaObj.active.effects = false;
        tempKuaObj.active.gain = false;
    }
}

export const updateKuaAchievements = () => {
    setAchievement(1, 4);
    setAchievement(1, 6);
    setAchievement(1, 9);
    setAchievement(1, 10);
    setAchievement(1, 11);
    setAchievement(1, 12);
    setAchievement(1, 18);
}

export const updateKuaProofs = (delta: DecimalSource) => {
    const tempKuaObj = tmp.value.kua;
    const playerKuaObj = player.value.prog.kua;
    let scal, k, data, calc;
    playerKuaObj.proofs.strange.cooldown = Decimal.sub(playerKuaObj.proofs.strange.cooldown, delta);
    playerKuaObj.proofs.finicky.cooldown = Decimal.sub(playerKuaObj.proofs.finicky.cooldown, delta);

    tempKuaObj.proofs.skpEff = D(0);
    tempKuaObj.proofs.skpEff = Decimal.max(playerKuaObj.proofs.strange.amount, 0).add(1).log2().add(1).ln().div(2).add(1).pow(2).sub(1).mul(3);

    tempKuaObj.proofs.fkpEff = D(0);
    tempKuaObj.proofs.fkpEff = Decimal.max(playerKuaObj.proofs.finicky.amount, 0).add(1).log10().sqrt();

    tempKuaObj.proofs.speed = D(1);
    tempKuaObj.proofs.skpSpeed = D(1);
    if (player.value.prog.layer4.gro.upgrades.overall.includes(0)) {
        tempKuaObj.proofs.speed = tempKuaObj.proofs.speed.mul(2);
        tempKuaObj.proofs.skpSpeed = tempKuaObj.proofs.skpSpeed.mul(2);
    }

    tempKuaObj.proofs.canBuyUpg = false;
    tempKuaObj.proofs.canBuyUpgs.effect = false;
    tempKuaObj.proofs.canBuyUpgs.kp = false;
    tempKuaObj.proofs.canBuyUpgs.skp = false;
    tempKuaObj.proofs.canBuyUpgs.fkp = false;
    for (let i = 0; i < Object.keys(KUA_PROOF_UPGS).length; i++) {
        for (let j = 0; j < KUA_PROOF_UPGS[Object.keys(KUA_PROOF_UPGS)[i] as KuaProofUpgTypes].length; j++) {
            k = Object.keys(KUA_PROOF_UPGS)[i] as KuaProofUpgTypes;
            switch (k) {
                case 'effect':
                case 'kp':
                    data = playerKuaObj.proofs.amount;
                    break;
                case 'skp':
                    data = playerKuaObj.proofs.strange.amount;
                    break;
                case 'fkp':
                    data = playerKuaObj.proofs.finicky.amount;
                    break;
                default:
                    throw new Error(`${k} is not a valid type!! (failed in updateKua KProof section)`)
            }

            scal = KUA_PROOF_UPGS[k][j].target(data);
            if (k === 'kp' && (j >= 0 && j <= 2)) {
                scal = scal.add(tempKuaObj.proofs.upgrades.skp[2].effect);
            }
            tempKuaObj.proofs.upgrades[k][j].target = scal;
            NaNCheck(tempKuaObj.proofs.upgrades[k][j].target, `KProof ${k} Upgrade #${j+1} was able to buy NaN levels by autobuying!`);

            tempKuaObj.proofs.upgrades[k][j].canBuy = Decimal.gte(data, tempKuaObj.proofs.upgrades[k][j].cost) && KUA_PROOF_UPGS[k][j].show.value;

            data = playerKuaObj.proofs.automationBought[k][j] && playerKuaObj.proofs.automationEnabled[k][j];
            tempKuaObj.proofs.canBuyUpg = tempKuaObj.proofs.canBuyUpg || (tempKuaObj.proofs.upgrades[k][j].canBuy && !data);
            tempKuaObj.proofs.canBuyUpgs[k] = tempKuaObj.proofs.canBuyUpgs[k] || (tempKuaObj.proofs.upgrades[k][j].canBuy && !data);
            tempKuaObj.canBuyUpg = tempKuaObj.canBuyUpg || (tempKuaObj.proofs.upgrades[k][j].canBuy && !data);

            if (data) {
                playerKuaObj.proofs.upgrades[k][j] = tempKuaObj.proofs.upgrades[k][j].target.floor().add(1).max(playerKuaObj.proofs.upgrades[k][j]);
            }

            data = D(0);
            if (k === 'effect') {
                if (j >= 0 && j <= 2) {
                    data = data.add(tempKuaObj.proofs.upgrades.skp[0].effect);
                }
            }
            if (k === 'kp') {
                if (j >= 0 && j <= 2) {
                    data = data.add(tempKuaObj.proofs.skpEff);
                    data = data.add(tempKuaObj.proofs.upgrades.skp[1].effect);
                }
                if (j >= 3 && j <= 5) {
                    data = data.add(tempKuaObj.proofs.upgrades.kp[8].effect);
                }
            }
            tempKuaObj.proofs.upgrades[k][j].freeExtra = data;
            NaNCheck(tempKuaObj.proofs.upgrades[k][j].freeExtra, `KProof ${k} Upgrade #${j+1} had NaN free levels!`);
            tempKuaObj.proofs.upgrades[k][j].trueLevel = Decimal.add(playerKuaObj.proofs.upgrades[k][j], tempKuaObj.proofs.upgrades[k][j].freeExtra);
            if (!tempKuaObj.active.proofs.upgrades[k][j]) {
                tempKuaObj.proofs.upgrades[k][j].trueLevel = D(0);
            }

            scal = D(playerKuaObj.proofs.upgrades[k][j]);
            if (k === 'kp' && (j >= 0 && j <= 2)) {
                scal = scal.sub(tempKuaObj.proofs.upgrades.skp[2].effect);
            }
            scal = scal.max(0);
            tempKuaObj.proofs.upgrades[k][j].cost = KUA_PROOF_UPGS[k][j].cost(scal);

            tempKuaObj.proofs.upgrades[k][j].effect = KUA_PROOF_UPGS[k][j].effect(tempKuaObj.proofs.upgrades[k][j].trueLevel);

            NaNCheck(tempKuaObj.proofs.upgrades[k][j].effect, `KProof ${k} Upgrade #${j+1} had a NaN effect!`);
        }
    }

    tempKuaObj.proofs.canBuyUpgs.auto = false;
    for (let i = 0; i < Object.keys(KUA_PROOF_AUTO).length; i++) {
        for (let j = 0; j < KUA_PROOF_AUTO[Object.keys(KUA_PROOF_AUTO)[i] as KuaProofAutoTypes].length; j++) {
            k = Object.keys(KUA_PROOF_AUTO)[i] as KuaProofAutoTypes;

            tempKuaObj.proofs.canBuyUpgs.auto = tempKuaObj.proofs.canBuyUpgs.auto || (Decimal.gte(playerKuaObj.proofs.strange.amount, KUA_PROOF_AUTO[k][j].cost) && !playerKuaObj.proofs.automationBought[k][j]);
            tempKuaObj.proofs.canBuyUpg = tempKuaObj.proofs.canBuyUpg || (Decimal.gte(playerKuaObj.proofs.strange.amount, KUA_PROOF_AUTO[k][j].cost) && !playerKuaObj.proofs.automationBought[k][j]);
            tempKuaObj.canBuyUpg = tempKuaObj.canBuyUpg || (Decimal.gte(playerKuaObj.proofs.strange.amount, KUA_PROOF_AUTO[k][j].cost) && !playerKuaObj.proofs.automationBought[k][j]);
        }
    }

    if (playerKuaObj.proofs.automationBought.other[0] && playerKuaObj.proofs.automationEnabled.other[0]) {
        resetFromSKP(false, playerKuaObj.proofs.automationBought.other[1] && playerKuaObj.proofs.automationEnabled.other[1], playerKuaObj.proofs.automationBought.other[2] && playerKuaObj.proofs.automationEnabled.other[2], delta);
    }

    tempKuaObj.proofs.exp = D(1);
    tempKuaObj.proofs.exp = tempKuaObj.proofs.exp.add(tempKuaObj.proofs.upgrades.kp[0].effect);
    tempKuaObj.proofs.exp = tempKuaObj.proofs.exp.add(tempKuaObj.proofs.upgrades.kp[1].effect);
    tempKuaObj.proofs.exp = tempKuaObj.proofs.exp.add(tempKuaObj.proofs.fkpEff);
    tempKuaObj.proofs.exp = tempKuaObj.proofs.exp.add(GROWAN_UPGS.overall[1].eff!.value.kpe);
    tempKuaObj.proofs.exp = tempKuaObj.proofs.exp.mul(tempKuaObj.proofs.upgrades.kp[2].effect);
    NaNCheck(tempKuaObj.proofs.exp, `KProof's exponent turned into NaN!`)

    tempKuaObj.proofs.skpExp = getStrangeKPExp(playerKuaObj.proofs.strange.hiddenExp);
    tempKuaObj.proofs.fkpExp = getFinickyKPExp(playerKuaObj.proofs.finicky.hiddenExp);

    if (player.value.prog.unlocks.kproofs.main && tempKuaObj.active.proofs.gain) {
        // why did i do this
        let fuck = playerKuaObj.proofs.amount;
        data = Decimal.max(playerKuaObj.proofs.amount, 0).add(1).root(tempKuaObj.proofs.exp).add(tempKuaObj.proofs.speed.mul(delta)).pow(tempKuaObj.proofs.exp).sub(1);
        calc = Decimal.max(playerKuaObj.proofs.amount, 0).add(1).root(tempKuaObj.proofs.exp).add(tempKuaObj.proofs.speed).pow(tempKuaObj.proofs.exp).sub(1);

        const softcaps = {
            prevEff: calc,
            scal: getSCSLAttribute('kp', false)
        }

        if (data.gte(softcaps.scal[1].start)) {
            data = scale(data, 2, true, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
            calc = scale(calc, 2, true, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
            fuck = scale(fuck, 2, true, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
            playerKuaObj.proofs.amount = scale(playerKuaObj.proofs.amount, 2, true, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
            setSCSLEffectDisp('kp', false, 1, `${format(calc.log(softcaps.prevEff), 3)}√`);
        }

        if (data.gte(softcaps.scal[0].start)) {
            data = scale(data, 0, true, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
            calc = scale(calc, 0, true, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
            fuck = scale(fuck, 0, true, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
            playerKuaObj.proofs.amount = scale(playerKuaObj.proofs.amount, 0, true, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
            setSCSLEffectDisp('kp', false, 0, `/${format(calc.div(softcaps.prevEff), 3)}`);
        }

        if (inChallenge("df")) {
            data = scale(data, 2.1, true, 10, 1, 0.75);
            calc = scale(calc, 2.1, true, 10, 1, 0.75);
            fuck = scale(fuck, 2.1, true, 10, 1, 0.75);
            playerKuaObj.proofs.amount = scale(playerKuaObj.proofs.amount, 2.1, true, 10, 1, 0.75);
        }

        fuck = Decimal.max(fuck, 0).add(1).root(tempKuaObj.proofs.exp).add(tempKuaObj.proofs.speed).pow(tempKuaObj.proofs.exp).sub(1);
        playerKuaObj.proofs.amount = Decimal.max(playerKuaObj.proofs.amount, 0).add(1).root(tempKuaObj.proofs.exp).add(tempKuaObj.proofs.speed.mul(delta)).pow(tempKuaObj.proofs.exp).sub(1);

        if (inChallenge("df")) {
            data = scale(data, 2.1, false, 10, 1, 0.75);
            calc = scale(calc, 2.1, false, 10, 1, 0.75);
            fuck = scale(fuck, 2.1, false, 10, 1, 0.75);
            playerKuaObj.proofs.amount = scale(playerKuaObj.proofs.amount, 2.1, false, 10, 1, 0.75);
        }

        if (data.gte(softcaps.scal[0].start)) {
            data = scale(data, 0, false, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
            calc = scale(calc, 0, false, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
            fuck = scale(fuck, 0, false, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
            playerKuaObj.proofs.amount = scale(playerKuaObj.proofs.amount, 0, false, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
        }

        if (data.gte(softcaps.scal[1].start)) {
            data = scale(data, 2, false, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
            calc = scale(calc, 2, false, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
            fuck = scale(fuck, 2, false, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
            playerKuaObj.proofs.amount = scale(playerKuaObj.proofs.amount, 2, false, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
        }

        tempKuaObj.proofs.expPerSec = fuck.div(playerKuaObj.proofs.amount);
    }
}

export const updateKuaBlessings = (delta: DecimalSource) => {
    const tempKuaObj = tmp.value.kua;
    const playerKuaObj = player.value.prog.kua;
    let i, generate, data;
    playerKuaObj.blessings.clickCooldown = Decimal.sub(playerKuaObj.blessings.clickCooldown, delta);

    tempKuaObj.blessings.rank = KUA_BLESS_TIER.rank.rounded.value;
    tempKuaObj.blessings.tier = KUA_BLESS_TIER.tier.rounded.value;
    tempKuaObj.blessings.tetr = KUA_BLESS_TIER.tetr.rounded.value;

    resetFactor([3, 4]);
    resetFactor([3, 5]);

    tempKuaObj.blessings.perClick = D(1);
    tempKuaObj.blessings.perSec = D(2);
    setFactor(0, [3, 4], "Base", `${format(0.1, 2)}`, `${format(tempKuaObj.blessings.perClick, 2)}`, true);
    setFactor(0, [3, 5], "Base", `${format(1, 2)}`, `${format(tempKuaObj.blessings.perSec, 2)}`, true);

    tempKuaObj.blessings.perClick = tempKuaObj.blessings.perClick.mul(KUA_BLESS_TIER.rank.effects.kuaBlessGainActive.value);
    tempKuaObj.blessings.perSec = tempKuaObj.blessings.perSec.mul(KUA_BLESS_TIER.rank.effects.kuaBlessGainIdle.value);
    setFactor(1, [3, 4], "KBlessing Rank", `×${format(KUA_BLESS_TIER.rank.effects.kuaBlessGainActive.value, 2)}`, `${format(tempKuaObj.blessings.perClick, 2)}`, true, "kb");
    setFactor(1, [3, 5], "KBlessing Rank", `×${format(KUA_BLESS_TIER.rank.effects.kuaBlessGainIdle.value, 2)}`, `${format(tempKuaObj.blessings.perSec, 2)}`, true, "kb");

    tempKuaObj.blessings.perClick = tempKuaObj.blessings.perClick.mul(KUA_BLESS_UPGS[1].eff.value[1]);
    tempKuaObj.blessings.perSec = tempKuaObj.blessings.perSec.mul(KUA_BLESS_UPGS[1].eff.value[1]);
    setFactor(2, [3, 4], "KBlessing Upgrade 1", `×${format(KUA_BLESS_UPGS[1].eff.value[1], 2)}`, `${format(tempKuaObj.blessings.perClick, 2)}`, Decimal.gte(playerKuaObj.blessings.upgrades[1], 6), "kb");
    setFactor(2, [3, 5], "KBlessing Upgrade 1", `×${format(KUA_BLESS_UPGS[1].eff.value[1], 2)}`, `${format(tempKuaObj.blessings.perSec, 2)}`, Decimal.gte(playerKuaObj.blessings.upgrades[1], 6), "kb");

    tempKuaObj.blessings.perClick = tempKuaObj.blessings.perClick.mul(KUA_BLESS_TIER.tetr.effects.pr2Eff.value);
    tempKuaObj.blessings.perSec = tempKuaObj.blessings.perSec.mul(KUA_BLESS_TIER.tetr.effects.pr2Eff.value);
    setFactor(3, [3, 4], "KBlessing Tetr", `×${format(KUA_BLESS_TIER.tetr.effects.pr2Eff.value, 2)}`, `${format(tempKuaObj.blessings.perClick, 2)}`, Decimal.gte(tempKuaObj.blessings.tetr, 1), "kb");
    setFactor(3, [3, 5], "KBlessing Tetr", `×${format(KUA_BLESS_TIER.tetr.effects.pr2Eff.value, 2)}`, `${format(tempKuaObj.blessings.perSec, 2)}`, Decimal.gte(tempKuaObj.blessings.tetr, 1), "kb");

    tempKuaObj.blessings.perClick = tempKuaObj.blessings.perClick.mul(tempKuaObj.effects.bless);
    tempKuaObj.blessings.perSec = tempKuaObj.blessings.perSec.mul(tempKuaObj.effects.bless);
    setFactor(4, [3, 4], "Kuaraniai Upgrade 2", `×${format(tempKuaObj.effects.bless, 2)}`, `${format(tempKuaObj.blessings.perClick, 2)}`, playerKuaObj.upgrades >= 2, "kua");
    setFactor(4, [3, 5], "Kuaraniai Upgrade 2", `×${format(tempKuaObj.effects.bless, 2)}`, `${format(tempKuaObj.blessings.perSec, 2)}`, playerKuaObj.upgrades >= 2, "kua");

    tempKuaObj.blessings.perClick = tempKuaObj.blessings.perClick.mul(tempKuaObj.proofs.upgrades.effect[2].effect);
    tempKuaObj.blessings.perSec = tempKuaObj.blessings.perSec.mul(tempKuaObj.proofs.upgrades.effect[2].effect);
    setFactor(5, [3, 4], "Holy Process", `×${format(tempKuaObj.proofs.upgrades.effect[2].effect, 2)}`, `${format(tempKuaObj.blessings.perClick, 2)}`, Decimal.gt(tempKuaObj.proofs.upgrades.effect[2].effect, 1), "kp");
    setFactor(5, [3, 5], "Holy Process", `×${format(tempKuaObj.proofs.upgrades.effect[2].effect, 2)}`, `${format(tempKuaObj.blessings.perSec, 2)}`, Decimal.gt(tempKuaObj.proofs.upgrades.effect[2].effect, 1), "kp");

    tempKuaObj.blessings.perClick = tempKuaObj.blessings.perClick.mul(getColResEffect(5));
    tempKuaObj.blessings.perSec = tempKuaObj.blessings.perSec.mul(getColResEffect(4));
    setFactor(6, [3, 4], "Compliance", `×${format(getColResEffect(5), 2)}`, `${format(tempKuaObj.blessings.perClick, 2)}`, Decimal.gte(timesCompleted('im'), 1e33), "col");
    setFactor(6, [3, 5], "Defiance", `×${format(getColResEffect(4), 2)}`, `${format(tempKuaObj.blessings.perSec, 2)}`, Decimal.gte(timesCompleted('im'), 1e33), "col");

    tempKuaObj.blessings.perClick = tempKuaObj.blessings.perClick.mul(ACHIEVEMENT_DATA[3].effect.value);
    tempKuaObj.blessings.perSec = tempKuaObj.blessings.perSec.mul(ACHIEVEMENT_DATA[3].effect.value);
    setFactor(7, [3, 4], "Achievement Tier 4", `×${format(ACHIEVEMENT_DATA[3].effect.value, 2)}`, `${format(tempKuaObj.blessings.perClick, 2)}`, Decimal.gte(ACHIEVEMENT_DATA[3].effect.value, 1), "ach");
    setFactor(7, [3, 5], "Achievement Tier 4", `×${format(ACHIEVEMENT_DATA[3].effect.value, 2)}`, `${format(tempKuaObj.blessings.perSec, 2)}`, Decimal.gte(ACHIEVEMENT_DATA[3].effect.value, 1), "ach");

    if (player.value.prog.layer4.gro.upgrades.idle.includes(0)) {
        tempKuaObj.blessings.perSec = tempKuaObj.blessings.perSec.mul(10);
        pushFactor([3, 5], "Grōwan Idle Upg. 1", `×${format(10)}`, `${format(tempKuaObj.blessings.perSec, 2)}`, "growan");
    }

    if (player.value.prog.layer4.gro.upgrades.active.includes(0)) {
        tempKuaObj.blessings.perClick = tempKuaObj.blessings.perClick.mul(10);
        pushFactor([3, 5], "Grōwan Active Upg. 1", `×${format(10)}`, `${format(tempKuaObj.blessings.perClick, 2)}`, "growan");
    }

    data = {
        oldGain: tempKuaObj.blessings.perClick,
        oldKB: D(0),
        newKB: D(0),
    };
    data.oldKB = Decimal.max(playerKuaObj.blessings.amount, 1);

    if (inChallenge("df")) {
        data.newKB = scale(
            scale(
                scale(
                    scale(
                        data.oldKB.max(1).log10().add(1), 0.2, true, 1, 1, Decimal.pow(0.9, challengeDepth("df"))
                    ).sub(1).pow10().add(tempKuaObj.blessings.perClick).log10().add(1), 0.2, false, 1, 1, Decimal.pow(0.9, challengeDepth("df"))
                ).sub(1).pow10(), 0.2, true, 1, 1, Decimal.pow(0.75, challengeDepth("df"))
            ).add(tempKuaObj.blessings.perClick), 0.2, false, 1, 1, Decimal.pow(0.75, challengeDepth("df"))
        );

        tempKuaObj.blessings.perClick = data.newKB.sub(data.oldKB).max(0.1);
    }
    setFactor(7, [3, 4], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, tempKuaObj.blessings.perClick), 2)}`, `${format(tempKuaObj.blessings.perClick, 2)}`, inChallenge("df"), "col");

    data = {
        prevEff: tempKuaObj.blessings.perClick,
        scal: getSCSLAttribute('kba', false)
    }

    tempKuaObj.blessings.perClick = scale(tempKuaObj.blessings.perClick, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
    setSCSLEffectDisp('kba', false, 0, `${format(data.prevEff.log(tempKuaObj.blessings.perClick), 3)}√`);
    setFactor(8, [3, 4], "Softcap", `softcap(${format(data.prevEff)})`, `${format(tempKuaObj.blessings.perClick, 2)}`, Decimal.gt(tempKuaObj.blessings.perClick, data.scal[0].start), "sc1");

    data = {
        oldGain: tempKuaObj.blessings.perSec,
        oldKB: D(0),
        newKB: D(0),
    };
    data.oldKB = Decimal.max(playerKuaObj.blessings.amount, 1);

    if (inChallenge("df")) {
        data.newKB = scale(
            scale(
                scale(
                    scale(
                        data.oldKB.max(1).log10().add(1), 0.2, true, 1, 1, Decimal.pow(0.9, challengeDepth("df"))
                    ).sub(1).pow10().add(tempKuaObj.blessings.perSec).log10().add(1), 0.2, false, 1, 1, Decimal.pow(0.9, challengeDepth("df"))
                ).sub(1).pow10(), 0.2, true, 1, 1, Decimal.pow(0.75, challengeDepth("df"))
            ).add(tempKuaObj.blessings.perSec), 0.2, false, 1, 1, Decimal.pow(0.75, challengeDepth("df"))
        );
        tempKuaObj.blessings.perSec = data.newKB.sub(data.oldKB).max(0.1);
    }
    setFactor(7, [3, 5], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, tempKuaObj.blessings.perSec), 2)}`, `${format(tempKuaObj.blessings.perSec, 2)}`, inChallenge("df"), "col");

    data = {
        prevEff: tempKuaObj.blessings.perSec,
        scal: getSCSLAttribute('kbi', false)
    }

    tempKuaObj.blessings.perSec = scale(tempKuaObj.blessings.perSec, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
    setSCSLEffectDisp('kbi', false, 0, `${format(data.prevEff.log(tempKuaObj.blessings.perSec), 3)}√`);
    setFactor(8, [3, 5], "Softcap", `softcap(${format(data.prevEff)})`, `${format(tempKuaObj.blessings.perSec, 2)}`, Decimal.gt(tempKuaObj.blessings.perSec, data.scal[0].start), "sc1");

    NaNCheck(tempKuaObj.blessings.perClick, 'KB per click is NaN!');
    NaNCheck(tempKuaObj.blessings.perSec, 'KB per second is NaN!');

    if (!tempKuaObj.active.blessings.gain) {
        tempKuaObj.blessings.perSec = D(0);
        tempKuaObj.blessings.perClick = D(0);
    }

    tempKuaObj.blessings.canBuyUpg = false;
    for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
        tempKuaObj.blessings.upgrades[i].canBuy = Decimal.gte(playerKuaObj.blessings.amount, KUA_BLESS_UPGS[i].cost.value);
        tempKuaObj.blessings.canBuyUpg = tempKuaObj.blessings.canBuyUpg || Decimal.gte(playerKuaObj.blessings.amount, KUA_BLESS_UPGS[i].cost.value);
        tempKuaObj.canBuyUpg = tempKuaObj.canBuyUpg || tempKuaObj.blessings.upgrades[i].canBuy;
    }

    if (player.value.prog.unlocks.kblessings) {
        generate = tempKuaObj.blessings.perSec.mul(delta);
        playerKuaObj.blessings.amount = Decimal.add(playerKuaObj.blessings.amount, generate);
        playerKuaObj.blessings.bestInCol = Decimal.max(playerKuaObj.blessings.bestInCol, playerKuaObj.blessings.amount);
        playerKuaObj.blessings.bestInLayer4 = Decimal.max(playerKuaObj.blessings.bestInLayer4, playerKuaObj.blessings.amount);
    }

    i = Decimal.max(playerKuaObj.blessings.bestInCol, 0);
    i = Decimal.mul(i, KUA_BLESS_TIER.tier.effects.kuaBlessEff.value)
    if (!tempKuaObj.active.blessings.effects) {
        i = D(0);
    }
    tempKuaObj.blessings.upg1Base = Decimal.gte(i, 1)
        ? Decimal.log10(i).add(1).mul(0.01)
        : Decimal.mul(i, 0.01)
    tempKuaObj.blessings.upg2Base = Decimal.gte(i, 1)
        ? Decimal.log10(i).add(1).mul(0.02)
        : Decimal.mul(i, 0.02)
    tempKuaObj.blessings.kuaEff = Decimal.add(i, 1).log10().mul(0.75).add(1).pow(0.9).sub(1).pow10();
}

export const updateKuaEnhancers = (delta: DecimalSource) => {
    const tempKuaObj = tmp.value.kua;
    const playerKuaObj = player.value.prog.kua;
    let j, decayExp, generate;
    tempKuaObj.sourcesCanBuy = [false, false, false];
    tempKuaObj.totalEnhSources = D(0);
    tempKuaObj.enhSourcesUsed = D(0);
    tempKuaObj.enhShowSlow = false;

    decayExp = D(10);
    decayExp = decayExp.add(0); // just to make the compiler happy
    tempKuaObj.enhSlowdown = decayExp.div(10).mul(1e2);
    for (let i = 0; i < KUA_ENHANCERS.sources.length; i++) {
        tempKuaObj.sourcesCanBuy[i] = Decimal.gte(
            KUA_ENHANCERS.sources[i].source,
            KUA_ENHANCERS.sources[i].cost(playerKuaObj.enhancers.sources[i])
        );
    }

    j = D(0);
    for (let i = 0; i < KUA_ENHANCERS.enhances.length; i++) {
        j = j.add(Decimal.div(playerKuaObj.enhancers.enhancePow[i], 100));
    }

    for (let i = 0; i < KUA_ENHANCERS.enhances.length; i++) {
        tempKuaObj.trueEnhPower[i] = Decimal.div(playerKuaObj.enhancers.enhancePow[i], Decimal.max(j, playerKuaObj.enhancers.xpSpread)).div(100);
        tempKuaObj.totalEnhSources = Decimal.add(tempKuaObj.totalEnhSources, playerKuaObj.enhancers.sources[i]);
        tempKuaObj.enhSourcesUsed = Decimal.add(tempKuaObj.enhSourcesUsed, playerKuaObj.enhancers.enhancers[i]);

        tempKuaObj.baseSourceXPGen[i] = Decimal.pow(playerKuaObj.enhancers.enhancers[i], 1.5);

        generate = tempKuaObj.baseSourceXPGen[i].mul(delta);

        const lastXP = playerKuaObj.enhancers.enhanceXP[i];
        playerKuaObj.enhancers.enhanceXP[i] = Decimal.add(playerKuaObj.enhancers.enhanceXP[i], 1).root(decayExp).sub(1).mul(decayExp).exp().sub(1).add(generate).add(1).ln().div(decayExp).add(1).pow(decayExp).sub(1);
        tempKuaObj.kuaTrueSourceXPGen[i] = Decimal.sub(playerKuaObj.enhancers.enhanceXP[i], lastXP).div(delta);

        tempKuaObj.enhShowSlow = tempKuaObj.enhShowSlow || Decimal.gte(playerKuaObj.enhancers.enhanceXP[i], 10);
    }
}

export const updateKuaBasics = (delta: DecimalSource) => {
    const tempKuaObj = tmp.value.kua;
    const playerKuaObj = player.value.prog.kua;
    let i, j, k, data, generate;
    tempKuaObj.effectiveKS = Decimal.max(playerKuaObj.kshards.totalInLayer4, 0);
    tempKuaObj.effectiveKP = Decimal.max(playerKuaObj.kpower.totalInLayer4, 0);

    tempKuaObj.effectiveKS = tempKuaObj.effectiveKS.mul(KUA_BLESS_UPGS[0].eff.value[1]);
    tempKuaObj.effectiveKP = tempKuaObj.effectiveKP.mul(KUA_BLESS_UPGS[0].eff.value[1]);
    
    if (getKuaUpgrade('p', 17)) {
        tempKuaObj.effectiveKS = tempKuaObj.effectiveKS.pow(KUA_UPGRADES.KPower[16].eff!.value);
        tempKuaObj.effectiveKP = tempKuaObj.effectiveKP.pow(KUA_UPGRADES.KPower[16].eff2!.value);
    }

    tempKuaObj.effectiveKS = tempKuaObj.effectiveKS.pow(tempKuaObj.proofs.upgrades.effect[1].effect);
    tempKuaObj.effectiveKP = tempKuaObj.effectiveKP.pow(tempKuaObj.proofs.upgrades.effect[1].effect);

    NaNCheck(tempKuaObj.effectiveKS, 'Effective KShards are NaN!');
    NaNCheck(tempKuaObj.effectiveKP, 'Effective KPower is NaN!');

    playerKuaObj.timeInKua = Decimal.add(playerKuaObj.timeInKua, delta);

    tempKuaObj.req = D(1e10);
    tempKuaObj.exp = D(3);

    tempKuaObj.exp = tempKuaObj.exp.add(getColResEffect(2));
    tempKuaObj.exp = tempKuaObj.exp.add(KUA_BLESS_UPGS[2].eff.value[1]);

    tempKuaObj.effectivePrai = Decimal.add(player.value.prog.main.prai.amount, tmp.value.main.prai.pending);
    tempKuaObj.canDo = tempKuaObj.effectivePrai.gte(tempKuaObj.req) && tempKuaObj.active.gain;
    tempKuaObj.pending = D(0);
    if (tempKuaObj.canDo) {
        tempKuaObj.pending = tempKuaObj.effectivePrai.log(tempKuaObj.req);
        // this is to catch an edge-case, where the value above gets fucked because of floating point errors if this is way lower than the kua exponent, so i have to make an approximation here
        if (tempKuaObj.exp.div(tempKuaObj.pending).gte(1e9)) {
            // yes i'm not joking this reduces down to PRai ^1.5 to exponent when kua exp is high enough
            tempKuaObj.pending = tempKuaObj.pending.pow(1.5).sub(5).pow10();
        } else {
            tempKuaObj.pending = tempKuaObj.pending.ln().mul(1.5).div(tempKuaObj.exp).add(1).pow(tempKuaObj.exp).sub(5).pow10();
        }
    } 

    setFactor(0, [3, 1], "Base", `~10^(ln(log(${format(tempKuaObj.effectivePrai)})))^${format(tempKuaObj.exp, 2)}-${format(5)}) (approx.)`, `${format(tempKuaObj.pending, 4)}`, true);
    
    if (getKuaUpgrade("s", 1)) {
        tempKuaObj.pending = tempKuaObj.pending.mul(1.5);
    }
    setFactor(1, [3, 1], "KShard Upgrade 1", `×${format(1.5, 2)}`, `${format(tempKuaObj.pending, 4)}`, getKuaUpgrade("s", 1), "kua");

    if (getKuaUpgrade("s", 12)) {
        tempKuaObj.pending = tempKuaObj.pending.mul(KUA_UPGRADES.KShards[11].eff!.value);
    }
    setFactor(2, [3, 1], "KShard Upgrade 12", `×${format(KUA_UPGRADES.KShards[11].eff!.value, 2)}`, `${format(tempKuaObj.pending, 4)}`, getKuaUpgrade("s", 12), "kua");

    if (Decimal.gte(timesCompleted("df"), 1)) {
        tempKuaObj.pending = tempKuaObj.pending.mul(2);
    }
    setFactor(3, [3, 1], `Decaying Feeling Completion ×${format(timesCompleted('df'))}`, `×${format(2, 2)}`, `${format(tempKuaObj.pending, 1)}`, Decimal.gte(timesCompleted("df"), 1), "col");

    if (Decimal.gte(playerKuaObj.blessings.upgrades[2], 1)) {
        tempKuaObj.pending = tempKuaObj.pending.mul(KUA_BLESS_UPGS[2].eff.value[0]);
    }
    setFactor(4, [3, 1], `KBlessing Upgrade 3`, `×${format(KUA_BLESS_UPGS[2].eff.value[0], 2)}`, `${format(tempKuaObj.pending, 1)}`, Decimal.gte(playerKuaObj.blessings.upgrades[2], 1), "kb");

    if (Decimal.gt(player.value.prog.layer4.gro.totalAmt, 0)) {
        tempKuaObj.pending = tempKuaObj.pending.mul(tmp.value.layer4.growan.eff.kuaGain);
    }
    setFactor(5, [3, 1], `Grōwan Effect`, `×${format(tmp.value.layer4.growan.eff.kuaGain, 2)}`, `${format(tempKuaObj.pending, 1)}`, Decimal.gt(player.value.prog.layer4.gro.totalAmt, 0), "growan");

    data = {
        oldGain: tempKuaObj.pending,
        oldKua: D(0),
        newKua: D(0),
    };
    data.oldKua = Decimal.max(playerKuaObj.amount, 1e-4);

    if (inChallenge("df")) {
        data.newKua = scale(scale(data.oldKua, 0.2, true, 1e-4, 1, Decimal.pow(0.75, challengeDepth("df"))).add(tempKuaObj.pending), 0.2, false, 1e-4, 1, Decimal.pow(0.75, challengeDepth("df")));

        tempKuaObj.pending = data.newKua.sub(data.oldKua);
    }
    setFactor(6, [3, 1], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, tempKuaObj.pending), 2)}`, `${format(tempKuaObj.pending, 4)}`, inChallenge("df"), "col");

    if (playerKuaObj.auto) {
        generate = tempKuaObj.pending.mul(delta).mul(0.01);
        playerKuaObj.amount = Decimal.add(playerKuaObj.amount, generate);
    }

    tempKuaObj.effects = {
        kshardPassive: D(1),
        kpowerPassive: D(1),
        upg4: D(1),
        upg5: D(1),
        upg6: D(0),
        upg1Scaling: D(1),
        upg1SuperScaling: D(1),
        ptPower: D(1),
        upg2Softcap: D(1),
        kshardPrai: D(1),
        kpower: D(1),
        pts: D(1),
        bless: D(1)
    };

    k = D(1);
    setFactor(0, [3, 0], "Base", `${format(playerKuaObj.amount, 4)}`, `(${format(Decimal.pow(playerKuaObj.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, true);

    if (player.value.prog.unlocks.kblessings) {
        k = k.mul(tempKuaObj.blessings.kuaEff.log(Decimal.pow(playerKuaObj.amount, k)).add(1))
    }
    setFactor(1, [3, 0], "KBlessings", `×${format(tempKuaObj.blessings.kuaEff, 2)}`, `(${format(Decimal.pow(playerKuaObj.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, player.value.prog.unlocks.kblessings, "kb");

    k = k.mul(ACHIEVEMENT_DATA[1].effect.value);
    setFactor(2, [3, 0], "Achievement Tier 2", `^${format(ACHIEVEMENT_DATA[1].effect.value, 3)}`, `(${format(Decimal.pow(playerKuaObj.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, true, "ach");

    if (getKuaUpgrade("s", 11)) {
        k = k.mul(KUA_UPGRADES.KShards[10].eff!.value);
    }
    setFactor(3, [3, 0], "KShard Upgrade 11", `^${format(KUA_UPGRADES.KShards[10].eff!.value, 3)}`, `(${format(Decimal.pow(playerKuaObj.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, getKuaUpgrade("s", 11), "kua");

    if (getKuaUpgrade("p", 15)) {
        k = k.mul(1.05);
    }
    setFactor(4, [3, 0], "KPower Upgrade 15", `^${format(1.05, 3)}`, `(${format(Decimal.pow(playerKuaObj.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, getKuaUpgrade("p", 15), "kua");
    
    k = Decimal.pow(playerKuaObj.amount, k);

    if (tempKuaObj.active.effects) {
        // * theres probably a better way to do this
        // no requirements for this, no need to lump them in the ones with conditionals
        tempKuaObj.effects.upg1Scaling = Decimal.max(player.value.prog.main.points, 0).add(1).log10().pow(0.6).div(200).mul(Decimal.max(k, 0).mul(1e4).add(1).pow(2 / 3).sub(1)).add(1).log10().add(1);
        if (getKuaUpgrade("p", 3)) {
            tempKuaObj.effects.upg1Scaling = Decimal.max(player.value.prog.main.points, 0).add(1).pow(0.022).mul(Decimal.max(k, 0).mul(10).add(1).pow(0.75).sub(1)).add(1).log10().add(1).max(tempKuaObj.effects.upg1Scaling);
        }

        let exp = D(1);

        if (getKuaUpgrade("k", 3)) { exp = exp.add(0.25); }
        if (getKuaUpgrade("k", 4)) { exp = exp.add(0.25); }
        if (getKuaUpgrade("k", 5)) { exp = exp.add(0.25); }

        exp = exp.mul(tempKuaObj.proofs.upgrades.effect[4].effect)

        // pow ^exp
        // ^2 to exponent
        // ^0.9 to 2nd exponent
        tempKuaObj.effects.kshardPassive = Decimal.max(tempKuaObj.effectiveKS, 0.01).mul(1e3).log10().pow(2).sub(1).pow10().pow(0.05).pow(exp).log10().add(1).log10().add(1).pow(0.9).sub(1).pow10().sub(1).pow10();
        tempKuaObj.effects.kpowerPassive = Decimal.max(tempKuaObj.effectiveKP, 0.01).mul(1e3).log10().pow(2).sub(1).pow10().pow(0.05).pow(exp).log10().add(1).log10().add(1).pow(0.9).sub(1).pow10().sub(1).pow10();

        tempKuaObj.effects.upg4 = Decimal.gt(k, 0)
            ? Decimal.log10(k).add(4).div(13).mul(7).add(1).cbrt().sub(4).pow10().add(1)
            : D(1);

        tempKuaObj.effects.upg5 = Decimal.gt(playerKuaObj.kshards.amount, 0)
            ? Decimal.pow(20, Decimal.log10(playerKuaObj.kshards.amount).add(2).div(13)).div(1e3).add(1)
            : D(1);

        tempKuaObj.effects.upg6 = Decimal.gt(playerKuaObj.kpower.amount, 1)
            ? Decimal.log10(playerKuaObj.kpower.amount)
                    .div(13)
                    .mul(7)
                    .add(1)
                    .cbrt()
                    .sub(6)
                    .pow10()
            : D(0);

        tempKuaObj.effects.upg1SuperScaling = getKuaUpgrade("p", 6)
            ? tempKuaObj.effects.upg1Scaling.sqrt().sub(1).div(16).add(1)
            : D(1);

        tempKuaObj.effects.ptPower = getKuaUpgrade("p", 3)
            ? Decimal.max(k, 0).add(1).log2().add(1).sqrt().sub(1).mul(0.01).add(1) // 1 = ^1, 2 = ^1.01, 16 = ^1.02, 256 = ^1.03, 65,536 = ^1.04 ...
            : D(1);

        tempKuaObj.effects.upg2Softcap = getKuaUpgrade("s", 6)
            ? Decimal.max(k, 1e2).div(1e2).pow(7)
            : D(1);

        tempKuaObj.effects.kshardPrai = getKuaUpgrade("s", 10)
            ? Decimal.max(k, 10).log10().log10().div(4).add(1).pow(2.5)
            : D(1);

        tempKuaObj.effects.kpower = getKuaUpgrade("s", 10)
            ? Decimal.max(k, 10).log10().sub(1).div(8).pow10()
            : D(1);

        tempKuaObj.effects.pts = getKuaUpgrade("s", 7)
            ? Decimal.max(k, 1).pow(Decimal.max(player.value.prog.main.prai.timeInPRai, 0).add(1).ln().mul(2).add(1).sqrt())
            : D(1);

        tempKuaObj.effects.bless = getKuaUpgrade("k", 2)
            ? Decimal.max(k, 1e8).log10().cbrt().div(2).sub(1).pow10()
            : D(1);
    }

    i = D(0);
    if (tempKuaObj.active.kshards.gain) {
        i = D(playerKuaObj.amount);
        setFactor(0, [3, 2], "Base", `${format(playerKuaObj.amount, 4)}`, `${format(i, 3)}`, true);
        
        i = i.pow(tempKuaObj.proofs.upgrades.effect[7].effect);
        setFactor(1, [3, 2], "Constructive Interference", `^${format(tempKuaObj.proofs.upgrades.effect[7].effect, 3)}`, `${format(i, 3)}`, Decimal.gt(tempKuaObj.proofs.upgrades.effect[7].effect, 1), "kp");

        if (getKuaUpgrade("p", 1)) {
            i = i.mul(2.5);
        }
        setFactor(2, [3, 2], "KPower Upgrade 1", `×${format(2.5, 2)}`, `${format(i, 3)}`, getKuaUpgrade("p", 1), "kua");

        if (getKuaUpgrade("s", 13)) {
            i = i.mul(KUA_UPGRADES.KShards[12].eff!.value);
        }
        setFactor(3, [3, 2], "KShard Upgrade 13", `×${format(KUA_UPGRADES.KShards[12].eff!.value, 2)}`, `${format(i, 3)}`, getKuaUpgrade("s", 13), "kua");

        if (Decimal.gte(timesCompleted("df"), 1)) {
            i = i.mul(2);
        }
        setFactor(4, [3, 2], `Decaying Feeling Completion ×${format(timesCompleted('df'))}`, `×${format(2, 2)}`, `${format(i, 3)}`, Decimal.gte(timesCompleted("df"), 1), "col");

        if (Decimal.gte(playerKuaObj.blessings.upgrades[2], 1)) {
            i = i.mul(KUA_BLESS_UPGS[2].eff.value[2]);
        }
        setFactor(5, [3, 2], `KBlessing Upgrade 3`, `×${format(KUA_BLESS_UPGS[2].eff.value[2], 2)}`, `${format(i, 3)}`, Decimal.gte(playerKuaObj.blessings.upgrades[2], 12), "kb");

        if (Decimal.gte(playerKuaObj.blessings.upgrades[3], 1)) {
            i = i.mul(KUA_BLESS_UPGS[3].eff.value[0]);
        }
        setFactor(6, [3, 2], `KBlessing Upgrade 4`, `×${format(KUA_BLESS_UPGS[3].eff.value[0], 2)}`, `${format(i, 3)}`, Decimal.gte(playerKuaObj.blessings.upgrades[3], 1), "kb");

        if (Decimal.gte(playerKuaObj.blessings.upgrades[3], 6)) {
            i = i.mul(Decimal.max(playerKuaObj.kpower.amount, 1).log10().add(1).pow(KUA_BLESS_UPGS[3].eff.value[1]));
        }
        setFactor(7, [3, 2], `KBlessing Upgrade 4`, `×log10(${format(playerKuaObj.kpower.amount, 2)})^${format(KUA_BLESS_UPGS[3].eff.value[1], 2)}`, `${format(i, 3)}`, Decimal.gte(playerKuaObj.blessings.upgrades[3], 6), "kb");

        data = {
            oldGain: i,
            oldKua: D(0),
            newKua: D(0),
        };
        data.oldKua = Decimal.max(playerKuaObj.amount, 1e-4);

        if (inChallenge("df")) {
            data.newKua = scale(scale(data.oldKua, 0.2, true, 1e-4, 1, Decimal.pow(0.5, challengeDepth("df"))).add(i), 0.2, false, 1e-4, 1, Decimal.pow(0.5, challengeDepth("df")));

            i = data.newKua.sub(data.oldKua);
        }
        setFactor(8, [3, 2], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, i), 2)}`, `${format(i, 4)}`, inChallenge("df"), "col");
    }
    tempKuaObj.shardGen = i;

    i = D(0);
    if (tempKuaObj.active.kpower.gain) {
        i = D(playerKuaObj.kshards.amount);
        setFactor(0, [3, 3], "Base", `${format(playerKuaObj.kshards.amount, 4)}`, `${format(i, 3)}`, true);

        i = i.pow(tempKuaObj.proofs.upgrades.effect[7].effect);
        setFactor(1, [3, 3], "Constructive Interference", `^${format(tempKuaObj.proofs.upgrades.effect[7].effect, 3)}`, `${format(i, 3)}`, Decimal.gt(tempKuaObj.proofs.upgrades.effect[7].effect, 1), "kp");

        if (getKuaUpgrade("s", 10)) {
            i = i.mul(tempKuaObj.effects.kpower);
        }
        setFactor(2, [3, 3], "KShard Upgrade 10", `×${format(tempKuaObj.effects.kpower, 2)}`, `${format(i, 3)}`, getKuaUpgrade("s", 10), "kua");

        if (getKuaUpgrade("s", 14)) {
            i = i.mul(KUA_UPGRADES.KShards[13].eff!.value);
        }
        setFactor(3, [3, 3], "KShard Upgrade 14", `×${format(KUA_UPGRADES.KShards[13].eff!.value, 2)}`, `${format(i, 3)}`, getKuaUpgrade("s", 14), "kua");

        if (Decimal.gte(timesCompleted("df"), 1)) {
            i = i.mul(2);
        }
        setFactor(4, [3, 3], `Decaying Feeling Completion ×${format(timesCompleted('df'))}`, `×${format(2, 2)}`, `${format(i, 3)}`, Decimal.gte(timesCompleted("df"), 1), "col");

        if (Decimal.gte(playerKuaObj.blessings.upgrades[2], 1)) {
            i = i.mul(KUA_BLESS_UPGS[2].eff.value[2]);
        }
        setFactor(5, [3, 3], `KBlessing Upgrade 3`, `×${format(KUA_BLESS_UPGS[2].eff.value[2], 2)}`, `${format(i, 3)}`, Decimal.gte(playerKuaObj.blessings.upgrades[2], 12), "kb");

        if (Decimal.gte(playerKuaObj.blessings.upgrades[3], 1)) {
            i = i.mul(KUA_BLESS_UPGS[3].eff.value[0]);
        }
        setFactor(6, [3, 3], `KBlessing Upgrade 4`, `×${format(KUA_BLESS_UPGS[3].eff.value[0], 2)}`, `${format(i, 3)}`, Decimal.gte(playerKuaObj.blessings.upgrades[3], 1), "kb");

        if (Decimal.gte(playerKuaObj.blessings.upgrades[3], 6)) {
            i = i.mul(Decimal.max(playerKuaObj.kshards.amount, 1).log10().add(1).pow(KUA_BLESS_UPGS[3].eff.value[1]));
        }
        setFactor(7, [3, 3], `KBlessing Upgrade 4`, `×log10(${format(playerKuaObj.kshards.amount, 2)})^${format(KUA_BLESS_UPGS[3].eff.value[1], 2)}`, `${format(i, 3)}`, Decimal.gte(playerKuaObj.blessings.upgrades[3], 6), "kb");

        data = {
            oldGain: i,
            oldKua: D(0),
            newKua: D(0),
        };
        data.oldKua = Decimal.max(playerKuaObj.amount, 1e-4);

        if (inChallenge("df")) {
            data.newKua = scale(scale(data.oldKua, 0.2, true, 1e-4, 1, Decimal.pow(0.5, challengeDepth("df"))).add(i), 0.2, false, 1e-4, 1, Decimal.pow(0.5, challengeDepth("df")));

            i = data.newKua.sub(data.oldKua);
        }
        setFactor(8, [3, 3], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, i), 2)}`, `${format(i, 4)}`, inChallenge("df"), "col");
    }
    tempKuaObj.powGen = i;

    tempKuaObj.upgCanBuyUpg = false;
    for (let i = playerKuaObj.kshards.upgrades; i < KUA_UPGRADES.KShards.length; i++) {
        j = Decimal.gte(playerKuaObj.kshards.amount, KUA_UPGRADES.KShards[i].cost);
        tempKuaObj.upgCanBuyUpg = tempKuaObj.upgCanBuyUpg || j;
        tempKuaObj.canBuyUpg = tempKuaObj.canBuyUpg || j;
    }
    for (let i = playerKuaObj.kpower.upgrades; i < KUA_UPGRADES.KPower.length; i++) {
        j = Decimal.gte(playerKuaObj.kpower.amount, KUA_UPGRADES.KPower[i].cost);
        tempKuaObj.upgCanBuyUpg = tempKuaObj.upgCanBuyUpg || j;
        tempKuaObj.canBuyUpg = tempKuaObj.canBuyUpg || j;
    }
    for (let i = playerKuaObj.upgrades; i < KUA_UPGRADES.Kua.length; i++) {
        j = Decimal.gte(playerKuaObj.amount, KUA_UPGRADES.Kua[i].cost);
        tempKuaObj.upgCanBuyUpg = tempKuaObj.upgCanBuyUpg || j;
        tempKuaObj.canBuyUpg = tempKuaObj.canBuyUpg || j;
    }

    generate = tempKuaObj.shardGen.mul(delta);
    playerKuaObj.kshards.amount = Decimal.add(playerKuaObj.kshards.amount, generate);
    playerKuaObj.kshards.totalInLayer4 = Decimal.add(playerKuaObj.kshards.totalInLayer4, generate);
    playerKuaObj.kshards.bestInLayer4 = Decimal.max(playerKuaObj.kshards.bestInLayer4, playerKuaObj.kshards.amount);

    generate = tempKuaObj.powGen.mul(delta);
    playerKuaObj.kpower.amount = Decimal.add(playerKuaObj.kpower.amount, generate);
    playerKuaObj.kpower.totalInLayer4 = Decimal.add(playerKuaObj.kpower.totalInLayer4, generate);
    playerKuaObj.kpower.bestInLayer4 = Decimal.max(playerKuaObj.kpower.bestInLayer4, playerKuaObj.kpower.amount);
}