import { D, smoothExp, smoothPoly } from "@/calc"
import { format, formatPerc } from "@/format"
import { player } from "@/main"
import Decimal, { type DecimalSource } from "break_eternity.js"
import { computed, type ComputedRef } from "vue"
import { getKuaUpgrade } from "../../Game_Kuaraniai/Game_KuaUpgrades/Game_KuaUpgrades"
import { MAIN_UPG_DATA } from "../Game_MainUpgrades/Game_MainUpgrades"
import { LABELS } from "@/components/Game/Game_Stats/Game_Stats"

export type MainOneUpg = {
    implemented?: boolean
    cost: ComputedRef<Decimal>
    target: ComputedRef<Decimal>
    effect: ComputedRef<Decimal>
    desc: ComputedRef<string>
    effectDesc: ComputedRef<string>
    show: ComputedRef<boolean>
    tooltipText?: ComputedRef<string>
}

export const maxxedOMUpgrade = (id: number): boolean => {
    // this is because col challenge Inverted Mechanics
    return !true && Decimal.gte(player.value.gameProgress.oneUpgrades[id], 1);
}

export const getOMUpgrade = (id: number): DecimalSource => {
    return player.value.gameProgress.oneUpgrades[id] ?? D(0);
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
            return smoothExp(Decimal.add(getOMUpgrade(0), 1), 1.05, false).pow(2).pow_base(1e6);
        }),
        target: computed(() => {
            return smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 1e6).log(1e6).root(2), 1.05, true);
        }),
        effect: computed(() => { 
            let i = Decimal.max(player.value.gameProgress.prai.amount, 1).pow(0.5).log10().pow(1.1).pow10() ;
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
        effectDesc: computed(() => { return `/${format(MAIN_ONE_UPGS[0].effect.value, 2)}`; }),
        show: computed(() => { return true; }),
        tooltipText: computed(() => {
            let txt = ``
            const newUp2Amt = MAIN_UPG_DATA[1].target(Decimal.mul(MAIN_UPG_DATA[1].cost(player.value.gameProgress.upgrades[1].bought), MAIN_ONE_UPGS[0].effect.value));
            const oldUp2Amt = MAIN_UPG_DATA[1].target(MAIN_UPG_DATA[1].cost(player.value.gameProgress.upgrades[1].bought));
            const newUp1Amt = MAIN_UPG_DATA[0].target(Decimal.mul(MAIN_UPG_DATA[0].cost(player.value.gameProgress.upgrades[0].bought), MAIN_UPG_DATA[1].effect()));
            const oldUp1Amt = MAIN_UPG_DATA[0].target(MAIN_UPG_DATA[0].cost(player.value.gameProgress.upgrades[0].bought));
            txt = `
                ${LABELS.ou1} allows you to buy +${format(newUp2Amt.sub(oldUp2Amt), 3)} more Upgrade 2.<br>
                This number decreases because Upgrade 2's cost scaling grows faster than this upgrade can decrease its cost.<br>
                The extra Upgrade 2s decrease Upgrade 1's cost by ~${format(MAIN_UPG_DATA[1].effect(newUp2Amt).div(MAIN_UPG_DATA[1].effect()), 2)}×.<br>
                <br>
                The extra Upgrade 2s allows you to buy +${format(newUp1Amt.sub(oldUp1Amt), 3)} more Upgrade 1.<br>
                The extra Upgrade 1s increase your point gain by ~${format(MAIN_UPG_DATA[0].effect(newUp1Amt).div(MAIN_UPG_DATA[0].effect()), 2)}×.
            `
            return txt;
        })
    },
    { // 2
        cost: computed(() => {
            return smoothExp(Decimal.add(getOMUpgrade(1), 1), 1.05, false).pow(2.25).pow_base(4e6);
        }),
        target: computed(() => {
            return smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 4e6).log(4e6).root(2.25), 1.05, true);
        }),
        effect: computed(() => { 
            let i = Decimal.min(player.value.gameProgress.prai.timeInPRai, 300).div(300).sqrt().mul(0.2);
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
        show: computed(() => { return true; }),
        tooltipText: computed(() => {
            let txt = ``
            txt = `
                ${LABELS.ou2} effectively increases your points by ${format(MAIN_UPG_DATA[0].effect().div(Decimal.pow(MAIN_UPG_DATA[0].effectBase.value.sub(MAIN_ONE_UPGS[1].effect.value), player.value.gameProgress.upgrades[0].bought)), 2)}×.
            `
            return txt;
        })

    },
    { // 3
        cost: computed(() => {
            return smoothExp(Decimal.add(getOMUpgrade(2), 1), 1.05, false).pow(2.5).pow_base(5e7);
        }),
        target: computed(() => {
            return smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 5e7).log(5e7).root(2.5), 1.05, true);
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
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[2].effect.value, 3)}`; }),
        show: computed(() => { return true; })
    },
    { // 4
        cost: computed(() => {
            return smoothExp(Decimal.add(getOMUpgrade(3), 1), 1.05, false).pow(2.75).pow_base(2e10);
        }),
        target: computed(() => {
            return smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 2e10).log(2e10).root(2.75), 1.05, true);
        }),
        effect: computed(() => { 
            let i = Decimal.max(player.value.gameProgress.prai.timeInPRai, 0).mul(0.1).add(1).ln().add(1);
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
            i = i.pow(Decimal.max(getOMUpgrade(3), 1));
            return i;
        }),
        desc: computed(() => { return `PRai gain is multiplied based off how much time you spent in this PRai reset.`; }),
        effectDesc: computed(() => { return `${format(MAIN_ONE_UPGS[3].effect.value, 3)}×`; }),
        show: computed(() => { return Decimal.gte(player.value.gameProgress.pr2.amount, 7); })
    },
    { // 5
        cost: computed(() => {
            return smoothExp(Decimal.add(getOMUpgrade(4), 1), 1.05, false).pow(3).pow_base(1e15);
        }),
        target: computed(() => {
            return smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 1e15).log(1e15).root(2.25), 1.05, true);
        }),
        effect: computed(() => { 
            let i = Decimal.max(player.value.gameProgress.points, 10).log10().div(10).add(1).log10().add(1);
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
        desc: computed(() => { return `Raise One-Upgrade 1 based off of your points.`; }),
        effectDesc: computed(() => { return `^${format(MAIN_ONE_UPGS[4].effect.value, 3)}`; }),
        show: computed(() => { return Decimal.gte(player.value.gameProgress.pr2.amount, 7); })
    },
    { // 6
        cost: computed(() => {
            return smoothExp(getOMUpgrade(5), 1.1, false).pow_base(1e7).mul(1e23);
        }),
        target: computed(() => {
            return smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 1e23).div(1e23).log(1e7), 1.1, true);
        }),
        effect: computed(() => { 
            let i = Decimal.mul(player.value.gameProgress.kua.amount, 1000).max(1).log10().sqrt().mul(0.02).add(1);
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
        show: computed(() => { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); })
    },
    { // 7
        cost: computed(() => {
            return smoothExp(getOMUpgrade(6), 1.2, false).pow_base(1e11).mul(1e33);
        }),
        target: computed(() => {
            return smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 1e33).div(1e33).log(1e11), 1.2, true);
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
        desc: computed(() => { return `Increase Upgrade 2's effective amount to its effect.`; }),
        effectDesc: computed(() => { return `^${format(MAIN_ONE_UPGS[6].effect.value, 3)}`; }),
        show: computed(() => { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); })
    },
    { // 8
        cost: computed(() => {
            return smoothPoly(getOMUpgrade(7), 4, 100, false).pow_base(1e23).mul(1e46);
        }),
        target: computed(() => {
            return smoothPoly(Decimal.max(player.value.gameProgress.prai.amount, 1e46).div(1e46).log(1e23), 4, 100, true);
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
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[7].effect.value, 3)}`; }),
        show: computed(() => { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); })
    },
    { // 9
        cost: computed(() => {
            return smoothExp(smoothPoly(getOMUpgrade(8), 2, 25, false), 1.05, false).pow_base(1e29).mul(1e71);
        }),
        target: computed(() => {
            return smoothPoly(smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 1e71).div(1e71).log(1e29), 1.05, true), 2, 25, true);
        }),
        effect: computed(() => { 
            let j = D(60);
            j = j.mul(Decimal.max(getOMUpgrade(8), 1));
            let i = Decimal.sub(j, Decimal.clamp(player.value.gameProgress.kua.timeInKua, 0, j)).div(15);
            if (Decimal.gte(getOMUpgrade(13), 1)) {
                i = Decimal.max(i, (Decimal.gte(player.value.gameProgress.kua.timeInKua, j) 
                    ? Decimal.max(player.value.gameProgress.kua.timeInKua, j).log(j).sub(1).mul(Decimal.ln(j)).add(1).mul(4) 
                    : Decimal.max(player.value.gameProgress.kua.timeInKua, 0).div(j).mul(4)).mul(MAIN_ONE_UPGS[13].effect.value));
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
            return smoothExp(smoothPoly(getOMUpgrade(9), 2, 10, false), 1.1, false).pow_base(1e40).mul(1e100);
        }),
        target: computed(() => {
            return smoothPoly(smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 1e100).div(1e100).log(1e40), 1.1, true), 2, 10, true);
        }),
        effect: computed(() => { 
            let i = Decimal.add(MAIN_UPG_DATA[2].effect(), MAIN_UPG_DATA[5].effect()).max(0).pow_base(1e10);
            i = i.pow(Decimal.max(getOMUpgrade(9), 1).cbrt().add(1));
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
        cost: computed(() => {
            return smoothExp(smoothPoly(getOMUpgrade(10), 3, 15, false), 1.15, false).pow_base(1e65).mul(1e135);
        }),
        target: computed(() => {
            return smoothPoly(smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 1e135).div(1e135).log(1e65), 1.15, true), 3, 15, true);
        }),
        effect: computed(() => { 
            let i = Decimal.max(10, player.value.gameProgress.col.power).log10().mul(0.01).add(0.99);
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[15].effect.value).add(1);
            }
            i = i.sub(1).mul(Decimal.max(getOMUpgrade(10), 1).div(10).add(0.9)).add(1);
            return i;
        }),
        desc: computed(() => { return `Make all previous One-Upgrades stronger based off of your Colosseum Power.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[10].effect.value.sub(1).mul(100), 2)}%`; }),
        show: computed(() => { return player.value.gameProgress.unlocks.col; })
    },
    { // 12
        cost: computed(() => {
            return smoothExp(smoothPoly(getOMUpgrade(11), 4, 20, false), 1.2, false).pow_base(1e90).mul(1e180);
        }),
        target: computed(() => {
            return smoothPoly(smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 1e180).div(1e180).log(1e90), 1.2, true), 4, 20, true);
        }),
        effect: computed(() => { 
            let i = Decimal.max(player.value.gameProgress.col.timeInCol, 1).log(60).mul(0.01).add(1);
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[15].effect.value).add(1);
            }
            i = i.sub(1).mul(Decimal.max(getOMUpgrade(11), 1).div(10).add(0.9)).add(1);
            return i;
        }),
        desc: computed(() => { return `Gradually increase Upgrade 3's effectiveness over time in this Colosseum reset.`; }),
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[11].effect.value.sub(1).mul(100), 2)}%`; }),
        show: computed(() => { return player.value.gameProgress.unlocks.col; })
    },
    { // 13
        cost: computed(() => {
            return smoothExp(smoothExp(getOMUpgrade(12), 1.05, false), 1.25, false).pow_base(1e120).mul(1e240);
        }),
        target: computed(() => {
            return smoothExp(smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 1e240).div(1e240).log(1e120), 1.25, true), 1.05, true);
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
        effectDesc: computed(() => { return `+${format(MAIN_ONE_UPGS[12].effect.value, 3)}`; }),
        show: computed(() => { return player.value.gameProgress.unlocks.col; })
    },
    { // 14
        cost: computed(() => {
            return smoothExp(smoothExp(getOMUpgrade(13), 1.1, false), 1.35, false).pow_base(1e180).mul(1e300);
        }),
        target: computed(() => {
            return smoothExp(smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 1e300).div(1e300).log(1e180), 1.35, true), 1.1, true);
        }),
        effect: computed(() => { 
            let i = D(1);
            i = i.mul(Decimal.max(getOMUpgrade(13), 1).div(10).add(0.9));
            return i;
        }),
        desc: computed(() => { return `One-Upgrades #4 and #9 are better.`; }),
        effectDesc: computed(() => { return `---`; }),
        show: computed(() => { return player.value.gameProgress.unlocks.col; })
    },
    { // 15
        cost: computed(() => {
            return smoothExp(smoothExp(getOMUpgrade(14), 1.15, false), 1.5, false).pow_base(1e300).mul('e400');
        }),
        target: computed(() => {
            return smoothExp(smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 'e400').div('e400').log(1e300), 1.5, true), 1.15, true);
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
        effectDesc: computed(() => { return `-${formatPerc(MAIN_ONE_UPGS[14].effect.value, 3)}`; }),
        show: computed(() => { return player.value.gameProgress.unlocks.col; })
    },
    { // 16
        cost: computed(() => {
            return smoothExp(smoothPoly(getOMUpgrade(15), 2, 20, false), 1.2, false).pow_base(2).pow_base('e500').mul('e500');
        }),
        target: computed(() => {
            return smoothPoly(smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 'e500').div('e500').log('e500').log(2), 1.2, true), 2, 20, true);
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
            return smoothExp(smoothPoly(getOMUpgrade(16), 2, 15, false), 1.25, false).pow_base(3).pow_base('e750').mul('e750');
        }),
        target: computed(() => {
            return smoothPoly(smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 'e750').div('e750').log('e750').log(3), 1.25, true), 2, 15, true);
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
            return smoothExp(smoothPoly(getOMUpgrade(17), 3, 15, false), 1.35, false).pow_base(5).pow_base('ee3').mul('ee3');
        }),
        target: computed(() => {
            return smoothPoly(smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 'ee3').div('ee3').log('ee3').log(5), 1.35, true), 3, 15, true);
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
            return smoothExp(smoothPoly(getOMUpgrade(18), 4, 20, false), 1.5, false).pow_base(10).pow_base('e1500').mul('e1500');
        }),
        target: computed(() => {
            return smoothPoly(smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 'e1500').div('e1500').log('e1500').log(10), 1.5, true), 4, 20, true);
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
            return smoothExp(smoothPoly(getOMUpgrade(19), 4, 15, false), 1.65, false).pow_base(10).pow_base('e2000').mul('e2000');
        }),
        target: computed(() => {
            return smoothPoly(smoothExp(Decimal.max(player.value.gameProgress.prai.amount, 'e2000').div('e2000').log('e2000').log(10), 1.5, true), 4, 15, true);
        }),
        effect: computed(() => { 
            let i = MAIN_UPG_DATA[0].effective().mul(Decimal.ln(MAIN_UPG_DATA[0].effectBase.value)).mul(0.00001).add(1).root(3).sub(1).mul(3).add(1);
            i = i.sub(1).mul(Decimal.max(getOMUpgrade(19), 1).cbrt()).add(1)
            return i;
        }),
        desc: computed(() => { return `Upgrade 1 also raises point gain.`; }),
        effectDesc: computed(() => { return `^${format(MAIN_ONE_UPGS[19].effect.value, 3)}`; }),
        show: computed(() => { return false; })
    },
]

export const buyOneMainUpg = (id: number) => {
    if (Decimal.gte(player.value.gameProgress.prai.amount, MAIN_ONE_UPGS[id].cost.value) && !maxxedOMUpgrade(id)) {
        player.value.gameProgress.prai.amount = Decimal.sub(player.value.gameProgress.prai.amount, MAIN_ONE_UPGS[id].cost.value);
        player.value.gameProgress.oneUpgrades[id] = Decimal.add(player.value.gameProgress.oneUpgrades[id], 1);
        // player.value.gameProgress.oneUpgrades[id] = Decimal.max(player.value.gameProgress.oneUpgrades[id], MAIN_ONE_UPGS[id].target.value.floor().add(1));
    }
}