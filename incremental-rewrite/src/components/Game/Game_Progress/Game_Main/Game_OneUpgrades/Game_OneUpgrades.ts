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
    target: ComputedRef<Decimal>
    effect: ComputedRef<Decimal>
    desc: ComputedRef<string>
    effectDesc: ComputedRef<string>
    show: ComputedRef<boolean>
}

export const maxxedOMUpgrade = (id: number): boolean => {
    // this is because col challenge Inverted Mechanics
    return !inChallenge("im") && Decimal.gte(player.value.prog.main.oneUpgrades[id], 1);
}

export const getOMUpgrade = (id: number): DecimalSource => {
    return player.value.prog.main.oneUpgrades[id] ?? D(0);
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
                return smoothPoly(getOMUpgrade(0), 2, 100, false).pow_base(1e44).mul(1e6);
            } else {
                return D(1e6);
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(Decimal.max(player.value.prog.main.prai.amount, 1e6).div(1e6).log(1e44), 2, 100, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 1e6) ? D(1) : D(0);
            }
        }),
        effect: computed(() => { 
            let i = Decimal.max(player.value.prog.main.prai.amount, 1).pow(0.5).log10().pow(1.1).pow10() ;
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
            i = i.pow(Decimal.max(getOMUpgrade(0), 1));
            return i;
        }),
        desc: computed(() => { return `Divide Upgrade 2's cost based off of your PRai.`; }),
        effectDesc: computed(() => { return `/${format(MAIN_ONE_UPGS[0].effect.value)}`; }),
        show: computed(() => true)
    },
    { // 2
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(getOMUpgrade(1), 2, 50, false).pow_base(2.5e3).mul(4e6);
            } else {
                return D(4e6);
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(Decimal.max(player.value.prog.main.prai.amount, 4e6).div(4e6).log(2.5e3), 2, 50, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 4e6) ? D(1) : D(0);
            }
        }),
        effect: computed(() => { 
            let i = Decimal.min(player.value.prog.main.prai.timeInPRai, 300).div(3000);
            if (Decimal.gte(getOMUpgrade(5), 1)) {
                i = i.mul(MAIN_ONE_UPGS[5].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.mul(MAIN_ONE_UPGS[10].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect.value);
            }
            i = i.mul(Decimal.max(getOMUpgrade(1), 1));
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
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(Decimal.max(player.value.prog.main.prai.amount, 5e7).div(5e7).log(1e3), 2, 25, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 5e7) ? D(1) : D(0);
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
            i = i.mul(Decimal.max(getOMUpgrade(2), 1));
            return i;
        }),
        desc: computed(() => { return `Delay Upgrade 1's scaling by a little bit.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[2].effect.value)}`; }),
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
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(Decimal.max(player.value.prog.main.prai.amount, 2e10).div(2e10).log(2e4), 3, 50, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 2e10) ? D(1) : D(0);
            }
        }),
        effect: computed(() => { 
            let i = Decimal.max(player.value.prog.main.prai.timeInPRai, 0).mul(0.1).add(1).ln().add(1);
            if (Decimal.gte(getOMUpgrade(13), 1)) {
                i = i.pow(MAIN_ONE_UPGS[13].effect.value.mul(0.25).add(1));
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
            i = i.pow(Decimal.max(getOMUpgrade(3), 1).sqrt());
            return i;
        }),
        desc: computed(() => { return `PRai gain is multiplied based off how much time you spent in this PRai reset.`; }),
        effectDesc: computed(() => { return `${format(MAIN_ONE_UPGS[3].effect.value, 1)}×`; }),
        show: computed(() => { return Decimal.gte(player.value.prog.main.pr2.amount, 7); })
    },
    { // 5
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(getOMUpgrade(4), 3, 20, false).pow_base(1e5).mul(1e15);
            } else {
                return D(1e15);
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(Decimal.max(player.value.prog.main.prai.amount, 1e15).div(1e15).log(1e5), 3, 20, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 1e15) ? D(1) : D(0);
            }
        }),
        effect: computed(() => { 
            let i = Decimal.max(player.value.prog.main.points, 10).log10().div(10).add(1).log10().add(1);
            if (Decimal.gte(getOMUpgrade(5), 1)) {
                i = i.mul(MAIN_ONE_UPGS[5].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.mul(MAIN_ONE_UPGS[10].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect.value);
            }
            i = i.mul(Decimal.max(getOMUpgrade(4), 1).sqrt().div(10).add(0.9));
            return i;
        }),
        desc: computed(() => { return `Raise One-Upgrade 1's effect based off of your points.`; }),
        effectDesc: computed(() => { return `^${format(MAIN_ONE_UPGS[4].effect.value, 3)}`; }),
        show: computed(() => { return Decimal.gte(player.value.prog.main.pr2.amount, 7); })
    },
    { // 6
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(getOMUpgrade(5), 1.1, false).pow_base(1e7).mul(1e23);
            } else {
                return D(1e23);
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(Decimal.max(player.value.prog.main.prai.amount, 1e23).div(1e23).log(1e7), 1.1, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 1e23) ? D(1) : D(0);
            }
        }),
        effect: computed(() => { 
            let i = Decimal.mul(player.value.prog.kua.amount, 1000).max(1).log10().sqrt().mul(0.02).add(1);
            i = i.sub(1).mul(Decimal.max(getOMUpgrade(5), 1).ln().add(1)).add(1);
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
        show: computed(() => { return Decimal.gt(player.value.prog.kua.amount, 0.0001); })
    },
    { // 7
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(getOMUpgrade(6), 1.2, false).pow_base(1e11).mul(1e33);
            } else {
                return D(1e33);
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(Decimal.max(player.value.prog.main.prai.amount, 1e33).div(1e33).log(1e11), 1.2, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 1e33) ? D(1) : D(0);
            }
        }),
        effect: computed(() => {
            let i = D(1.01);
            i = i.sub(1).mul(Decimal.max(getOMUpgrade(6), 1).cbrt()).add(1);
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[10].effect.value).add(1);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[15].effect.value).add(1);
            }
            return i;
        }),
        // ^1.01 to effectiveness
        desc: computed(() => { return `Upgrade 2 gains additional free levels for every purchase.`; }),
        effectDesc: computed(() => { return `~+${format(Decimal.pow(player.value.prog.main.upgrades[1].bought, MAIN_ONE_UPGS[6].effect.value).sub(player.value.prog.main.upgrades[1].bought), 1)}`; }),
        show: computed(() => { return Decimal.gt(player.value.prog.kua.amount, 0.0001); })
    },
    { // 8
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(getOMUpgrade(7), 4, 100, false).pow_base(1e23).mul(1e46);
            } else {
                return D(1e46);
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(Decimal.max(player.value.prog.main.prai.amount, 1e46).div(1e46).log(1e23), 4, 100, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 1e46) ? D(1) : D(0);
            }
        }),
        effect: computed(() => {
            let i = D(15);
            i = i.mul(Decimal.max(getOMUpgrade(7), 1));
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.mul(MAIN_ONE_UPGS[10].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect.value);
            }
            return i;
        }),
        desc: computed(() => { return `Delay Upgrade 2's scaling by a little bit.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[7].effect.value)}`; }),
        show: computed(() => { return Decimal.gt(player.value.prog.kua.amount, 0.0001); })
    },
    { // 9
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(smoothPoly(getOMUpgrade(8), 2, 25, false), 1.05, false).pow_base(1e29).mul(1e71);
            } else {
                return D(1e71);
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(smoothExp(Decimal.max(player.value.prog.main.prai.amount, 1e71).div(1e71).log(1e29), 1.05, true), 2, 25, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 1e71) ? D(1) : D(0);
            }
        }),
        effect: computed(() => { 
            let j = D(60);
            j = j.mul(Decimal.max(getOMUpgrade(8), 1));
            let i = Decimal.sub(j, Decimal.clamp(player.value.prog.kua.timeInKua, 0, j)).div(15);
            if (Decimal.gte(getOMUpgrade(13), 1)) {
                i = Decimal.max(i, (Decimal.gte(player.value.prog.kua.timeInKua, j) 
                    ? Decimal.max(player.value.prog.kua.timeInKua, j).log(j).sub(1).mul(Decimal.ln(j)).add(1).mul(4) 
                    : Decimal.max(player.value.prog.kua.timeInKua, 0).div(j).mul(4)).mul(MAIN_ONE_UPGS[13].effect.value));
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.mul(MAIN_ONE_UPGS[10].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect.value);
            }
            return i;
        }),
        desc: computed(() => { return `PR2's effect is stronger based off of how long you spent in a Kuaraniai reset.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[8].effect.value, 2)}`; }),
        show: computed(() => { return Decimal.gt(player.value.prog.kua.amount, 0.0001); })
    },
    { // 10
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(smoothPoly(getOMUpgrade(9), 2, 10, false), 1.1, false).pow_base(1e40).mul(1e100);
            } else {
                return D(1e100);
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(smoothExp(Decimal.max(player.value.prog.main.prai.amount, 1e100).div(1e100).log(1e40), 1.1, true), 2, 10, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 1e100) ? D(1) : D(0);
            }
        }),
        effect: computed(() => { 
            let i = Decimal.add(tmp.value.main.upgrades[2].effect, tmp.value.main.upgrades[5].effect).max(0).pow_base(1e10);
            i = i.pow(Decimal.max(getOMUpgrade(9), 1).cbrt().add(1));
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.pow(MAIN_ONE_UPGS[10].effect.value);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.pow(MAIN_ONE_UPGS[15].effect.value);
            }
            return i;
        }),
        desc: computed(() => { return `Multiply point gain based off of Upgrade 3 and 6's effect.`; }),
        effectDesc: computed(() => { return `${format(MAIN_ONE_UPGS[9].effect.value)}×`; }),
        show: computed(() => { return Decimal.gt(player.value.prog.kua.amount, 0.0001); })
    },
    { // 11
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(smoothPoly(getOMUpgrade(10), 3, 15, false), 1.15, false).pow_base(1e65).mul(1e135);
            } else {
                return D(1e135);
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(smoothExp(Decimal.max(player.value.prog.main.prai.amount, 1e135).div(1e135).log(1e65), 1.15, true), 3, 15, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 1e135) ? D(1) : D(0);
            }
        }),
        effect: computed(() => { 
            let i = Decimal.max(10, player.value.prog.col.power).log10().mul(0.01).add(0.99);
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[15].effect.value).add(1);
            }
            i = i.sub(1).mul(Decimal.max(getOMUpgrade(10), 1).div(10).add(0.9)).add(1);
            return i;
        }),
        desc: computed(() => { return `Make all previous One-Upgrades stronger based off of your Colosseum Power.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[10].effect.value.sub(1).mul(100), 2)}%`; }),
        show: computed(() => { return player.value.prog.unlocks.col; })
    },
    { // 12
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(smoothPoly(getOMUpgrade(11), 4, 20, false), 1.2, false).pow_base(1e90).mul(1e180);
            } else {
                return D(1e180);
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(smoothExp(Decimal.max(player.value.prog.main.prai.amount, 1e180).div(1e180).log(1e90), 1.2, true), 4, 20, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 1e180) ? D(1) : D(0);
            }
        }),
        effect: computed(() => { 
            let i = Decimal.max(player.value.prog.col.timeInCol, 1).log(60).mul(0.01).add(1);
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[15].effect.value).add(1);
            }
            i = i.sub(1).mul(Decimal.max(getOMUpgrade(11), 1).div(10).add(0.9)).add(1);
            return i;
        }),
        // +X% to effectiveness
        desc: computed(() => { return `Upgrade 3 gains free levels over time in this Colosseum reset.`; }),
        effectDesc: computed(() => { return `~+${format(Decimal.sub(MAIN_ONE_UPGS[11].effect.value, 1).mul(player.value.prog.main.upgrades[2].bought), 1)}`; }),
        show: computed(() => { return player.value.prog.unlocks.col; })
    },
    { // 13
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(smoothExp(getOMUpgrade(12), 1.05, false), 1.25, false).pow_base(1e120).mul(1e240);
            } else {
                return D(1e240);
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(smoothExp(Decimal.max(player.value.prog.main.prai.amount, 1e240).div(1e240).log(1e120), 1.25, true), 1.05, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 1e240) ? D(1) : D(0);
            }
        }),
        effect: computed(() => { 
            let i = D(10);
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect.value);
            }
            i = i.mul(Decimal.max(getOMUpgrade(12), 1));
            return i;
        }),
        desc: computed(() => { return `Delay Upgrade 3's scaling by a little bit.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[12].effect.value)}`; }),
        show: computed(() => { return player.value.prog.unlocks.col; })
    },
    { // 14
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(smoothExp(getOMUpgrade(13), 1.1, false), 1.35, false).pow_base(1e180).mul(1e300);
            } else {
                return D(1e300);
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(smoothExp(Decimal.max(player.value.prog.main.prai.amount, 1e300).div(1e300).log(1e180), 1.35, true), 1.1, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 1e300) ? D(1) : D(0);
            }
        }),
        effect: computed(() => { 
            let i = D(1);
            i = i.mul(Decimal.max(getOMUpgrade(13), 1).div(10).add(0.9));
            return i;
        }),
        desc: computed(() => { return `One-Upgrades #4 and #9 are better.`; }),
        effectDesc: computed(() => { return `---`; }),
        show: computed(() => { return player.value.prog.unlocks.col; })
    },
    { // 15
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(smoothExp(getOMUpgrade(14), 1.15, false), 1.5, false).pow_base(1e300).mul('e400');
            } else {
                return D('e400');
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(smoothExp(Decimal.max(player.value.prog.main.prai.amount, 'e400').div('e400').log(1e300), 1.5, true), 1.15, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 'e400') ? D(1) : D(0);
            }
        }),
        effect: computed(() => { 
            let i = D(10/9);
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect.value);
            }
            i = i.pow(Decimal.max(getOMUpgrade(14), 1).sqrt());
            return i;
        }),
        desc: computed(() => { return `Weaken Upgrade 1's hyper scaling by a good amount.`; }),
        effectDesc: computed(() => { return `-${formatPerc(MAIN_ONE_UPGS[14].effect.value, 2)}`; }),
        show: computed(() => { return player.value.prog.unlocks.col; })
    },
    { // 16
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(smoothPoly(getOMUpgrade(15), 2, 20, false), 1.2, false).pow_base(2).pow_base('e500').mul('e500');
            } else {
                return D('e500');
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(smoothExp(Decimal.max(player.value.prog.main.prai.amount, 'e500').div('e500').log('e500').log(2), 1.2, true), 2, 20, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 'e500') ? D(1) : D(0);
            }
        }),
        effect: computed(() => { 
            let i = D(1); /* Decimal.add(player.value.gameProgress.tax.amount, 1).log2().sqrt().mul(0.01).add(1); */ 
            i = i.sub(1).mul(Decimal.max(getOMUpgrade(15), 1).mul(0.1).add(0.9).sqrt()).add(1);
            return i;
        }),
        desc: computed(() => { return `Make all previous One-Upgrades stronger based off of your Taxed Coins.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[15].effect.value.sub(1).mul(100), 2)}%`; }),
        show: computed(() => { return false; })
    },
    { // 17
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(smoothPoly(getOMUpgrade(16), 2, 15, false), 1.25, false).pow_base(3).pow_base('e750').mul('e750');
            } else {
                return D('e750');
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(smoothExp(Decimal.max(player.value.prog.main.prai.amount, 'e750').div('e750').log('e750').log(3), 1.25, true), 2, 15, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 'e750') ? D(1) : D(0);
            }
        }),
        effect: computed(() => { 
            let i = D(1.005);
            i = i.sub(1).mul(Decimal.max(getOMUpgrade(16), 1).cbrt().mul(0.2).add(0.8)).add(1);
            return i;
        }),
        desc: computed(() => { return `Raise Upgrade 4-6's effective amount.`; }),
        effectDesc: computed(() => { return `^${format(MAIN_ONE_UPGS[16].effect.value, 3)}`; }),
        show: computed(() => { return false; })
    },
    { // 18
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(smoothPoly(getOMUpgrade(17), 3, 15, false), 1.35, false).pow_base(5).pow_base('ee3').mul('ee3');
            } else {
                return D('ee3');
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(smoothExp(Decimal.max(player.value.prog.main.prai.amount, 'ee3').div('ee3').log('ee3').log(5), 1.35, true), 3, 15, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 'ee3') ? D(1) : D(0);
            }
        }),
        effect: computed(() => { 
            let i = D(1);
            i = i.mul(Decimal.max(getOMUpgrade(17), 1).mul(0.1).add(0.9));
            return i;
        }),
        desc: computed(() => { return `Remove Upgrade 4-6's Linear scaling.`; }),
        effectDesc: computed(() => { return `^${format(Decimal.sub(1, MAIN_ONE_UPGS[17].effect.value), 3)}`; }),
        show: computed(() => { return false; })
    },
    { // 19
        implemented: false,
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(smoothPoly(getOMUpgrade(18), 4, 20, false), 1.5, false).pow_base(10).pow_base('e1500').mul('e1500');
            } else {
                return D('e1500');
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(smoothExp(Decimal.max(player.value.prog.main.prai.amount, 'e1500').div('e1500').log('e1500').log(10), 1.5, true), 4, 20, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 'e1500') ? D(1) : D(0);
            }
        }),
        effect: computed(() => { 
            let i = D(0); /* Decimal.mul(player.value.gameProgress.tax.times, 0.1).add(1).ln().mul(0.01); */ 
            i = i.sub(1).mul(Decimal.max(getOMUpgrade(18), 1).mul(0.1).add(0.9).sqrt()).add(1);
            return i;
        }),
        desc: computed(() => { return `Increase Kua's gain exponent based on how many times you taxed.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[18].effect.value, 3)}`; }),
        show: computed(() => { return false; })
    },
    { // 20
        cost: computed(() => {
            if (inChallenge("im")) {
                return smoothExp(smoothPoly(getOMUpgrade(19), 4, 15, false), 1.65, false).pow_base(10).pow_base('e2000').mul('e2000');
            } else {
                return D('e2000');
            }
        }),
        target: computed(() => {
            if (inChallenge("im")) {
                return smoothPoly(smoothExp(Decimal.max(player.value.prog.main.prai.amount, 'e2000').div('e2000').log('e2000').log(10), 1.5, true), 4, 15, true);
            } else {
                return Decimal.gte(player.value.prog.main.prai.amount, 'e2000') ? D(1) : D(0);
            }
        }),
        effect: computed(() => { 
            let i = tmp.value.main.upgrades[0].effective.mul(Decimal.ln(tmp.value.main.upgrades[0].effectBase)).mul(0.00001).add(1).root(3).sub(1).mul(3).add(1);
            i = i.sub(1).mul(Decimal.max(getOMUpgrade(19), 1).cbrt()).add(1)
            return i;
        }),
        desc: computed(() => { return `Upgrade 1 also raises point gain.`; }),
        effectDesc: computed(() => { return `^${format(MAIN_ONE_UPGS[19].effect.value, 3)}`; }),
        show: computed(() => { return false; })
    },
]

export const buyOneMainUpg = (id: number) => {
    if (Decimal.gte(player.value.prog.main.prai.amount, MAIN_ONE_UPGS[id].cost.value) && !maxxedOMUpgrade(id)) {
        player.value.prog.main.prai.amount = Decimal.sub(player.value.prog.main.prai.amount, MAIN_ONE_UPGS[id].cost.value);
        player.value.prog.main.oneUpgrades[id] = Decimal.add(player.value.prog.main.oneUpgrades[id], 1);
        // player.value.gameProgress.main.oneUpgrades[id] = Decimal.max(player.value.gameProgress.main.oneUpgrades[id], MAIN_ONE_UPGS[id].target.value.floor().add(1));
    }
}