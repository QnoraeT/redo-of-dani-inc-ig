import Decimal, { type DecimalSource } from "break_eternity.js";
import { NaNCheck, player, tmp, updateAllBest, updateAllTotal } from "@/main";
import { format } from "@/format";
import { D, scale } from "@/calc";
import { ACHIEVEMENT_DATA } from "../../Game_Achievements/Game_Achievements";
import { setFactor } from "../../Game_Stats/Game_Stats";
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
    updateKua(-1, delta);
    updateKua(3, delta);
    updateKua(2, delta);
    updateKua(1, delta);
    updateKua(0, delta);
};

export const updateKua = (type: number, delta: DecimalSource) => {
    let i, j, k, generate, decayExp, data, calc, scal;
    switch (type) {
        case -1:
            tmp.value.kua.active.blessings.gain = true;
            tmp.value.kua.active.blessings.effects = true;
            tmp.value.kua.active.blessings.ranks.rank = true;
            tmp.value.kua.active.blessings.ranks.tier = true;
            tmp.value.kua.active.blessings.ranks.tetr = true;
            for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
                tmp.value.kua.active.blessings.upgrades[i] = true;
            }
            tmp.value.kua.active.proofs.gain = true;
            for (const i in KUA_PROOF_UPGS) {
                for (let j = 0; j < KUA_PROOF_UPGS[i as KuaProofUpgTypes].length; j++) {
                    tmp.value.kua.active.proofs.upgrades[i as KuaProofUpgTypes][j] = true;
                }
            }
            tmp.value.kua.active.kpower.upgrades = true;
            tmp.value.kua.active.kpower.effects = true;
            tmp.value.kua.active.kpower.gain = true;
            tmp.value.kua.active.kshards.upgrades = true;
            tmp.value.kua.active.kshards.effects = true;
            tmp.value.kua.active.kshards.gain = true;
            tmp.value.kua.active.upgrades = true;
            tmp.value.kua.active.effects = true;
            tmp.value.kua.active.gain = true;

            if (inChallenge("nk")) {
                tmp.value.kua.active.blessings.gain = false;
                tmp.value.kua.active.blessings.effects = false;
                tmp.value.kua.active.blessings.ranks.rank = false;
                tmp.value.kua.active.blessings.ranks.tier = false;
                tmp.value.kua.active.blessings.ranks.tetr = false;
                for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
                    tmp.value.kua.active.blessings.upgrades[i] = false;
                }
                tmp.value.kua.active.proofs.gain = false;
                for (const i in KUA_PROOF_UPGS) {
                    for (let j = 0; j < KUA_PROOF_UPGS[i as KuaProofUpgTypes].length; j++) {
                        tmp.value.kua.active.proofs.upgrades[i as KuaProofUpgTypes][j] = false;
                    }
                }
                tmp.value.kua.active.kpower.upgrades = false;
                tmp.value.kua.active.kpower.effects = false;
                tmp.value.kua.active.kpower.gain = false;
                tmp.value.kua.active.kshards.upgrades = false;
                tmp.value.kua.active.kshards.effects = false;
                tmp.value.kua.active.kshards.gain = false;
                tmp.value.kua.active.upgrades = false;
                tmp.value.kua.active.effects = false;
                tmp.value.kua.active.gain = false;
            }
            break;
        case 3:
            player.value.gameProgress.kua.proofs.strange.cooldown = Decimal.sub(player.value.gameProgress.kua.proofs.strange.cooldown, delta);
            player.value.gameProgress.kua.proofs.finicky.cooldown = Decimal.sub(player.value.gameProgress.kua.proofs.finicky.cooldown, delta);

            tmp.value.kua.proofs.skpEff = D(0);
            tmp.value.kua.proofs.skpEff = Decimal.max(player.value.gameProgress.kua.proofs.strange.amount, 0).add(1).log2().add(1).ln().div(2).add(1).pow(2).sub(1).mul(3);

            tmp.value.kua.proofs.fkpEff = D(0);
            tmp.value.kua.proofs.fkpEff = Decimal.max(player.value.gameProgress.kua.proofs.finicky.amount, 0).add(1).log10().sqrt();

            tmp.value.kua.proofs.speed = D(1);
            tmp.value.kua.proofs.skpSpeed = D(1);
            if (player.value.gameProgress.layer4.gro.upgrades.overall.includes(0)) {
                tmp.value.kua.proofs.speed = tmp.value.kua.proofs.speed.mul(2);
                tmp.value.kua.proofs.skpSpeed = tmp.value.kua.proofs.skpSpeed.mul(2);
            }

            tmp.value.kua.proofs.canBuyUpg = false;
            tmp.value.kua.proofs.canBuyUpgs.effect = false;
            tmp.value.kua.proofs.canBuyUpgs.kp = false;
            tmp.value.kua.proofs.canBuyUpgs.skp = false;
            tmp.value.kua.proofs.canBuyUpgs.fkp = false;
            for (let i = 0; i < Object.keys(KUA_PROOF_UPGS).length; i++) {
                for (let j = 0; j < KUA_PROOF_UPGS[Object.keys(KUA_PROOF_UPGS)[i] as KuaProofUpgTypes].length; j++) {
                    k = Object.keys(KUA_PROOF_UPGS)[i] as KuaProofUpgTypes;
                    switch (k) {
                        case 'effect':
                        case 'kp':
                            data = player.value.gameProgress.kua.proofs.amount;
                            break;
                        case 'skp':
                            data = player.value.gameProgress.kua.proofs.strange.amount;
                            break;
                        case 'fkp':
                            data = player.value.gameProgress.kua.proofs.finicky.amount;
                            break;
                        default:
                            throw new Error(`${k} is not a valid type!! (failed in updateKua KProof section)`)
                    }

                    scal = KUA_PROOF_UPGS[k][j].target(data);
                    if (k === 'kp' && (j >= 0 && j <= 2)) {
                        scal = scal.add(tmp.value.kua.proofs.upgrades.skp[2].effect);
                    }
                    tmp.value.kua.proofs.upgrades[k][j].target = scal;
                    NaNCheck(tmp.value.kua.proofs.upgrades[k][j].target, `KProof ${k} Upgrade #${j+1} was able to buy NaN levels by autobuying!`);

                    tmp.value.kua.proofs.upgrades[k][j].canBuy = Decimal.gte(data, tmp.value.kua.proofs.upgrades[k][j].cost) && KUA_PROOF_UPGS[k][j].show.value;

                    data = player.value.gameProgress.kua.proofs.automationBought[k][j] && player.value.gameProgress.kua.proofs.automationEnabled[k][j];
                    tmp.value.kua.proofs.canBuyUpg = tmp.value.kua.proofs.canBuyUpg || (tmp.value.kua.proofs.upgrades[k][j].canBuy && !data);
                    tmp.value.kua.proofs.canBuyUpgs[k] = tmp.value.kua.proofs.canBuyUpgs[k] || (tmp.value.kua.proofs.upgrades[k][j].canBuy && !data);
                    tmp.value.kua.canBuyUpg = tmp.value.kua.canBuyUpg || (tmp.value.kua.proofs.upgrades[k][j].canBuy && !data);

                    if (data) {
                        player.value.gameProgress.kua.proofs.upgrades[k][j] = tmp.value.kua.proofs.upgrades[k][j].target.floor().add(1).max(player.value.gameProgress.kua.proofs.upgrades[k][j]);
                    }

                    data = D(0);
                    if (k === 'effect') {
                        if (j >= 0 && j <= 2) {
                            data = data.add(tmp.value.kua.proofs.upgrades.skp[0].effect);
                        }
                    }
                    if (k === 'kp') {
                        if (j >= 0 && j <= 2) {
                            data = data.add(tmp.value.kua.proofs.skpEff);
                            data = data.add(tmp.value.kua.proofs.upgrades.skp[1].effect);
                        }
                        if (j >= 3 && j <= 5) {
                            data = data.add(tmp.value.kua.proofs.upgrades.kp[8].effect);
                        }
                    }
                    tmp.value.kua.proofs.upgrades[k][j].freeExtra = data;
                    NaNCheck(tmp.value.kua.proofs.upgrades[k][j].freeExtra, `KProof ${k} Upgrade #${j+1} had NaN free levels!`);
                    tmp.value.kua.proofs.upgrades[k][j].trueLevel = Decimal.add(player.value.gameProgress.kua.proofs.upgrades[k][j], tmp.value.kua.proofs.upgrades[k][j].freeExtra);
                    if (!tmp.value.kua.active.proofs.upgrades[k][j]) {
                        tmp.value.kua.proofs.upgrades[k][j].trueLevel = D(0);
                    }

                    scal = D(player.value.gameProgress.kua.proofs.upgrades[k][j]);
                    if (k === 'kp' && (j >= 0 && j <= 2)) {
                        scal = scal.sub(tmp.value.kua.proofs.upgrades.skp[2].effect);
                    }
                    scal = scal.max(0);
                    tmp.value.kua.proofs.upgrades[k][j].cost = KUA_PROOF_UPGS[k][j].cost(scal);

                    tmp.value.kua.proofs.upgrades[k][j].effect = KUA_PROOF_UPGS[k][j].effect(tmp.value.kua.proofs.upgrades[k][j].trueLevel);

                    NaNCheck(tmp.value.kua.proofs.upgrades[k][j].effect, `KProof ${k} Upgrade #${j+1} had a NaN effect!`);
                }
            }

            tmp.value.kua.proofs.canBuyUpgs.auto = false;
            for (let i = 0; i < Object.keys(KUA_PROOF_AUTO).length; i++) {
                for (let j = 0; j < KUA_PROOF_AUTO[Object.keys(KUA_PROOF_AUTO)[i] as KuaProofAutoTypes].length; j++) {
                    k = Object.keys(KUA_PROOF_AUTO)[i] as KuaProofAutoTypes;

                    tmp.value.kua.proofs.canBuyUpgs.auto = tmp.value.kua.proofs.canBuyUpgs.auto || (Decimal.gte(player.value.gameProgress.kua.proofs.strange.amount, KUA_PROOF_AUTO[k][j].cost) && !player.value.gameProgress.kua.proofs.automationBought[k][j]);
                    tmp.value.kua.proofs.canBuyUpg = tmp.value.kua.proofs.canBuyUpg || (Decimal.gte(player.value.gameProgress.kua.proofs.strange.amount, KUA_PROOF_AUTO[k][j].cost) && !player.value.gameProgress.kua.proofs.automationBought[k][j]);
                    tmp.value.kua.canBuyUpg = tmp.value.kua.canBuyUpg || (Decimal.gte(player.value.gameProgress.kua.proofs.strange.amount, KUA_PROOF_AUTO[k][j].cost) && !player.value.gameProgress.kua.proofs.automationBought[k][j]);
                }
            }

            if (player.value.gameProgress.kua.proofs.automationBought.other[0] && player.value.gameProgress.kua.proofs.automationEnabled.other[0]) {
                resetFromSKP(false, player.value.gameProgress.kua.proofs.automationBought.other[1] && player.value.gameProgress.kua.proofs.automationEnabled.other[1], player.value.gameProgress.kua.proofs.automationBought.other[2] && player.value.gameProgress.kua.proofs.automationEnabled.other[2], delta);
            }

            tmp.value.kua.proofs.exp = D(1);
            setFactor(0, [4, 6], "Base", `${format(1, 2)}`, `^${format(tmp.value.kua.proofs.exp, 2)}`, true);
            tmp.value.kua.proofs.exp = tmp.value.kua.proofs.exp.add(tmp.value.kua.proofs.upgrades.kp[0].effect);
            setFactor(1, [4, 6], "Simple Breakthrough", `+${format(tmp.value.kua.proofs.upgrades.kp[0].effect, 2)}`, `^${format(tmp.value.kua.proofs.exp, 2)}`, tmp.value.kua.proofs.upgrades.kp[0].effect.gt(0), "kp");
            tmp.value.kua.proofs.exp = tmp.value.kua.proofs.exp.add(tmp.value.kua.proofs.upgrades.kp[1].effect);
            setFactor(2, [4, 6], "Trial and Error", `+${format(tmp.value.kua.proofs.upgrades.kp[1].effect, 2)}`, `^${format(tmp.value.kua.proofs.exp, 2)}`, tmp.value.kua.proofs.upgrades.kp[1].effect.gt(0), "kp");
            tmp.value.kua.proofs.exp = tmp.value.kua.proofs.exp.add(tmp.value.kua.proofs.fkpEff);
            setFactor(3, [4, 6], "Finicky KProof Effect", `+${format(tmp.value.kua.proofs.fkpEff, 2)}`, `^${format(tmp.value.kua.proofs.exp, 2)}`, tmp.value.kua.proofs.fkpEff.gt(0), "fkp");
            tmp.value.kua.proofs.exp = tmp.value.kua.proofs.exp.add(GROWAN_UPGS.overall[1].eff!.value.kpe);
            setFactor(4, [4, 6], "Grōwan Overall Upg. 2", `+${format(GROWAN_UPGS.overall[1].eff!.value.kpe, 2)}`, `^${format(tmp.value.kua.proofs.exp, 2)}`, player.value.gameProgress.layer4.gro.upgrades.overall.includes(1), "growan");
            tmp.value.kua.proofs.exp = tmp.value.kua.proofs.exp.mul(tmp.value.kua.proofs.upgrades.kp[2].effect);
            setFactor(5, [4, 6], "Crafted Experiments", `×${format(tmp.value.kua.proofs.upgrades.kp[2].effect, 2)}`, `^${format(tmp.value.kua.proofs.exp, 2)}`, tmp.value.kua.proofs.upgrades.kp[2].effect.gt(1), "kp");
            NaNCheck(tmp.value.kua.proofs.exp, `KProof's exponent turned into NaN!`)

            tmp.value.kua.proofs.skpExp = getStrangeKPExp(player.value.gameProgress.kua.proofs.strange.hiddenExp, true);
            tmp.value.kua.proofs.fkpExp = getFinickyKPExp(player.value.gameProgress.kua.proofs.finicky.hiddenExp, true);

            if (player.value.gameProgress.unlocks.kproofs.main && tmp.value.kua.active.proofs.gain) {
                // why did i do this
                let fuck = player.value.gameProgress.kua.proofs.amount;
                data = Decimal.max(player.value.gameProgress.kua.proofs.amount, 0).add(1).root(tmp.value.kua.proofs.exp).add(tmp.value.kua.proofs.speed.mul(delta)).pow(tmp.value.kua.proofs.exp).sub(1);
                calc = Decimal.max(player.value.gameProgress.kua.proofs.amount, 0).add(1).root(tmp.value.kua.proofs.exp).add(tmp.value.kua.proofs.speed).pow(tmp.value.kua.proofs.exp).sub(1);

                const softcaps = {
                    prevEff: calc,
                    scal: getSCSLAttribute('kp', false)
                }

                if (data.gte(softcaps.scal[1].start)) {
                    data = scale(data, 2, true, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
                    calc = scale(calc, 2, true, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
                    fuck = scale(fuck, 2, true, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
                    player.value.gameProgress.kua.proofs.amount = scale(player.value.gameProgress.kua.proofs.amount, 2, true, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
                    setSCSLEffectDisp('kp', false, 1, `${format(calc.log(softcaps.prevEff), 3)}√`);
                }

                if (data.gte(softcaps.scal[0].start)) {
                    data = scale(data, 0, true, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
                    calc = scale(calc, 0, true, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
                    fuck = scale(fuck, 0, true, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
                    player.value.gameProgress.kua.proofs.amount = scale(player.value.gameProgress.kua.proofs.amount, 0, true, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
                    setSCSLEffectDisp('kp', false, 0, `/${format(calc.div(softcaps.prevEff), 3)}`);
                }

                if (inChallenge("df")) {
                    data = scale(data, 2.1, true, 10, 1, 0.75);
                    calc = scale(calc, 2.1, true, 10, 1, 0.75);
                    fuck = scale(fuck, 2.1, true, 10, 1, 0.75);
                    player.value.gameProgress.kua.proofs.amount = scale(player.value.gameProgress.kua.proofs.amount, 2.1, true, 10, 1, 0.75);
                }

                fuck = Decimal.max(fuck, 0).add(1).root(tmp.value.kua.proofs.exp).add(tmp.value.kua.proofs.speed).pow(tmp.value.kua.proofs.exp).sub(1);
                player.value.gameProgress.kua.proofs.amount = Decimal.max(player.value.gameProgress.kua.proofs.amount, 0).add(1).root(tmp.value.kua.proofs.exp).add(tmp.value.kua.proofs.speed.mul(delta)).pow(tmp.value.kua.proofs.exp).sub(1);

                if (inChallenge("df")) {
                    data = scale(data, 2.1, false, 10, 1, 0.75);
                    calc = scale(calc, 2.1, false, 10, 1, 0.75);
                    fuck = scale(fuck, 2.1, false, 10, 1, 0.75);
                    player.value.gameProgress.kua.proofs.amount = scale(player.value.gameProgress.kua.proofs.amount, 2.1, false, 10, 1, 0.75);
                }

                if (data.gte(softcaps.scal[0].start)) {
                    data = scale(data, 0, false, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
                    calc = scale(calc, 0, false, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
                    fuck = scale(fuck, 0, false, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
                    player.value.gameProgress.kua.proofs.amount = scale(player.value.gameProgress.kua.proofs.amount, 0, false, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
                }

                if (data.gte(softcaps.scal[1].start)) {
                    data = scale(data, 2, false, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
                    calc = scale(calc, 2, false, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
                    fuck = scale(fuck, 2, false, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
                    player.value.gameProgress.kua.proofs.amount = scale(player.value.gameProgress.kua.proofs.amount, 2, false, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
                }

                tmp.value.kua.proofs.expPerSec = fuck.div(player.value.gameProgress.kua.proofs.amount);
            }
            break;
        case 2:
            player.value.gameProgress.kua.blessings.clickCooldown = Decimal.sub(player.value.gameProgress.kua.blessings.clickCooldown, delta);

            tmp.value.kua.blessings.rank = KUA_BLESS_TIER.rank.rounded.value;
            tmp.value.kua.blessings.tier = KUA_BLESS_TIER.tier.rounded.value;
            tmp.value.kua.blessings.tetr = KUA_BLESS_TIER.tetr.rounded.value;

            tmp.value.kua.blessings.perClick = D(1);
            tmp.value.kua.blessings.perSec = D(2);
            setFactor(0, [4, 4], "Base", `${format(0.1, 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, true);
            setFactor(0, [4, 5], "Base", `${format(1, 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, true);

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(KUA_BLESS_TIER.rank.effects.kuaBlessGainActive.value);
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(KUA_BLESS_TIER.rank.effects.kuaBlessGainIdle.value);
            setFactor(1, [4, 4], "KBlessing Rank", `×${format(KUA_BLESS_TIER.rank.effects.kuaBlessGainActive.value, 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, true, "kb");
            setFactor(1, [4, 5], "KBlessing Rank", `×${format(KUA_BLESS_TIER.rank.effects.kuaBlessGainIdle.value, 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, true, "kb");

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(KUA_BLESS_UPGS[1].eff.value[1]);
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(KUA_BLESS_UPGS[1].eff.value[1]);
            setFactor(2, [4, 4], "KBlessing Upgrade 1", `×${format(KUA_BLESS_UPGS[1].eff.value[1], 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[1], 6), "kb");
            setFactor(2, [4, 5], "KBlessing Upgrade 1", `×${format(KUA_BLESS_UPGS[1].eff.value[1], 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[1], 6), "kb");

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(KUA_BLESS_TIER.tetr.effects.pr2Eff.value);
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(KUA_BLESS_TIER.tetr.effects.pr2Eff.value);
            setFactor(3, [4, 4], "KBlessing Tetr", `×${format(KUA_BLESS_TIER.tetr.effects.pr2Eff.value, 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, Decimal.gte(tmp.value.kua.blessings.tetr, 1), "kb");
            setFactor(3, [4, 5], "KBlessing Tetr", `×${format(KUA_BLESS_TIER.tetr.effects.pr2Eff.value, 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, Decimal.gte(tmp.value.kua.blessings.tetr, 1), "kb");

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(tmp.value.kua.effects.bless);
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(tmp.value.kua.effects.bless);
            setFactor(4, [4, 4], "Kuaraniai Upgrade 2", `×${format(tmp.value.kua.effects.bless, 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, player.value.gameProgress.kua.upgrades >= 2, "kua");
            setFactor(4, [4, 5], "Kuaraniai Upgrade 2", `×${format(tmp.value.kua.effects.bless, 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, player.value.gameProgress.kua.upgrades >= 2, "kua");

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(tmp.value.kua.proofs.upgrades.effect[2].effect);
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(tmp.value.kua.proofs.upgrades.effect[2].effect);
            setFactor(5, [4, 4], "Holy Process", `×${format(tmp.value.kua.proofs.upgrades.effect[2].effect, 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, Decimal.gt(tmp.value.kua.proofs.upgrades.effect[2].effect, 1), "kp");
            setFactor(5, [4, 5], "Holy Process", `×${format(tmp.value.kua.proofs.upgrades.effect[2].effect, 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, Decimal.gt(tmp.value.kua.proofs.upgrades.effect[2].effect, 1), "kp");

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(getColResEffect(5));
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(getColResEffect(4));
            setFactor(6, [4, 4], "Compliance", `×${format(getColResEffect(5), 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, Decimal.gte(timesCompleted('im'), 1e33), "col");
            setFactor(6, [4, 5], "Defiance", `×${format(getColResEffect(4), 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, Decimal.gte(timesCompleted('im'), 1e33), "col");

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(ACHIEVEMENT_DATA[3].eff.value);
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(ACHIEVEMENT_DATA[3].eff.value);
            setFactor(7, [4, 4], "Achievement Tier 4", `×${format(ACHIEVEMENT_DATA[3].eff.value, 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, Decimal.gte(ACHIEVEMENT_DATA[3].eff.value, 1), "ach");
            setFactor(7, [4, 5], "Achievement Tier 4", `×${format(ACHIEVEMENT_DATA[3].eff.value, 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, Decimal.gte(ACHIEVEMENT_DATA[3].eff.value, 1), "ach");

            data = {
                oldGain: tmp.value.kua.blessings.perClick,
                oldKB: D(0),
                newKB: D(0),
            };
            data.oldKB = Decimal.max(player.value.gameProgress.kua.blessings.amount, 1);

            if (inChallenge("df")) {
                data.newKB = scale(
                    scale(
                        scale(
                            scale(
                                data.oldKB.max(1).log10().add(1), 0.2, true, 1, 1, Decimal.pow(0.9, challengeDepth("df"))
                            ).sub(1).pow10().add(tmp.value.kua.blessings.perClick).log10().add(1), 0.2, false, 1, 1, Decimal.pow(0.9, challengeDepth("df"))
                        ).sub(1).pow10(), 0.2, true, 1, 1, Decimal.pow(0.75, challengeDepth("df"))
                    ).add(tmp.value.kua.blessings.perClick), 0.2, false, 1, 1, Decimal.pow(0.75, challengeDepth("df"))
                );

                tmp.value.kua.blessings.perClick = data.newKB.sub(data.oldKB).max(0.1);
            }
            setFactor(7, [4, 4], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, tmp.value.kua.blessings.perClick), 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, inChallenge("df"), "col");

            data = {
                prevEff: tmp.value.kua.blessings.perClick,
                scal: getSCSLAttribute('kba', false)
            }

            tmp.value.kua.blessings.perClick = scale(tmp.value.kua.blessings.perClick, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('kba', false, 0, `${format(data.prevEff.log(tmp.value.kua.blessings.perClick), 3)}√`);
            setFactor(8, [4, 4], "Softcap", `softcap(${format(data.prevEff)})`, `${format(tmp.value.kua.blessings.perClick, 2)}`, Decimal.gt(tmp.value.kua.blessings.perClick, data.scal[0].start), "sc1");

            data = {
                oldGain: tmp.value.kua.blessings.perSec,
                oldKB: D(0),
                newKB: D(0),
            };
            data.oldKB = Decimal.max(player.value.gameProgress.kua.blessings.amount, 1);

            if (inChallenge("df")) {
                data.newKB = scale(
                    scale(
                        scale(
                            scale(
                                data.oldKB.max(1).log10().add(1), 0.2, true, 1, 1, Decimal.pow(0.9, challengeDepth("df"))
                            ).sub(1).pow10().add(tmp.value.kua.blessings.perSec).log10().add(1), 0.2, false, 1, 1, Decimal.pow(0.9, challengeDepth("df"))
                        ).sub(1).pow10(), 0.2, true, 1, 1, Decimal.pow(0.75, challengeDepth("df"))
                    ).add(tmp.value.kua.blessings.perSec), 0.2, false, 1, 1, Decimal.pow(0.75, challengeDepth("df"))
                );
                tmp.value.kua.blessings.perSec = data.newKB.sub(data.oldKB).max(0.1);
            }
            setFactor(7, [4, 5], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, tmp.value.kua.blessings.perSec), 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, inChallenge("df"), "col");

            data = {
                prevEff: tmp.value.kua.blessings.perSec,
                scal: getSCSLAttribute('kbi', false)
            }

            tmp.value.kua.blessings.perSec = scale(tmp.value.kua.blessings.perSec, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('kbi', false, 0, `${format(data.prevEff.log(tmp.value.kua.blessings.perSec), 3)}√`);
            setFactor(8, [4, 5], "Softcap", `softcap(${format(data.prevEff)})`, `${format(tmp.value.kua.blessings.perSec, 2)}`, Decimal.gt(tmp.value.kua.blessings.perSec, data.scal[0].start), "sc1");

            NaNCheck(tmp.value.kua.blessings.perClick, 'KB per click is NaN!');
            NaNCheck(tmp.value.kua.blessings.perSec, 'KB per second is NaN!');

            if (!tmp.value.kua.active.blessings.gain) {
                tmp.value.kua.blessings.perSec = D(0);
                tmp.value.kua.blessings.perClick = D(0);
            }

            tmp.value.kua.blessings.canBuyUpg = false;
            for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
                tmp.value.kua.blessings.upgrades[i].canBuy = Decimal.gte(player.value.gameProgress.kua.blessings.amount, KUA_BLESS_UPGS[i].cost.value);
                tmp.value.kua.blessings.canBuyUpg = tmp.value.kua.blessings.canBuyUpg || Decimal.gte(player.value.gameProgress.kua.blessings.amount, KUA_BLESS_UPGS[i].cost.value);
                tmp.value.kua.canBuyUpg = tmp.value.kua.canBuyUpg || tmp.value.kua.blessings.upgrades[i].canBuy;
            }

            if (player.value.gameProgress.unlocks.kblessings) {
                generate = tmp.value.kua.blessings.perSec.mul(delta);
                player.value.gameProgress.kua.blessings.amount = Decimal.add(player.value.gameProgress.kua.blessings.amount, generate);
                updateAllTotal(player.value.gameProgress.kua.blessings.totals, generate);
                player.value.gameProgress.kua.blessings.totalEver = Decimal.add(player.value.gameProgress.kua.blessings.totalEver, generate);
                updateAllBest(player.value.gameProgress.kua.blessings.best,player.value.gameProgress.kua.blessings.amount);
                player.value.gameProgress.kua.blessings.bestEver = Decimal.max(player.value.gameProgress.kua.blessings.bestEver, player.value.gameProgress.kua.blessings.amount);
            }

            i = Decimal.max(player.value.gameProgress.kua.blessings.totals[3]!, 0);
            i = Decimal.mul(i, KUA_BLESS_TIER.tier.effects.kuaBlessEff.value)
            if (!tmp.value.kua.active.blessings.effects) {
                i = D(0);
            }
            tmp.value.kua.blessings.upg1Base = Decimal.gte(i, 1)
                ? Decimal.log10(i).add(1).mul(0.01)
                : Decimal.mul(i, 0.01)
            tmp.value.kua.blessings.upg2Base = Decimal.gte(i, 1)
                ? Decimal.log10(i).add(1).mul(0.02)
                : Decimal.mul(i, 0.02)
            tmp.value.kua.blessings.kuaEff = Decimal.add(i, 1).log10().mul(0.75).add(1).pow(0.9).sub(1).pow10();
            break;
        case 1:
            tmp.value.kua.sourcesCanBuy = [false, false, false];
            tmp.value.kua.totalEnhSources = D(0);
            tmp.value.kua.enhSourcesUsed = D(0);
            tmp.value.kua.enhShowSlow = false;

            decayExp = D(10);
            tmp.value.kua.enhSlowdown = decayExp.div(10).mul(1e2);
            for (let i = 0; i < KUA_ENHANCERS.sources.length; i++) {
                tmp.value.kua.sourcesCanBuy[i] = Decimal.gte(
                    KUA_ENHANCERS.sources[i].source,
                    KUA_ENHANCERS.sources[i].cost(player.value.gameProgress.kua.enhancers.sources[i])
                );
            }

            j = D(0);
            for (let i = 0; i < KUA_ENHANCERS.enhances.length; i++) {
                j = j.add(Decimal.div(player.value.gameProgress.kua.enhancers.enhancePow[i], 100));
            }

            for (let i = 0; i < KUA_ENHANCERS.enhances.length; i++) {
                tmp.value.kua.trueEnhPower[i] = Decimal.div(player.value.gameProgress.kua.enhancers.enhancePow[i], Decimal.max(j, player.value.gameProgress.kua.enhancers.xpSpread)).div(100);
                tmp.value.kua.totalEnhSources = Decimal.add(tmp.value.kua.totalEnhSources, player.value.gameProgress.kua.enhancers.sources[i]);
                tmp.value.kua.enhSourcesUsed = Decimal.add(tmp.value.kua.enhSourcesUsed, player.value.gameProgress.kua.enhancers.enhancers[i]);

                tmp.value.kua.baseSourceXPGen[i] = Decimal.pow(player.value.gameProgress.kua.enhancers.enhancers[i], 1.5);

                generate = tmp.value.kua.baseSourceXPGen[i].mul(delta);

                const lastXP = player.value.gameProgress.kua.enhancers.enhanceXP[i];
                player.value.gameProgress.kua.enhancers.enhanceXP[i] = Decimal.add(player.value.gameProgress.kua.enhancers.enhanceXP[i], 1).root(decayExp).sub(1).mul(decayExp).exp().sub(1).add(generate).add(1).ln().div(decayExp).add(1).pow(decayExp).sub(1);
                tmp.value.kua.kuaTrueSourceXPGen[i] = Decimal.sub(player.value.gameProgress.kua.enhancers.enhanceXP[i], lastXP).div(delta);

                tmp.value.kua.enhShowSlow = tmp.value.kua.enhShowSlow || Decimal.gte(player.value.gameProgress.kua.enhancers.enhanceXP[i], 10);
            }
            break;
        case 0:
            tmp.value.kua.effectiveKS = Decimal.max(player.value.gameProgress.kua.kshards.totals[3]!, 0);
            tmp.value.kua.effectiveKP = Decimal.max(player.value.gameProgress.kua.kpower.totals[3]!, 0);

            tmp.value.kua.effectiveKS = tmp.value.kua.effectiveKS.mul(KUA_BLESS_UPGS[0].eff.value[1]);
            tmp.value.kua.effectiveKP = tmp.value.kua.effectiveKP.mul(KUA_BLESS_UPGS[0].eff.value[1]);
            
            if (getKuaUpgrade('p', 17)) {
                tmp.value.kua.effectiveKS = tmp.value.kua.effectiveKS.pow(KUA_UPGRADES.KPower[16].eff!.value);
                tmp.value.kua.effectiveKP = tmp.value.kua.effectiveKP.pow(KUA_UPGRADES.KPower[16].eff2!.value);
            }

            tmp.value.kua.effectiveKS = tmp.value.kua.effectiveKS.pow(tmp.value.kua.proofs.upgrades.effect[1].effect);
            tmp.value.kua.effectiveKP = tmp.value.kua.effectiveKP.pow(tmp.value.kua.proofs.upgrades.effect[1].effect);

            NaNCheck(tmp.value.kua.effectiveKS, 'Effective KShards are NaN!');
            NaNCheck(tmp.value.kua.effectiveKP, 'Effective KPower is NaN!');

            player.value.gameProgress.kua.timeInKua = Decimal.add(player.value.gameProgress.kua.timeInKua, delta);

            tmp.value.kua.req = D(1e10);
            tmp.value.kua.exp = D(3);

            tmp.value.kua.exp = tmp.value.kua.exp.add(getColResEffect(2));
            tmp.value.kua.exp = tmp.value.kua.exp.add(KUA_BLESS_UPGS[2].eff.value[1]);

            tmp.value.kua.effectivePrai = Decimal.add(player.value.gameProgress.main.prai.totals[2]!, tmp.value.main.prai.pending);
            tmp.value.kua.canDo = tmp.value.kua.effectivePrai.gte(tmp.value.kua.req) && tmp.value.kua.active.gain;
            tmp.value.kua.pending = D(0);
            if (tmp.value.kua.canDo) {
                tmp.value.kua.pending = tmp.value.kua.effectivePrai.log(tmp.value.kua.req);
                // this is to catch an edge-case, where the value above gets fucked because of floating point errors if this is way lower than the kua exponent, so i have to make an approximation here
                if (tmp.value.kua.exp.div(tmp.value.kua.pending).gte(1e9)) {
                    // yes i'm not joking this reduces down to a dilate 1.5 of PRai when kua exp is high enough
                    tmp.value.kua.pending = tmp.value.kua.pending.pow(1.5).sub(5).pow10();
                } else {
                    tmp.value.kua.pending = tmp.value.kua.pending.ln().mul(1.5).div(tmp.value.kua.exp).add(1).pow(tmp.value.kua.exp).sub(5).pow10();
                }
            } 

            setFactor(0, [4, 1], "Base", `~10^(ln(log(${format(tmp.value.kua.effectivePrai)})))^${format(tmp.value.kua.exp, 2)}-${format(5)}) (approx.)`, `${format(tmp.value.kua.pending, 4)}`, true);
            
            if (getKuaUpgrade("s", 1)) {
                tmp.value.kua.pending = tmp.value.kua.pending.mul(1.5);
            }
            setFactor(1, [4, 1], "KShard Upgrade 1", `×${format(1.5, 2)}`, `${format(tmp.value.kua.pending, 4)}`, getKuaUpgrade("s", 1), "kua");

            if (getKuaUpgrade("s", 12)) {
                tmp.value.kua.pending = tmp.value.kua.pending.mul(KUA_UPGRADES.KShards[11].eff!.value);
            }
            setFactor(2, [4, 1], "KShard Upgrade 12", `×${format(KUA_UPGRADES.KShards[11].eff!.value, 2)}`, `${format(tmp.value.kua.pending, 4)}`, getKuaUpgrade("s", 12), "kua");

            if (Decimal.gte(timesCompleted("df"), 1)) {
                tmp.value.kua.pending = tmp.value.kua.pending.mul(2);
            }
            setFactor(3, [4, 1], `Decaying Feeling Completion ×${format(timesCompleted('df'))}`, `×${format(2, 2)}`, `${format(tmp.value.kua.pending, 1)}`, Decimal.gte(timesCompleted("df"), 1), "col");

            if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 1)) {
                tmp.value.kua.pending = tmp.value.kua.pending.mul(KUA_BLESS_UPGS[2].eff.value[0]);
            }
            setFactor(4, [4, 1], `KBlessing Upgrade 3`, `×${format(KUA_BLESS_UPGS[2].eff.value[0], 2)}`, `${format(tmp.value.kua.pending, 1)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 1), "kb");

            if (Decimal.gt(player.value.gameProgress.layer4.gro.totalAmt, 0)) {
                tmp.value.kua.pending = tmp.value.kua.pending.mul(tmp.value.layer4.growan.eff.kuaGain);
            }
            setFactor(5, [4, 1], `Grōwan Effect`, `×${format(tmp.value.layer4.growan.eff.kuaGain, 2)}`, `${format(tmp.value.kua.pending, 1)}`, Decimal.gt(player.value.gameProgress.layer4.gro.totalAmt, 0), "growan");

            data = {
                oldGain: tmp.value.kua.pending,
                oldKua: D(0),
                newKua: D(0),
            };
            data.oldKua = Decimal.max(player.value.gameProgress.kua.amount, 1e-4);

            if (inChallenge("df")) {
                data.newKua = scale(scale(data.oldKua, 0.2, true, 1e-4, 1, Decimal.pow(0.75, challengeDepth("df"))).add(tmp.value.kua.pending), 0.2, false, 1e-4, 1, Decimal.pow(0.75, challengeDepth("df")));

                tmp.value.kua.pending = data.newKua.sub(data.oldKua);
            }
            setFactor(6, [4, 1], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, tmp.value.kua.pending), 2)}`, `${format(tmp.value.kua.pending, 4)}`, inChallenge("df"), "col");

            if (player.value.gameProgress.kua.auto) {
                generate = tmp.value.kua.pending.mul(delta).mul(0.01);
                player.value.gameProgress.kua.amount = Decimal.add(player.value.gameProgress.kua.amount, generate);
                updateAllTotal(player.value.gameProgress.kua.totals, generate);
                player.value.gameProgress.kua.totalEver = Decimal.add(player.value.gameProgress.kua.totalEver, generate);
            }

            updateAllBest(player.value.gameProgress.kua.best, player.value.gameProgress.kua.amount);
            player.value.gameProgress.kua.bestEver = Decimal.max(player.value.gameProgress.kua.bestEver, player.value.gameProgress.kua.amount);

            tmp.value.kua.effects = {
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
            setFactor(0, [4, 0], "Base", `${format(player.value.gameProgress.kua.amount, 4)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, true);

            if (player.value.gameProgress.unlocks.kblessings) {
                k = k.mul(tmp.value.kua.blessings.kuaEff.log(Decimal.pow(player.value.gameProgress.kua.amount, k)).add(1))
            }
            setFactor(1, [4, 0], "KBlessings", `×${format(tmp.value.kua.blessings.kuaEff, 2)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, player.value.gameProgress.unlocks.kblessings, "kb");

            k = k.mul(ACHIEVEMENT_DATA[1].eff.value);
            setFactor(2, [4, 0], "Achievement Tier 2", `^${format(ACHIEVEMENT_DATA[1].eff.value, 3)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, true, "ach");

            if (getKuaUpgrade("s", 11)) {
                k = k.mul(KUA_UPGRADES.KShards[10].eff!.value);
            }
            setFactor(3, [4, 0], "KShard Upgrade 11", `^${format(KUA_UPGRADES.KShards[10].eff!.value, 3)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, getKuaUpgrade("s", 11), "kua");

            if (getKuaUpgrade("p", 15)) {
                k = k.mul(1.05);
            }
            setFactor(4, [4, 0], "KPower Upgrade 15", `^${format(1.05, 3)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, getKuaUpgrade("p", 15), "kua");
            
            k = Decimal.pow(player.value.gameProgress.kua.amount, k);

            if (tmp.value.kua.active.effects) {
                // * theres probably a better way to do this
                // no requirements for this, no need to lump them in the ones with conditionals
                tmp.value.kua.effects.upg1Scaling = Decimal.max(player.value.gameProgress.main.points, 0).add(1).log10().pow(0.6).div(200).mul(Decimal.max(k, 0).mul(1e4).add(1).pow(2 / 3).sub(1)).add(1).log10().add(1);
                if (getKuaUpgrade("p", 3)) {
                    tmp.value.kua.effects.upg1Scaling = Decimal.max(player.value.gameProgress.main.points, 0).add(1).pow(0.022).mul(Decimal.max(k, 0).mul(10).add(1).pow(0.75).sub(1)).add(1).log10().add(1).max(tmp.value.kua.effects.upg1Scaling);
                }

                let exp = D(1);

                if (getKuaUpgrade("k", 2)) { exp = exp.add(0.25); }
                if (getKuaUpgrade("k", 3)) { exp = exp.add(0.25); }
                if (getKuaUpgrade("k", 4)) { exp = exp.add(0.25); }

                exp = exp.mul(tmp.value.kua.proofs.upgrades.effect[4].effect)

                // dilate 2
                // pow ^exp
                // trilate 0.9
                tmp.value.kua.effects.kshardPassive = Decimal.max(tmp.value.kua.effectiveKS, 0.01).mul(1e3).log10().pow(2).sub(1).pow10().pow(0.05).pow(exp).log10().add(1).log10().add(1).pow(0.9).sub(1).pow10().sub(1).pow10();
                tmp.value.kua.effects.kpowerPassive = Decimal.max(tmp.value.kua.effectiveKP, 0.01).mul(1e3).log10().pow(2).sub(1).pow10().pow(0.05).pow(exp).log10().add(1).log10().add(1).pow(0.9).sub(1).pow10().sub(1).pow10();

                tmp.value.kua.effects.upg4 = Decimal.gt(k, 0)
                    ? Decimal.log10(k).add(4).div(13).mul(7).add(1).cbrt().sub(4).pow10().add(1)
                    : D(1);

                tmp.value.kua.effects.upg5 = Decimal.gt(player.value.gameProgress.kua.kshards.amount, 0)
                    ? Decimal.pow(20, Decimal.log10(player.value.gameProgress.kua.kshards.amount).add(2).div(13)).div(1e3).add(1)
                    : D(1);

                tmp.value.kua.effects.upg6 = Decimal.gt(player.value.gameProgress.kua.kpower.amount, 1)
                    ? Decimal.log10(player.value.gameProgress.kua.kpower.amount)
                            .div(13)
                            .mul(7)
                            .add(1)
                            .cbrt()
                            .sub(6)
                            .pow10()
                    : D(0);

                tmp.value.kua.effects.upg1SuperScaling = getKuaUpgrade("p", 6)
                    ? tmp.value.kua.effects.upg1Scaling.sqrt().sub(1).div(16).add(1)
                    : D(1);

                tmp.value.kua.effects.ptPower = getKuaUpgrade("p", 3)
                    ? Decimal.max(k, 0).add(1).log2().add(1).sqrt().sub(1).mul(0.01).add(1) // 1 = ^1, 2 = ^1.01, 16 = ^1.02, 256 = ^1.03, 65,536 = ^1.04 ...
                    : D(1);

                tmp.value.kua.effects.upg2Softcap = getKuaUpgrade("s", 6)
                    ? Decimal.max(k, 1e2).div(1e2).pow(7)
                    : D(1);

                tmp.value.kua.effects.kshardPrai = getKuaUpgrade("s", 10)
                    ? Decimal.max(k, 10).log10().log10().div(4).add(1).pow(2.5)
                    : D(1);

                tmp.value.kua.effects.kpower = getKuaUpgrade("s", 10)
                    ? Decimal.max(k, 10).log10().sub(1).div(8).pow10()
                    : D(1);

                tmp.value.kua.effects.pts = getKuaUpgrade("s", 7)
                    ? Decimal.max(k, 1)
                            .mul(1e3)
                            .cbrt()
                            .log10()
                            .pow(1.1)
                            .mul(
                                Decimal.max(player.value.gameProgress.main.prai.timeInPRai, 0)
                                    .add(1)
                                    .ln()
                                    .mul(2)
                                    .add(1)
                                    .sqrt()
                            )
                            .pow10()
                    : D(1);

                tmp.value.kua.effects.bless = getKuaUpgrade("k", 2)
                    ? Decimal.max(k, 1e8).log10().cbrt().div(2).sub(1).pow10()
                    : D(1);
            }

            i = D(0);
            if (tmp.value.kua.active.kshards.gain) {
                i = D(player.value.gameProgress.kua.amount);
                setFactor(0, [4, 2], "Base", `${format(player.value.gameProgress.kua.amount, 4)}`, `${format(i, 3)}`, true);
                
                i = i.pow(tmp.value.kua.proofs.upgrades.effect[7].effect);
                setFactor(1, [4, 2], "Constructive Interference", `^${format(tmp.value.kua.proofs.upgrades.effect[7].effect, 3)}`, `${format(i, 3)}`, Decimal.gt(tmp.value.kua.proofs.upgrades.effect[7].effect, 1), "kp");

                if (getKuaUpgrade("p", 1)) {
                    i = i.mul(2.5);
                }
                setFactor(2, [4, 2], "KPower Upgrade 1", `×${format(2.5, 2)}`, `${format(i, 3)}`, getKuaUpgrade("p", 1), "kua");

                if (getKuaUpgrade("s", 13)) {
                    i = i.mul(KUA_UPGRADES.KShards[12].eff!.value);
                }
                setFactor(3, [4, 2], "KShard Upgrade 13", `×${format(KUA_UPGRADES.KShards[12].eff!.value, 2)}`, `${format(i, 3)}`, getKuaUpgrade("s", 13), "kua");

                if (Decimal.gte(timesCompleted("df"), 1)) {
                    i = i.mul(2);
                }
                setFactor(4, [4, 2], `Decaying Feeling Completion ×${format(timesCompleted('df'))}`, `×${format(2, 2)}`, `${format(i, 3)}`, Decimal.gte(timesCompleted("df"), 1), "col");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 1)) {
                    i = i.mul(KUA_BLESS_UPGS[2].eff.value[2]);
                }
                setFactor(5, [4, 2], `KBlessing Upgrade 3`, `×${format(KUA_BLESS_UPGS[2].eff.value[2], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 12), "kb");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 1)) {
                    i = i.mul(KUA_BLESS_UPGS[3].eff.value[0]);
                }
                setFactor(6, [4, 2], `KBlessing Upgrade 4`, `×${format(KUA_BLESS_UPGS[3].eff.value[0], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 1), "kb");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 6)) {
                    i = i.mul(Decimal.max(player.value.gameProgress.kua.kpower.amount, 1).log10().add(1).pow(KUA_BLESS_UPGS[3].eff.value[1]));
                }
                setFactor(7, [4, 2], `KBlessing Upgrade 4`, `×log10(${format(player.value.gameProgress.kua.kpower.amount, 2)})^${format(KUA_BLESS_UPGS[3].eff.value[1], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 6), "kb");

                data = {
                    oldGain: i,
                    oldKua: D(0),
                    newKua: D(0),
                };
                data.oldKua = Decimal.max(player.value.gameProgress.kua.amount, 1e-4);

                if (inChallenge("df")) {
                    data.newKua = scale(scale(data.oldKua, 0.2, true, 1e-4, 1, Decimal.pow(0.5, challengeDepth("df"))).add(i), 0.2, false, 1e-4, 1, Decimal.pow(0.5, challengeDepth("df")));

                    i = data.newKua.sub(data.oldKua);
                }
                setFactor(8, [4, 2], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, i), 2)}`, `${format(i, 4)}`, inChallenge("df"), "col");
            }
            tmp.value.kua.shardGen = i;

            i = D(0);
            if (tmp.value.kua.active.kpower.gain) {
                i = D(player.value.gameProgress.kua.kshards.amount);
                setFactor(0, [4, 3], "Base", `${format(player.value.gameProgress.kua.kshards.amount, 4)}`, `${format(i, 3)}`, true);

                i = i.pow(tmp.value.kua.proofs.upgrades.effect[7].effect);
                setFactor(1, [4, 3], "Constructive Interference", `^${format(tmp.value.kua.proofs.upgrades.effect[7].effect, 3)}`, `${format(i, 3)}`, Decimal.gt(tmp.value.kua.proofs.upgrades.effect[7].effect, 1), "kp");

                if (getKuaUpgrade("s", 10)) {
                    i = i.mul(tmp.value.kua.effects.kpower);
                }
                setFactor(2, [4, 3], "KShard Upgrade 10", `×${format(tmp.value.kua.effects.kpower, 2)}`, `${format(i, 3)}`, getKuaUpgrade("s", 10), "kua");

                if (getKuaUpgrade("s", 14)) {
                    i = i.mul(KUA_UPGRADES.KShards[13].eff!.value);
                }
                setFactor(3, [4, 3], "KShard Upgrade 14", `×${format(KUA_UPGRADES.KShards[13].eff!.value, 2)}`, `${format(i, 3)}`, getKuaUpgrade("s", 14), "kua");

                if (Decimal.gte(timesCompleted("df"), 1)) {
                    i = i.mul(2);
                }
                setFactor(4, [4, 3], `Decaying Feeling Completion ×${format(timesCompleted('df'))}`, `×${format(2, 2)}`, `${format(i, 3)}`, Decimal.gte(timesCompleted("df"), 1), "col");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 1)) {
                    i = i.mul(KUA_BLESS_UPGS[2].eff.value[2]);
                }
                setFactor(5, [4, 3], `KBlessing Upgrade 3`, `×${format(KUA_BLESS_UPGS[2].eff.value[2], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 12), "kb");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 1)) {
                    i = i.mul(KUA_BLESS_UPGS[3].eff.value[0]);
                }
                setFactor(6, [4, 3], `KBlessing Upgrade 4`, `×${format(KUA_BLESS_UPGS[3].eff.value[0], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 1), "kb");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 6)) {
                    i = i.mul(Decimal.max(player.value.gameProgress.kua.kshards.amount, 1).log10().add(1).pow(KUA_BLESS_UPGS[3].eff.value[1]));
                }
                setFactor(7, [4, 3], `KBlessing Upgrade 4`, `×log10(${format(player.value.gameProgress.kua.kshards.amount, 2)})^${format(KUA_BLESS_UPGS[3].eff.value[1], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 6), "kb");

                data = {
                    oldGain: i,
                    oldKua: D(0),
                    newKua: D(0),
                };
                data.oldKua = Decimal.max(player.value.gameProgress.kua.amount, 1e-4);

                if (inChallenge("df")) {
                    data.newKua = scale(scale(data.oldKua, 0.2, true, 1e-4, 1, Decimal.pow(0.5, challengeDepth("df"))).add(i), 0.2, false, 1e-4, 1, Decimal.pow(0.5, challengeDepth("df")));
    
                    i = data.newKua.sub(data.oldKua);
                }
                setFactor(8, [4, 3], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, i), 2)}`, `${format(i, 4)}`, inChallenge("df"), "col");
            }
            tmp.value.kua.powGen = i;

            tmp.value.kua.upgCanBuyUpg = false;
            for (let i = player.value.gameProgress.kua.kshards.upgrades; i < KUA_UPGRADES.KShards.length; i++) {
                j = Decimal.gte(player.value.gameProgress.kua.kshards.amount, KUA_UPGRADES.KShards[i].cost);
                tmp.value.kua.upgCanBuyUpg = tmp.value.kua.upgCanBuyUpg || j;
                tmp.value.kua.canBuyUpg = tmp.value.kua.canBuyUpg || j;
            }
            for (let i = player.value.gameProgress.kua.kpower.upgrades; i < KUA_UPGRADES.KPower.length; i++) {
                j = Decimal.gte(player.value.gameProgress.kua.kpower.amount, KUA_UPGRADES.KPower[i].cost);
                tmp.value.kua.upgCanBuyUpg = tmp.value.kua.upgCanBuyUpg || j;
                tmp.value.kua.canBuyUpg = tmp.value.kua.canBuyUpg || j;
            }
            for (let i = player.value.gameProgress.kua.upgrades; i < KUA_UPGRADES.Kua.length; i++) {
                j = Decimal.gte(player.value.gameProgress.kua.amount, KUA_UPGRADES.Kua[i].cost);
                tmp.value.kua.upgCanBuyUpg = tmp.value.kua.upgCanBuyUpg || j;
                tmp.value.kua.canBuyUpg = tmp.value.kua.canBuyUpg || j;
            }

            generate = tmp.value.kua.shardGen.mul(delta);
            player.value.gameProgress.kua.kshards.amount = Decimal.add(player.value.gameProgress.kua.kshards.amount, generate);
            updateAllTotal(player.value.gameProgress.kua.kshards.totals, generate);
            player.value.gameProgress.kua.kshards.totalEver = Decimal.add(player.value.gameProgress.kua.kshards.totalEver, generate);
            updateAllBest(player.value.gameProgress.kua.kshards.best,player.value.gameProgress.kua.kshards.amount);
            player.value.gameProgress.kua.kshards.bestEver = Decimal.max(player.value.gameProgress.kua.kshards.bestEver, player.value.gameProgress.kua.kshards.amount);

            generate = tmp.value.kua.powGen.mul(delta);
            player.value.gameProgress.kua.kpower.amount = Decimal.add(player.value.gameProgress.kua.kpower.amount, generate);
            updateAllTotal(player.value.gameProgress.kua.kpower.totals, generate);
            player.value.gameProgress.kua.kpower.totalEver = Decimal.add(player.value.gameProgress.kua.kpower.totalEver, generate);
            updateAllBest(player.value.gameProgress.kua.kpower.best,player.value.gameProgress.kua.kpower.amount);
            player.value.gameProgress.kua.kpower.bestEver = Decimal.max(player.value.gameProgress.kua.kpower.bestEver, player.value.gameProgress.kua.kpower.amount);
            break;
        default:
            throw new Error(`Kuaraniai area of the game does not contain ${type}`);
    }
};