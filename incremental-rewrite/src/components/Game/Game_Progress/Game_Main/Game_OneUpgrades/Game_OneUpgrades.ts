import { D, smoothExp, smoothPoly } from "@/calc"
import { format, formatPerc } from "@/format"
import { player, tmp } from "@/main"
import Decimal, { type DecimalSource } from "break_eternity.js"
import { computed, type ComputedRef } from "vue"
import { inChallenge } from "../../Game_Colosseum/Game_ColChallenges/Game_ColChalHandler"
import { getKuaUpgrade } from "../../Game_Kuaraniai/Game_KuaUpgrades/Game_KuaUpgrades"

export type MainOneUpg = {
    implemented?: boolean
    cost: ComputedRef<Decimal>
    effect: ComputedRef<Decimal>
    desc: ComputedRef<string>
    effectDesc: ComputedRef<string>
    show: ComputedRef<boolean>
}

export const maxxedOMUpgrade = (id: number): boolean => {
    // this is because col challenge Inverted Mechanics
    return !inChallenge("im") && Decimal.gte(player.value.gameProgress.main.oneUpgrades[id], 1);
}

export const getOMUpgrade = (id: number): DecimalSource => {
    return player.value.gameProgress.main.oneUpgrades[id] ?? D(0);
}

export const initAllMainOneUpgrades = () => {
    const arr = [];
    for (let i = MAIN_ONE_UPGS.length - 1; i >= 0; i--) {
        arr.push(
            {
                canBuy: false
            }
        );
    }
    return arr;
}

