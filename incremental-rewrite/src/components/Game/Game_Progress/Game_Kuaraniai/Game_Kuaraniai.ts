import Decimal, { type DecimalSource } from "break_eternity.js";
import { player, tmp, updateAllBest, updateAllTotal } from "@/main";
import { format, formatPerc } from "@/format";
import { D, scale, smoothExp, smoothPoly } from "@/calc";
import { ACHIEVEMENT_DATA } from "../../Game_Achievements/Game_Achievements";
import { challengeDepth, getColResEffect, inChallenge, timesCompleted } from "../Game_Colosseum/Game_Colosseum";
import { setFactor } from "../../Game_Stats/Game_Stats";

export const KUA_BLESS_TIER = {
    rank: {
        show: true,
        req(x: DecimalSource) {
            return smoothExp(x, 1.004, false).pow(1.3).pow_base(2).mul(10);
        },
        target(x: DecimalSource) {
            if (Decimal.lt(x, 10)) { return D(-1); }
            return smoothExp(Decimal.div(x, 10).log(2).root(1.3), 1.004, true);
        },
        rounded(x: DecimalSource) {
            return this.target(x).floor().add(1);
        },
        base: {
            get kuaBlessGainIdle() {
                return D(1.15);
            },
            get kuaBlessGainActive() {
                return D(1.3);
            }
        },
        effects: {
            get kuaBlessGainIdle() {
                return KUA_BLESS_TIER.rank.rounded(player.value.gameProgress.kua.blessings.amount).pow_base(KUA_BLESS_TIER.rank.base.kuaBlessGainIdle);
            },
            get kuaBlessGainActive() {
                return KUA_BLESS_TIER.rank.rounded(player.value.gameProgress.kua.blessings.amount).pow_base(KUA_BLESS_TIER.rank.base.kuaBlessGainActive);
            }
        },
        desc: {
            get kuaBlessGainIdle() {
                return `Increase KBlessing's idle generation by +${format(KUA_BLESS_TIER.rank.base.kuaBlessGainIdle.sub(1).mul(100))}% per rank. Currently: +${format(KUA_BLESS_TIER.rank.effects.kuaBlessGainIdle.sub(1).mul(100))}%`;
            },
            get kuaBlessGainActive() {
                return `Increase KBlessing's active generation by +${format(KUA_BLESS_TIER.rank.base.kuaBlessGainActive.sub(1).mul(100))}% per rank. Currently: +${format(KUA_BLESS_TIER.rank.effects.kuaBlessGainActive.sub(1).mul(100))}%`;
            }
        }
    },
    tier: {
        show: true,
        req(x: DecimalSource) {
            return smoothExp(x, 1.01, false).pow(1.2).mul(2).add(4);
        },
        target(x: DecimalSource) {
            if (Decimal.lt(x, 4)) { return D(-1); }
            return smoothExp(Decimal.sub(x, 4).div(2).root(1.2), 1.01, true);
        },
        rounded(x: DecimalSource) {
            return this.target(x).floor().add(1)
        },
        base: {
            get kuaBlessEff() {
                return D(0.1);
            },
        },
        effects: {
            get kuaBlessEff() {
                return KUA_BLESS_TIER.rank.rounded(player.value.gameProgress.kua.blessings.amount).mul(KUA_BLESS_TIER.tier.base.kuaBlessEff).add(1);
            },
        },
        desc: {
            get kuaBlessEff() {
                return `Increase KBlessing's effects by +${format(KUA_BLESS_TIER.tier.base.kuaBlessEff.mul(100))}% (additive) per rank. Currently: +${format(KUA_BLESS_TIER.tier.effects.kuaBlessEff.sub(1).mul(100))}%`;
            },
        }
    }
}

export const KUA_BLESS_UPGS = [
    {
        show: true,
        get cost() {
            return smoothExp(smoothPoly(player.value.gameProgress.kua.blessings.upgrades[0], 5, 2, false), 1.068, false).pow_base(2.5).mul(10);
        },
        get target() {
            if (Decimal.lt(player.value.gameProgress.kua.blessings.amount, 10)) { return D(-1); }
            return smoothPoly(smoothExp(Decimal.div(player.value.gameProgress.kua.blessings.amount, 10).log(2.5), 1.068, true), 5, 2, true);
        },
        get desc() {
            let txt = `KBs boost Upgrade 2's effect.`;
            if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[0], 6)) {
                txt += ` KShards and KPower effects act like they're higher based off of your KBs.`
            }
            if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[0], 12)) {
                txt += ` Upgrade 1-6's scaling start is delayed based off of your KBs.`
            }
            return txt;
        },
        get effDesc() {
            let txt = `^${format(this.eff[0], 3)}`
            if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[0], 6)) {
                txt += `, ×${format(this.eff[1], 1)}`
            }
            if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[0], 12)) {
                txt += `, +${format(this.eff[2], 2)}`
            }
            return txt
        },
        get eff() {
            return [
                Decimal.add(player.value.gameProgress.kua.blessings.amount, 1).ln().div(100).mul(Decimal.sqrt(player.value.gameProgress.kua.blessings.upgrades[0])).add(1).root(1.5),
                Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[0], 6) 
                    ? Decimal.add(player.value.gameProgress.kua.blessings.amount, 1)
                    : D(1),
                Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[0], 12) 
                    ? Decimal.add(player.value.gameProgress.kua.blessings.amount, 1).ln().add(1).pow(2).sub(1).div(2)
                    : D(0),
            ]
        }
    }
]

