import { D, scale, smoothExp, smoothPoly } from "@/calc";
import { format, formatPerc } from "@/format";
import { player, tmp } from "@/main";
import Decimal, { type DecimalSource } from "break_eternity.js";

export const KUA_BLESS_TIER = {
    rank: {
        show: true,
        req(x: DecimalSource) {
            let i = D(x);
            i = i.div(KUA_BLESS_UPGS[3].eff()[2]);
            return smoothExp(i, 1.004, false).pow_base(2).mul(10);
        },
        target(x: DecimalSource) {
            if (Decimal.lt(x, 10)) { return D(-1); }
            let i = smoothExp(Decimal.div(x, 10).log(2), 1.004, true);
            i = i.mul(KUA_BLESS_UPGS[3].eff()[2]);
            return i;
        },
        rounded(x: DecimalSource) {
            return this.target(x).floor().add(1);
        },
        base: {
            get kuaBlessGainIdle() {
                let i = D(1.15);
                i = i.add(KUA_BLESS_TIER.tetr.effects.kuaRankIdle);
                return i;
            },
            get kuaBlessGainActive() {
                let i = D(1.2);
                i = i.add(KUA_BLESS_TIER.tetr.effects.kuaRankActive);
                return i;
            }
        },
        effects: {
            get kuaBlessGainIdle() {
                let eff = KUA_BLESS_TIER.rank.rounded(player.value.gameProgress.kua.blessings.best[3]!).pow_base(KUA_BLESS_TIER.rank.base.kuaBlessGainIdle);
                if (!tmp.value.kua.active.blessings.ranks.rank) {
                    eff = D(1);
                }
                return eff;
            },
            get kuaBlessGainActive() {
                let eff = KUA_BLESS_TIER.rank.rounded(player.value.gameProgress.kua.blessings.best[3]!).pow_base(KUA_BLESS_TIER.rank.base.kuaBlessGainActive);
                if (!tmp.value.kua.active.blessings.ranks.rank) {
                    eff = D(1);
                }
                return eff;
            }
        },
        desc: {
            get kuaBlessGainIdle() {
                return `Increase KBlessing's idle generation by +${format(KUA_BLESS_TIER.rank.base.kuaBlessGainIdle.sub(1).mul(100))}%. Currently: +${format(KUA_BLESS_TIER.rank.effects.kuaBlessGainIdle.sub(1).mul(100))}%`;
            },
            get kuaBlessGainActive() {
                return `Increase KBlessing's active generation by +${format(KUA_BLESS_TIER.rank.base.kuaBlessGainActive.sub(1).mul(100))}%. Currently: +${format(KUA_BLESS_TIER.rank.effects.kuaBlessGainActive.sub(1).mul(100))}%`;
            }
        }
    },
    tier: {
        show: true,
        req(x: DecimalSource) {
            return smoothExp(x, 1.01, false).pow(1.2).mul(2).add(4).ceil();
        },
        target(x: DecimalSource) {
            x = D(x);
            if (x.lt(4)) { return D(-1); }
            return smoothExp(x.sub(4).div(2).root(1.2), 1.01, true);
        },
        rounded(x: DecimalSource) {
            return this.target(x).floor().add(1);
        },
        base: {
            get kuaBlessEff() {
                return D(0.25);
            },
        },
        effects: {
            get kuaBlessEff() {
                let eff = KUA_BLESS_TIER.tier.rounded(tmp.value.kua.blessings.rank).mul(KUA_BLESS_TIER.tier.base.kuaBlessEff).add(1);
                if (!tmp.value.kua.active.blessings.ranks.tier) {
                    eff = D(1);
                }
                return eff;
            },
        },
        desc: {
            get kuaBlessEff() {
                return `Increase KBlessing's effects by +${format(KUA_BLESS_TIER.tier.base.kuaBlessEff.mul(100))}% (additive). Currently: +${format(KUA_BLESS_TIER.tier.effects.kuaBlessEff.sub(1).mul(100))}%`;
            },
        }
    },
    tetr: {
        get show() {
            return Decimal.gte(tmp.value.kua.blessings.tier, 3);
        },
        req(x: DecimalSource) {
            return Decimal.pow(x, 1.2).mul(2).add(4).ceil();
        },
        target(x: DecimalSource) {
            x = D(x);
            if (x.lt(4)) { return D(-1); }
            return x.sub(4).div(2).root(1.2);
        },
        rounded(x: DecimalSource) {
            return this.target(x).floor().add(1);
        },
        base: {
            get kuaRankActive() {
                return D(0.05);
            },
            get kuaRankIdle() {
                return D(0.05);
            },
            get pr2Eff() {
                return KUA_BLESS_TIER.tetr.rounded(tmp.value.kua.blessings.tier).mul(0.004).add(1);
            },
        },
        effects: {
            get kuaRankActive() {
                let eff = KUA_BLESS_TIER.tetr.rounded(tmp.value.kua.blessings.tier).mul(KUA_BLESS_TIER.tetr.base.kuaRankActive);
                if (!tmp.value.kua.active.blessings.ranks.tetr) {
                    eff = D(0);
                }
                return eff;
            },
            get kuaRankIdle() {
                let eff = KUA_BLESS_TIER.tetr.rounded(tmp.value.kua.blessings.tier).mul(KUA_BLESS_TIER.tetr.base.kuaRankIdle);
                if (!tmp.value.kua.active.blessings.ranks.tetr) {
                    eff = D(0);
                }
                return eff;
            },
            get pr2Eff() {
                let eff = Decimal.pow(KUA_BLESS_TIER.tetr.base.pr2Eff, player.value.gameProgress.main.pr2.amount);
                if (!tmp.value.kua.active.blessings.ranks.tetr) {
                    eff = D(1);
                }
                return eff;
            },
        },
        desc: {
            get kuaRankActive() {
                return `Increase KB Rank's active base by +${format(KUA_BLESS_TIER.tetr.base.kuaRankActive.mul(100))}% (additive). Currently: +${format(KUA_BLESS_TIER.tetr.effects.kuaRankActive.mul(100))}%`;
            },
            get kuaRankIdle() {
                return `Increase KB Rank's idle base by +${format(KUA_BLESS_TIER.tetr.base.kuaRankIdle.mul(100))}% (additive). Currently: +${format(KUA_BLESS_TIER.tetr.effects.kuaRankIdle.mul(100))}%`;
            },
            get pr2Eff() {
                return `Increase KB gain by ${format(KUA_BLESS_TIER.tetr.base.pr2Eff, 3)}× for each PR2. Currently: ${format(KUA_BLESS_TIER.tetr.effects.pr2Eff, 2)}×`;
            },
        }
    },
}

