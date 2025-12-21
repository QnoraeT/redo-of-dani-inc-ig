import { format } from "@/format";
import { challengeDepth, getColChalCondEffects, getColChalRewEffects, inChallenge, timesCompleted } from "../../Game_Colosseum/Game_ColChallenges/Game_ColChalHandler";
import { shiftDown, tmp } from "@/main";
import { player } from "@/main";
import Decimal, { type DecimalSource } from "break_eternity.js";
import { getSCSLAttribute, setSCSLEffectDisp } from "@/softcapScaling";
import { D, scale } from "@/calc";
import { COL_CHALLENGES } from "../../Game_Colosseum/Game_ColChallenges/Game_ColChalData";
import { getOMUpgrade, MAIN_ONE_UPGS } from "../Game_OneUpgrades/Game_OneUpgrades";
import { getAchievementEffect, ifAchievement } from "@/components/Game/Game_Achievements/Game_Achievements";
import { getKuaUpgrade, KUA_UPGRADES } from "../../Game_Kuaraniai/Game_KuaUpgrades/Game_KuaUpgrades";
import { KUA_BLESS_UPGS } from "../../Game_Kuaraniai/Game_KuaBlessings/Game_KuaBlessings";
import { computed, type ComputedRef } from "vue";
import { hasGrowanMilestone } from "../../Game_Layer4/Game_Growan/Game_Growan";
import { updateMainUpgrades } from "../Game_Main";