export const initAllKBlessingUpgrades = () => {
    const arr = [];
    for (let i = KUA_BLESS_UPGS.length - 1; i >= 0; i--) {
        arr.push(
            {
                canBuy: false
            }
        );
    }
    return arr;
}

export const gainKPOnClick = () => {
    if (player.value.gameProgress.dilatedTime.paused) {
        return;
    }
    player.value.gameProgress.kua.blessings.amount = Decimal.add(player.value.gameProgress.kua.blessings.amount, tmp.value.kua.blessings.perClick);
}

// use get show if it can change in the mean time, currently unused as a placeholder
// costs will get the same treatment later

export const getKuaUpgrade = (sp: "s" | "p", id: number): boolean => {
    if (sp === "s") {
        return (
            player.value.gameProgress.kua.kshards.upgrades >= id &&
            tmp.value.kua.active.kshards.upgrades &&
            tmp.value.kua.active.spUpgrades
        );
    }
    if (sp === "p") {
        return (
            player.value.gameProgress.kua.kpower.upgrades >= id &&
            tmp.value.kua.active.kpower.upgrades &&
            tmp.value.kua.active.spUpgrades
        );
    }
    throw new Error(`${sp} is not a valid kua upgrade type!`);
};

export type Kua_Upgrade_List = {
    KShards: Array<Kua_Upgrade>;
    KPower: Array<Kua_Upgrade>;
};

export type Kua_Upgrade = {
    desc: string;
    cost: DecimalSource;
    show: boolean;
    eff?: Decimal;
    eff2?: Decimal;
    implemented?: boolean;
};

