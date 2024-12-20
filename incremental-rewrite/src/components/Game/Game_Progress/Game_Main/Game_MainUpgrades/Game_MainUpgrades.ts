import { setFactor } from "@/components/Game/Game_Stats/Game_Stats";
import { format } from "@/format";
import { challengeDepth, getColChalCondEffects, getColChalRewEffects, inChallenge, timesCompleted } from "../../Game_Colosseum/Game_ColChallenges/Game_ColChalHandler";
import { tmp } from "@/main";
import { player } from "@/main";
import Decimal, { type DecimalSource } from "break_eternity.js";
import { getSCSLAttribute, setSCSLEffectDisp } from "@/softcapScaling";
import { D, scale } from "@/calc";
import { COL_CHALLENGES } from "../../Game_Colosseum/Game_ColChallenges/Game_ColChalData";
import { updateStart } from "../Game_Main";
import { getOMUpgrade, MAIN_ONE_UPGS } from "../Game_OneUpgrades/Game_OneUpgrades";
import { getAchievementEffect, ifAchievement } from "@/components/Game/Game_Achievements/Game_Achievements";
import { KUA_ENHANCERS } from "../../Game_Kuaraniai/Game_KuaEnhancers/Game.KuaEnhancers";
import { getKuaUpgrade, KUA_UPGRADES } from "../../Game_Kuaraniai/Game_KuaUpgrades/Game_KuaUpgrades";
import { KUA_BLESS_UPGS } from "../../Game_Kuaraniai/Game_KuaBlessings/Game_KuaBlessings";

export const buyGenUPG = (id: number): void => {
    if (Decimal.gte(player.value.gameProgress.main.points, tmp.value.main.upgrades[id].cost)) {
        player.value.gameProgress.main.points = Decimal.sub(player.value.gameProgress.main.points, tmp.value.main.upgrades[id].cost);
        if (Decimal.lt(player.value.gameProgress.main.points, 0)) {
            throw new Error(`aaa!! main upgrade sent pts to negative!!`)
        }
        player.value.gameProgress.main.upgrades[id].bought = Decimal.add(player.value.gameProgress.main.upgrades[id].bought, 1);
        for (let i = 0; i < player.value.gameProgress.main.upgrades[id].boughtInReset.length; i++) {
            player.value.gameProgress.main.upgrades[id].boughtInReset[i] = player.value.gameProgress.main.upgrades[id].bought;
        }
        updateStart(-(id + 1), 0);
    }
}

export type MainUpgrade = {
    freeExtra: Decimal
    effective: (x: DecimalSource) => Decimal
    effectBase: Decimal
    effect: (x?: DecimalSource) => Decimal
};

export type TmpMainUpgrade = {
    effect: Decimal,
    effective: Decimal,
    cost: Decimal,
    target: Decimal,
    canBuy: boolean,
    effectTextColor: string,
    costTextColor: string,
    active: boolean,
    costBase: {
        exp: Decimal,
        scale: Array<Decimal>,
    },
    freeExtra: DecimalSource,
    effectBase: Decimal,
    multiplier: Decimal,
    calcEB: Decimal,
    shown: boolean,
    autoUnlocked: boolean,
    display: string,
    totalDisp: string
};

