import { LABELS, pushFactor, resetFactor } from "@/components/Game/Game_Stats/Game_Stats";
import { format } from "@/format";
import { tmp } from "@/main";
import { player } from "@/main";
import Decimal, { type DecimalSource } from "break_eternity.js";
import { D, smoothExp } from "@/calc";
import { updateStart } from "../Game_Main";
import { getOMUpgrade, MAIN_ONE_UPGS } from "../Game_OneUpgrades/Game_OneUpgrades";
import { getAchievementEffect, ifAchievement } from "@/components/Game/Game_Achievements/Game_Achievements";
import { getKuaUpgrade, KUA_UPGRADES } from "../../Game_Kuaraniai/Game_KuaUpgrades/Game_KuaUpgrades";
import { KUA_BLESS_UPGS } from "../../Game_Kuaraniai/Game_KuaBlessings/Game_KuaBlessings";
import { computed, type ComputedRef } from "vue";
import { hasGrowanMilestone } from "../../Game_Layer4/Game_Growan/Game_Growan";

export const buyGenUPG = (id: number): void => {
    if (Decimal.gte(player.value.gameProgress.points, MAIN_UPG_DATA[id].cost(player.value.gameProgress.upgrades[id].bought))) {
        player.value.gameProgress.points = Decimal.sub(player.value.gameProgress.points, MAIN_UPG_DATA[id].cost(player.value.gameProgress.upgrades[id].bought));
        if (Decimal.lt(player.value.gameProgress.points, 0)) {
            throw new Error(`aaa!! main upgrade sent pts to negative!!`)
        }
        player.value.gameProgress.upgrades[id].bought = Decimal.add(player.value.gameProgress.upgrades[id].bought, 1);
        player.value.gameProgress.upgrades[id].boughtInKua = player.value.gameProgress.upgrades[id].bought;
        updateStart(-(id + 1), 0);
    }
}