export const KUA_UPGRADES: Kua_Upgrade_List = {
    KShards: [
        {
            // 1
            get desc() {
                return `Gain ${format(0.01, 2)}% of your pending PRai per second, and Kuaraniai Gain is multiplied by ${format(1.5, 2)}×`;
            },
            get cost() {
                return D(0.1);
            },
            show: true
        },
        {
            // 2
            get desc() {
                return `KShards boost PRai's effect. Currently: ${format(this.eff!, 2)}×`;
            },
            get eff() {
                let i = D(1);
                if (tmp.value.kua.active.kshards.effects) {
                    i = Decimal.max(player.value.gameProgress.kua.kshards.totals[3]!, 0);
                    i = i.add(i.mul(4)).add(i.pow(2).mul(4)).add(1).log10().pow(0.85).pow10();
                    if (getKuaUpgrade("s", 10)) {
                        i = i.pow(tmp.value.kua.effects.kshardPrai);
                    }
                }
                return i;
            },
            get cost() {
                return D(1);
            },
            show: true
        },
        {
            // 3
            get desc() {
                return `UP1's effect reduces UP2's scaling strength. Currently: ${formatPerc(this.eff!)}`;
            },
            get eff() {
                let i = D(1);
                i = Decimal.max(tmp.value.main.upgrades[0].effect, 1e10)
                    .log10()
                    .div(10)
                    .sqrt()
                    .sub(1)
                    .div(5)
                    .add(1);
                return i;
            },
            get cost() {
                return D(2);
            },
            show: true
        },
        {
            // 4
            get desc() {
                return `UP1's scaling starts ${format(5)} later and is ${format(5, 3)}% weaker, and superscaling starts ${format(2)} later and is ${format(2, 3)}% weaker.`;
            },
            get cost() {
                return 10;
            },
            show: true
        },
        {
            // 5
            get desc() {
                return `PR2's effect exponent increases twice as fast, UP2's base is increased from ${format(4 / 3, 3)} to ${format(1.5, 3)}.`;
            },
            get cost() {
                return 400;
            },
            show: true
        },
        {
            // 6
            get desc() {
                return `UP2's superscaling and softcap are ${format(20, 3)}% weaker.`;
            },
            get cost() {
                return 2500;
            },
            show: true
        },
        {
            // 7
            get desc() {
                return `Upgrade 1's linear cost scaling is multiplied by ×${format(0.95, 2)}, and Point gain is boosted by Kuaraniai, which increases over time in PRai.`;
            },
            get cost() {
                return 1e7;
            },
            show: true
        },
        {
            // 8
            get desc() {
                return `KPower's UPG2 effect has a better formula, and KShards increase PRai gain. Currently: ${format(this.eff!, 2)}×`;
            },
            get eff() {
                let i = D(1);
                if (tmp.value.kua.active.kshards.effects) {
                    i = Decimal.max(player.value.gameProgress.kua.kshards.totals[3]!, 1);
                    i = i.pow(0.05).log10().pow(1.5).pow10();
                }
                return i;
            },
            get cost() {
                return 1e8;
            },
            show: true
        },
        {
            // 9
            get desc() {
                return `KShards delay Upgrade 2's cost growth (after scaling). Currently: +${format(this.eff!, 2)} purchases`;
            },
            get eff() {
                let i = Decimal.max(player.value.gameProgress.kua.kshards.totals[3]!, 10);
                i = i.log10().add(1).pow(4).div(16).ln().div(2).add(1).pow(2);
                return i;
            },
            get cost() {
                return 2e11;
            },
            show: true
        },
        {
            // 10
            get desc() {
                return `Kuaraniai buffs KShard's PRai effect boost and increases KPower gain.`;
            },
            get cost() {
                return 1e13;
            },
            show: true
        },
        {
            // 11
            get desc() {
                return `PR2 above or equal to ${format(45)} boosts Kuaraniai effects. Currently: ^${format(this.eff!, 4)}`;
            },
            get eff() {
                let i = Decimal.max(player.value.gameProgress.main.pr2.amount, 45).sub(45);
                i = i.mul(0.01).add(1).sqrt().sub(1).mul(2).add(1);
                return i;
            },
            get cost() {
                return 1e15;
            },
            show: true
        },
        {
            // 12
            get desc() {
                return `Upgrade 4 boosts Kuaraniai gain at a vastly reduced rate. Currently: ${format(this.eff!, 3)}×`;
            },
            get eff() {
                let i = Decimal.max(tmp.value.main.upgrades[3].effect, 1);
                i = i.log10().pow(0.2).add(1);
                return i;
            },
            get cost() {
                return 1e17;
            },
            show: true
        },
        {
            // 13
            get desc() {
                return `Upgrade 5 boosts KShard gain at a vastly reduced rate. Currently: ${format(this.eff!, 3)}×`;
            },
            get eff() {
                let i = Decimal.max(tmp.value.main.upgrades[4].effect, 1);
                i = i.log10().pow(0.2).add(1);
                return i;
            },
            get cost() {
                return 1e19;
            },
            show: true
        },
        {
            // 14
            get desc() {
                return `Upgrade 6 boosts KPower gain at a vastly increased rate, and Upgrade 3 also affects Upgrade 2 at a reduced rate. Currently: ${format(this.eff!, 3)}×, +${format(this.eff2!, 3)}`;
            },
            get eff() {
                let i = Decimal.add(tmp.value.main.upgrades[5].effect, 1);
                i = i.pow(4);
                return i;
            },
            get eff2() {
                let i = Decimal.max(tmp.value.main.upgrades[2].effect, 1);
                i = i.div(3);
                return i;
            },
            get cost() {
                return 1e22;
            },
            show: true
        },
        {
            // 15
            get desc() {
                return `Unlock Upgrade 7 which raises point gain.`;
            },
            get cost() {
                return 1e25;
            },
            show: true
        },
        {
            // 16
            get desc() {
                return `Unlock Upgrade 8 which raises Upgrade 1's cost.`;
            },
            get cost() {
                return 1e30;
            },
            show: true
        },
        {
            // 17
            get desc() {
                return `Unlock Upgrade 9 which multiplies Upgrade 1's base.`;
            },
            get cost() {
                return 1e35;
            },
            show: true
        },
    ],
    KPower: [
        {
            // 1
            get desc() {
                return `Multiply KShard gain by ${format(2.5, 1)}x, and KPower buffs Upgrade 2's base. Currently: +${format(this.eff!, 4)}`;
            },
            get eff() {
                let i = D(0);
                if (tmp.value.kua.active.kpower.effects) {
                    i = Decimal.max(player.value.gameProgress.kua.kpower.totals[3]!, 0)
                        .add(1)
                        .log10()
                        .add(1)
                        .log10()
                        .add(1)
                        .pow(2)
                        .sub(1)
                        .div(20);
                    if (getKuaUpgrade("s", 8)) {
                        i = Decimal.max(player.value.gameProgress.kua.kpower.totals[3]!, 0)
                            .add(1)
                            .log10()
                            .div(30)
                            .max(i);
                    }
                }
                return i;
            },
            get cost() {
                return 1;
            },
            show: true
        },
        {
            // 2
            get desc() {
                return `Be able to unlock a new feature at ${format(1e2)} Kuaraniai, and KPower increases UP3's effectiveness. Currently: +${format(this.eff!.sub(1).mul(100), 3)}%`;
            },
            get eff() {
                let i = D(1);
                if (tmp.value.kua.active.kpower.effects) {
                    i = Decimal.max(player.value.gameProgress.kua.kpower.totals[3]!, 0)
                        .add(1)
                        .log10()
                        .add(1)
                        .root(4)
                        .sub(1)
                        .div(20)
                        .add(1);
                }
                return i;
            },
            get cost() {
                return 1e2;
            },
            show: true
        },
        {
            // 3
            get desc() {
                return `Kuaraniai's effect on UP1's scaling uses a better formula, and add another effect.`;
            },
            get cost() {
                return 1e3;
            },
            show: true
        },
        {
            // 4
            get desc() {
                return `UP2's softcap is ${format(40, 3)}% weaker and starts later based off of your KPower. Currently: ${format(this.eff!, 2)}x`;
            },
            get eff() {
                let i = D(1);
                if (tmp.value.kua.active.kpower.effects) {
                    i = Decimal.max(player.value.gameProgress.kua.kpower.totals[3]!, 0)
                        .add(1)
                        .log10()
                        .pow(1.05)
                        .pow10()
                        .pow(0.75);
                }
                return i;
            },
            get cost() {
                return 8500;
            },
            show: true
        },
        {
            // 5
            get desc() {
                return `PRai's effect is more powerful based off of your KPower. Currently: ^${format(this.eff!, 4)}`;
            },
            get eff() {
                let res = D(1);
                if (tmp.value.kua.active.kpower.effects) {
                    res = Decimal.max(player.value.gameProgress.kua.kpower.totals[3]!, 1)
                        .log10()
                        .add(1)
                        .log2()
                        .div(50)
                        .add(1); // 1 = ^1, 10 = ^1.02, 1,000 = ^1.04, 1e7 = ^1.06, 1e15 = ^1.08, 1e31 = ^1.1
                }
                return res;
            },
            get cost() {
                return 5e4;
            },
            show: true
        },
        {
            // 6
            get desc() {
                return `Kuaraniai also delays Upgrade 2's softcap, and its effect of Upgrade 1's scaling also apply to superscaling at a reduced rate.`;
            },
            get cost() {
                return 1e6;
            },
            show: true
        },
        {
            // 7
            get desc() {
                return `Upgrade 2's effect is cubed, but its other effects are not boosted.`;
            },
            get cost() {
                return 1e8;
            },
            show: true
        },
        {
            // 8
            get desc() {
                return `Upgrade 1 is dilated by ^${format(1.01, 2)}, PR2's effect uses a better formula, and unlock KBlessings at ${format(1e6)} Kuaraniai.`;
            },
            get cost() {
                return 1e11;
            },
            show: true
        },
        {
            // 9
            get desc() {
                return `PR2 slightly weakens UP1 and UP2's hyper scaling. Currently: ${formatPerc(this.eff!)}`;
            },
            get eff() {
                if (Decimal.lt(player.value.gameProgress.main.pr2.amount, 25)) {
                    return D(1);
                }
                let eff = Decimal.sub(player.value.gameProgress.main.pr2.amount, 25);
                eff = eff.div(eff.add(20)).mul(0.25).add(1);
                return eff;
            },
            get cost() {
                return 1e15;
            },
            show: true
        },
        {
            // 10
            get desc() {
                return `UP1 and UP2's cost scaling is reduced based off of your points. Currently: ${formatPerc(this.eff!)}`;
            },
            get eff() {
                let eff = Decimal.max(player.value.gameProgress.main.points, 1e10);
                eff = eff.log10().log10().ln().div(50).add(1).sqrt();
                return eff;
            },
            get cost() {
                return 1e18;
            },
            show: true
        },
        {
            // 11
            get desc() {
                return `Upgrades 4, 5, and 6's cost scaling is ${format(10)}% slower.`;
            },
            get cost() {
                return 1e21;
            },
            show: true
        },
        {
            // 12
            get desc() {
                return `One-Upgrade #4 is improved.`;
            },
            get cost() {
                return 1e24;
            },
            show: true
        },
        {
            // 13
            get desc() {
                return `Upgrade 2's linear cost scaling is reduced by ×${format(0.92, 2)}.`;
            },
            get cost() {
                return 1e28;
            },
            show: true
        },
        {
            // 14
            get desc() {
                return `One-Upgrade #6 is ${format(10)}% stronger.`;
            },
            get cost() {
                return 1e33;
            },
            show: true
        },
        {
            // 15
            get desc() {
                return `Kuaraniai’s effects are ${format(5)}% stronger.`;
            },
            get cost() {
                return 1e40;
            },
            show: true
        },
        {
            // 16
            implemented: false,
            get desc() {
                return `Upgrade 1's effectiveness is increased based off of how much KPower you have. Currently: +${format(this.eff!.sub(1).mul(100), 3)}%`;
            },
            get eff() {
                let eff = Decimal.max(player.value.gameProgress.kua.kpower.amount, 1e45);
                eff = eff.log10().log(45).sub(1).div(5).add(1);
                return eff;
            },
            get cost() {
                return 1e45;
            },
            show: true
        },
        {
            // 17
            implemented: false,
            get desc() {
                return `All KShards and KPower's effects are stronger based off of their respective resource. Currently: KS: ${format(this.eff!.sub(1).mul(100), 3)}%, KP: ${format(this.eff2!.sub(1).mul(100), 3)}%`;
            },
            get eff() {
                let eff = Decimal.max(player.value.gameProgress.kua.kshards.amount, 1);
                eff = eff.log10().sqrt().div(250).add(1);
                return eff;
            },
            get eff2() {
                let eff = Decimal.max(player.value.gameProgress.kua.kpower.amount, 1);
                eff = eff.log10().cbrt().div(250).add(1);
                return eff;
            },
            get cost() {
                return 1e50;
            },
            show: true
        }
    ]
};