export const MAIN_UPGS: Array<MainUpgrade> = [
    { // UPG1
        get freeExtra() {
            let i = D(0);
            if (tmp.value.kua.proofs.upgrades.effect[0].effect.gt(0)) {
                i = i.add(tmp.value.kua.proofs.upgrades.effect[0].effect);
            }
            setFactor(1, [1, 0, 0], "Basic Discoveries", `+${format(tmp.value.kua.proofs.upgrades.effect[0].effect, 2)}`, `+${format(tmp.value.kua.proofs.upgrades.effect[0].effect)}`, tmp.value.kua.proofs.upgrades.effect[0].effect.gt(0), "kp");
            if (tmp.value.kua.proofs.upgrades.effect[3].effect.gt(0)) {
                i = i.add(tmp.value.main.upgrades[1].effective.mul(tmp.value.kua.proofs.upgrades.effect[3].effect));
            }
            setFactor(2, [1, 0, 0], "Line Extruder", `+${format(tmp.value.kua.proofs.upgrades.effect[3].effect, 2)}×${format(tmp.value.main.upgrades[1].effective)}`, `+${format(tmp.value.main.upgrades[1].effective.mul(tmp.value.kua.proofs.upgrades.effect[3].effect))}`, tmp.value.kua.proofs.upgrades.effect[3].effect.gt(0), "kp");
            return i;
        },
        get effectBase() {
            let i = D(1.5);
            setFactor(0, [1, 0, 2], "Base", `${format(1.5, 3)}`, `${format(i, 3)}`, true);

            if (Decimal.gte(player.value.gameProgress.main.upgrades[2].bought, 1)) {
                i = i.add(tmp.value.main.upgrades[2].effect ?? 0);
            }
            setFactor(1, [1, 0, 2], "Upgrade 3", `+${format(tmp.value.main.upgrades[2].effect, 3)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.main.upgrades[2].bought, 1));

            if (Decimal.gte(player.value.gameProgress.main.upgrades[5].bought, 1)) {
                i = i.add(tmp.value.main.upgrades[5].effect ?? 0);
            }
            setFactor(2, [1, 0, 2], "Upgrade 6", `+${format(tmp.value.main.upgrades[5].effect, 3)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.main.upgrades[5].bought, 1));

            if (Decimal.gte(player.value.gameProgress.main.oneUpgrades[1], 1)) {
                i = i.add(MAIN_ONE_UPGS[1].effect.value);
            }
            setFactor(3, [1, 0, 2], "One-Upgrade 2", `+${format(MAIN_ONE_UPGS[1].effect.value, 3)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.main.oneUpgrades[1], 1));

            if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 9)) {
                i = i.add(0.05);
            }
            setFactor(4, [1, 0, 2], "PR2 9", `+${format(0.05, 3)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.main.pr2.amount, 9));

            if (Decimal.gt(player.value.gameProgress.kua.blessings.amount, 0)) {
                i = i.add(tmp.value.kua.blessings.upg1Base);
            }
            setFactor(5, [1, 0, 2], "KBlessings", `+${format(tmp.value.kua.blessings.upg1Base, 3)}`, `${format(i, 3)}`, Decimal.gt(player.value.gameProgress.kua.blessings.amount, 0), "kb");

            i = i.add(KUA_ENHANCERS.enhances[0].effect());

            if (ifAchievement(1, 10)) {
                i = i.mul(1.01);
            }
            setFactor(6, [1, 0, 2], "Achievement ID (1, 10)", `×${format(1.01, 3)}`, `${format(i, 3)}`, ifAchievement(1, 10), "ach");

            if (Decimal.gte(player.value.gameProgress.main.upgrades[8].bought, 1)) {
                i = i.mul(tmp.value.main.upgrades[8].effect ?? 0);
            }
            setFactor(7, [1, 0, 2], "Upgrade 9", `×${format(tmp.value.main.upgrades[8].effect ?? 1, 3)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.main.upgrades[8].bought, 1));

            if (inChallenge("su") && Decimal.gte(challengeDepth("su"), 2)) {
                i = i.sub(getColChalCondEffects("su")[1]);
            }
            setFactor(8, [1, 0, 2], `Sabotaged Upgrades ×${format(challengeDepth("su"))}`, `-${format(getColChalCondEffects("su")[1], 3)}`, `${format(i, 3)}`, inChallenge("su") && Decimal.gte(challengeDepth("su"), 2), "col");
            return i;
        },
        effective(x) {
            let i = D(x);
            i = i.add(this.freeExtra)
            if (ifAchievement(1, 5)) {
                i = i.mul(getAchievementEffect(1, 5));
            }
            setFactor(3, [1, 0, 0], "Achievement ID (1, 5)", `×${format(getAchievementEffect(1, 5), 3)}`, `${format(i)} effective`, ifAchievement(1, 5), "ach");
            if (getKuaUpgrade('p', 16)) {
                i = i.mul(KUA_UPGRADES.KPower[15].eff!);
            }
            setFactor(4, [1, 0, 0], "KPower Upgrade 16", `×${format(KUA_UPGRADES.KPower[15].eff!, 3)}`, `${format(i)} effective`, getKuaUpgrade('p', 16), "kua");
            return i;
        },
        effect(x = player.value.gameProgress.main.upgrades[0].bought) {
            if (!tmp.value.main.upgrades[0].active) {
                return D(1);
            }
            let eff = D(x)
            setFactor(0, [1, 0, 0], "Base", `${format(eff, 3)}`, `${format(eff)} effective`, true);
            eff = this.effective(x);

            // ! yes, the "freeExtra" part of the accumulated is moved HERE so that things like Basic Discoveries or other stuff that can add free levels can do something to the multiplier
            // ! Dimension Crawler only
            if (inChallenge('dc')) {
                eff = eff.add(player.value.gameProgress.main.upgrades[0].accumulated);
            }
            setFactor(5, [1, 0, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `+${format(player.value.gameProgress.main.upgrades[0].accumulated, 1)}`, `${format(eff.mul(tmp.value.main.upgrades[0].multiplier))} effective`, inChallenge('dc'), 'col');

            setFactor(6, [1, 0, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `×${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[0], 2)}^${format(player.value.gameProgress.main.upgrades[0].bought, 2)}`, `${format(eff.mul(tmp.value.main.upgrades[0].multiplier))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = eff.mul(tmp.value.main.upgrades[0].multiplier);
            }

            setFactor(7, [1, 0, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `log10(${format(eff, 3)}+${format(1)})^${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1], 2)}`, `${format(Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]);
            }

            setFactor(8, [1, 0, 0], "Resulting Effect", `${format(this.effectBase, 3)}^${format(eff, 3)}`, `×${format(this.effectBase.pow(eff))}`, true);
            eff = this.effectBase.pow(eff);

            eff = eff.mul(tmp.value.kua.blessings.upg1Base.add(1).pow(COL_CHALLENGES.im.type2ChalEff![1]));
            setFactor(9, [1, 0, 0], `I. Mechanics PB: ${format(timesCompleted('im'))}`, `×${format(tmp.value.kua.blessings.upg1Base.add(1), 3)}^${format(COL_CHALLENGES.im.type2ChalEff![1], 3)}`, `×${format(eff)}`, Decimal.gt(COL_CHALLENGES.im.type2ChalEff![1], 1), "col");

            if (Decimal.gte(player.value.gameProgress.main.upgrades[6].bought, 1)) {
                eff = eff.pow(tmp.value.main.upgrades[6].effect ?? 0);
            }
            setFactor(10, [1, 0, 0], "Upgrade 7", `^${format(tmp.value.main.upgrades[6].effect, 3)}`, `×${format(eff)}`, Decimal.gte(player.value.gameProgress.main.upgrades[6].bought, 1));

            if (getKuaUpgrade("p", 8)) {
                eff = eff.max(1).log10().pow(1.01).pow10();
            }
            setFactor(11, [1, 0, 0], "KPower Upgrade 8", `${format(eff)} dilate ${format(1.01, 3)}`, `×${format(eff)}`, getKuaUpgrade("p", 8), "kua");

            const data = {
                prevEff: eff,
                scal: getSCSLAttribute('upg1', false)
            }

            eff = scale(eff, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('upg1', false, 0, `${format(data.prevEff.log(eff), 3)}√`);
            setFactor(12, [1, 0, 0], "Softcap", `softcap(${format(data.prevEff)})`, `×${format(eff)}`, eff.gte(data.scal[0].start), "sc1");

            data.prevEff = eff

            eff = scale(eff, 2.1, false, data.scal[1].start, data.scal[1].power, data.scal[1].basePow);
            setSCSLEffectDisp('upg1', false, 1, `${format(data.prevEff.log(eff), 3)}√`);
            setFactor(13, [1, 0, 0], "Supersoftcap", `supersoftcap(${format(data.prevEff)})`, `×${format(eff)}`, eff.gte(data.scal[1].start), "sc2");
            return eff;
        }
    },
    { // UPG2
        get freeExtra() {
            let i = D(0);
            if (tmp.value.kua.proofs.upgrades.effect[0].effect.gt(0)) {
                i = i.add(tmp.value.kua.proofs.upgrades.effect[0].effect);
            }
            setFactor(1, [1, 1, 0], "Basic Discoveries", `+${format(tmp.value.kua.proofs.upgrades.effect[0].effect, 2)}`, `+${format(i)}`, tmp.value.kua.proofs.upgrades.effect[0].effect.gt(0), "kp");
            return i;
        },
        get effectBase() {
            let i = D(1.2);
            setFactor(0, [1, 1, 2], "Base", `${format(1.2, 3)}`, `${format(i, 3)}`, true);

            if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 4)) {
                i = i.add(0.1);
            }
            setFactor(1, [1, 1, 2], "PR2 4", `+${format(0.1, 3)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.main.pr2.amount, 4));

            if (ifAchievement(0, 12)) {
                i = i.add(0.05);
            }
            setFactor(2, [1, 1, 2], "Achievement ID (0, 12)", `+${format(0.05, 3)}`, `${format(i, 3)}`, ifAchievement(0, 12), "ach");

            if (getKuaUpgrade("p", 1)) {
                i = i.add(KUA_UPGRADES.KPower[0].eff!);
            }
            setFactor(3, [1, 1, 2], "KPower Upgrade 1", `+${format(KUA_UPGRADES.KPower[0].eff!, 3)}`, `${format(i, 3)}`, getKuaUpgrade("p", 1), "kua");

            if (getKuaUpgrade("s", 14)) {
                i = i.add(KUA_UPGRADES.KShards[13].eff2!);
            }
            setFactor(4, [1, 1, 2], "KShard Upgrade 14", `+${format(KUA_UPGRADES.KShards[13].eff2!, 3)}`, `${format(i, 3)}`, getKuaUpgrade("s", 14), "kua");

            if (Decimal.gt(player.value.gameProgress.kua.blessings.amount, 0)) {
                i = i.add(tmp.value.kua.blessings.upg2Base);
            }
            setFactor(5, [1, 1, 2], "KBlessings", `+${format(tmp.value.kua.blessings.upg2Base, 3)}`, `${format(i, 3)}`, Decimal.gt(player.value.gameProgress.kua.blessings.amount, 0), "kb");

            if (getKuaUpgrade("s", 5)) {
                i = i.mul(1.125);
            }
            setFactor(6, [1, 1, 2], "KShard Upgrade 5", `×${format(1.125, 3)}`, `${format(i, 3)}`, getKuaUpgrade("s", 5), "kua");

            i = i.add(KUA_ENHANCERS.enhances[1].effect());

            if (ifAchievement(1, 10)) {
                i = i.mul(1.01);
            }
            setFactor(7, [1, 1, 2], "Achievement ID (1, 10)", `×${format(1.01, 3)}`, `${format(i, 3)}`, ifAchievement(1, 10), "ach");

            if (Decimal.gte(timesCompleted("su"), 6)) {
                i = i.mul(getColChalRewEffects("su")[2])
            }
            setFactor(8, [1, 1, 2], `Sabotaged Upgrades ×${format(timesCompleted('su'))}`, `×${format(getColChalRewEffects("su")[2], 2)}`, `${format(i, 3)}`, Decimal.gte(timesCompleted("su"), 6), "col");
            return i;
        },
        effective(x) {
            let i = D(x);
            i = i.add(this.freeExtra);
            if (Decimal.gte(getOMUpgrade(6), 1)) {
                i = i.pow(MAIN_ONE_UPGS[6].effect.value);
            }
            setFactor(2, [1, 1, 0], "One-Upgrade #7", `^${format(MAIN_ONE_UPGS[6].effect.value, 3)}`, `${format(i)} effective`, Decimal.gte(getOMUpgrade(6), 1));
            return i;
        },
        effect(x = player.value.gameProgress.main.upgrades[1].bought) {
            if (!tmp.value.main.upgrades[1].active) {
                return D(1);
            }
            let eff = D(x)
            setFactor(0, [1, 1, 0], "Base", `${format(eff, 3)}`, `${format(eff)} effective`, true);
            eff = this.effective(x)

            if (inChallenge('dc')) {
                eff = eff.add(player.value.gameProgress.main.upgrades[1].accumulated);
            }
            setFactor(3, [1, 1, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `+${format(player.value.gameProgress.main.upgrades[1].accumulated, 1)}`, `+${format(eff)}`, inChallenge('dc'), 'col');

            setFactor(4, [1, 1, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `×${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[0], 2)}^${format(player.value.gameProgress.main.upgrades[1].bought, 2)}`, `${format(eff.mul(tmp.value.main.upgrades[1].multiplier))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = eff.mul(tmp.value.main.upgrades[1].multiplier);
            }

            setFactor(5, [1, 1, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `log10(${format(eff, 3)}+${format(1)})^${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1], 2)}`, `${format(Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]);
            }

            setFactor(6, [1, 1, 0], "Resulting Effect", `${format(this.effectBase, 3)}^${format(eff, 3)}`, `/${format(this.effectBase.pow(eff))}`, true);
            eff = this.effectBase.pow(eff);

            eff = eff.mul(tmp.value.kua.blessings.upg2Base.add(1).pow(COL_CHALLENGES.im.type2ChalEff![1]));
            setFactor(7, [1, 1, 0], `I. Mechanics PB: ${format(timesCompleted('im'))}`, `×${format(tmp.value.kua.blessings.upg2Base.add(1), 3)}^${format(COL_CHALLENGES.im.type2ChalEff![1], 3)}`, `/${format(eff)}`, Decimal.gt(COL_CHALLENGES.im.type2ChalEff![1], 1), "col");

            if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[0], 1)) {
                eff = eff.pow(KUA_BLESS_UPGS[0].eff()[0]);
            }
            setFactor(8, [1, 1, 0], "KBlessing Upgrade 1", `^${format(KUA_BLESS_UPGS[0].eff()[0], 3)}`, `/${format(eff)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[0], 1), "kb");
            const data = {
                prevEff: eff,
                scal: getSCSLAttribute('upg2', false)
            }

            eff = scale(eff, 0, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('upg2', false, 0, `/${format(data.prevEff.div(eff), 3)}`);
            setFactor(9, [1, 1, 0], "Softcap", `softcap(${format(data.prevEff)})`, `/${format(eff)}`, eff.gte(data.scal[0].start), "sc1");

            if (getKuaUpgrade("p", 7)) {
                eff = eff.pow(3);
            }
            setFactor(10, [1, 1, 0], "KPower Upgrade 7", `^${format(3, 3)}`, `/${format(eff)}`, getKuaUpgrade("p", 7), "kua");

            data.prevEff = eff

            eff = scale(eff, 2.1, false, data.scal[1].start, data.scal[1].power, data.scal[1].basePow);
            setSCSLEffectDisp('upg2', false, 1, `${format(data.prevEff.log(eff), 3)}√`);
            setFactor(11, [1, 1, 0], "Supersoftcap", `supersoftcap(${format(data.prevEff)})`, `/${format(eff)}`, eff.gte(data.scal[1].start), "sc2");

            if (inChallenge("su") && Decimal.gte(challengeDepth("su"), 5)) {
                eff = eff.log10().add(1).pow(getColChalCondEffects("su")[2]).sub(1).pow10();
            }
            setFactor(12, [1, 1, 0], `Sabotaged Upgrades ×${format(challengeDepth("su"))}`, `dilate ${format(getColChalCondEffects("su")[2], 3)}`, `/${format(eff)}`, inChallenge("su") && Decimal.gte(challengeDepth("su"), 5), "col");
            return eff;
        }
    },
    { // UPG3
        get freeExtra() {
            let i = D(0);
            if (tmp.value.kua.proofs.upgrades.effect[0].effect.gt(0)) {
                i = i.add(tmp.value.kua.proofs.upgrades.effect[0].effect);
            }
            setFactor(1, [1, 2, 0], "Basic Discoveries", `+${format(tmp.value.kua.proofs.upgrades.effect[0].effect, 2)}`, `${format(i)} effective`, tmp.value.kua.proofs.upgrades.effect[0].effect.gt(0), "kp");
            if (inChallenge('dc')) {
                i = i.add(player.value.gameProgress.main.upgrades[2].accumulated);
            }
            setFactor(2, [1, 2, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `+${format(player.value.gameProgress.main.upgrades[2].accumulated, 1)}`, `+${format(i)}`, inChallenge('dc'), 'col');
            return i;
        },
        get effectBase() {
            let i = D(0.01);
            setFactor(0, [1, 2, 2], "Base", `${format(0.01, 3)}`, `${format(i, 3)}`, true);

            i = i.add(KUA_ENHANCERS.enhances[2].effect());

            if (ifAchievement(1, 10)) {
                i = i.mul(1.01);
            }
            setFactor(1, [1, 2, 2], "Achievement ID (1, 10)", `×${format(1.01, 3)}`, `${format(i, 3)}`, ifAchievement(1, 10), "ach");
            return i;
        },
        effective(x) {
            let i = D(x);
            i = i.add(this.freeExtra);
            if (getKuaUpgrade("p", 2)) {
                i = i.mul(KUA_UPGRADES.KPower[1].eff!);
            }
            setFactor(3, [1, 2, 0], "KPower Upgrade 2", `×${format(KUA_UPGRADES.KPower[1].eff!, 3)}`, `${format(i)} effective`, getKuaUpgrade("p", 2), "kua");
            if (ifAchievement(1, 5)) {
                i = i.mul(1.01);
            }
            setFactor(4, [1, 2, 0], "Achievement ID (1, 5)", `×${format(1.01, 3)}`, `${format(i)} effective`, ifAchievement(1, 5), "ach");
            if (Decimal.gte(getOMUpgrade(11), 1)) {
                i = i.mul(MAIN_ONE_UPGS[11].effect.value)
            }
            setFactor(5, [1, 2, 0], "One Upgrade #12", `×${format(MAIN_ONE_UPGS[11].effect.value, 3)}`, `${format(i)} effective`, Decimal.gte(getOMUpgrade(11), 1), "ach");
            return i;
        },
        effect(x = player.value.gameProgress.main.upgrades[2].bought) {
            if (!tmp.value.main.upgrades[2].active) {
                return D(0);
            }
            let eff = D(x);
            setFactor(0, [1, 2, 0], "Base", `${format(eff, 3)}`, `${format(eff)} effective`, true);
            eff = this.effective(x);

            setFactor(6, [1, 2, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `×${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[0], 2)}^${format(player.value.gameProgress.main.upgrades[2].bought, 2)}`, `${format(eff.mul(tmp.value.main.upgrades[2].multiplier))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = eff.mul(tmp.value.main.upgrades[2].multiplier);
            }

            setFactor(7, [1, 2, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `log10(${format(eff, 3)}+${format(1)})^${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1], 2)}`, `${format(Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]);
            }

            setFactor(8, [1, 2, 0], "Resulting Effect", `${format(this.effectBase, 3)}×${format(eff, 3)}`, `+${format(this.effectBase.mul(eff), 3)}`, true);
            eff = this.effectBase.mul(eff);
            const data = {
                prevEff: eff,
                scal: getSCSLAttribute('upg3', false)
            }

            eff = scale(eff, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('upg3', false, 0, `/${format(data.prevEff.div(eff), 3)}`);
            setFactor(9, [1, 2, 0], "Softcap", `softcap(${format(data.prevEff, 3)})`, `+${format(eff, 3)}`, eff.gte(data.scal[0].start), "sc1");
            return eff;
        }
    },
    { // UPG4
        get freeExtra() {
            let i = D(0);
            if (inChallenge('dc')) {
                i = i.add(player.value.gameProgress.main.upgrades[3].accumulated);
            }
            setFactor(1, [1, 3, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `+${format(player.value.gameProgress.main.upgrades[3].accumulated, 1)}`, `+${format(i)}`, inChallenge('dc'), 'col');
            return i;
        },
        get effectBase() {
            let i = tmp.value.kua.effects.upg4;
            setFactor(0, [1, 3, 2], "Base", `${format(tmp.value.kua.effects.upg4, 3)}`, `${format(tmp.value.kua.effects.upg4, 3)}`, true);
            if (ifAchievement(1, 10)) {
                i = i.mul(1.01);
            }
            setFactor(1, [1, 3, 2], "Achievement ID (1, 10)", `×${format(1.01, 3)}`, `${format(i, 3)}`, ifAchievement(1, 10), "ach");
            
            const data = {
                prevEff: i,
                scal: getSCSLAttribute('kuaupg4base', false)
            }

            i = scale(i, 0, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('kuaupg4base', false, 0, `/${format(data.prevEff.div(i), 3)}`);
            setFactor(2, [1, 3, 2], "Softcap", `softcap(${format(data.prevEff)})`, `${format(i, 3)}`, i.gte(data.scal[0].start), "sc1");
            return i;
        },
        effective(x) {
            let i = D(x);
            i = i.add(this.freeExtra);
            if (Decimal.gte(getOMUpgrade(16), 1)) {
                i = i.pow(MAIN_ONE_UPGS[16].effect.value);
            }
            setFactor(2, [1, 3, 0], "One-Upgrade #17", `^${format(MAIN_ONE_UPGS[16].effect.value, 3)}`, `${format(i)} effective`, Decimal.gte(getOMUpgrade(16), 1));
            return i;
        },
        effect(x = player.value.gameProgress.main.upgrades[3].bought) {
            if (!tmp.value.main.upgrades[3].active) {
                return D(1);
            }
            let eff = D(x);
            setFactor(0, [1, 3, 0], "Base", `${format(eff, 3)}`, `${format(eff)} effective`, true);
            eff = this.effective(x);

            setFactor(3, [1, 3, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `×${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[0], 2)}^${format(player.value.gameProgress.main.upgrades[3].bought, 2)}`, `${format(eff.mul(tmp.value.main.upgrades[3].multiplier))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = eff.mul(tmp.value.main.upgrades[3].multiplier);
            }

            setFactor(4, [1, 3, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `log10(${format(eff, 3)}+${format(1)})^${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1], 2)}`, `${format(Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]);
            }

            setFactor(5, [1, 3, 0], "Resulting Effect", `${format(this.effectBase, 3)}^${format(eff, 3)}`, `×${format(this.effectBase.pow(eff))}`, true);
            eff = this.effectBase.pow(eff);

            const data = {
                prevEff: eff,
                scal: getSCSLAttribute('upg4', false)
            }

            eff = scale(eff, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('upg4', false, 0, `${format(data.prevEff.log(eff), 3)}√`);
            setFactor(6, [1, 3, 0], "Softcap", `softcap(${format(data.prevEff)})`, `×${format(eff)}`, eff.gte(data.scal[0].start), "sc1");
            return eff;
        }
    },
    { // UPG5
        get freeExtra() {
            let i = D(0);
            if (inChallenge('dc')) {
                i = i.add(player.value.gameProgress.main.upgrades[4].accumulated);
            }
            setFactor(1, [1, 4, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `+${format(player.value.gameProgress.main.upgrades[4].accumulated, 1)}`, `+${format(i)}`, inChallenge('dc'), 'col');
            return i;
        },
        get effectBase() {
            let i = tmp.value.kua.effects.upg5;
            setFactor(0, [1, 4, 2], "Base", `${format(tmp.value.kua.effects.upg5, 3)}`, `${format(tmp.value.kua.effects.upg5, 3)}`, true);
            if (ifAchievement(1, 10)) {
                i = i.mul(1.01);
            }
            setFactor(1, [1, 4, 2], "Achievement ID (1, 10)", `×${format(1.01, 3)}`, `${format(i, 3)}`, ifAchievement(1, 10), "ach");

            const data = {
                prevEff: i,
                scal: getSCSLAttribute('kuaupg5base', false)
            }

            i = scale(i, 0, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('kuaupg5base', false, 0, `/${format(data.prevEff.div(i), 2)}`);
            setFactor(2, [1, 4, 2], "Softcap", `softcap(${format(data.prevEff)})`, `${format(i, 3)}`, i.gte(data.scal[0].start), "sc1");
            return i;
        },
        effective(x) {
            let i = D(x);
            i = i.add(this.freeExtra);
            if (Decimal.gte(getOMUpgrade(16), 1)) {
                i = i.pow(MAIN_ONE_UPGS[16].effect.value);
            }
            setFactor(2, [1, 4, 0], "One-Upgrade #17", `^${format(MAIN_ONE_UPGS[16].effect.value, 3)}`, `${format(i)} effective`, Decimal.gte(getOMUpgrade(16), 1));
            return i;
        },
        effect(x = player.value.gameProgress.main.upgrades[4].bought) {
            if (!tmp.value.main.upgrades[4].active) {
                return D(1);
            }
            let eff = D(x);
            setFactor(0, [1, 4, 0], "Base", `${format(eff, 3)}`, `${format(eff)} effective`, true);
            eff = this.effective(x);

            setFactor(3, [1, 4, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `×${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[0], 2)}^${format(player.value.gameProgress.main.upgrades[4].bought, 2)}`, `${format(eff.mul(tmp.value.main.upgrades[4].multiplier))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = eff.mul(tmp.value.main.upgrades[4].multiplier);
            }

            setFactor(4, [1, 4, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `log10(${format(eff, 3)}+${format(1)})^${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1], 2)}`, `${format(Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]);
            }

            setFactor(5, [1, 4, 0], "Resulting Effect", `${format(this.effectBase, 3)}^${format(eff, 3)}`, `/${format(this.effectBase.pow(eff))}`, true);
            eff = this.effectBase.pow(eff);
            const data = {
                prevEff: eff,
                scal: getSCSLAttribute('upg5', false)
            }

            eff = scale(eff, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('upg5', false, 0, `${format(data.prevEff.log(eff), 3)}√`);
            setFactor(6, [1, 4, 0], "Softcap", `softcap(${format(data.prevEff)})`, `/${format(eff)}`, eff.gte(data.scal[0].start), "sc1");
            return eff;
        }
    },
    { // UPG6
        get freeExtra() {
            let i = D(0);
            if (inChallenge('dc')) {
                i = i.add(player.value.gameProgress.main.upgrades[5].accumulated);
            }
            setFactor(1, [1, 5, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `+${format(player.value.gameProgress.main.upgrades[5].accumulated, 1)}`, `+${format(i)}`, inChallenge('dc'), 'col');
            return i;
        },
        get effectBase() {
            let i = tmp.value.kua.effects.upg6;
            setFactor(0, [1, 5, 2], "Base", `${format(tmp.value.kua.effects.upg6, 3)}`, `${format(tmp.value.kua.effects.upg6, 3)}`, true);
            if (ifAchievement(1, 10)) {
                i = i.mul(1.01);
            }
            setFactor(1, [1, 5, 2], "Achievement ID (1, 10)", `×${format(1.01, 3)}`, `${format(i, 3)}`, ifAchievement(1, 10), "ach");

            if (getKuaUpgrade("k", 4)) { 
                i = i.mul(1.5);
            }
            setFactor(2, [1, 5, 2], "Kuaraniai Upgrade 5", `×${format(1.5, 3)}`, `${format(i, 3)}`, getKuaUpgrade("k", 4), "kua");

            const data = {
                prevEff: i,
                scal: getSCSLAttribute('kuaupg6base', false)
            }

            i = scale(i, 0, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('kuaupg6base', false, 0, `/${format(data.prevEff.div(i), 2)}`);
            setFactor(3, [1, 5, 2], "Softcap", `softcap(${format(data.prevEff, 3)})`, `${format(i, 3)}`, i.gte(data.scal[0].start), "sc1");
            return i;
        },
        effective(x) {
            let i = D(x);
            i = i.add(this.freeExtra);
            if (Decimal.gte(getOMUpgrade(16), 1)) {
                i = i.pow(MAIN_ONE_UPGS[16].effect.value);
            }
            setFactor(2, [1, 5, 0], "One-Upgrade #17", `^${format(MAIN_ONE_UPGS[16].effect.value, 3)}`, `${format(i)} effective`, Decimal.gte(getOMUpgrade(16), 1));
            return i
        },
        effect(x = player.value.gameProgress.main.upgrades[5].bought) {
            if (!tmp.value.main.upgrades[5].active) {
                return D(0);
            }
            let eff = D(x);
            setFactor(0, [1, 5, 0], "Base", `${format(eff, 3)}`, `${format(eff)} effective`, true);
            eff = this.effective(x);

            setFactor(3, [1, 5, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `×${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[0], 2)}^${format(player.value.gameProgress.main.upgrades[5].bought, 2)}`, `${format(eff.mul(tmp.value.main.upgrades[5].multiplier))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = eff.mul(tmp.value.main.upgrades[5].multiplier);
            }

            setFactor(4, [1, 5, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `log10(${format(eff, 3)}+${format(1)})^${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1], 2)}`, `${format(Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]);
            }

            setFactor(5, [1, 5, 0], "Resulting Effect", `${format(this.effectBase, 3)}×${format(eff, 3)}`, `+${format(this.effectBase.mul(eff), 3)}`, true);
            eff = this.effectBase.mul(eff);
            const data = {
                prevEff: eff,
                scal: getSCSLAttribute('upg6', false)
            }

            // i don't have a good feeling about this softcap, makes me feel it actually *inflates* instead of reduces
            eff = scale(eff, 1.3, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);

            setSCSLEffectDisp('upg6', false, 0, `/${format(data.prevEff.div(eff), 2)}`);
            setFactor(6, [1, 5, 0], "Softcap", `softcap(${format(data.prevEff)})`, `+${format(eff, 3)}`, eff.gte(data.scal[0].start), "sc1");
            return eff;
        }
    },
    { // UPG7
        get freeExtra() {
            let i = D(0);
            if (inChallenge('dc')) {
                i = i.add(player.value.gameProgress.main.upgrades[6].accumulated);
            }
            setFactor(1, [1, 6, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `+${format(player.value.gameProgress.main.upgrades[6].accumulated, 1)}`, `+${format(i)}`, inChallenge('dc'), 'col');
            return i;
        },
        get effectBase() {
            const i = D(1.01);
            setFactor(0, [1, 6, 2], "Base", `${format(i, 3)}`, `${format(i, 3)}`, true);
            return i;
        },
        effective(x) {
            let i = D(x);
            i = i.add(this.freeExtra);
            return i;
        },
        effect(x = player.value.gameProgress.main.upgrades[6].bought) {
            if (!tmp.value.main.upgrades[6].active) {
                return D(1);
            }
            let eff = D(x);
            setFactor(0, [1, 6, 0], "Base", `${format(eff, 3)}`, `${format(eff)} effective`, true);
            eff = this.effective(x);

            setFactor(2, [1, 6, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `×${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[0], 2)}^${format(player.value.gameProgress.main.upgrades[6].bought, 2)}`, `${format(eff.mul(tmp.value.main.upgrades[6].multiplier))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = eff.mul(tmp.value.main.upgrades[6].multiplier);
            }

            setFactor(3, [1, 6, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `log10(${format(eff, 3)}+${format(1)})^${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1], 2)}`, `${format(Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]);
            }

            setFactor(4, [1, 6, 0], "Resulting Effect", `${format(this.effectBase, 3)}^${format(eff, 3)}`, `^${format(this.effectBase.pow(eff), 3)}`, true);
            eff = this.effectBase.pow(eff);
            return eff;
        }
    },
    { // UPG8
        get freeExtra() {
            let i = D(0);
            if (inChallenge('dc')) {
                i = i.add(player.value.gameProgress.main.upgrades[7].accumulated);
            }
            setFactor(1, [1, 7, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `+${format(player.value.gameProgress.main.upgrades[7].accumulated, 1)}`, `+${format(i)}`, inChallenge('dc'), 'col');
            return i;
        },
        get effectBase() {
            const i = D(0.99);
            setFactor(0, [1, 7, 2], "Base", `${format(i, 3)}`, `${format(i, 3)}`, true);
            return i;
        },
        effective(x) {
            let i = D(x);
            i = i.add(this.freeExtra);
            return i
        },
        effect(x = player.value.gameProgress.main.upgrades[7].bought) {
            if (!tmp.value.main.upgrades[7].active) {
                return D(1);
            }
            let eff = D(x);
            setFactor(0, [1, 7, 0], "Base", `${format(eff, 3)}`, `${format(eff)} effective`, true);
            eff = this.effective(x);

            setFactor(2, [1, 7, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `×${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[0], 2)}^${format(player.value.gameProgress.main.upgrades[7].bought, 2)}`, `${format(eff.mul(tmp.value.main.upgrades[7].multiplier))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = eff.mul(tmp.value.main.upgrades[7].multiplier);
            }

            setFactor(3, [1, 7, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `log10(${format(eff, 3)}+${format(1)})^${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1], 2)}`, `${format(Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]);
            }

            setFactor(4, [1, 7, 0], "Resulting Effect", `${format(this.effectBase, 3)}^${format(eff, 3)}`, `^${format(this.effectBase.pow(eff), 3)}`, true);
            eff = this.effectBase.pow(eff);
            return eff;
        }
    },
    { // UPG9
        get freeExtra() {
            let i = D(0);
            if (inChallenge('dc')) {
                i = i.add(player.value.gameProgress.main.upgrades[8].accumulated);
            }
            setFactor(1, [1, 8, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `+${format(player.value.gameProgress.main.upgrades[8].accumulated, 1)}`, `+${format(i)}`, inChallenge('dc'), 'col');
            return i;
        },
        get effectBase() {
            const i = D(1.01);
            setFactor(0, [1, 8, 2], "Base", `${format(i, 3)}`, `${format(i, 3)}`, true);
            return i;
        },
        effective(x) {
            let i = D(x);
            i = i.add(this.freeExtra);
            return i
        },
        effect(x = player.value.gameProgress.main.upgrades[8].bought) {
            if (!tmp.value.main.upgrades[8].active) {
                return D(1);
            }
            let eff = D(x);
            setFactor(0, [1, 8, 0], "Base", `${format(eff, 3)}`, `${format(eff)} effective`, true);
            eff = this.effective(x);

            setFactor(2, [1, 8, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `×${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[0], 2)}^${format(player.value.gameProgress.main.upgrades[8].bought, 2)}`, `${format(eff.mul(tmp.value.main.upgrades[8].multiplier))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = eff.mul(tmp.value.main.upgrades[8].multiplier);
            }

            setFactor(3, [1, 8, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `log10(${format(eff, 3)}+${format(1)})^${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1], 2)}`, `${format(Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]))} effective`, inChallenge('dc'), 'col');
            if (inChallenge('dc')) {
                eff = Decimal.add(eff, 1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]);
            }
            setFactor(4, [1, 8, 0], "Resulting Effect", `${format(this.effectBase, 3)}^${format(eff, 3)}`, `×${format(this.effectBase.pow(eff), 3)}`, true);
            eff = this.effectBase.pow(eff);
            return eff;
        }
    },
]

export const initAllMainUpgrades = (): Array<TmpMainUpgrade> => {
    const arr = [];
    for (let i = MAIN_UPGS.length - 1; i >= 0; i--) {
        arr.push(
            {
                effect: D(1),
                effective: D(0),
                cost: D(Infinity),
                target: D(0),
                canBuy: false,
                effectTextColor: "#ffffff",
                costTextColor: "#ffffff",
                active: true,
                costBase: {exp: D(0), scale: [D(1), D(2), D(2)]},
                freeExtra: D(0),
                effectBase: D(1),
                calculatedEB: D(1),
                multiplier: D(1),
                calcEB: D(0),
                shown: false,
                autoUnlocked: false,
                display: ``,
                totalDisp: ``
            }
        );
    }
    return arr;
}