export const buyGenUPG = (id: number): void => {
    if (Decimal.gte(player.value.prog.main.points, tmp.value.main.upgrades[id].cost)) {
        player.value.prog.main.points = Decimal.sub(player.value.prog.main.points, tmp.value.main.upgrades[id].cost);

        if (shiftDown) {
            player.value.prog.main.upgrades[id].bought = tmp.value.main.upgrades[id].target.floor().add(1).max(player.value.prog.main.upgrades[id].bought);
        } else {
            player.value.prog.main.upgrades[id].bought = Decimal.add(player.value.prog.main.upgrades[id].bought, 1);
        }

        player.value.prog.main.upgrades[id].boughtInKua = player.value.prog.main.upgrades[id].bought;
        updateMainUpgrades(0, id);
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

export const MAIN_UPGRADE_COST_DATA = [
    {exp: D(0), scale: [D(5),    D(1.55),   D(1)     ]},
    {exp: D(0), scale: [D(1e3),  D(1.25),   D(1)     ]},
    {exp: D(0), scale: [D(1e10), D(100),    D(1.05)  ]},
    {exp: D(0), scale: [D(1e33), D(1.02),   D(1.0003)]},
    {exp: D(0), scale: [D(1e45), D(1.03),   D(1.0002)]},
    {exp: D(0), scale: [D(1e63), D(1.25),   D(1.025) ]},
    {exp: D(1), scale: [D(1000), D(1.01),   D(1.0001)]},
    {exp: D(1), scale: [D(1250), D(1.0075), D(1.0002)]},
    {exp: D(1), scale: [D(1500), D(1.025),  D(1.0005)]},
]

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
        this.baseCostGrowthData = MAIN_UPGRADE_COST_DATA[index];
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
        let extraLv = D(0);
        let eff = D(0);

        if (this.index === 0) {
            eff = tmp.value.main.upgrades[1].effective.mul(tmp.value.kua.proofs.upgrades.effect[3].effect);
            if (eff.gt(0)) {
                extraLv = extraLv.add(eff);
            }
        }

        if (this.index >= 0 && this.index <= 2) {
            eff = tmp.value.kua.proofs.upgrades.effect[0].effect;
            if (eff.gt(0)) {
                extraLv = extraLv.add(eff);
            }
        }

        if (this.index >= 0 && this.index <= 5) {
            if (Decimal.gte(timesCompleted("dc"), 3) && !player.value.prog.col.inAChallenge) {
                eff = getColChalRewEffects("dc")[1];
                extraLv = extraLv.add(eff);
            }
        }

        if (Decimal.gte(timesCompleted("dc"), 11) && !player.value.prog.inChallenge.dc.overall) {
            eff = tmp.value.main.upgrades[this.index].dc11FreeLvs;
            extraLv = extraLv.add(eff);
        }

        return extraLv;
    })
    effectBase: ComputedRef<Decimal> = computed(() => {
        let effBase = D(0);
        let eff = D(0);

        effBase = this.baseEffectBase.val.value;

        if (this.index === 0) {
            if (Decimal.gt(player.value.prog.main.upgrades[2].bought, 0)) {
                eff = MAIN_UPG_DATA[2].effect.value;
                effBase = effBase.add(eff);
            }

            if (Decimal.gt(player.value.prog.main.upgrades[5].bought, 0)) {
                eff = MAIN_UPG_DATA[5].effect.value;
                effBase = effBase.add(eff);
            }

            if (Decimal.gt(getOMUpgrade(1), 0)) {
                eff = MAIN_ONE_UPGS[1].effect.value;
                effBase = effBase.add(eff);
            }

            if (Decimal.gte(player.value.prog.main.pr2.amount, 9)) {
                eff = D(0.05);
                effBase = effBase.add(eff);
            }

            if (Decimal.gt(player.value.prog.kua.blessings.amount, 0)) {
                eff = tmp.value.kua.blessings.upg1Base;
                effBase = effBase.add(eff);
            }

            // i = i.add(KUA_ENHANCERS.enhances[0].effect());
        }

        if (this.index === 1) {
            if (ifAchievement(0, 12)) {
                eff = D(0.05);
                effBase = effBase.add(eff);
            }

            if (Decimal.gte(player.value.prog.main.pr2.amount, 4)) {
                eff = D(0.1);
                effBase = effBase.add(eff);
            }

            if (getKuaUpgrade("p", 1)) {
                eff = KUA_UPGRADES.KPower[0].eff!.value;
                effBase = effBase.add(eff);
            }

            if (getKuaUpgrade("s", 14)) {
                eff = KUA_UPGRADES.KShards[13].eff2!.value;
                effBase = effBase.add(eff);
            }

            if (Decimal.gt(player.value.prog.kua.blessings.amount, 0)) {
                eff = tmp.value.kua.blessings.upg2Base;
                effBase = effBase.add(eff);
            }

            // i = i.add(KUA_ENHANCERS.enhances[1].effect());

            if (getKuaUpgrade("s", 5)) {
                eff = D(1.125);
                effBase = effBase.mul(eff);
            }

            if (Decimal.gte(timesCompleted("su"), 6)) {
                eff = getColChalRewEffects("su")[2];
                effBase = effBase.mul(eff);
            }
        }

        if (this.index === 2) {
            // i = i.add(KUA_ENHANCERS.enhances[2].effect());
            if (Decimal.gte(timesCompleted("dc"), 5)) {
                eff = getColChalRewEffects("dc")[2];
                effBase = effBase.add(eff);
            }
        }

        if (this.index === 5) {
            if (getKuaUpgrade("k", 5)) {
                eff = D(1.5);
                effBase = effBase.mul(eff);
            }
        }

        if (this.index >= 0 && this.index <= 5 && ifAchievement(1, 10)) {
            eff = D(1.01);
            effBase = effBase.mul(eff);
        }

        if (this.index === 0) {
            if (Decimal.gt(player.value.prog.main.upgrades[8].bought, 0)) {
                eff = MAIN_UPG_DATA[8].effect.value;
                effBase = effBase.mul(eff);
            }

            if (inChallenge("su")) {
                eff = getColChalCondEffects("su")[1];
                effBase = effBase.sub(eff);
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
            }
        }

        return effBase;
    })

    effective: ComputedRef<Decimal> = computed(() => {
        let effLv = D(player.value.prog.main.upgrades[this.index].bought);
        let eff = D(0);
        effLv = effLv.add(this.freeExtra.value);

        if (this.index === 0) {
            if (ifAchievement(1, 5)) {
                eff = getAchievementEffect(1, 5);
                effLv = effLv.mul(eff);
            }

            if (getKuaUpgrade('p', 16)) {
                eff = KUA_UPGRADES.KPower[15].eff!.value;
                effLv = effLv.mul(eff);
            }
        }

        if (this.index === 2) {
            if (Decimal.gt(getOMUpgrade(11), 0)) {
                eff = MAIN_ONE_UPGS[11].effect.value;
                effLv = effLv.mul(eff);
            }

            if (getKuaUpgrade('p', 2)) {
                eff = KUA_UPGRADES.KPower[1].eff!.value;
                effLv = effLv.mul(eff);
            }
        }

        if (this.index >= 0 && this.index <= 2) {
            if (hasGrowanMilestone(2) && getKuaUpgrade('s', 15 + this.index)) {
                eff = D(1.1);
                effLv = effLv.mul(eff);}
        }

        if (this.index >= 3 && this.index <= 5) {
            if (Decimal.gt(getOMUpgrade(16), 0)) {
                eff = MAIN_ONE_UPGS[16].effect.value;
                effLv = effLv.pow(eff);
            }
        }

        if (this.index === 1) {
            if (Decimal.gt(getOMUpgrade(6), 0)) {
                eff = MAIN_ONE_UPGS[6].effect.value;
                effLv = effLv.pow(eff);
            }
        }
        return effLv;
    })
    effect: ComputedRef<Decimal> = computed(() => {
        let effect = this.effective.value;
        let eff: DecimalSource = D(0);

        // ! yes, the "freeExtra" part of the accumulated is moved HERE so that things like Basic Discoveries or other stuff that can add free levels can do something to the multiplier
        if (inChallenge('dc')) {
            eff = player.value.prog.main.upgrades[0].accumulated;
            effect = effect.add(eff);

            eff = tmp.value.main.upgrades[0].multiplier;
            effect = effect.mul(eff);

            eff = effect;
            effect = effect.add(1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]);
        }

        eff = effect;
        effect = this.baseEffectBase.type === 0
            ? this.effectBase.value.mul(effect)
            : this.effectBase.value.pow(effect);

        if (this.index === 0) {
            if (Decimal.gte(timesCompleted('im'), 1e33)) {
                eff = tmp.value.kua.blessings.upg1Base.add(1).pow(COL_CHALLENGES.im.type2ChalEff!.value[1]);
                effect = effect.mul(eff);
            }

            if (Decimal.gt(player.value.prog.main.upgrades[6].bought, 0)) {
                eff = MAIN_UPG_DATA[6].effect.value;
                effect = effect.pow(eff);
            }

            if (getKuaUpgrade('p', 8)) {
                eff = D(1.01);
                effect = effect.max(1).log10().pow(eff).pow10();
            }

            const data = {
                prevEff: effect,
                scal: getSCSLAttribute(`upg1`, false)
            }

            if (effect.gte(data.scal[0].start)) {
                effect = scale(effect, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
                setSCSLEffectDisp(`upg1`, false, 0, `${format(data.prevEff.log(effect), 3)}√`);
            }

            data.prevEff = effect;

            if (effect.gte(data.scal[1].start)) {
                effect = scale(effect, 2.1, false, data.scal[1].start, data.scal[1].power, data.scal[1].basePow);
                setSCSLEffectDisp(`upg1`, false, 1, `${format(data.prevEff.log(effect), 3)}√`);
            }
        }

        if (this.index === 1) {
            if (Decimal.gte(timesCompleted('im'), 1e33)) {
                eff = tmp.value.kua.blessings.upg2Base.add(1).pow(COL_CHALLENGES.im.type2ChalEff!.value[1]);
                effect = effect.mul(eff);
            }

            if (Decimal.gt(player.value.prog.kua.blessings.upgrades[0], 0)) {
                eff = KUA_BLESS_UPGS[0].eff.value[0];
                effect = effect.pow(eff);
            }

            const data = {
                prevEff: effect,
                scal: getSCSLAttribute(`upg2`, false)
            }

            if (effect.gte(data.scal[0].start)) {
                effect = scale(effect, 0, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
                setSCSLEffectDisp(`upg2`, false, 0, `/${format(data.prevEff.div(effect), 3)}`);
            }

            if (getKuaUpgrade('p', 7)) {
                eff = D(1.5);
                effect = effect.pow(eff);
            }

            data.prevEff = effect;

            if (effect.gte(data.scal[1].start)) {
                effect = scale(effect, 2.1, false, data.scal[1].start, data.scal[1].power, data.scal[1].basePow);
                setSCSLEffectDisp(`upg2`, false, 1, `${format(data.prevEff.log(effect), 3)}√`);
            }

            if (inChallenge("su") && Decimal.gte(challengeDepth("su"), 5)) {
                eff = getColChalCondEffects("su")[2];
                effect = effect.log10().add(1).pow(eff).sub(1).pow10();
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