export type TmpMainUpgrade = {
    canBuy: boolean,
    active: boolean,
    dc11FreeLvs: Decimal,
    multiplier: Decimal,
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
                canBuy: false,
                active: true,
                dc11FreeLvs: D(0),
                multiplier: D(1),
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
            {exp: D(0), scale: [D(5),    D(1.55),   D(1.02)  ]},
            {exp: D(0), scale: [D(1e3),  D(1.25),   D(1.015) ]},
            {exp: D(0), scale: [D(1e10), D(100),    D(1.05)  ]},
            {exp: D(0), scale: [D(1e33), D(1.02),   D(1.0003)]},
            {exp: D(0), scale: [D(1e45), D(1.03),   D(1.0002)]},
            {exp: D(0), scale: [D(1e63), D(1.25),   D(1.005) ]},
            {exp: D(1), scale: [D(1000), D(1.01),   D(1.01)  ]},
            {exp: D(1), scale: [D(1250), D(1.0075), D(1.02)  ]},
            {exp: D(1), scale: [D(1500), D(1.025),  D(1.05)  ]},
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
    costGrowthData: ComputedRef<{
        exp: Decimal,
        scale: Array<Decimal>
    }> = computed(() => {
        const costGrowthData = this.baseCostGrowthData;

        if (this.index === 0) {
            if (getKuaUpgrade("s", 7)) {
                costGrowthData.scale[1] = costGrowthData.scale[1].mul(0.95);
            }
        }
        if (this.index === 1) {
            if (getKuaUpgrade("p", 13)) {
                costGrowthData.scale[1] = costGrowthData.scale[1].mul(0.92);
            }
        }
        if (this.index === 3 || this.index === 4 || this.index === 5) {
            if (Decimal.gte(getOMUpgrade(17), 1)) {
                costGrowthData.scale[1] = costGrowthData.scale[1].pow(Decimal.sub(1, MAIN_ONE_UPGS[17].effect.value));
            }
        }
        return costGrowthData;
    })
    cost(bought = player.value.gameProgress.upgrades[this.index].bought) {
        const FACTOR_ARR = [1, this.index, 1];
        resetFactor(FACTOR_ARR);

        let cost = D(bought);

        pushFactor(FACTOR_ARR, LABELS.def, `${format(cost, 2)}`, `${format(cost, 2)} effective`);

        if (ifAchievement(1, 6)) {
            cost = cost.div(getAchievementEffect(1, 6));
            pushFactor(FACTOR_ARR, "Achievement ID: (1, 6)", `/${format(getAchievementEffect(1, 6), 2)}`, `${format(cost, 2)} effective`, "ach");
        }

        if (this.index === 0) {
            if (Decimal.gte(player.value.gameProgress.pr2.amount, 20)) {
                cost = cost.mul(0.975);
                pushFactor(FACTOR_ARR, LABELS.pr2_20, `×${format(0.975, 2)}`, `${format(cost, 2)} effective`);
            }
        }
        if (this.index === 1) {
            if (getKuaUpgrade("s", 9)) {
                cost = cost.sub(KUA_UPGRADES.KShards[8].eff!.value);
                pushFactor(FACTOR_ARR, LABELS.kshau9, `-${format(KUA_UPGRADES.KShards[8].eff!.value, 2)}`, `${format(cost, 2)} effective`, "kua");
            }
        }
        if (this.index === 0 || this.index === 1) {
            if (getKuaUpgrade("p", 10)) {
                cost = cost.div(KUA_UPGRADES.KPower[9].eff!.value);
                pushFactor(FACTOR_ARR, LABELS.kpowu10, `/${format(KUA_UPGRADES.KPower[9].eff!.value, 2)}`, `${format(cost, 2)} effective`, "kua");
            }
        }
        if (this.index === 2) {
            if (Decimal.gte(player.value.gameProgress.pr2.amount, 11)) {
                cost = cost.div(10 / 9);
                pushFactor(FACTOR_ARR, LABELS.pr2_11, `/${format(10 / 9, 2)}`, `${format(cost, 2)} effective`);
            }
        }
        if (this.index === 3 || this.index === 4 || this.index === 5) {
            if (getKuaUpgrade("p", 11)) {
                cost = cost.mul(0.9);
                pushFactor(FACTOR_ARR, LABELS.kpowu11, `×${format(0.9, 2)}`, `${format(cost, 2)} effective`, "kua");
            }
        }

        const last = cost;
        cost = smoothExp(cost, this.costGrowthData.value.scale[2], false).pow_base(this.costGrowthData.value.scale[1]).mul(this.costGrowthData.value.scale[0]).layeradd10(this.costGrowthData.value.exp);
        pushFactor(FACTOR_ARR, LABELS.def, `~${format(this.costGrowthData.value.scale[0])} × ${format(this.costGrowthData.value.scale[1], 3)}^${format(this.costGrowthData.value.scale[2], 4)}^${format(last, 3)}`, `${format(cost)}`);

        if (this.index === 0) {
            if (Decimal.gte(player.value.gameProgress.upgrades[7].bought, 1)) {
                cost = cost.pow(MAIN_UPG_DATA[7].effect());
                pushFactor(FACTOR_ARR, LABELS.upg8, `^${format(MAIN_UPG_DATA[7].effect(), 3)}`, `${format(cost)}`);
            }
            
            if (Decimal.gte(player.value.gameProgress.upgrades[4].bought, 1)) {
                cost = cost.div(MAIN_UPG_DATA[4].effect());
                pushFactor(FACTOR_ARR, LABELS.upg5, `/${format(MAIN_UPG_DATA[4].effect(), 2)}`, `${format(cost)}`);
            }

            if (Decimal.gte(player.value.gameProgress.upgrades[1].bought, 1)) {
                cost = cost.div(MAIN_UPG_DATA[1].effect());
                pushFactor(FACTOR_ARR, LABELS.upg2, `/${format(MAIN_UPG_DATA[1].effect(), 2)}`, `${format(cost)}`);
            }
        }

        if (this.index === 1) {
            if (Decimal.gte(player.value.gameProgress.oneUpgrades[0], 1)) {
                cost = cost.div(MAIN_ONE_UPGS[0].effect.value);
                pushFactor(FACTOR_ARR, LABELS.ou1, `/${format(MAIN_ONE_UPGS[0].effect.value, 2)}`, `${format(cost)}`);
            }
        }

        return cost;
    }
    target(resource = player.value.gameProgress.points) {
        if (Decimal.lt(resource, this.costGrowthData.value.scale[0])) {
            return D(-1);
        }

        let target = D(resource);

        if (this.index === 1) {
            if (Decimal.gte(player.value.gameProgress.oneUpgrades[0], 1)) {
                target = target.mul(MAIN_ONE_UPGS[0].effect.value);
            }
        }

        if (this.index === 0) {
            if (Decimal.gte(player.value.gameProgress.upgrades[1].bought, 1)) {
                target = target.mul(MAIN_UPG_DATA[1].effect());
            }

            if (Decimal.gte(player.value.gameProgress.upgrades[4].bought, 1)) {
                target = target.mul(MAIN_UPG_DATA[4].effect());
            }

            if (Decimal.gte(player.value.gameProgress.upgrades[7].bought, 1)) {
                target = target.root(MAIN_UPG_DATA[7].effect());
            }
        }

        target = smoothExp(target.layeradd10(this.costGrowthData.value.exp.neg()).div(this.costGrowthData.value.scale[0]).log(this.costGrowthData.value.scale[1]), this.costGrowthData.value.scale[2], true);

        if (this.index === 3 || this.index === 4 || this.index === 5) {
            if (getKuaUpgrade("p", 11)) {
                target = target.div(0.9);
            }
        }
        if (this.index === 2) {
            if (Decimal.gte(player.value.gameProgress.pr2.amount, 11)) {
                target = target.mul(10 / 9);
            }
        }
        if (this.index === 1) {
            if (getKuaUpgrade("p", 10)) {
                target = target.mul(KUA_UPGRADES.KPower[9].eff!.value);
            }
            if (getKuaUpgrade("s", 9)) {
                target = target.add(KUA_UPGRADES.KShards[8].eff!.value);
            }
        }
        if (this.index === 0) {
            if (getKuaUpgrade("p", 10)) {
                target = target.mul(KUA_UPGRADES.KPower[9].eff!.value);
            }
            if (Decimal.gte(player.value.gameProgress.pr2.amount, 20)) {
                target = target.div(0.975);
            }
        }
        if (ifAchievement(1, 6)) {
            target = target.mul(getAchievementEffect(1, 6));
        }

        return target;
    }
    freeExtra: ComputedRef<Decimal> = computed(() => {
        // const FACTOR_ARR = [1, this.index, 0];
        // resetFactor(FACTOR_ARR);
        const extraLv = D(0);
        // let eff = D(0);

        // if (this.index >= 0 && this.index <= 5) {
        //     if (Decimal.gte(timesCompleted("dc"), 3) && !player.value.gameProgress.col.inChallenge) {
        //         eff = getColChalRewEffects("dc")[1];
        //         extraLv = extraLv.add(eff);
        //         pushFactor(FACTOR_ARR, COL_CHALLENGES.dc.labelRew.value, `+${format(eff, 2)}`, `+${format(eff)}`, "col");
        //     }
        // }

        // if (Decimal.gte(timesCompleted("dc"), 11) && !player.value.gameProgress.inChallenge.dc.overall) {
        //     eff = tmp.value.main.upgrades[this.index].dc11FreeLvs;
        //     extraLv = extraLv.add(eff);
        //     pushFactor(FACTOR_ARR, COL_CHALLENGES.dc.labelRew.value, `+${format(eff, 2)}`, `+${format(eff)}`, "col");
        // }

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
            if (Decimal.gt(player.value.gameProgress.upgrades[2].bought, 0)) {
                eff = MAIN_UPG_DATA[2].effect();
                effBase = effBase.add(eff);
                pushFactor(FACTOR_ARR, LABELS.upg3, `+${format(eff, 3)}`, `${format(effBase, 3)}`);
            }

            if (Decimal.gt(player.value.gameProgress.upgrades[5].bought, 0)) {
                eff = MAIN_UPG_DATA[5].effect();
                effBase = effBase.add(eff);
                pushFactor(FACTOR_ARR, LABELS.upg6, `+${format(eff, 3)}`, `${format(effBase, 3)}`);
            }

            if (Decimal.gt(getOMUpgrade(1), 0)) {
                eff = MAIN_ONE_UPGS[1].effect.value;
                effBase = effBase.add(eff);
                pushFactor(FACTOR_ARR, LABELS.ou2, `+${format(eff, 3)}`, `${format(effBase, 3)}`);
            }

            if (Decimal.gte(player.value.gameProgress.pr2.amount, 9)) {
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

            if (Decimal.gte(player.value.gameProgress.pr2.amount, 4)) {
                eff = D(0.5);
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

            if (getKuaUpgrade("s", 5)) {
                eff = D(1.125);
                effBase = effBase.mul(eff);
                pushFactor(FACTOR_ARR, LABELS.kshau5, `×${format(eff, 3)}`, `${format(effBase, 3)}`, "kua");
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
            if (Decimal.gt(player.value.gameProgress.upgrades[8].bought, 0)) {
                eff = MAIN_UPG_DATA[8].effect();
                effBase = effBase.mul(eff);
                pushFactor(FACTOR_ARR, LABELS.upg9, `×${format(eff, 3)}`, `${format(effBase, 3)}`);
            }
        }

        return effBase;
    })

    effective(bought = player.value.gameProgress.upgrades[this.index].bought) {
        const FACTOR_ARR = [1, this.index, 0];
        // resetFactor(FACTOR_ARR);
        let effLv = D(bought);
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
    }
    effect(bought = player.value.gameProgress.upgrades[this.index].bought) {
        const FACTOR_ARR = [1, this.index, 0];
        resetFactor(FACTOR_ARR);
        pushFactor(FACTOR_ARR, LABELS.def, `${format(player.value.gameProgress.upgrades[this.index].bought)}`, `${format(player.value.gameProgress.upgrades[this.index].bought)} effective`);
        let effect = this.effective(bought);
        let eff: DecimalSource = D(0);

        // // ! yes, the "freeExtra" part of the accumulated is moved HERE so that things like Basic Discoveries or other stuff that can add free levels can do something to the multiplier
        // if (inChallenge('dc')) {
        //     eff = player.value.gameProgress.upgrades[0].accumulated;
        //     effect = effect.add(eff);
        //     pushFactor(FACTOR_ARR, COL_CHALLENGES.dc.labelRew.value, `+${format(eff, 3)}`, `${format(effect)} effective`, "col");

        //     eff = tmp.value.main.upgrades[0].multiplier;
        //     effect = effect.mul(eff);
        //     pushFactor(FACTOR_ARR, COL_CHALLENGES.dc.labelRew.value, `×${format(eff, 3)}`, `${format(effect)} effective`, "col");

        //     eff = effect;
        //     effect = effect.add(1).log10().pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1]);
        //     pushFactor(FACTOR_ARR, COL_CHALLENGES.dc.labelRew.value, `log10(${format(eff, 3)}+${format(1)})^${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[1], 3)}`, `${format(effect)} effective`, "col");
        // }

        eff = effect;
        effect = this.baseEffectBase.type === 0
            ? this.effectBase.value.mul(effect)
            : this.effectBase.value.pow(effect);
            pushFactor(FACTOR_ARR, LABELS.def, this.baseEffectBase.type === 0
                ? `${format(this.effectBase.value, 3)}×${format(eff)}`
                : `${format(this.effectBase.value, 3)}^${format(eff)}`
            , `×${format(effect)}`)

        if (this.index === 0) {
            if (Decimal.gt(player.value.gameProgress.upgrades[6].bought, 0)) {
                eff = MAIN_UPG_DATA[6].effect();
                effect = effect.pow(eff);
                pushFactor(FACTOR_ARR, LABELS.upg7, `^${format(eff, 3)}`, `×${format(effect)}`);
            }

            if (getKuaUpgrade('p', 8)) {
                eff = D(1.01);
                effect = effect.max(1).log10().pow(eff).pow10();
                pushFactor(FACTOR_ARR, LABELS.kpowu8, `dilate ${format(eff, 3)}`, `×${format(effect)}`, "kua");
            }
        }

        if (this.index === 1) {
            if (Decimal.gt(player.value.gameProgress.kua.blessings.upgrades[0], 0)) {
                eff = KUA_BLESS_UPGS[0].eff.value[0];
                effect = effect.pow(eff);
                pushFactor(FACTOR_ARR, LABELS.kbu1, `^${format(eff, 3)}`, `/${format(effect)}`, "kb");
            }

            if (getKuaUpgrade('p', 7)) {
                eff = D(3);
                effect = effect.pow(eff);
                pushFactor(FACTOR_ARR, LABELS.kpowu7, `^${format(eff, 3)}`, `×${format(effect)}`, "kua");
            }
        }

        return effect;
    }

    tooltipText: ComputedRef<string> = computed(() => {
        let txt = ``;
        if (this.index === 1) {
            const newAmt = MAIN_UPG_DATA[0].target(MAIN_UPG_DATA[0].cost(player.value.gameProgress.upgrades[0].bought));
            const oldAmt = MAIN_UPG_DATA[0].target(Decimal.div(MAIN_UPG_DATA[0].cost(player.value.gameProgress.upgrades[0].bought), this.effect()));
            txt = `
                Upgrade 2 allows you to buy +${format(newAmt.sub(oldAmt), 3)} more Upgrade 1.<br>
                This number decreases because Upgrade 1's cost scaling grows faster than this upgrade can decrease its cost.<br>
                The extra Upgrade 1s increase your point gain by ~${format(MAIN_UPG_DATA[0].effect().div(MAIN_UPG_DATA[0].effect(oldAmt)), 2)}×.
            `
        }
        if (this.index === 2) {
            txt = `
                Upgrade 3 effectively increases your points by ${format(MAIN_UPG_DATA[0].effect().div(Decimal.pow(MAIN_UPG_DATA[0].effectBase.value.sub(this.effect()), player.value.gameProgress.upgrades[0].bought)), 2)}×.
            `
        }
        return txt;
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