export const MAIN_ONE_UPGS: Array<MainOneUpg> = [
    { // 1
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(getOMUpgrade(0), 2, 100, false).pow_base(100).mul(1e6);
            } else {
                return D(1e6);
            }
        }),
        effect: computed(() => { 
            let i = Decimal.max(player.value.gameProgress.main.prai.amount, 1).pow(0.5).log10().pow(1.1).pow10() ;
            if (Decimal.gte(getOMUpgrade(4), 1)) {
                i = i.pow(MAIN_ONE_UPGS[4].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(5), 1)) {
                i = i.pow(MAIN_ONE_UPGS[5].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.pow(MAIN_ONE_UPGS[10].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.pow(MAIN_ONE_UPGS[15].effect.value);
            }
            if (inChallenge("im")) {
                i = i.pow(Decimal.max(getOMUpgrade(0), 1).sqrt());
            }
            return i;
        }),
        desc: computed(() => { return `Divide Upgrade 2's cost based off of your PRai.`; }),
        effectDesc: computed(() => { return `/${format(MAIN_ONE_UPGS[0].effect.value, 2)}`; }),
        show: computed(() => true)
    },
    { // 2
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(getOMUpgrade(1), 2, 50, false).pow_base(200).mul(4e6);
            } else {
                return D(4e6);
            }
        }),
        effect: computed(() => { 
            let i = Decimal.min(player.value.gameProgress.main.prai.timeInPRai, 300).div(3000);
            if (Decimal.gte(getOMUpgrade(5), 1)) {
                i = i.mul(MAIN_ONE_UPGS[5].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.mul(MAIN_ONE_UPGS[10].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect.value);
            }
            if (inChallenge("im")) {
                i = i.mul(Decimal.max(getOMUpgrade(1), 1));
            }
            return i;
        }),
        desc: computed(() => { return `Slowly increase Upgrade 1's base over time, maxing out over 5 minutes in this PRai reset.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[1].effect.value, 3)}`; }),
        show: computed(() => true)
    },
    { // 3
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(getOMUpgrade(2), 2, 25, false).pow_base(1e3).mul(5e7);
            } else {
                return D(5e7);
            }
        }),
        effect: computed(() => { 
            let i = D(5);
            if (Decimal.gte(getOMUpgrade(5), 1)) {
                i = i.mul(MAIN_ONE_UPGS[5].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.mul(MAIN_ONE_UPGS[10].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect.value);
            }
            if (inChallenge("im")) {
                i = i.mul(Decimal.max(getOMUpgrade(2), 1));
            }
            return i;
        }),
        desc: computed(() => { return `Delay Upgrade 1's scaling by a little bit.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[2].effect.value, 3)}`; }),
        show: computed(() => true)
    },
    { // 4
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(getOMUpgrade(3), 3, 50, false).pow_base(2e4).mul(2e10);
            } else {
                return D(2e10);
            }
        }),
        effect: computed(() => { 
            let i = Decimal.max(player.value.gameProgress.main.prai.timeInPRai, 0).mul(0.1).add(1).ln().add(1);
            if (Decimal.gte(getOMUpgrade(13), 1)) {
                i = i.pow(1.25);
            }
            if (getKuaUpgrade("p", 12)) {
                i = i.sqrt().sub(1).pow10();
            }
            if (Decimal.gte(getOMUpgrade(5), 1)) {
                i = i.pow(MAIN_ONE_UPGS[5].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.pow(MAIN_ONE_UPGS[10].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.pow(MAIN_ONE_UPGS[15].effect.value);
            }
            if (inChallenge("im")) {
                i = i.pow(Decimal.add(getOMUpgrade(3), 1).pow(1.2));
            }
            return i;
        }),
        desc: computed(() => { return `PRai gain is multiplied based off how much time you spent in this PRai reset.`; }),
        effectDesc: computed(() => { return `${format(MAIN_ONE_UPGS[3].effect.value, 3)}×`; }),
        show: computed(() => { return Decimal.gte(player.value.gameProgress.main.pr2.amount, 7); })
    },
    { // 5
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(getOMUpgrade(4), 3, 20, false).pow_base(1e5).mul(1e15);
            } else {
                return D(1e15);
            }
        }),
        effect: computed(() => { 
            let i = Decimal.max(player.value.gameProgress.main.points, 10).log10().div(10).add(1).log10().add(1);
            if (Decimal.gte(getOMUpgrade(5), 1)) {
                i = i.mul(MAIN_ONE_UPGS[5].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.mul(MAIN_ONE_UPGS[10].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect.value);
            }
            if (inChallenge("im")) {
                i = i.mul(Decimal.add(getOMUpgrade(4), 1).sqrt());
            }
            return i;
        }),
        desc: computed(() => { return `Raise One-Upgrade 1 based off of your points.`; }),
        effectDesc: computed(() => { return `^${format(MAIN_ONE_UPGS[4].effect.value, 3)}`; }),
        show: computed(() => { return Decimal.gte(player.value.gameProgress.main.pr2.amount, 7); })
    },
    { // 6
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(getOMUpgrade(5), 1.1, false).pow_base(1e7).mul(1e23);
            } else {
                return D(1e23);
            }
        }),
        effect: computed(() => { 
            let i = Decimal.mul(player.value.gameProgress.kua.amount, 1000).max(1).log10().sqrt().mul(0.02).add(1);
            if (inChallenge("im")) {
                i = i.sub(1).mul(Decimal.add(getOMUpgrade(5), 1).sqrt()).add(1);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[10].effect.value).add(1);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[15].effect.value).add(1);
            }
            if (getKuaUpgrade("p", 14)) {
                i = i.sub(1).mul(1.1).add(1);
            }
            return i;
        }),
        desc: computed(() => { return `Make all previous One-Upgrades stronger based off of your Kuaraniai.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[5].effect.value.sub(1).mul(100), 2)}%`; }),
        show: computed(() => { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); })
    },
    { // 7
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(getOMUpgrade(6), 1.2, false).pow_base(1e11).mul(1e33);
            } else {
                return D(1e33);
            }
        }),
        effect: computed(() => {
            let i = D(1.01);
            if (inChallenge("im")) {
                i = i.sub(1).mul(Decimal.add(getOMUpgrade(6), 1).sqrt()).add(1);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[10].effect.value).add(1);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[15].effect.value).add(1);
            }
            return i;
        }),
        desc: computed(() => { return `Increase Upgrade 2's effective amount to its effect.`; }),
        effectDesc: computed(() => { return `^${format(MAIN_ONE_UPGS[6].effect.value, 3)}`; }),
        show: computed(() => { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); })
    },
    { // 8
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(getOMUpgrade(7), 4, 100, false).pow_base(1e23).mul(1e46);
            } else {
                return D(1e46);
            }
        }),
        effect: computed(() => {
            let i = D(15);
            if (inChallenge("im")) {
                i = i.mul(Decimal.add(getOMUpgrade(7), 1));
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.mul(MAIN_ONE_UPGS[10].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect.value);
            }
            return i;
        }),
        desc: computed(() => { return `Delay Upgrade 2's scaling by a little bit.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[7].effect.value, 3)}`; }),
        show: computed(() => { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); })
    },
    { // 9
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(smoothPoly(getOMUpgrade(8), 2, 25, false), 1.05, false).pow_base(1e29).mul(1e71);
            } else {
                return D(1e71);
            }
        }),
        effect: computed(() => { 
            let j = D(60);
            j = j.mul(Decimal.add(getOMUpgrade(8), 1));
            let i = Decimal.sub(j, Decimal.clamp(player.value.gameProgress.kua.timeInKua, 0, j)).div(15);
            if (Decimal.gte(getOMUpgrade(13), 1)) {
                i = Decimal.gte(player.value.gameProgress.kua.timeInKua, j) 
                    ? Decimal.max(player.value.gameProgress.kua.timeInKua, j).log(j).sub(1).mul(Decimal.ln(j)).add(1).mul(4) 
                    : Decimal.max(player.value.gameProgress.kua.timeInKua, 0).div(j).mul(4);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.mul(MAIN_ONE_UPGS[10].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect.value);
            }
            return i;
        }),
        desc: computed(() => { return `Add effective PR2 to PR2's base effect based off of how long you spent in a Kuaraniai reset.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[8].effect.value, 3)}`; }),
        show: computed(() => { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); })
    },
    { // 10
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(smoothPoly(getOMUpgrade(8), 2, 10, false), 1.1, false).pow_base(1e40).mul(1e100);
            } else {
                return D(1e100);
            }
        }),
        effect: computed(() => { 
            let i = Decimal.add(tmp.value.main.upgrades[2].effect, tmp.value.main.upgrades[5].effect).max(0).pow_base(1e10);
            if (inChallenge("im")) {
                i = i.pow(MAIN_ONE_UPGS[8].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.pow(MAIN_ONE_UPGS[10].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.pow(MAIN_ONE_UPGS[15].effect.value);
            }
            return i;
        }),
        desc: computed(() => { return `Multiply points gain based off of Upgrade 3 and 6's effect.`; }),
        effectDesc: computed(() => { return `${format(MAIN_ONE_UPGS[9].effect.value, 3)}×`; }),
        show: computed(() => { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); })
    },
    { // 11
        cost: computed(() => { return D(1e135); }),
        effect: computed(() => { 
            let i = Decimal.max(10, player.value.gameProgress.col.power).log10().mul(0.01).add(0.99);
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[15].effect.value).add(1);
            }
            return i;
        }),
        desc: computed(() => { return `Make all previous One-Upgrades stronger based off of your Colosseum Power.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[10].effect.value.sub(1).mul(100), 2)}%`; }),
        show: computed(() => { return player.value.gameProgress.unlocks.col; })
    },
    { // 12
        cost: computed(() => { return D(1e180); }),
        effect: computed(() => { 
            let i = Decimal.max(player.value.gameProgress.tax.timeInTax, 1).log(60).mul(0.01).add(1);
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[15].effect.value).add(1);
            }
            return i;
        }),
        desc: computed(() => { return `Gradually increase Upgrade 3’s effectiveness over time in this Colosseum reset.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[11].effect.value.sub(1).mul(100), 2)}%`; }),
        show: computed(() => { return player.value.gameProgress.unlocks.col; })
    },
    { // 13
        cost: computed(() => { return D(1e240); }),
        effect: computed(() => { 
            let i = D(10);
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect.value);
            }
            return i;
        }),
        desc: computed(() => { return `Delay Upgrade 3’s scaling by a little bit.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[12].effect.value, 3)}`; }),
        show: computed(() => { return player.value.gameProgress.unlocks.col; })
    },
    { // 14
        cost: computed(() => { return D(1e300); }),
        effect: computed(() => { return D(1) }),
        desc: computed(() => { return `One-Upgrades #4 and #9 are better.`; }),
        effectDesc: computed(() => { return `---`; }),
        show: computed(() => { return player.value.gameProgress.unlocks.col; })
    },
    { // 15
        cost: computed(() => { return D('e400'); }),
        effect: computed(() => { 
            let i = D(10/9);
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect.value);
            }
            return i;
        }),
        desc: computed(() => { return `Weaken Upgrade 1’s hyper scaling by a good amount.`; }),
        effectDesc: computed(() => { return `-${formatPerc(MAIN_ONE_UPGS[14].effect.value, 3)}`; }),
        show: computed(() => { return player.value.gameProgress.unlocks.col; })
    },
    { // 16
        cost: computed(() => { return D('e500'); }),
        effect: computed(() => { return Decimal.add(player.value.gameProgress.tax.amount, 1).log2().sqrt().mul(0.01).add(1) }),
        desc: computed(() => { return `Make all previous One-Upgrades stronger based off of your Taxed Coins.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[15].effect.value.sub(1).mul(100), 2)}%`; }),
        show: computed(() => { return player.value.gameProgress.unlocks.tax; })
    },
    { // 17
        cost: computed(() => { return D('e750'); }),
        effect: computed(() => { return D(1.005) }),
        desc: computed(() => { return `Raise Upgrade 4-6’s effective amount.`; }),
        effectDesc: computed(() => { return `^${format(MAIN_ONE_UPGS[16].effect.value, 3)}`; }),
        show: computed(() => { return player.value.gameProgress.unlocks.tax; })
    },
    { // 18
        cost: computed(() => { return D('ee3'); }),
        effect: computed(() => { return D(1) }),
        desc: computed(() => { return `Remove Upgrade 4-6’s Linear scaling.`; }),
        effectDesc: computed(() => { return `^${format(Decimal.sub(1, MAIN_ONE_UPGS[17].effect.value), 3)}`; }),
        show: computed(() => { return player.value.gameProgress.unlocks.tax; })
    },
    { // 19
        implemented: false,
        cost: computed(() => { return D('e1500'); }),
        effect: computed(() => { return Decimal.mul(player.value.gameProgress.tax.times, 0.1).add(1).ln().mul(0.01) }),
        desc: computed(() => { return `Increase Kua’s gain exponent based on how many times you taxed.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[18].effect.value, 3)}`; }),
        show: computed(() => { return player.value.gameProgress.unlocks.tax; })
    },
    { // 20
        cost: computed(() => { return D('e2000'); }),
        effect: computed(() => { return tmp.value.main.upgrades[0].effective.mul(Decimal.ln(tmp.value.main.upgrades[0].effectBase)).mul(0.00001).add(1).root(3).sub(1).mul(3).add(1) }),
        desc: computed(() => { return `Upgrade 1 also raises point gain.`; }),
        effectDesc: computed(() => { return `^${format(MAIN_ONE_UPGS[19].effect.value, 3)}`; }),
        show: computed(() => { return player.value.gameProgress.unlocks.tax; })
    },
]

export const buyOneMainUpg = (id: number) => {
    if (Decimal.gte(player.value.gameProgress.main.prai.amount, MAIN_ONE_UPGS[id].cost.value) && !maxxedOMUpgrade(id)) {
        player.value.gameProgress.main.prai.amount = Decimal.sub(player.value.gameProgress.main.prai.amount, MAIN_ONE_UPGS[id].cost.value);
        player.value.gameProgress.main.oneUpgrades[id] = Decimal.add(player.value.gameProgress.main.oneUpgrades[id], 1);
    }
}