export const KUA_ENHANCERS = {
    sources: [
        {
            get source() {
                return player.value.gameProgress.main.points;
            },
            sourceName: "points",
            cost(level: DecimalSource) {
                const cost = Decimal.pow(1e60, smoothExp(Decimal.max(level, 0), 1.25, false)).mul(
                    1e93
                );
                return cost;
            },
            target(amount: DecimalSource) {
                const levels = smoothExp(Decimal.max(amount, 1e93).div(1e93).log(1e60), 1.25, true);
                return levels;
            }
        },
        {
            get source() {
                return player.value.gameProgress.main.prai.amount;
            },
            sourceName: "PRai",
            cost(level: DecimalSource) {
                const cost = Decimal.pow(1e24, smoothExp(Decimal.max(level, 0), 1.1, false)).mul(
                    1e24
                );
                return cost;
            },
            target(amount: DecimalSource) {
                const levels = smoothExp(Decimal.max(amount, 1e24).div(1e24).log(1e24), 1.1, true);
                return levels;
            }
        },
        {
            get source() {
                return player.value.gameProgress.kua.amount;
            },
            sourceName: "Kuaraniai",
            cost(level: DecimalSource) {
                const cost = smoothPoly(Decimal.max(level, 0), 2, 50, false).pow_base(100).mul(0.1);
                return cost;
            },
            target(amount: DecimalSource) {
                const levels = smoothPoly(Decimal.max(amount, 0.1).div(0.1).log(100), 2, 50, true);
                return levels;
            }
        }
    ],
    enhances: [
        {
            color: "#ffffff",
            get desc() {
                return `Increase UP1's base by +${format(this.effect(), 4)}`;
            },
            effect(xp = player.value.gameProgress.kua.enhancers.enhanceXP[0], pow = tmp.value.kua.trueEnhPower[0]) {
                const effect = Decimal.max(xp, 0).mul(0.0025).add(1).ln().mul(0.1).add(1).pow(pow).sub(1);
                return effect;
            }
        },
        {
            color: "#ffffff",
            get desc() {
                return `Increase UP2's base by +${format(this.effect(), 4)}`;
            },
            effect(xp = player.value.gameProgress.kua.enhancers.enhanceXP[1], pow = tmp.value.kua.trueEnhPower[1]) {
                const effect = Decimal.max(xp, 0).mul(0.00025).add(1).root(10).sub(1).mul(10).add(1).pow(pow).sub(1);
                return effect;
            }
        },
        {
            color: "#ffffff",
            get desc() {
                return `Increase UP3's base by +${format(this.effect(), 4)}`;
            },
            effect(xp = player.value.gameProgress.kua.enhancers.enhanceXP[2], pow = tmp.value.kua.trueEnhPower[2]) {
                const effect = Decimal.max(xp, 0).mul(0.0025).add(1).ln().mul(0.001).add(1).pow(pow).sub(1);
                return effect;
            }
        },
        {
            color: "#8000ff",
            get desc() {
                return `Weaken UP4's cost growth (after scaling) by ${formatPerc(this.effect(), 3)}`;
            },
            effect(xp = player.value.gameProgress.kua.enhancers.enhanceXP[3], pow = tmp.value.kua.trueEnhPower[3]) {
                const effect = Decimal.max(xp, 0).mul(0.01).add(1).ln().mul(0.1).mul(pow).add(1);
                return effect;
            }
        },
        {
            color: "#8000ff",
            get desc() {
                return `Weaken UP5's cost growth (after scaling) by ${formatPerc(this.effect(), 3)}`;
            },
            effect(xp = player.value.gameProgress.kua.enhancers.enhanceXP[4], pow = tmp.value.kua.trueEnhPower[4]) {
                const effect = Decimal.max(xp, 0).mul(0.01).add(1).ln().mul(0.1).mul(pow).add(1);
                return effect;
            }
        },
        {
            color: "#8000ff",
            get desc() {
                return `Weaken UP6's cost growth (after scaling) by ${formatPerc(this.effect(), 3)}`;
            },
            effect(xp = player.value.gameProgress.kua.enhancers.enhanceXP[5], pow = tmp.value.kua.trueEnhPower[5]) {
                const effect = Decimal.max(xp, 0).mul(0.01).add(1).ln().mul(0.1).mul(pow).add(1);
                return effect;
            }
        },
        {
            color: "#c0d0e0",
            get desc() {
                return `Weaken PR2's cost growth (after scaling) by ${formatPerc(this.effect(), 3)}`;
            },
            effect(xp = player.value.gameProgress.kua.enhancers.enhanceXP[6], pow = tmp.value.kua.trueEnhPower[6]) {
                const effect = Decimal.max(xp, 0).mul(0.005).add(1).ln().mul(0.05).mul(pow).add(1);
                return effect;
            }
        }
    ]
};