export type KuaBlessUpg = {
    show: boolean,
    cost: (x?: DecimalSource) => Decimal,
    target: (x: DecimalSource) => Decimal,
    desc: (x?: DecimalSource) => string,
    effDesc: (x?: DecimalSource) => string,
    eff: (x?: DecimalSource) => Array<Decimal>
}

export const KUA_BLESS_UPGS: Array<KuaBlessUpg> = [
    {
        show: true,
        cost(x = player.value.gameProgress.kua.blessings.upgrades[0]) {
            let cost = smoothExp(smoothPoly(x, 2, 35, false), 1.02, false).pow_base(2.5).mul(10);
            if (cost.lt("ee6")) {
                cost = cost.sub(cost.mod(cost.log10().sub(1).floor().pow10()));
            }
            return cost;
        },
        target(x) {
            if (Decimal.lt(x, 10)) { return D(-1); }
            let target = D(x);
            if (target.lt("ee6")) {
                target = target.sub(target.mod(target.log10().sub(1).floor().pow10()));
            }
            return smoothPoly(smoothExp(Decimal.div(target, 10).log(2.5), 1.02, true), 2, 35, true);
        },
        desc(x = player.value.gameProgress.kua.blessings.upgrades[0]) {
            let txt = `KBs boost Upgrade 2's effect.`;
            if (Decimal.gte(x, 6)) {
                txt += ` KShards and KPower effects act like they're higher based off of your KBs.`;
            }
            if (Decimal.gte(x, 12)) {
                txt += ` Upgrade 1-6's superscaling start is delayed based off of your KBs.`;
            }
            return txt;
        },
        effDesc(x = player.value.gameProgress.kua.blessings.upgrades[0]) {
            let txt = `^${format(this.eff(x)[0], 3)}`;
            if (Decimal.gte(x, 6)) {
                txt += `, ×${format(this.eff(x)[1], 1)}`;
            }
            if (Decimal.gte(x, 12)) {
                txt += `, +${format(this.eff(x)[2], 2)}`;
            }
            return txt;
        },
        eff(x = player.value.gameProgress.kua.blessings.upgrades[0]) {
            if (!tmp.value.kua.active.blessings.upgrades[0]) {
                x = D(0);
            }
            const arr = [
                Decimal.add(player.value.gameProgress.kua.blessings.amount, 1).ln().div(100).mul(Decimal.sqrt(x)).add(1).root(1.5),
                Decimal.gte(x, 6) 
                    ? Decimal.add(player.value.gameProgress.kua.blessings.amount, 1).pow(Decimal.sub(x, 4).sqrt().sub(1).div(2))
                    : D(1),
                Decimal.gte(x, 12) 
                    ? Decimal.add(player.value.gameProgress.kua.blessings.amount, 1).ln().add(1).pow(Decimal.sub(x, 11).sqrt().div(2)).sub(1).div(Decimal.sub(player.value.gameProgress.kua.blessings.upgrades[0], 11).sqrt().div(2)).div(10).add(1).ln().mul(10)
                    : D(0),
            ];
            if (arr[0].gte(50)) {
                arr[0] = scale(arr[0], 0.2, false, 50, 1, 0.5);
            }
            return arr;
        }
    },
    {
        get show() {
            return Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[0], 1);
        },
        cost(x = player.value.gameProgress.kua.blessings.upgrades[1]) {
            let cost = smoothExp(smoothPoly(x, 3, 50, false), 1.03, false).pow_base(3).mul(100);
            if (cost.lt("ee6")) {
                cost = cost.sub(cost.mod(cost.log10().sub(1).floor().pow10()));
            }
            return cost;
        },
        target(x) {
            if (Decimal.lt(x, 100)) { return D(-1); }
            let target = D(x);
            if (target.lt("ee6")) {
                target = target.sub(target.mod(target.log10().sub(1).floor().pow10()));
            }
            return smoothPoly(smoothExp(Decimal.div(target, 100).log(3), 1.03, true), 3, 50, true);
        },
        desc(x = player.value.gameProgress.kua.blessings.upgrades[1]) {
            let txt = `KBs delay Upgrade 1's hyper scaling.`;
            if (Decimal.gte(x, 6)) {
                txt += ` KB gain is increased based off of how many KB upgrades you've bought.`;
            }
            if (Decimal.gte(x, 12)) {
                txt += ` Raise point gain.`;
            }
            return txt;
        },
        effDesc(x = player.value.gameProgress.kua.blessings.upgrades[1]) {
            let txt = `+${format(this.eff(x)[0], 3)}`;
            if (Decimal.gte(x, 6)) {
                txt += `, ×${format(this.eff(x)[1], 1)}`;
            }
            if (Decimal.gte(x, 12)) {
                txt += `, ^${format(this.eff(x)[2], 2)}`;
            }
            return txt;
        },
        eff(x = player.value.gameProgress.kua.blessings.upgrades[1]) {
            if (!tmp.value.kua.active.blessings.upgrades[1]) {
                x = D(0);
            }
            let totalKB = D(0);
            for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
                totalKB = Decimal.add(totalKB, player.value.gameProgress.kua.blessings.upgrades[i]);
            }
            return [
                Decimal.add(player.value.gameProgress.kua.blessings.amount, 1).ln().mul(Decimal.sqrt(x)),
                Decimal.gte(x, 6) 
                    ? Decimal.pow(Decimal.sub(x, 5).mul(0.01).add(1), totalKB)
                    : D(1),
                Decimal.gte(x, 12) 
                    ? Decimal.sub(x, 11).pow_base(1.01)
                    : D(1),
            ]
        }
    },
    {
        get show() {
            return Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[1], 1);
        },
        cost(x = player.value.gameProgress.kua.blessings.upgrades[2]) {
            let cost = smoothExp(smoothPoly(x, 4, 75, false), 1.04, false).pow_base(4).mul(250);
            if (cost.lt("ee6")) {
                cost = cost.sub(cost.mod(cost.log10().sub(1).floor().pow10()));
            }
            return cost;
        },
        target(x) {
            if (Decimal.lt(x, 250)) { return D(-1); }
            let target = D(x);
            if (target.lt("ee6")) {
                target = target.sub(target.mod(target.log10().sub(1).floor().pow10()));
            }
            return smoothPoly(smoothExp(Decimal.div(target, 250).log(4), 1.04, true), 4, 75, true);
        },
        desc(x = player.value.gameProgress.kua.blessings.upgrades[2]) {
            let txt = `Kuaraniai gain is boosted.`;
            if (Decimal.gte(x, 6)) {
                txt += ` Kuaraniai's gain exponent is boosted.`;
            }
            if (Decimal.gte(x, 12)) {
                txt += ` Boost KShard and KPower gain.`;
            }
            return txt;
        },
        effDesc(x = player.value.gameProgress.kua.blessings.upgrades[2]) {
            let txt = `×${format(this.eff(x)[0])}`;
            if (Decimal.gte(x, 6)) {
                txt += `, +${format(this.eff(x)[1], 3)}`;
            }
            if (Decimal.gte(x, 12)) {
                txt += `, ×${format(this.eff(x)[2])}`;
            }
            return txt;
        },
        eff(x = player.value.gameProgress.kua.blessings.upgrades[2]) {
            if (!tmp.value.kua.active.blessings.upgrades[2]) {
                x = D(0);
            }
            return [
                Decimal.pow(2, x),
                Decimal.gte(x, 6) 
                    ? Decimal.sub(x, 5).mul(0.01)
                    : D(0),
                Decimal.gte(x, 12) 
                    ? Decimal.sub(x, 10).factorial()
                    : D(1),
            ]
        }
    },
    {
        get show() {
            return Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 1);
        },
        cost(x = player.value.gameProgress.kua.blessings.upgrades[3]) {
            let cost = smoothExp(smoothPoly(x, 5, 100, false), 1.05, false).pow_base(5).mul(1000);
            if (cost.lt("ee6")) {
                cost = cost.sub(cost.mod(cost.log10().sub(1).floor().pow10()));
            }
            return cost;
        },
        target(x) {
            if (Decimal.lt(x, 1000)) { return D(-1); }
            let target = D(x);
            if (target.lt("ee6")) {
                target = target.sub(target.mod(target.log10().sub(1).floor().pow10()));
            }
            return smoothPoly(smoothExp(Decimal.div(target, 1000).log10(), 1.05, true), 5, 100, true);
        },
        desc(x = player.value.gameProgress.kua.blessings.upgrades[3]) {
            let txt = `KBlessings boost KShard and KPower gain.`;
            if (Decimal.gte(x, 6)) {
                txt += ` KShards and KPower gain boost each other.`;
            }
            if (Decimal.gte(x, 12)) {
                txt += ` Slow down the KB Rank requirement.`;
            }
            return txt;
        },
        effDesc(x = player.value.gameProgress.kua.blessings.upgrades[3]) {
            let txt = `×${format(this.eff(x)[0], 2)}`;
            if (Decimal.gte(x, 6)) {
                txt += `, ×log10(x)^${format(this.eff(x)[1], 2)}`;
            }
            if (Decimal.gte(x, 12)) {
                txt += `, ${formatPerc(this.eff(x)[2], 2)}`;
            }
            return txt;
        },
        eff(x = player.value.gameProgress.kua.blessings.upgrades[3]) {
            if (!tmp.value.kua.active.blessings.upgrades[3]) {
                x = D(0);
            }
            return [
                Decimal.max(player.value.gameProgress.kua.blessings.amount, 1).log10().sqrt().add(1).pow(Decimal.pow(x, 0.75)),
                Decimal.gte(x, 6) 
                    ? Decimal.add(x, 4).sqrt().mul(1.5).sub(4.5)
                    : D(0),
                Decimal.gte(x, 12) 
                    ? Decimal.sub(x, 11).div(50).add(1)
                    : D(1),
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

export const gainKBOnClick = () => {
    if (Decimal.lt(player.value.gameProgress.kua.blessings.clickCooldown, 0)) {
        player.value.gameProgress.kua.blessings.clickCooldown = D(0.25);
        player.value.gameProgress.kua.blessings.amount = Decimal.add(player.value.gameProgress.kua.blessings.amount, tmp.value.kua.blessings.perClick);
    }
}

export const buyKBUpg = (id: number) => {
    if (Decimal.gte(player.value.gameProgress.kua.blessings.amount, KUA_BLESS_UPGS[id].cost(player.value.gameProgress.kua.blessings.upgrades[id]))) {
        player.value.gameProgress.kua.blessings.amount = Decimal.sub(player.value.gameProgress.kua.blessings.amount, KUA_BLESS_UPGS[id].cost(player.value.gameProgress.kua.blessings.upgrades[id]));
        player.value.gameProgress.kua.blessings.upgrades[id] = Decimal.add(player.value.gameProgress.kua.blessings.upgrades[id], 1);
    }
}