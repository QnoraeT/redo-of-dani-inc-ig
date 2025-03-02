import { LABELS, pushFactor, resetFactor } from "@/components/Game/Game_Stats/Game_Stats";
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
import { getKuaUpgrade, KUA_UPGRADES } from "../../Game_Kuaraniai/Game_KuaUpgrades/Game_KuaUpgrades";
import { KUA_BLESS_UPGS } from "../../Game_Kuaraniai/Game_KuaBlessings/Game_KuaBlessings";
import { computed, type ComputedRef } from "vue";
import { hasGrowanMilestone } from "../../Game_Layer4/Game_Growan/Game_Growan";

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
    freeExtra: ComputedRef<Decimal>
    effectBase: ComputedRef<Decimal>
    effective: (x: DecimalSource) => Decimal
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
    dc11FreeLvs: Decimal,
    effectBase: Decimal,
    multiplier: Decimal,
    calcEB: Decimal,
    shown: boolean,
    autoUnlocked: boolean,
    display: string,
    totalDisp: string
};

export const initAllMainUpgrades = (): Array<TmpMainUpgrade> => {
    const arr = [];
    for (let i = MAIN_UPG_DATA.length - 1; i >= 0; i--) {
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
                dc11FreeLvs: D(0),
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

export class MainUpgrades {
    index: number
    baseEffectBase: {
        type: number,
        val: ComputedRef<Decimal>
    }
    baseCostGrowthData: {
        exp: Decimal,
        scale: Array<Decimal>
    }
    constructor(index: number) {
        this.index = index;
        this.baseCostGrowthData = [
            {exp: D(0), scale: [D(5),    D(1.55),   D(1)     ]},
            {exp: D(0), scale: [D(1e3),  D(1.25),   D(1)     ]},
            {exp: D(0), scale: [D(1e10), D(100),    D(1.05)  ]},
            {exp: D(0), scale: [D(1e33), D(1.02),   D(1.0003)]},
            {exp: D(0), scale: [D(1e45), D(1.03),   D(1.0002)]},
            {exp: D(0), scale: [D(1e63), D(1.25),   D(1.025) ]},
            {exp: D(1), scale: [D(1000), D(1.01),   D(1.0001)]},
            {exp: D(1), scale: [D(1250), D(1.0075), D(1.0002)]},
            {exp: D(1), scale: [D(1500), D(1.025),  D(1.0005)]},
        ][index];
        this.baseEffectBase = [
            {type: 1, val: computed(() => { return D(1.5); })},
            {type: 1, val: computed(() => { return D(1.2); })},
            {type: 0, val: computed(() => { return D(0.01); })},
            {type: 1, val: computed(() => { return tmp.value.kua.effects.upg4; })},
            {type: 1, val: computed(() => { return tmp.value.kua.effects.upg5; })},
            {type: 0, val: computed(() => { return tmp.value.kua.effects.upg6; })},
            {type: 1, val: computed(() => { return D(1.01); })},
            {type: 1, val: computed(() => { return D(0.99); })},
            {type: 1, val: computed(() => { return D(1.01); })},
        ][index]
    }
    freeExtra: ComputedRef<Decimal> = computed(() => {
        const FACTOR_ARR = [1, this.index, 0];
        // resetFactor(FACTOR_ARR);
        let extraLv = D(0);
        let eff = D(0);

        if (this.index === 0) {
            eff = tmp.value.main.upgrades[1].effective.mul(tmp.value.kua.proofs.upgrades.effect[3].effect);
            if (eff.gt(0)) {
                extraLv = extraLv.add(eff);
                pushFactor(FACTOR_ARR, LABELS.kpe4, `+${format(tmp.value.kua.proofs.upgrades.effect[3].effect, 2)}×${format(tmp.value.main.upgrades[1].effective)}`, `+${format(eff)}`, "kp");
            }
        }

        if (this.index >= 0 && this.index <= 2) {
            eff = tmp.value.kua.proofs.upgrades.effect[0].effect;
            if (eff.gt(0)) {
                extraLv = extraLv.add(eff);
                pushFactor(FACTOR_ARR, LABELS.kpe1, `+${format(eff, 2)}`, `+${format(eff)}`, "kp");
            }
        }

        if (this.index >= 0 && this.index <= 5) {
            if (Decimal.gte(timesCompleted("dc"), 3) && !player.value.gameProgress.col.inAChallenge) {
                eff = getColChalRewEffects("dc")[1];
                extraLv = extraLv.add(eff);
                pushFactor(FACTOR_ARR, COL_CHALLENGES.dc.labelRew.value, `+${format(eff, 2)}`, `+${format(eff)}`, "col");
            }
        }

        if (Decimal.gte(timesCompleted("dc"), 11) && !player.value.gameProgress.inChallenge.dc.overall) {
            eff = tmp.value.main.upgrades[this.index].dc11FreeLvs;
            extraLv = extraLv.add(eff);
            pushFactor(FACTOR_ARR, COL_CHALLENGES.dc.labelRew.value, `+${format(eff, 2)}`, `+${format(eff)}`, "col");
        }

        return extraLv;
    })
    effectBase: ComputedRef<Decimal> = computed(() => {
        const FACTOR_ARR = [1, this.index, 2];
        resetFactor(FACTOR_ARR);
        let effBase = D(0);
        let eff = D(0);

        effBase = this.baseEffectBase.val.value;
        pushFactor(FACTOR_ARR, LABELS.def, `${format(effBase, 3)}`, `${format(effBase, 3)}`)

        if (this.index === 0) {
            if (Decimal.gt(player.value.gameProgress.main.upgrades[2].bought, 0)) {
                eff = MAIN_UPG_DATA[2].effect.value;
                effBase = effBase.add(eff);
                pushFactor(FACTOR_ARR, LABELS.upg3, `+${format(eff, 3)}`, `${format(effBase, 3)}`);
            }

            if (Decimal.gt(player.value.gameProgress.main.upgrades[5].bought, 0)) {
                eff = MAIN_UPG_DATA[5].effect.value;
                effBase = effBase.add(eff);
                pushFactor(FACTOR_ARR, LABELS.upg6, `+${format(eff, 3)}`, `${format(effBase, 3)}`);
            }

            if (Decimal.gt(getOMUpgrade(1), 0)) {
                eff = MAIN_ONE_UPGS[1].effect.value;
                effBase = effBase.add(eff);
                pushFactor(FACTOR_ARR, LABELS.ou2, `+${format(eff, 3)}`, `${format(effBase, 3)}`);
            }

            if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 9)) {
                eff = D(0.05);
                effBase = effBase.add(eff);
                pushFactor(FACTOR_ARR, LABELS.pr2_9, `+${format(eff, 3)}`, `${format(effBase, 3)}`);
            }

            if (Decimal.gt(player.value.gameProgress.kua.blessings.amount, 0)) {
                eff = tmp.value.kua.blessings.upg1Base;
                effBase = effBase.add(eff);
                pushFactor(FACTOR_ARR, LABELS.kb, `+${format(eff, 3)}`, `${format(effBase, 3)}`, "kb");
            }

            // i = i.add(KUA_ENHANCERS.enhances[0].effect());
        }

        if (this.index === 1) {
            if (ifAchievement(0, 12)) {
                eff = D(0.05);
                effBase = effBase.add(eff);
                pushFactor(FACTOR_ARR, "Achievement ID: (0, 12)", `+${format(eff, 3)}`, `${format(effBase, 3)}`, "ach");
            }

            if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 4)) {
                eff = D(0.1);
                effBase = effBase.add(eff);
                pushFactor(FACTOR_ARR, LABELS.pr2_4, `+${format(eff, 3)}`, `${format(effBase, 3)}`);
            }

            if (getKuaUpgrade("p", 1)) {
                eff = KUA_UPGRADES.KPower[0].eff!.value;
                effBase = effBase.add(eff);
                pushFactor(FACTOR_ARR, LABELS.kpowu1, `+${format(eff, 3)}`, `${format(effBase, 3)}`, "kua");
            }

            if (getKuaUpgrade("s", 14)) {
                eff = KUA_UPGRADES.KShards[13].eff2!.value;
                effBase = effBase.add(eff);
                pushFactor(FACTOR_ARR, LABELS.kshau14, `+${format(eff, 3)}`, `${format(effBase, 3)}`, "kua");
            }

            if (Decimal.gt(player.value.gameProgress.kua.blessings.amount, 0)) {
                eff = tmp.value.kua.blessings.upg2Base;
                effBase = effBase.add(eff);
                pushFactor(FACTOR_ARR, LABELS.kb, `+${format(eff, 3)}`, `${format(effBase, 3)}`, "kb");
            }

            // i = i.add(KUA_ENHANCERS.enhances[1].effect());

            if (getKuaUpgrade("s", 5)) {
                eff = D(1.125);
                effBase = effBase.mul(eff);
                pushFactor(FACTOR_ARR, LABELS.kshau5, `×${format(eff, 3)}`, `${format(effBase, 3)}`, "kua");
            }

            if (Decimal.gte(timesCompleted("su"), 6)) {
                eff = getColChalRewEffects("su")[2];
                effBase = effBase.mul(eff);
                pushFactor(FACTOR_ARR, COL_CHALLENGES.su.labelRew.value, `×${format(eff, 3)}`, `${format(effBase, 3)}`, "col");
            }
        }

        if (this.index === 2) {
            // i = i.add(KUA_ENHANCERS.enhances[2].effect());
            if (Decimal.gte(timesCompleted("dc"), 5)) {
                eff = getColChalRewEffects("dc")[2];
                effBase = effBase.add(eff);
                pushFactor(FACTOR_ARR, COL_CHALLENGES.dc.labelRew.value, `+${format(eff, 3)}`, `${format(effBase, 3)}`, "col");
            }
        }

        if (this.index === 5) {
            if (getKuaUpgrade("k", 5)) {
                eff = D(1.5);
                effBase = effBase.mul(eff);
                pushFactor(FACTOR_ARR, LABELS.ku5, `×${format(eff, 3)}`, `${format(effBase, 3)}`, "kua");
            }
        }

        if (this.index >= 0 && this.index <= 5 && ifAchievement(1, 10)) {
            eff = D(1.01);
            effBase = effBase.mul(eff);
            pushFactor(FACTOR_ARR, "Achievement ID: (1, 10)", `×${format(eff, 3)}`, `${format(effBase, 3)}`, "ach");
        }

        if (this.index === 0) {
            if (Decimal.gt(player.value.gameProgress.main.upgrades[8].bought, 0)) {
                eff = MAIN_UPG_DATA[8].effect.value;
                effBase = effBase.mul(eff);
                pushFactor(FACTOR_ARR, LABELS.upg9, `×${format(eff, 3)}`, `${format(effBase, 3)}`);
            }

            if (inChallenge("su")) {
                eff = getColChalCondEffects("su")[1];
                effBase = effBase.sub(eff);
                pushFactor(FACTOR_ARR, COL_CHALLENGES.su.labelEff.value, `-${format(eff, 3)}`, `${format(effBase, 3)}`);
            }
        }

        if (this.index >= 3 && this.index <= 5) {
            const data = {
                prevEff: effBase,
                scal: getSCSLAttribute(`kuaupg${(this.index + 1) as 4 | 5 | 6}base`, false)
            }

            if (effBase.gte(data.scal[0].start)) {
                effBase = scale(effBase, 0, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
                setSCSLEffectDisp(`kuaupg${(this.index + 1) as 4 | 5 | 6}base`, false, 0, `/${format(data.prevEff.div(effBase), 3)}`);
                pushFactor(FACTOR_ARR, LABELS.sc1, `softcap(${format(data.prevEff)})`, `${format(eff, 3)}`, "sc1");
            }
        }

        return effBase;
    })

    effective: ComputedRef<Decimal> = computed(() => {
        const FACTOR_ARR = [1, this.index, 0];
        // resetFactor(FACTOR_ARR);
        let effLv = D(player.value.gameProgress.main.upgrades[this.index].bought);
        let eff = D(0);
        effLv = effLv.add(this.freeExtra.value);

        if (this.index === 0) {
            if (ifAchievement(1, 5)) {
                eff = getAchievementEffect(1, 5);
                effLv = effLv.mul(eff);
                pushFactor(FACTOR_ARR, "Achievement ID: (1, 5)", `×${format(eff, 3)}`, `${format(effLv)} effective`, "ach");
            }

            if (getKuaUpgrade('p', 16)) {
                eff = KUA_UPGRADES.KPower[15].eff!.value;
                effLv = effLv.mul(eff);
                pushFactor(FACTOR_ARR, LABELS.kpowu16, `×${format(eff, 3)}`, `${format(effLv)} effective`, "kua");
            }
        }

        if (this.index === 2) {
            if (Decimal.gt(getOMUpgrade(11), 0)) {
                eff = MAIN_ONE_UPGS[11].effect.value;
                effLv = effLv.mul(eff);
                pushFactor(FACTOR_ARR, LABELS.ou12, `×${format(eff, 3)}`, `${format(effLv)} effective`);
            }

            if (getKuaUpgrade('p', 2)) {
                eff = KUA_UPGRADES.KPower[1].eff!.value;
                effLv = effLv.mul(eff);
                pushFactor(FACTOR_ARR, LABELS.kpowu2, `×${format(eff, 3)}`, `${format(effLv)} effective`, "kua");
            }
        }

        if (this.index >= 0 && this.index <= 2) {
            if (hasGrowanMilestone(2) && getKuaUpgrade('s', 15 + this.index)) {
                eff = D(1.1);
                effLv = effLv.mul(eff);

                pushFactor(FACTOR_ARR, LABELS[`kshau${15 + this.index}`], `×${format(eff, 3)}`, `${format(effLv)} effective`, "kua");
            }
        }

        if (this.index >= 3 && this.index <= 5) {
            if (Decimal.gt(getOMUpgrade(16), 0)) {
                eff = MAIN_ONE_UPGS[16].effect.value;
                effLv = effLv.pow(eff);
                pushFactor(FACTOR_ARR, LABELS.ou17, `^${format(eff, 3)}`, `${format(effLv)} effective`);
            }
        }

        if (this.index === 1) {
            if (Decimal.gt(getOMUpgrade(6), 0)) {
                eff = MAIN_ONE_UPGS[6].effect.value;
                effLv = effLv.pow(eff);
                pushFactor(FACTOR_ARR, LABELS.ou7, `^${format(eff, 3)}`, `${format(effLv)} effective`);
            }
        }
        return effLv;
    })
    effect: ComputedRef<Decimal> = computed(() => {
        const FACTOR_ARR = [1, this.index, 0];
        resetFactor(FACTOR_ARR);
        pushFactor(FACTOR_ARR, LABELS.def, `${format(player.value.gameProgress.main.upgrades[this.index].bought)}`, `${format(player.value.gameProgress.main.upgrades[this.index].bought)} effective`);
        let effect = this.effective.value;
        let eff: DecimalSource = D(0);

        // ! yes, the "freeExtra" part of the accumulated is moved HERE so that things like Basic Discoveries or other stuff that can add free levels can do something to the multiplier
        if (inChallenge('dc')) {
            eff = player.value.gameProgress.main.upgrades[0].accumulated;
            effect = effect.add(eff);
            pushFactor(FACTOR_ARR, COL_CHALLENGES.dc.labelRew.value, `+${format(eff, 3)}`, `${format(effect)} effective`, "col");

            eff = tmp.value.main.upgrades[0].multiplier;
            effect = effect.mul(eff);
            pushFactor(FACTOR_ARR, COL_CHALLENGES.dc.labelRew.value, `×${format(eff, 3)}`, `${format(effect)} effective`, "col");

            eff = effect;
            effect = effect.add(1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]);
            pushFactor(FACTOR_ARR, COL_CHALLENGES.dc.labelRew.value, `log10(${format(eff, 3)}+${format(1)})^${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1], 3)}`, `${format(effect)} effective`, "col");
        }

        eff = effect;
        effect = this.baseEffectBase.type === 0
            ? this.effectBase.value.mul(effect)
            : this.effectBase.value.pow(effect);
            pushFactor(FACTOR_ARR, LABELS.def, this.baseEffectBase.type === 0
                ? `${format(this.effectBase.value, 3)}×${format(eff)}`
                : `${format(this.effectBase.value, 3)}^${format(eff)}`
            , `×${format(effect)}`)

        if (this.index === 0) {
            if (Decimal.gte(timesCompleted('im'), 1e33)) {
                eff = tmp.value.kua.blessings.upg1Base.add(1).pow(COL_CHALLENGES.im.type2ChalEff!.value[1]);
                effect = effect.mul(eff);
                pushFactor(FACTOR_ARR, COL_CHALLENGES.im.labelRew.value, `×${format(tmp.value.kua.blessings.upg1Base.add(1), 3)}^${format(COL_CHALLENGES.im.type2ChalEff!.value[1], 3)}`, `×${format(effect)}`, "col");
            }

            if (Decimal.gt(player.value.gameProgress.main.upgrades[6].bought, 0)) {
                eff = MAIN_UPG_DATA[6].effect.value;
                effect = effect.pow(eff);
                pushFactor(FACTOR_ARR, LABELS.upg7, `^${format(eff, 3)}`, `×${format(effect)}`);
            }

            if (getKuaUpgrade('p', 8)) {
                eff = D(1.01);
                effect = effect.max(1).log10().pow(eff).pow10();
                pushFactor(FACTOR_ARR, LABELS.kpowu8, `dilate ${format(eff, 3)}`, `×${format(effect)}`, "kua");
            }

            const data = {
                prevEff: effect,
                scal: getSCSLAttribute(`upg1`, false)
            }

            if (effect.gte(data.scal[0].start)) {
                effect = scale(effect, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
                setSCSLEffectDisp(`upg1`, false, 0, `${format(data.prevEff.log(effect), 3)}√`);
                pushFactor(FACTOR_ARR, LABELS.sc1, `softcap(${format(data.prevEff)})`, `×${format(effect)}`, "sc1");
            }

            data.prevEff = effect;

            if (effect.gte(data.scal[1].start)) {
                effect = scale(effect, 2.1, false, data.scal[1].start, data.scal[1].power, data.scal[1].basePow);
                setSCSLEffectDisp(`upg1`, false, 1, `${format(data.prevEff.log(effect), 3)}√`);
                pushFactor(FACTOR_ARR, LABELS.sc2, `supersoftcap(${format(data.prevEff)})`, `/${format(effect)}`, "sc2");
            }
        }

        if (this.index === 1) {
            if (Decimal.gte(timesCompleted('im'), 1e33)) {
                eff = tmp.value.kua.blessings.upg2Base.add(1).pow(COL_CHALLENGES.im.type2ChalEff!.value[1]);
                effect = effect.mul(eff);
                pushFactor(FACTOR_ARR, COL_CHALLENGES.im.labelRew.value, `×${format(tmp.value.kua.blessings.upg2Base.add(1), 3)}^${format(COL_CHALLENGES.im.type2ChalEff!.value[1], 3)}`, `/${format(effect)}`, "col");
            }

            if (Decimal.gt(player.value.gameProgress.kua.blessings.upgrades[0], 0)) {
                eff = KUA_BLESS_UPGS[0].eff.value[0];
                effect = effect.pow(eff);
                pushFactor(FACTOR_ARR, LABELS.kbu1, `^${format(eff, 3)}`, `/${format(effect)}`, "kb");
            }

            const data = {
                prevEff: effect,
                scal: getSCSLAttribute(`upg2`, false)
            }

            if (effect.gte(data.scal[0].start)) {
                effect = scale(effect, 0, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
                setSCSLEffectDisp(`upg2`, false, 0, `/${format(data.prevEff.div(effect), 3)}`);
                pushFactor(FACTOR_ARR, LABELS.sc1, `softcap(${format(data.prevEff)})`, `/${format(effect)}`, "sc1");
            }

            if (getKuaUpgrade('p', 7)) {
                eff = D(3);
                effect = effect.pow(eff);
                pushFactor(FACTOR_ARR, LABELS.kpowu7, `^${format(eff, 3)}`, `×${format(effect)}`, "kua");
            }

            data.prevEff = effect;

            if (effect.gte(data.scal[1].start)) {
                effect = scale(effect, 2.1, false, data.scal[1].start, data.scal[1].power, data.scal[1].basePow);
                setSCSLEffectDisp(`upg2`, false, 1, `${format(data.prevEff.log(effect), 3)}√`);
                pushFactor(FACTOR_ARR, LABELS.sc2, `supersoftcap(${format(data.prevEff)})`, `/${format(effect)}`, "sc2");
            }

            if (inChallenge("su") && Decimal.gte(challengeDepth("su"), 5)) {
                eff = getColChalCondEffects("su")[2];
                effect = effect.log10().add(1).pow(eff).sub(1).pow10();
                pushFactor(FACTOR_ARR, COL_CHALLENGES.su.labelEff.value, `dilate ${format(eff, 3)}`, `/${format(effect)}`, "col");
            }
        }

        if (this.index === 2) {
            const data = {
                prevEff: effect,
                scal: getSCSLAttribute(`upg3`, false)
            }

            if (effect.gte(data.scal[0].start)) {
                effect = scale(effect, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
                setSCSLEffectDisp(`upg3`, false, 0, `${format(data.prevEff.log(effect), 3)}√`);
                pushFactor(FACTOR_ARR, LABELS.sc1, `softcap(${format(data.prevEff)})`, `+${format(effect, 3)}`, "sc1");
            }
        }

        if (this.index === 3) {
            const data = {
                prevEff: effect,
                scal: getSCSLAttribute(`upg4`, false)
            }

            if (effect.gte(data.scal[0].start)) {
                effect = scale(effect, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
                setSCSLEffectDisp(`upg4`, false, 0, `${format(data.prevEff.log(effect), 3)}√`);
                pushFactor(FACTOR_ARR, LABELS.sc1, `softcap(${format(data.prevEff)})`, `×${format(effect)}`, "sc1");
            }
        }

        if (this.index === 4) {
            const data = {
                prevEff: effect,
                scal: getSCSLAttribute(`upg5`, false)
            }

            if (effect.gte(data.scal[0].start)) {
                effect = scale(effect, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
                setSCSLEffectDisp(`upg5`, false, 0, `${format(data.prevEff.log(effect), 3)}√`);
                pushFactor(FACTOR_ARR, LABELS.sc1, `softcap(${format(data.prevEff)})`, `/${format(effect)}`, "sc1");
            }
        }

        if (this.index === 5) {
            const data = {
                prevEff: effect,
                scal: getSCSLAttribute(`upg6`, false)
            }

            if (effect.gte(data.scal[0].start)) {
                effect = scale(effect, 1.3, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
                setSCSLEffectDisp(`upg6`, false, 0, `/${format(data.prevEff.div(effect), 3)}`);
                pushFactor(FACTOR_ARR, LABELS.sc1, `softcap(${format(data.prevEff)})`, `+${format(effect, 3)}`, "sc1");
            }
        }
        return effect;
    })  
}

 // TODO: make this a part of tmp
export const MAIN_UPG_DATA = [
    new MainUpgrades(0),
    new MainUpgrades(1),
    new MainUpgrades(2),
    new MainUpgrades(3),
    new MainUpgrades(4),
    new MainUpgrades(5),
    new MainUpgrades(6),
    new MainUpgrades(7),
    new MainUpgrades(8),
]