export const updateAllKua = (delta: DecimalSource) => {
    updateKua(-1, delta);
    updateKua(2, delta);
    updateKua(1, delta);
    updateKua(0, delta);
};

export const updateKua = (type: number, delta: DecimalSource) => {
    let i, j, k, generate, decayExp, data;
    switch (type) {
        case -1:
            tmp.value.kua.active.kpower.upgrades = true;
            tmp.value.kua.active.kpower.effects = true;
            tmp.value.kua.active.kpower.gain = true;
            tmp.value.kua.active.kshards.upgrades = true;
            tmp.value.kua.active.kshards.effects = true;
            tmp.value.kua.active.kshards.gain = true;
            tmp.value.kua.active.spUpgrades = true;
            tmp.value.kua.active.effects = true;
            tmp.value.kua.active.gain = true;

            if (inChallenge("nk")) {
                tmp.value.kua.active.kpower.upgrades = false;
                tmp.value.kua.active.kpower.effects = false;
                tmp.value.kua.active.kpower.gain = false;
                tmp.value.kua.active.kshards.upgrades = false;
                tmp.value.kua.active.kshards.effects = false;
                tmp.value.kua.active.kshards.gain = false;
                tmp.value.kua.active.spUpgrades = false;
                tmp.value.kua.active.effects = false;
                tmp.value.kua.active.gain = false;
            }
            break;
        case 2:
            tmp.value.kua.blessings.perClick = D(0.001)
            tmp.value.kua.blessings.perSec = D(0.01)
            tmp.value.kua.blessings.upg1Base = Decimal.gte(player.value.gameProgress.kua.blessings.amount, 1)
                ? Decimal.log10(player.value.gameProgress.kua.blessings.amount).add(1).mul(0.02)
                : Decimal.mul(player.value.gameProgress.kua.blessings.amount, 0.02)
            tmp.value.kua.blessings.upg2Base = Decimal.gte(player.value.gameProgress.kua.blessings.amount, 1)
                ? Decimal.ln(player.value.gameProgress.kua.blessings.amount).add(1).mul(0.04)
                : Decimal.mul(player.value.gameProgress.kua.blessings.amount, 0.04)
            tmp.value.kua.blessings.kuaEff = Decimal.add(player.value.gameProgress.kua.blessings.amount, 1).pow(4);

            generate = tmp.value.kua.blessings.perSec.mul(delta);
            player.value.gameProgress.kua.blessings.amount = Decimal.add(player.value.gameProgress.kua.blessings.amount, generate);
            updateAllTotal(player.value.gameProgress.kua.blessings.totals, generate);
            player.value.gameProgress.kua.blessings.totalEver = Decimal.add(player.value.gameProgress.kua.blessings.totalEver, generate);
            updateAllBest(player.value.gameProgress.kua.blessings.best,player.value.gameProgress.kua.blessings.amount);
            player.value.gameProgress.kua.blessings.bestEver = Decimal.max(player.value.gameProgress.kua.blessings.bestEver, player.value.gameProgress.kua.blessings.amount);
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
            player.value.gameProgress.kua.timeInKua = Decimal.add(player.value.gameProgress.kua.timeInKua, delta);

            tmp.value.kua.req = D(1e10);
            tmp.value.kua.exp = D(3);

            tmp.value.kua.exp = tmp.value.kua.exp.add(getColResEffect(2));

            tmp.value.kua.effectivePrai = Decimal.add(player.value.gameProgress.main.prai.totals[2]!, tmp.value.main.prai.pending);
            tmp.value.kua.canDo = tmp.value.kua.effectivePrai.gte(tmp.value.kua.req) && tmp.value.kua.active.gain;
            tmp.value.kua.pending = tmp.value.kua.canDo
                ? tmp.value.kua.effectivePrai
                        .log(tmp.value.kua.req)
                        .ln()
                        .mul(1.5)
                        .div(tmp.value.kua.exp)
                        .add(1)
                        .pow(tmp.value.kua.exp)
                        .sub(5)
                        .pow10()
                : D(0);
            setFactor(0, [4, 1], "Base", `~10^(ln(log(${format(tmp.value.kua.effectivePrai)})))^${format(tmp.value.kua.exp, 2)}-${format(5)}) (approx.)`, `${format(tmp.value.kua.pending, 4)}`, true);
            
            if (getKuaUpgrade("s", 1)) {
                tmp.value.kua.pending = tmp.value.kua.pending.mul(1.5);
            }
            setFactor(1, [4, 1], "KShard Upgrade 1", `×${format(1.5, 2)}`, `${format(tmp.value.kua.pending, 4)}`, getKuaUpgrade("s", 1), "kua");

            if (getKuaUpgrade("s", 12)) {
                tmp.value.kua.pending = tmp.value.kua.pending.mul(KUA_UPGRADES.KShards[11].eff!);
            }
            setFactor(2, [4, 1], "KShard Upgrade 12", `×${format(KUA_UPGRADES.KShards[11].eff!, 2)}`, `${format(tmp.value.kua.pending, 4)}`, getKuaUpgrade("s", 12), "kua");

            if (Decimal.gte(timesCompleted("df"), 1)) {
                tmp.value.kua.pending = tmp.value.kua.pending.mul(2);
            }
            setFactor(3, [4, 1], `Decaying Feeling Completion ×${format(timesCompleted('df'))}`, `×${format(2, 2)}`, `${format(tmp.value.kua.pending, 1)}`, Decimal.gte(timesCompleted("df"), 1), "col");

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
            setFactor(4, [4, 1], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, tmp.value.kua.pending), 2)}`, `${format(tmp.value.kua.pending, 4)}`, inChallenge("df"), "col");

            if (player.value.gameProgress.kua.auto) {
                generate = tmp.value.kua.pending.mul(delta).mul(0.0001);
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
                pts: D(1)
            };

            k = D(1);
            setFactor(0, [4, 0], "Base", `${format(player.value.gameProgress.kua.amount, 4)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, true);
            k = k.mul(ACHIEVEMENT_DATA[1].eff);
            setFactor(1, [4, 0], "Achievement Tier 2", `^${format(ACHIEVEMENT_DATA[1].eff, 3)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, true, "ach");

            if (getKuaUpgrade("s", 11)) {
                k = k.mul(KUA_UPGRADES.KShards[10].eff!);
            }
            setFactor(2, [4, 0], "KShard Upgrade 11", `^${format(KUA_UPGRADES.KShards[10].eff!, 3)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, getKuaUpgrade("s", 11), "kua");

            if (getKuaUpgrade("p", 15)) {
                k = k.mul(1.05);
            }
            setFactor(3, [4, 0], "KPower Upgrade 15", `^${format(1.05, 3)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, getKuaUpgrade("p", 15), "kua");
            k = Decimal.pow(player.value.gameProgress.kua.amount, k);

            if (tmp.value.kua.active.effects) {
                // * theres probably a better way to do this
                // no requirements for this, no need to lump them in the ones with conditionals
                tmp.value.kua.effects.upg1Scaling = Decimal.max(player.value.gameProgress.main.points, 0).add(1).log10().pow(0.6).div(200).mul(Decimal.max(k, 0).mul(1e4).add(1).pow(2 / 3).sub(1)).add(1).log10().add(1);
                if (getKuaUpgrade("p", 3)) {
                    tmp.value.kua.effects.upg1Scaling = Decimal.max(player.value.gameProgress.main.points, 0).add(1).pow(0.022).mul(Decimal.max(k, 0).mul(10).add(1).pow(0.75).sub(1)).add(1).log10().add(1).max(tmp.value.kua.effects.upg1Scaling);
                }

                const exp = D(1.35);

                tmp.value.kua.effects.kshardPassive = Decimal.max(player.value.gameProgress.kua.kshards.totals[3]!, 0.01).mul(1e3).log10().pow(2).sub(1).pow10().pow(0.04).pow(exp).log10().add(1).log10().add(1).pow(0.9).sub(1).pow10().sub(1).pow10();
                tmp.value.kua.effects.kpowerPassive = Decimal.max(player.value.gameProgress.kua.kpower.totals[3]!, 0.01).mul(1e3).log10().pow(2).sub(1).pow10().pow(0.04).pow(exp).log10().add(1).log10().add(1).pow(0.9).sub(1).pow10().sub(1).pow10();

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
                    ? Decimal.max(k, 10).log10().sub(1).div(4).add(1).pow(1.1).sub(1).pow10()
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
            }

            i = D(0);
            if (tmp.value.kua.active.kshards.gain) {
                i = D(player.value.gameProgress.kua.amount);
                setFactor(0, [4, 2], "Base", `${format(player.value.gameProgress.kua.amount, 4)}`, `${format(i, 3)}`, true);
                if (getKuaUpgrade("p", 1)) {
                    i = i.mul(2.5);
                }
                setFactor(1, [4, 2], "KPower Upgrade 1", `×${format(2.5, 2)}`, `${format(i, 3)}`, getKuaUpgrade("p", 1), "kua");

                if (getKuaUpgrade("s", 13)) {
                    i = i.mul(KUA_UPGRADES.KShards[12].eff!);
                }
                setFactor(2, [4, 2], "KShard Upgrade 13", `×${format(KUA_UPGRADES.KShards[12].eff!, 2)}`, `${format(i, 3)}`, getKuaUpgrade("s", 13), "kua");

                if (Decimal.gte(timesCompleted("df"), 1)) {
                    i = i.mul(2);
                }
                setFactor(3, [4, 2], `Decaying Feeling Completion ×${format(timesCompleted('df'))}`, `×${format(2, 2)}`, `${format(i, 3)}`, Decimal.gte(timesCompleted("df"), 1), "col");

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
                setFactor(4, [4, 2], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, i), 2)}`, `${format(i, 4)}`, inChallenge("df"), "col");
            }
            tmp.value.kua.shardGen = i;

            i = D(0);
            if (tmp.value.kua.active.kpower.gain) {
                i = D(player.value.gameProgress.kua.kshards.amount);
                setFactor(0, [4, 3], "Base", `${format(player.value.gameProgress.kua.kshards.amount, 4)}`, `${format(i, 3)}`, true);
                if (getKuaUpgrade("s", 10)) {
                    i = i.mul(tmp.value.kua.effects.kpower);
                }
                setFactor(1, [4, 3], "KShard Upgrade 10", `×${format(tmp.value.kua.effects.kpower, 2)}`, `${format(i, 3)}`, getKuaUpgrade("s", 10), "kua");

                if (getKuaUpgrade("s", 14)) {
                    i = i.mul(KUA_UPGRADES.KShards[13].eff!);
                }
                setFactor(2, [4, 3], "KShard Upgrade 14", `×${format(KUA_UPGRADES.KShards[13].eff!, 2)}`, `${format(i, 3)}`, getKuaUpgrade("s", 14), "kua");

                if (Decimal.gte(timesCompleted("df"), 1)) {
                    i = i.mul(2);
                }
                setFactor(3, [4, 3], `Decaying Feeling Completion ×${format(timesCompleted('df'))}`, `×${format(2, 2)}`, `${format(i, 3)}`, Decimal.gte(timesCompleted("df"), 1), "col");

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
                setFactor(4, [4, 3], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, i), 2)}`, `${format(i, 4)}`, inChallenge("df"), "col");
            }
            tmp.value.kua.powGen = i;

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

export const buyKShardUpg = (id: number) => {
    if (id === player.value.gameProgress.kua.kshards.upgrades) {
        if (Decimal.gte(player.value.gameProgress.kua.kshards.amount, KUA_UPGRADES.KShards[id].cost)) {
            player.value.gameProgress.kua.kshards.upgrades++;
            player.value.gameProgress.kua.kshards.amount = Decimal.sub(player.value.gameProgress.kua.kshards.amount, KUA_UPGRADES.KShards[id].cost);
        }
    }
};

export const buyKPowerUpg = (id: number) => {
    if (id === player.value.gameProgress.kua.kpower.upgrades) {
        if (Decimal.gte(player.value.gameProgress.kua.kpower.amount, KUA_UPGRADES.KPower[id].cost)) {
            player.value.gameProgress.kua.kpower.upgrades++;
            player.value.gameProgress.kua.kpower.amount = Decimal.sub(player.value.gameProgress.kua.kpower.amount, KUA_UPGRADES.KPower[id].cost);
        }
    }
};

export const buyKuaEnhSourceUPG = (i: number, max = false) => {
    if (Decimal.gte(KUA_ENHANCERS.sources[i].source, KUA_ENHANCERS.sources[i].cost(player.value.gameProgress.kua.enhancers.sources[i]))) {
        player.value.gameProgress.kua.enhancers.sources[i] = max 
            ? Decimal.max(player.value.gameProgress.kua.enhancers.sources[i], KUA_ENHANCERS.sources[i].target(KUA_ENHANCERS.sources[i].source).floor().add(1))
            : Decimal.add(player.value.gameProgress.kua.enhancers.sources[i], 1);
    }
};

export const kuaEnh = (id: number, amt: DecimalSource) => {
    const remain = Decimal.sub(tmp.value.kua.totalEnhSources, tmp.value.kua.enhSourcesUsed);
    player.value.gameProgress.kua.enhancers.enhancers[id] = Decimal.min(
        Decimal.add(remain, player.value.gameProgress.kua.enhancers.enhancers[id]),
        Decimal.max(0, Decimal.add(player.value.gameProgress.kua.enhancers.enhancers[id], amt))
    );
};

export const kuaEnhReset = () => {
    for (let i = 0; i < player.value.gameProgress.kua.enhancers.enhancers.length; i++) {
        player.value.gameProgress.kua.enhancers.enhancers[i] = 0;
    }
};
