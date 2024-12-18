import Decimal, { type DecimalSource } from 'break_eternity.js'
import { format, formatPerc } from '@/format'
import { tmp, player, updateAllTotal, updateAllBest, NaNCheck, type TrueFactor } from '@/main'
import { scale, D, smoothPoly, smoothExp, expQuadCostGrowth } from '@/calc'
import { getSCSLAttribute, setSCSLEffectDisp, SCALE_ATTR, SOFT_ATTR, doAllScaling, type ScSlItems } from '@/softcapScaling'
import { getAchievementEffect, ifAchievement } from '../../Game_Achievements/Game_Achievements'
import { getKuaUpgrade, KUA_BLESS_UPGS, KUA_ENHANCERS, KUA_UPGRADES } from '../Game_Kuaraniai/Game_Kuaraniai'
import { challengeDepth, COL_CHALLENGES, getColChalCondEffects, getColChalRewEffects, getColResEffect, getColResLevel, inChallenge, timesCompleted } from '../Game_Colosseum/Game_Colosseum'
import { setFactor } from '../../Game_Stats/Game_Stats'

export type MainOneUpg = {
    implemented?: boolean
    cost: Decimal
    effect: Decimal
    desc: string
    effectDesc: string
    show: boolean
}

export const maxxedOMUpgrade = (id: number): boolean => {
    // this is because col challenge Inverted Mechanics
    return !inChallenge("im") && Decimal.gte(player.value.gameProgress.main.oneUpgrades[id], 1);
}

export const getOMUpgrade = (id: number): DecimalSource => {
    return player.value.gameProgress.main.oneUpgrades[id] ?? D(0);
}

export const MAIN_ONE_UPGS: Array<MainOneUpg> = [
    { // 1
        get cost() {
            if (inChallenge("im")) {
                return smoothPoly(getOMUpgrade(0), 2, 100, false).pow_base(100).mul(1e6);
            } else {
                return D(1e6);
            }
        },
        get effect() { 
            let i = Decimal.max(player.value.gameProgress.main.prai.amount, 1).pow(0.5).log10().pow(1.1).pow10() ;
            if (Decimal.gte(getOMUpgrade(4), 1)) {
                i = i.pow(MAIN_ONE_UPGS[4].effect);
            }
            if (Decimal.gte(getOMUpgrade(5), 1)) {
                i = i.pow(MAIN_ONE_UPGS[5].effect);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.pow(MAIN_ONE_UPGS[10].effect);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.pow(MAIN_ONE_UPGS[15].effect);
            }
            if (inChallenge("im")) {
                i = i.pow(Decimal.max(getOMUpgrade(0), 1).sqrt());
            }
            return i;
        },
        get desc() { return `Divide Upgrade 2's cost based off of your PRai.`; },
        get effectDesc() { return `/${format(this.effect!, 2)}`; },
        show: true
    },
    { // 2
        get cost() {
            if (inChallenge("im")) {
                return smoothPoly(getOMUpgrade(1), 2, 50, false).pow_base(200).mul(4e6);
            } else {
                return D(4e6);
            }
        },
        get effect() { 
            let i = Decimal.min(player.value.gameProgress.main.prai.timeInPRai, 300).div(3000);
            if (Decimal.gte(getOMUpgrade(5), 1)) {
                i = i.mul(MAIN_ONE_UPGS[5].effect);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.mul(MAIN_ONE_UPGS[10].effect);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect);
            }
            if (inChallenge("im")) {
                i = i.mul(Decimal.max(getOMUpgrade(1), 1));
            }
            return i;
        },
        get desc() { return `Slowly increase Upgrade 1's base over time, maxing out over 5 minutes in this PRai reset.`; },
        get effectDesc() { return `+${format(this.effect!, 3)}`; },
        show: true
    },
    { // 3
        get cost() {
            if (inChallenge("im")) {
                return smoothPoly(getOMUpgrade(2), 2, 25, false).pow_base(1e3).mul(5e7);
            } else {
                return D(5e7);
            }
        },
        get effect() { 
            let i = D(5);
            if (Decimal.gte(getOMUpgrade(5), 1)) {
                i = i.mul(MAIN_ONE_UPGS[5].effect);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.mul(MAIN_ONE_UPGS[10].effect);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect);
            }
            if (inChallenge("im")) {
                i = i.mul(Decimal.max(getOMUpgrade(2), 1));
            }
            return i;
        },
        get desc() { return `Delay Upgrade 1's scaling by a little bit.`; },
        get effectDesc() { return `+${format(this.effect!, 3)}`; },
        show: true
    },
    { // 4
        get cost() {
            if (inChallenge("im")) {
                return smoothPoly(getOMUpgrade(3), 3, 50, false).pow_base(2e4).mul(2e10);
            } else {
                return D(2e10);
            }
        },
        get effect() { 
            let i = Decimal.max(player.value.gameProgress.main.prai.timeInPRai, 0).mul(0.1).add(1).ln().add(1);
            if (Decimal.gte(getOMUpgrade(13), 1)) {
                i = i.pow(1.25);
            }
            if (getKuaUpgrade("p", 12)) {
                i = i.sqrt().sub(1).pow10();
            }
            if (Decimal.gte(getOMUpgrade(5), 1)) {
                i = i.pow(MAIN_ONE_UPGS[5].effect);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.pow(MAIN_ONE_UPGS[10].effect);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.pow(MAIN_ONE_UPGS[15].effect);
            }
            if (inChallenge("im")) {
                i = i.pow(Decimal.add(getOMUpgrade(3), 1).pow(1.2));
            }
            return i;
        },
        get desc() { return `PRai gain is multiplied based off how much time you spent in this PRai reset.`; },
        get effectDesc() { return `${format(this.effect!, 3)}×`; },
        get show() { return Decimal.gte(player.value.gameProgress.main.pr2.amount, 7); }
    },
    { // 5
        get cost() {
            if (inChallenge("im")) {
                return smoothPoly(getOMUpgrade(4), 3, 20, false).pow_base(1e5).mul(1e15);
            } else {
                return D(1e15);
            }
        },
        get effect() { 
            let i = Decimal.max(player.value.gameProgress.main.points, 10).log10().div(10).add(1).log10().add(1);
            if (Decimal.gte(getOMUpgrade(5), 1)) {
                i = i.mul(MAIN_ONE_UPGS[5].effect);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.mul(MAIN_ONE_UPGS[10].effect);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect);
            }
            if (inChallenge("im")) {
                i = i.mul(Decimal.add(getOMUpgrade(4), 1).sqrt());
            }
            return i;
        },
        get desc() { return `Raise One-Upgrade 1 based off of your points.`; },
        get effectDesc() { return `^${format(this.effect!, 3)}`; },
        get show() { return Decimal.gte(player.value.gameProgress.main.pr2.amount, 7); }
    },
    { // 6
        get cost() {
            if (inChallenge("im")) {
                return smoothExp(getOMUpgrade(5), 1.1, false).pow_base(1e7).mul(1e23);
            } else {
                return D(1e23);
            }
        },
        get effect() { 
            let i = Decimal.mul(player.value.gameProgress.kua.amount, 1000).max(1).log10().sqrt().mul(0.02).add(1);
            if (inChallenge("im")) {
                i = i.sub(1).mul(Decimal.add(getOMUpgrade(5), 1).sqrt()).add(1);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[10].effect).add(1);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[15].effect).add(1);
            }
            if (getKuaUpgrade("p", 14)) {
                i = i.sub(1).mul(1.1).add(1);
            }
            return i;
        },
        get desc() { return `Make all previous One-Upgrades stronger based off of your Kuaraniai.`; },
        get effectDesc() { return `+${format(this.effect!.sub(1).mul(100), 2)}%`; },
        get show() { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); }
    },
    { // 7
        get cost() {
            if (inChallenge("im")) {
                return smoothExp(getOMUpgrade(6), 1.2, false).pow_base(1e11).mul(1e33);
            } else {
                return D(1e33);
            }
        },
        get effect() {
            let i = D(1.01);
            if (inChallenge("im")) {
                i = i.sub(1).mul(Decimal.add(getOMUpgrade(6), 1).sqrt()).add(1);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[10].effect).add(1);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[15].effect).add(1);
            }
            return i;
        },
        get desc() { return `Increase Upgrade 2's effective amount to its effect.`; },
        get effectDesc() { return `^${format(this.effect!, 3)}`; },
        get show() { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); }
    },
    { // 8
        get cost() {
            if (inChallenge("im")) {
                return smoothPoly(getOMUpgrade(7), 4, 100, false).pow_base(1e23).mul(1e46);
            } else {
                return D(1e46);
            }
        },
        get effect() {
            let i = D(15);
            if (inChallenge("im")) {
                i = i.mul(Decimal.add(getOMUpgrade(7), 1));
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.mul(MAIN_ONE_UPGS[10].effect);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect);
            }
            return i;
        },
        get desc() { return `Delay Upgrade 2's scaling by a little bit.`; },
        get effectDesc() { return `+${format(this.effect!, 3)}`; },
        get show() { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); }
    },
    { // 9
        cost: D(1e71),
        get effect() { 
            let i = Decimal.sub(60, Decimal.clamp(player.value.gameProgress.kua.timeInKua, 0, 60)).div(15);
            if (Decimal.gte(getOMUpgrade(13), 1)) {
                i = Decimal.gte(player.value.gameProgress.kua.timeInKua, 60) ? Decimal.max(player.value.gameProgress.kua.timeInKua, 60).log(60).sub(1).mul(Decimal.ln(60)).add(1).mul(4) : Decimal.max(player.value.gameProgress.kua.timeInKua, 0).div(15);
            }
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.mul(MAIN_ONE_UPGS[10].effect);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect);
            }
            return i;
        },
        get desc() { return `Add effective PR2 to PR2's base effect based off of how long you spent in a Kuaraniai reset.`; },
        get effectDesc() { return `+${format(this.effect!, 3)}`; },
        get show() { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); }
    },
    { // 10
        cost: D(1e100),
        get effect() { 
            let i = Decimal.add(tmp.value.main.upgrades[2].effect, tmp.value.main.upgrades[5].effect).max(0).pow_base(1e10);
            if (Decimal.gte(getOMUpgrade(10), 1)) {
                i = i.pow(MAIN_ONE_UPGS[10].effect);
            }
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.pow(MAIN_ONE_UPGS[15].effect);
            }
            return i;
        },
        get desc() { return `Multiply points gain based off of Upgrade 3 and 6's effect.`; },
        get effectDesc() { return `${format(this.effect!, 3)}×`; },
        get show() { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); }
    },
    { // 11
        cost: D(1e135),
        get effect() { 
            let i = Decimal.max(10, player.value.gameProgress.col.power).log10().mul(0.01).add(0.99);
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[15].effect).add(1);
            }
            return i;
        },
        get desc() { return `Make all previous One-Upgrades stronger based off of your Colosseum Power.`; },
        get effectDesc() { return `+${format(this.effect!.sub(1).mul(100), 2)}%`; },
        get show() { return player.value.gameProgress.unlocks.col; }
    },
    { // 12
        cost: D(1e180),
        get effect() { 
            let i = Decimal.max(player.value.gameProgress.tax.timeInTax, 1).log(60).mul(0.01).add(1);
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.sub(1).mul(MAIN_ONE_UPGS[15].effect).add(1);
            }
            return i;
        },
        get desc() { return `Gradually increase Upgrade 3’s effectiveness over time in this Colosseum reset.`; },
        get effectDesc() { return `+${format(this.effect!.sub(1).mul(100), 2)}%`; },
        get show() { return player.value.gameProgress.unlocks.col; }
    },
    { // 13
        cost: D(1e240),
        get effect() { 
            let i = D(10);
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect);
            }
            return i;
        },
        get desc() { return `Delay Upgrade 3’s scaling by a little bit.`; },
        get effectDesc() { return `+${format(this.effect!, 3)}`; },
        get show() { return player.value.gameProgress.unlocks.col; }
    },
    { // 14
        cost: D(1e300),
        get effect() { return D(1) },
        get desc() { return `One-Upgrades #4 and #9 are better.`; },
        get effectDesc() { return `---`; },
        get show() { return player.value.gameProgress.unlocks.col; }
    },
    { // 15
        cost: D("e400"),
        get effect() { 
            let i = D(10/9);
            if (Decimal.gte(getOMUpgrade(15), 1)) {
                i = i.mul(MAIN_ONE_UPGS[15].effect);
            }
            return i;
        },
        get desc() { return `Weaken Upgrade 1’s hyper scaling by a good amount.`; },
        get effectDesc() { return `-${formatPerc(this.effect!, 3)}`; },
        get show() { return player.value.gameProgress.unlocks.col; }
    },
    { // 16
        cost: D("e500"),
        get effect() { return Decimal.add(player.value.gameProgress.tax.amount, 1).log2().sqrt().mul(0.01).add(1) },
        get desc() { return `Make all previous One-Upgrades stronger based off of your Taxed Coins.`; },
        get effectDesc() { return `+${format(this.effect!.sub(1).mul(100), 2)}%`; },
        get show() { return player.value.gameProgress.unlocks.tax; }
    },
    { // 17
        cost: D("e750"),
        get effect() { return D(1.005) },
        get desc() { return `Raise Upgrade 4-6’s effective amount.`; },
        get effectDesc() { return `^${format(this.effect!, 3)}`; },
        get show() { return player.value.gameProgress.unlocks.tax; }
    },
    { // 18
        cost: D("ee3"),
        get effect() { return D(1) },
        get desc() { return `Remove Upgrade 4-6’s Linear scaling.`; },
        get effectDesc() { return `^${format(Decimal.sub(1, this.effect!), 3)}`; },
        get show() { return player.value.gameProgress.unlocks.tax; }
    },
    { // 19
        implemented: false,
        cost: D("e1500"),
        get effect() { return Decimal.mul(player.value.gameProgress.tax.times, 0.1).add(1).ln().mul(0.01) },
        get desc() { return `Increase Kua’s gain exponent based on how many times you taxed.`; },
        get effectDesc() { return `+${format(this.effect!, 3)}`; },
        get show() { return player.value.gameProgress.unlocks.tax; }
    },
    { // 20
        cost: D("e2000"),
        get effect() { return tmp.value.main.upgrades[0].effective.mul(Decimal.ln(tmp.value.main.upgrades[0].effectBase)).mul(0.00001).add(1).root(3).sub(1).mul(3).add(1) },
        get desc() { return `Upgrade 1 also raises point gain.`; },
        get effectDesc() { return `^${format(this.effect!, 3)}`; },
        get show() { return player.value.gameProgress.unlocks.tax; }
    },
]

export const buyOneMainUpg = (id: number) => {
    if (Decimal.gte(player.value.gameProgress.main.prai.amount, MAIN_ONE_UPGS[id].cost) && !maxxedOMUpgrade(id)) {
        player.value.gameProgress.main.prai.amount = Decimal.sub(player.value.gameProgress.main.prai.amount, MAIN_ONE_UPGS[id].cost);
        player.value.gameProgress.main.oneUpgrades[id] = Decimal.add(player.value.gameProgress.main.oneUpgrades[id], 1);
    }
}

export const PR2_EFF = [
    {
        show: true,
        when: D(1),
        get text() { return `you gain a new upgrade and make PRai resets unforced.` }
    },
    {
        show: true,
        when: D(2),
        get text() { return `unlock the Upgrade 1 Autobuyer.` }
    },
    {
        show: true,
        when: D(4),
        get text() { return `unlock the Upgrade 2 Autobuyer and increase the Upgrade 2 base from ${format(1.2, 3)}x -> ${format(1.3, 3)}x.`}
    },
    {
        show: true,
        when: D(5),
        get text() { return `unlock Upgrade 3.`}
    },
    {
        show: true,
        when: D(6),
        get text() { return `unlock One-Upgrades.`}
    },
    {
        get show() { return !inChallenge('dc'); },
        when: D(7),
        get text() { return `weaken Upgrade 1's scaling strength by ${formatPerc(10 / 9, 3)}.`}
    },
    {
        show: true,
        when: D(9),
        get text() { return `increase Upgrade 1's base by +${format(0.05, 3)}.`}
    },
    {
        show: true,
        when: D(11),
        get text() { return `slow down Upgrade 3's cost by ${formatPerc(10 / 9, 3)}.`}
    },
    {
        get show() { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); },
        when: D(12),
        get text() { return `unlock the Upgrade 4 autobuyer.`}
    },
    {
        get show() { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); },
        when: D(14),
        get text() { return `unlock the Upgrade 5 autobuyer.`}
    },
    {
        get show() { return !inChallenge('dc'); },
        when: D(15),
        get text() { return `decrease Upgrade 2's superscaling strength by ${formatPerc(8 / 7, 3)}.`}
    },
    {
        get show() { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); },
        when: D(18),
        get text() { return `unlock the Upgrade 3 and 6 autobuyer.`}
    },
    {
        show: true,
        when: D(20),
        get text() { return `weaken Upgrade 1's cost scaling by ${format(2.5, 3)}%.`}
    },
    {
        show: true,
        when: D(25),
        get text() { return inChallenge('dc') ? `keep One-Upgrades on Kuaraniai reset.` : `keep One-Upgrades, and Upgrade 1 and 2's scaling and super scaling starts ${format(15, 1)} later.`}
    },
    {
        get show() { return getKuaUpgrade("s", 11); },
        when: D(45),
        get text() { return `boosts Kuaraniai effects based on how much PR2 you have.`}
    },
    {
        get show() { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); },
        when: D(75),
        get text() { return `unlock the Kuaraniai generator (works by ${format(1)}%/s).`}
    },
    {
        get show() { return getKuaUpgrade('s', 15); },
        when: D(100),
        get text() { return `unlock the Upgrade 7 autobuyer.`}
    },
    {
        get show() { return getKuaUpgrade('s', 16); },
        when: D(125),
        get text() { return `unlock the Upgrade 8 autobuyer.`}
    },
    {
        get show() { return getKuaUpgrade('s', 17); },
        when: D(150),
        get text() { return `unlock the Upgrade 9 autobuyer.`}
    },
]

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
    shown: boolean
    freeExtra: Decimal
    effective: (x: DecimalSource) => Decimal
    effectBase: Decimal
    effect: (x?: DecimalSource) => Decimal
    calcEB: Decimal
    autoUnlocked: boolean
    display: string
    totalDisp: string
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
    calculatedEB: Decimal,
    multiplier: Decimal
};

export const MAIN_UPGS: Array<MainUpgrade> = [
    { // UPG1
        shown: true,
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
            if (inChallenge('dc')) {
                i = i.add(player.value.gameProgress.main.upgrades[0].accumulated);
            }
            setFactor(3, [1, 0, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `+${format(player.value.gameProgress.main.upgrades[0].accumulated, 1)}`, `+${format(i)}`, inChallenge('dc'), 'col');
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
                i = i.add(MAIN_ONE_UPGS[1].effect);
            }
            setFactor(3, [1, 0, 2], "One-Upgrade 2", `+${format(MAIN_ONE_UPGS[1].effect, 3)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.main.oneUpgrades[1], 1));

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
            setFactor(4, [1, 0, 0], "Achievement ID (1, 5)", `×${format(getAchievementEffect(1, 5), 3)}`, `${format(i)} effective`, ifAchievement(1, 5), "ach");
            if (getKuaUpgrade('p', 16)) {
                i = i.mul(KUA_UPGRADES.KPower[15].eff!);
            }
            setFactor(5, [1, 0, 0], "KPower Upgrade 16", `×${format(KUA_UPGRADES.KPower[15].eff!, 3)}`, `${format(i)} effective`, getKuaUpgrade('p', 16), "kua");
            return i;
        },
        effect(x = player.value.gameProgress.main.upgrades[0].bought) {
            if (!tmp.value.main.upgrades[0].active) {
                return D(1);
            }
            let eff = D(x)
            setFactor(0, [1, 0, 0], "Base", `${format(eff, 3)}`, `${format(eff)} effective`, true);
            eff = this.effective(x);

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
        },
        get calcEB() {
            if (Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 1e10) || player.value.settings.scaledUpgBase) {
                return this.effectBase;
            } else {
                return this.effect(Decimal.add(player.value.gameProgress.main.upgrades[0].bought, 1)).div(this.effect());
            }
        },
        get autoUnlocked() {
            return Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 2);
        },
        get display() {
            return `Increase point gain by ${format(this.calcEB, 3)}×`;
        },
        get totalDisp() {
            return `Total: ${format(this.effect(), 2)}× to point gain`;
        }
    },
    { // UPG2
        get freeExtra() {
            let i = D(0);
            if (tmp.value.kua.proofs.upgrades.effect[0].effect.gt(0)) {
                i = i.add(tmp.value.kua.proofs.upgrades.effect[0].effect);
            }
            setFactor(1, [1, 1, 0], "Basic Discoveries", `+${format(tmp.value.kua.proofs.upgrades.effect[0].effect, 2)}`, `${format(i)} effective`, tmp.value.kua.proofs.upgrades.effect[0].effect.gt(0), "kp");
            if (inChallenge('dc')) {
                i = i.add(player.value.gameProgress.main.upgrades[1].accumulated);
            }
            setFactor(2, [1, 1, 0], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `+${format(player.value.gameProgress.main.upgrades[1].accumulated, 1)}`, `+${format(i)}`, inChallenge('dc'), 'col');
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
                i = i.pow(MAIN_ONE_UPGS[6].effect);
            }
            setFactor(3, [1, 1, 0], "One-Upgrade #7", `^${format(MAIN_ONE_UPGS[6].effect, 3)}`, `${format(i)} effective`, Decimal.gte(getOMUpgrade(6), 1));
            return i;
        },
        effect(x = player.value.gameProgress.main.upgrades[1].bought) {
            if (!tmp.value.main.upgrades[1].active) {
                return D(1);
            }
            let eff = D(x)
            setFactor(0, [1, 1, 0], "Base", `${format(eff, 3)}`, `${format(eff)} effective`, true);
            eff = this.effective(x)

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
        },
        get calcEB() {
            if (Decimal.gte(player.value.gameProgress.main.upgrades[1].bought, 1e10) || player.value.settings.scaledUpgBase) {
                return this.effectBase;
            } else {
                return this.effect(Decimal.add(player.value.gameProgress.main.upgrades[1].bought, 1)).div(this.effect());
            }
        },
        get shown() {
            return Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 1);
        },
        get autoUnlocked() {
            return Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 4);
        },
        get display() {
            return `Decreases Upgrade 1's cost by /${format(this.calcEB, 3)}`;
        },
        get totalDisp() {
            return `Total: /${format(this.effect(), 2)} to Upgrade 1's cost`;
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
                i = i.mul(MAIN_ONE_UPGS[11].effect)
            }
            setFactor(5, [1, 2, 0], "One Upgrade #12", `×${format(MAIN_ONE_UPGS[11].effect, 3)}`, `${format(i)} effective`, Decimal.gte(getOMUpgrade(11), 1), "ach");
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
        },
        get calcEB() {
            if (Decimal.gte(player.value.gameProgress.main.upgrades[2].bought, 1e10) || player.value.settings.scaledUpgBase) {
                return this.effectBase;
            } else {
                return this.effect(Decimal.add(player.value.gameProgress.main.upgrades[2].bought, 1)).sub(this.effect());
            }
        },
        get shown() {
            return Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 5);
        },
        get autoUnlocked() {
            return Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 18);
        },
        get display() {
            return `Increases Upgrade 1's base by +${format(this.calcEB, 3)}`;
        },
        get totalDisp() {
            return `Total: +${format(this.effect(), 3)} to Upgrade 1's base`;
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
                i = i.pow(MAIN_ONE_UPGS[16].effect);
            }
            setFactor(2, [1, 3, 0], "One-Upgrade #17", `^${format(MAIN_ONE_UPGS[16].effect, 3)}`, `${format(i)} effective`, Decimal.gte(getOMUpgrade(16), 1));
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
        },
        get calcEB() {
            if (Decimal.gte(player.value.gameProgress.main.upgrades[3].bought, 1e10) || player.value.settings.scaledUpgBase) {
                return this.effectBase;
            } else {
                return this.effect(Decimal.add(player.value.gameProgress.main.upgrades[3].bought, 1)).div(this.effect());
            }
        },
        get shown() {
            return Decimal.gt(player.value.gameProgress.kua.amount, 0);
        },
        get autoUnlocked() {
            return Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 12);
        },
        get display() {
            return `Increase point gain by ${format(this.calcEB, 3)}×`;
        },
        get totalDisp() {
            return `Total: ${format(this.effect(), 2)}× to point gain`;
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
                i = i.pow(MAIN_ONE_UPGS[16].effect);
            }
            setFactor(2, [1, 4, 0], "One-Upgrade #17", `^${format(MAIN_ONE_UPGS[16].effect, 3)}`, `${format(i)} effective`, Decimal.gte(getOMUpgrade(16), 1));
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
        },
        get calcEB() {
            if (Decimal.gte(player.value.gameProgress.main.upgrades[4].bought, 1e10) || player.value.settings.scaledUpgBase) {
                return this.effectBase;
            } else {
                return this.effect(Decimal.add(player.value.gameProgress.main.upgrades[4].bought, 1)).div(this.effect());
            }
        },
        get shown() {
            return Decimal.gte(player.value.gameProgress.kua.kshards.amount, 0.01);
        },
        get autoUnlocked() {
            return Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 14);
        },
        get display() {
            return `Decreases Upgrade 1's cost by /${format(this.calcEB, 3)}`;
        },
        get totalDisp() {
            return `Total: /${format(this.effect(), 2)} to Upgrade 1's cost`;
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
                i = i.pow(MAIN_ONE_UPGS[16].effect);
            }
            setFactor(2, [1, 5, 0], "One-Upgrade #17", `^${format(MAIN_ONE_UPGS[16].effect, 3)}`, `${format(i)} effective`, Decimal.gte(getOMUpgrade(16), 1));
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
        },
        get calcEB() {
            if (Decimal.gte(player.value.gameProgress.main.upgrades[5].bought, 1e10) || player.value.settings.scaledUpgBase) {
                return this.effectBase;
            } else {
                return this.effect(Decimal.add(player.value.gameProgress.main.upgrades[5].bought, 1)).sub(this.effect());
            }
        },
        get shown() {
            return Decimal.gte(player.value.gameProgress.kua.kpower.amount, 1);
        },
        get autoUnlocked() {
            return Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 18);
        },
        get display() {
            return `Increases Upgrade 1's base by +${format(this.calcEB, 3)}`;
        },
        get totalDisp() {
            return `Total: +${format(this.effect(), 3)} to Upgrade 1's base`;
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
        },
        get calcEB() {
            if (Decimal.gte(player.value.gameProgress.main.upgrades[6].bought, 1e10) || player.value.settings.scaledUpgBase) {
                return this.effectBase;
            } else {
                return this.effect(Decimal.add(player.value.gameProgress.main.upgrades[6].bought, 1)).div(this.effect());
            }
        },
        get shown() {
            return getKuaUpgrade('s', 15);
        },
        get autoUnlocked() {
            return Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 100);
        },
        get display() {
            return `Raise Upgrade 1's effect by ^${format(this.calcEB, 3)}`;
        },
        get totalDisp() {
            return `Total: ^${format(this.effect(), 3)} to Upgrade 1's effect`;
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
        },
        get calcEB() {
            if (Decimal.gte(player.value.gameProgress.main.upgrades[7].bought, 1e10) || player.value.settings.scaledUpgBase) {
                return this.effectBase;
            } else {
                return this.effect(Decimal.add(player.value.gameProgress.main.upgrades[7].bought, 1)).div(this.effect());
            }
        },
        get shown() {
            return getKuaUpgrade('s', 16);
        },
        get autoUnlocked() {
            return Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 125);
        },
        get display() {
            return `Raise Upgrade 1's cost by ^${format(this.calcEB, 3)}`;
        },
        get totalDisp() {
            return `Total: ^${format(this.effect(), 3)} to Upgrade 1's cost`;
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
        },
        get calcEB() {
            if (Decimal.gte(player.value.gameProgress.main.upgrades[8].bought, 1e10) || player.value.settings.scaledUpgBase) {
                return this.effectBase;
            } else {
                return this.effect(Decimal.add(player.value.gameProgress.main.upgrades[8].bought, 1)).div(this.effect());
            }
        },
        get shown() {
            return getKuaUpgrade('s', 17);
        },
        get autoUnlocked() {
            return Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 150);
        },
        get display() {
            return `Multiply Upgrade 1's base by ×${format(this.calcEB, 3)}`;
        },
        get totalDisp() {
            return `Total: ×${format(this.effect(), 3)} to Upgrade 1's base`;
        }
    },
]

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
                multiplier: D(1)
            }
        );
    }
    return arr;
}



export const PRAI_GAIN_CALC: Array<TrueFactor> = [
    {
        baseActive: true,
        active: true,
        name: 'Base',
        get effect() {
            return Decimal.max(player.value.gameProgress.main.totals[0]!, 0).div(tmp.value.main.prai.req).pow(tmp.value.main.prai.gainExp).sub(1).mul(tmp.value.main.prai.gainExp).add(1).log10().pow(0.9).pow10();
        },
        color: 'norm',
        type: 'mult'
    },
    {
        get baseActive() {
            return player.value.gameProgress.unlocks.pr2;
        },
        active: true,
        name: 'PR2',
        get effect() {
            return tmp.value.main.pr2.effActive ? tmp.value.main.pr2.effect : D(1);
        },
        color: 'norm',
        type: 'mult'
    },
    {
        get baseActive() {
            return Decimal.gte(player.value.gameProgress.main.oneUpgrades[3], 1);
        },
        active: true,
        name: 'One Upgrade #4',
        get effect() {
            return MAIN_ONE_UPGS[3].effect;
        },
        color: 'norm',
        type: 'mult'
    },
    {
        get baseActive() {
            return Decimal.gt(player.value.gameProgress.kua.kshards.amount, 0);
        },
        active: true,
        name: 'KShard Base Effect',
        get effect() {
            return tmp.value.kua.effects.kshardPassive;
        },
        color: 'kua',
        type: 'mult'
    },
    {
        get baseActive() {
            return getKuaUpgrade("s", 8);
        },
        active: true,
        name: 'KShard Upgrade 8',
        get effect() {
            return KUA_UPGRADES.KShards[7].eff!;
        },
        color: 'kua',
        type: 'mult'
    },
    {
        get baseActive() {
            return ifAchievement(1, 11);
        },
        active: true,
        name: 'Achievement ID (1, 11)',
        get effect() {
            return getAchievementEffect(1, 11);
        },
        color: 'ach',
        type: 'mult'
    },
    {
        get baseActive() {
            return ifAchievement(2, 1);
        },
        active: true,
        name: 'Achievement ID (2, 1)',
        get effect() {
            return D(5);
        },
        color: 'ach',
        type: 'mult'
    },
    {
        get baseActive() {
            return Decimal.gte(getColResLevel(1), 1);
        },
        active: true,
        name: 'Firsterious',
        get effect() {
            return getColResEffect(1);
        },
        color: 'col',
        type: 'mult'
    },
    {
        get baseActive() {
            return Decimal.gte(timesCompleted("df"), 1);
        },
        active: true,
        get name() {
            return `Decaying Feeling Completion ×${format(timesCompleted('df'))}`;
        },
        get effect() {
            return D(10);
        },
        color: 'col',
        type: 'mult'
    },
    {
        get baseActive() {
            return inChallenge("im");
        },
        active: true,
        get name() {
            return `Inverted Mechanics ×${format(challengeDepth("im"))}`;
        },
        get effect() {
            return Decimal.pow(0.8, challengeDepth("im"));
        },
        color: 'col',
        type: 'pow'
    },
];

export const updateAllStart = (delta: DecimalSource) => {
    updateStart(2, delta); // one upgrades (only for if they can be bought and is the tab should be highlighted)
    updateStart(1, delta); // pr2 calculations
    updateStart(0, delta); // prai calculations
    for (let i = MAIN_UPGS.length - 1; i >= 0; i--) {
        updateStart(-(i + 1), delta); // all main upgs
    }
}

export const updateStart = (whatToUpdate: number, delta: DecimalSource) => {
    let i, j, generate, scal, upgID;
    switch (whatToUpdate) {
        case 2:
            tmp.value.main.canBuyUpg = false;
            for (let i = 0; i < MAIN_ONE_UPGS.length; i++) {
                if (player.value.gameProgress.main.oneUpgrades[i] === undefined) { player.value.gameProgress.main.oneUpgrades[i] = D(0); }
                tmp.value.main.oneUpgrades[i].canBuy = Decimal.gte(player.value.gameProgress.main.prai.amount, MAIN_ONE_UPGS[i].cost);
                tmp.value.main.canBuyUpg = tmp.value.main.canBuyUpg || (tmp.value.main.oneUpgrades[i].canBuy && !maxxedOMUpgrade(i) && MAIN_ONE_UPGS[i].show);
            }
            break;
        case -9:
        case -8:
        case -7:
        case -6:
        case -5:
        case -4:
        case -3:
        case -2:
        case -1:
            upgID = -1 - whatToUpdate

            tmp.value.main.upgrades[upgID].active = true;
            if ((upgID === 3 || upgID === 4 || upgID === 5) && (inChallenge("su") && Decimal.gte(challengeDepth("su"), 8))) {
                tmp.value.main.upgrades[upgID].active = false;
            }

            tmp.value.main.upgrades[upgID].costBase = [
                {exp: D(0), scale: [D(5),    D(1.55), D(1)     ]},
                {exp: D(0), scale: [D(1e3),  D(1.25), D(1)     ]},
                {exp: D(0), scale: [D(1e10), D(100),  D(1.05)  ]},
                {exp: D(0), scale: [D(1e33), D(1.02), D(1.0003)]},
                {exp: D(0), scale: [D(1e45), D(1.03), D(1.0002)]},
                {exp: D(0), scale: [D(1e63), D(1.25), D(1.025) ]},
                {exp: D(1), scale: [D(1000), D(1.1),  D(1.001) ]},
                {exp: D(1), scale: [D(1250), D(1.075),D(1.0015)]},
                {exp: D(1), scale: [D(1500), D(1.25), D(1.005) ]},
            ][upgID];

            if (upgID === 0) {
                if (getKuaUpgrade("s", 7)) {
                    tmp.value.main.upgrades[upgID].costBase.scale[1] = tmp.value.main.upgrades[upgID].costBase.scale[1].mul(0.95);
                }
            }
            if (upgID === 1) {
                if (getKuaUpgrade("p", 13)) {
                    tmp.value.main.upgrades[upgID].costBase.scale[1] = tmp.value.main.upgrades[upgID].costBase.scale[1].mul(0.92);
                }
            }
            if (upgID === 3 || upgID === 4 || upgID === 5) {
                if (Decimal.gte(getOMUpgrade(17), 1)) {
                    tmp.value.main.upgrades[upgID].costBase.scale[1] = tmp.value.main.upgrades[upgID].costBase.scale[1].pow(Decimal.sub(1, MAIN_ONE_UPGS[17].effect));
                }
            }

            scal = D(player.value.gameProgress.main.upgrades[upgID].bought);
            setFactor(0, [1, upgID, 1], "Base", `${format(scal, 2)}`, `${format(scal, 2)} effective`, true);

            if (ifAchievement(1, 6)) {
                scal = scal.div(getAchievementEffect(1, 6));
            }
            setFactor(1, [1, upgID, 1], "Achievement ID: (1, 6)", `/${format(getAchievementEffect(1, 6), 2)}`, `${format(scal, 2)} effective`, ifAchievement(1, 6), "ach");

            if (upgID === 0) {
                if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 20)) {
                    scal = scal.mul(0.975);
                }
                setFactor(2, [1, upgID, 1], "PR2 20", `×${format(0.975, 2)}`, `${format(scal, 2)} effective`, Decimal.gte(player.value.gameProgress.main.pr2.amount, 20));

                if (getKuaUpgrade("p", 10)) {
                    scal = scal.div(KUA_UPGRADES.KPower[9].eff!);
                }
                setFactor(2, [1, upgID, 1], "KPower Upgrade 10", `/${format(KUA_UPGRADES.KPower[9].eff!, 2)}`, `${format(scal, 2)} effective`, getKuaUpgrade("p", 10), "kua");
            }
            if (upgID === 1) {
                if (getKuaUpgrade("s", 9)) {
                    scal = scal.sub(KUA_UPGRADES.KShards[8].eff!);
                }
                setFactor(3, [1, upgID, 1], "KShard Upgrade 9", `-${format(KUA_UPGRADES.KShards[8].eff!, 2)}`, `${format(scal, 2)} effective`, getKuaUpgrade("s", 9), "kua");

                if (getKuaUpgrade("p", 10)) {
                    scal = scal.div(KUA_UPGRADES.KPower[9].eff!);
                }
                setFactor(4, [1, upgID, 1], "KPower Upgrade 10", `/${format(KUA_UPGRADES.KPower[9].eff!, 2)}`, `${format(scal, 2)} effective`, getKuaUpgrade("p", 10), "kua");
            }
            if (upgID === 2) {
                if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 11)) {
                    scal = scal.div(10 / 9);
                }
                setFactor(5, [1, upgID, 1], "PR2 11", `/${format(10 / 9, 2)}`, `${format(scal, 2)} effective`, Decimal.gte(player.value.gameProgress.main.pr2.amount, 11));
            }
            if (upgID === 3 || upgID === 4 || upgID === 5) {
                if (getKuaUpgrade("p", 11)) {
                    scal = scal.mul(0.9);
                }
                setFactor(6, [1, upgID, 1], "KPower Upgrade 11", `×${format(0.9, 2)}`, `${format(scal, 2)} effective`, getKuaUpgrade("p", 11), "kua");
            }
            if (inChallenge("su")) {
                scal = scal.mul(getColChalCondEffects("su")[0]);
            }
            setFactor(7, [1, upgID, 1], `Sabotaged Upgrades ×${format(challengeDepth("su"))}`, `×${format(getColChalCondEffects("su")[0], 2)}`, `${format(scal, 2)} effective`, inChallenge("su"), "col");
            
            if (inChallenge("dc")) {
                scal = scal.pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[3]).sub(1).pow10();
            }
            setFactor(8, [1, upgID, 1], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `10^(${format(scal)}^${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[3], 2)})`, `${format(scal, 2)} effective`, inChallenge("dc"), "col");

            i = scal;
            scal = doAllScaling(scal, getSCSLAttribute(`upg${upgID + 1}` as ScSlItems, true), false);
            setFactor(9, [1, upgID, 1], "Scaling", `scaling(${format(i, 2)})`, `${format(scal, 2)} effective`, true);

            if (upgID === 3) {
                scal = scal.div(KUA_ENHANCERS.enhances[3].effect())
            }
            if (upgID === 4) {
                scal = scal.div(KUA_ENHANCERS.enhances[4].effect())
            }
            if (upgID === 5) {
                scal = scal.div(KUA_ENHANCERS.enhances[5].effect())
            }

            tmp.value.main.upgrades[upgID].cost = expQuadCostGrowth(scal, tmp.value.main.upgrades[upgID].costBase.scale[2], tmp.value.main.upgrades[upgID].costBase.scale[1], tmp.value.main.upgrades[upgID].costBase.scale[0], tmp.value.main.upgrades[upgID].costBase.exp, false);
            if (tmp.value.main.upgrades[upgID].costBase.scale[2].gt(1)) {
                setFactor(10, [1, upgID, 1], "Resulting Cost", `${format(tmp.value.main.upgrades[upgID].costBase.scale[2], 4)}^${format(scal)}² × ${format(tmp.value.main.upgrades[upgID].costBase.scale[1], 2)}^${format(scal)} × ${format(tmp.value.main.upgrades[upgID].costBase.scale[0])}`, `${format(tmp.value.main.upgrades[upgID].cost)}`, true);
            } else {
                setFactor(10, [1, upgID, 1], "Resulting Cost", `${format(tmp.value.main.upgrades[upgID].costBase.scale[1], 2)}^${format(scal)} × ${format(tmp.value.main.upgrades[upgID].costBase.scale[0])}`, `${format(tmp.value.main.upgrades[upgID].cost)}`, true);
            }

            if (upgID === 0) {
                if (Decimal.gte(player.value.gameProgress.main.upgrades[7].bought, 1)) {
                    tmp.value.main.upgrades[upgID].cost = tmp.value.main.upgrades[upgID].cost.pow(tmp.value.main.upgrades[7].effect ?? 1);
                }
                setFactor(11, [1, upgID, 1], "Upgrade 8", `^${format(tmp.value.main.upgrades[7].effect ?? 1, 3)}`, `${format(tmp.value.main.upgrades[upgID].cost)}`, Decimal.gte(player.value.gameProgress.main.upgrades[7].bought, 1));

                tmp.value.main.upgrades[upgID].cost = tmp.value.main.upgrades[upgID].cost.div(tmp.value.main.upgrades[1].effect ?? 1);
                setFactor(12, [1, upgID, 1], "Upgrade 2", `/${format(tmp.value.main.upgrades[1].effect ?? 1, 2)}`, `${format(tmp.value.main.upgrades[upgID].cost)}`, Decimal.gte(player.value.gameProgress.main.upgrades[1].bought, 1));

                tmp.value.main.upgrades[upgID].cost = tmp.value.main.upgrades[upgID].cost.div(tmp.value.main.upgrades[4].effect ?? 1);
                setFactor(13, [1, upgID, 1], "Upgrade 5", `/${format(tmp.value.main.upgrades[4].effect ?? 1, 2)}`, `${format(tmp.value.main.upgrades[upgID].cost)}`, Decimal.gte(player.value.gameProgress.main.upgrades[4].bought, 1));
            }

            if (upgID === 1) {
                if (Decimal.gte(player.value.gameProgress.main.oneUpgrades[0], 1)) {
                    tmp.value.main.upgrades[upgID].cost = tmp.value.main.upgrades[upgID].cost.div(MAIN_ONE_UPGS[0].effect);
                }
                setFactor(14, [1, upgID, 1], "One-Upgrade #1", `/${format(MAIN_ONE_UPGS[0].effect, 2)}`, `${format(tmp.value.main.upgrades[upgID].cost)}`, Decimal.gte(player.value.gameProgress.main.oneUpgrades[0], 1));
            }

            if (inChallenge('im') && Decimal.gte(player.value.gameProgress.main.upgrades[upgID].bought, 1)) {
                tmp.value.main.upgrades[upgID].cost = D(Infinity);
            }
            setFactor(15, [1, upgID, 1], "Inverted Mechanics", `---`, `Capped`, inChallenge('im') && Decimal.gte(player.value.gameProgress.main.upgrades[upgID].bought, 1), "col");

            tmp.value.main.upgrades[upgID].target = D(0);

            if (Decimal.gte(player.value.gameProgress.main.points, tmp.value.main.upgrades[upgID].costBase.scale[0])) {
                i = D(player.value.gameProgress.main.points);
                if (upgID === 1) {
                    if (Decimal.gte(player.value.gameProgress.main.oneUpgrades[0], 1)) {
                        i = i.mul(MAIN_ONE_UPGS[0].effect);
                    }
                }
                if (upgID === 0) {
                    i = i.mul(tmp.value.main.upgrades[4].effect ?? 1);
                    i = i.mul(tmp.value.main.upgrades[1].effect ?? 1);
                    i = i.root(tmp.value.main.upgrades[7].effect ?? 1);
                }

                scal = expQuadCostGrowth(i, tmp.value.main.upgrades[upgID].costBase.scale[2], tmp.value.main.upgrades[upgID].costBase.scale[1], tmp.value.main.upgrades[upgID].costBase.scale[0], tmp.value.main.upgrades[upgID].costBase.exp, true);

                if (upgID === 5) {
                    scal = scal.mul(KUA_ENHANCERS.enhances[5].effect())
                }
                if (upgID === 4) {
                    scal = scal.mul(KUA_ENHANCERS.enhances[4].effect())
                }
                if (upgID === 3) {
                    scal = scal.mul(KUA_ENHANCERS.enhances[3].effect())
                }

                scal = doAllScaling(scal, getSCSLAttribute(`upg${upgID + 1}` as ScSlItems, true), true);
                if (inChallenge("dc")) {
                    scal = scal.log10().add(1).root(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[3]);
                }
                if (inChallenge("su")) {
                    scal = scal.div(getColChalCondEffects("su")[0])
                }
                if (upgID === 3 || upgID === 4 || upgID === 5) {
                    if (getKuaUpgrade("p", 11)) {
                        scal = scal.div(0.9)
                    }
                }
                if (upgID === 2) {
                    if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 11)) {
                        scal = scal.mul(10 / 9);
                    }
                }
                if (upgID === 1) {
                    if (getKuaUpgrade("p", 10)) {
                        scal = scal.mul(KUA_UPGRADES.KPower[9].eff!)
                    }
                    if (getKuaUpgrade("s", 9)) {
                        scal = scal.add(KUA_UPGRADES.KShards[8].eff!);
                    }
                }
                if (upgID === 0) {
                    if (getKuaUpgrade("p", 10)) {
                        scal = scal.mul(KUA_UPGRADES.KPower[9].eff!)
                    }
                    if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 20)) {
                        scal = scal.div(0.975)
                    }
                }
                if (ifAchievement(1, 6)) {
                    scal = scal.mul(getAchievementEffect(1, 6));
                }

                if (inChallenge('im')) {
                    scal = D(0);
                }
                tmp.value.main.upgrades[upgID].target = scal;
            }

            tmp.value.main.upgrades[upgID].effect = MAIN_UPGS[upgID].effect();
            tmp.value.main.upgrades[upgID].effective = MAIN_UPGS[upgID].effective(player.value.gameProgress.main.upgrades[upgID].bought);
            tmp.value.main.upgrades[upgID].freeExtra = MAIN_UPGS[upgID].freeExtra;
            tmp.value.main.upgrades[upgID].effectBase = MAIN_UPGS[upgID].effectBase;
            tmp.value.main.upgrades[upgID].calculatedEB = MAIN_UPGS[upgID].calcEB;

            // this is only used for Col Challenge 'Dimension Crawler!'
            tmp.value.main.upgrades[upgID].multiplier = D(1);
            if (inChallenge('dc')) {
                i = COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[0];
                tmp.value.main.upgrades[upgID].multiplier = tmp.value.main.upgrades[upgID].multiplier.mul(i.pow(player.value.gameProgress.main.upgrades[upgID].bought));

                tmp.value.main.upgrades[upgID].multiplier = tmp.value.main.upgrades[upgID].multiplier.pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[2]);

                if (upgID > 0) {
                    player.value.gameProgress.main.upgrades[upgID - 1].accumulated = Decimal.add(player.value.gameProgress.main.upgrades[upgID - 1].accumulated, tmp.value.main.upgrades[upgID].effective.add(player.value.gameProgress.main.upgrades[upgID].accumulated).add(player.value.gameProgress.main.upgrades[upgID].bought).mul(tmp.value.main.upgrades[upgID].multiplier).mul(delta))
                }
            }

            tmp.value.main.upgrades[upgID].effectTextColor = "#FFFFFF";
            if (player.value.settings.scaleSoftColors) {
                for (let i = getSCSLAttribute(`upg${upgID + 1}` as ScSlItems, false).length - 1; i >= 0; i--) {
                    if (Decimal.gte(tmp.value.main.upgrades[upgID].effect, getSCSLAttribute(`upg${upgID + 1}` as ScSlItems, false)[i].start)) {
                        tmp.value.main.upgrades[upgID].effectTextColor = SOFT_ATTR[i].color;
                        break;
                    }
                }
            }

            tmp.value.main.upgrades[upgID].costTextColor = "#FFFFFF";
            if (player.value.settings.scaleSoftColors) {
                for (let i = getSCSLAttribute(`upg${upgID + 1}` as ScSlItems, true).length - 1; i >= 0; i--) {
                    if (Decimal.gte(player.value.gameProgress.main.upgrades[upgID].bought, getSCSLAttribute(`upg${upgID + 1}` as ScSlItems, true)[i].start)) {
                        tmp.value.main.upgrades[upgID].costTextColor = SCALE_ATTR[i].color;
                        break;
                    }
                } 
            }

            if (player.value.gameProgress.main.upgrades[upgID].auto) {
                player.value.gameProgress.main.upgrades[upgID].bought = Decimal.max(player.value.gameProgress.main.upgrades[upgID].bought, tmp.value.main.upgrades[upgID].target.add(1).floor());
            }
            
            for (let i = 0; i < player.value.gameProgress.main.upgrades[upgID].boughtInReset.length; i++) {
                player.value.gameProgress.main.upgrades[upgID].boughtInReset[i] = Decimal.max(player.value.gameProgress.main.upgrades[upgID].boughtInReset[i]!, player.value.gameProgress.main.upgrades[upgID].bought);
            }

            tmp.value.main.upgrades[upgID].canBuy = Decimal.gte(player.value.gameProgress.main.points, tmp.value.main.upgrades[upgID].cost);
            player.value.gameProgress.main.upgrades[upgID].best = Decimal.max(player.value.gameProgress.main.upgrades[upgID].best, player.value.gameProgress.main.upgrades[upgID].bought);
            break;
        case 0: // prai
            tmp.value.main.prai.effActive = true;

            player.value.gameProgress.main.prai.timeInPRai = Decimal.add(player.value.gameProgress.main.prai.timeInPRai, delta);

            tmp.value.main.prai.req = D(1e6);
            tmp.value.main.prai.gainExp = D(1 / 3);
            setFactor(0, [2, 2], "Base", `${format(tmp.value.main.prai.gainExp, 3)}`, `^${format(tmp.value.main.prai.gainExp, 3)}`, true);

            if (ifAchievement(1, 8)) {
                tmp.value.main.prai.gainExp = tmp.value.main.prai.gainExp.add(5/3000);
            }
            setFactor(1, [2, 2], "Achievement ID: (1, 8)", `+${format(5/3000, 3)}`, `^${format(tmp.value.main.prai.gainExp, 3)}`, ifAchievement(1, 8), "ach");

            if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 1) && Decimal.gte(player.value.gameProgress.main.totals[0]!, tmp.value.main.prai.req)) {
                let eff, txt;
                i = D(1);

                for (let j = 0; j < PRAI_GAIN_CALC.length; j++) {
                    PRAI_GAIN_CALC[j].active = PRAI_GAIN_CALC[j].baseActive;

                    txt = '';
                    if (PRAI_GAIN_CALC[j].active) {
                        eff = PRAI_GAIN_CALC[j].effect;

                        if (PRAI_GAIN_CALC[j].type === 'mult') {
                            if (inChallenge('dc') && PRAI_GAIN_CALC[j].name !== 'Base') {
                                eff = eff.max(1).log10().add(1).pow(0.5).sub(1).pow10();
                            }
                            i = i.mul(eff);
                            txt = `×${format(eff, 2)}`;
                        }
                        if (PRAI_GAIN_CALC[j].type === 'pow') {
                            i = i.pow(eff);
                            txt = `^${format(eff, 3)}`;
                        }
                    }

                    if (PRAI_GAIN_CALC[j].name === 'Base') {
                        txt = `(1+${format(tmp.value.main.prai.gainExp, 3)}(${format(player.value.gameProgress.main.totals[0]!)}/${format(tmp.value.main.prai.req)})^${format(tmp.value.main.prai.gainExp, 3)}-1) dilate ${format(0.9, 2)}`;
                    }
                    setFactor(j, [2, 0], PRAI_GAIN_CALC[j].name, txt, `${format(i, 1)}`, PRAI_GAIN_CALC[j].active, PRAI_GAIN_CALC[j].color);
                }

                const data = {
                    oldGain: i,
                    oldPRai: D(0),
                    newPRai: D(0),
                };
                data.oldPRai = Decimal.max(player.value.gameProgress.main.prai.amount, 10);

                if (inChallenge("df")) {
                    data.newPRai = scale(scale(scale(scale(data.oldPRai.max(10).log10(), 0.2, true, 1, 1, Decimal.pow(0.9, challengeDepth("df"))).pow10().add(i).log10(), 0.2, false, 1, 1, Decimal.pow(0.9, challengeDepth("df"))).pow10(), 0.2, true, 10, 1, Decimal.pow(0.75, challengeDepth("df"))).add(i), 0.2, false, 10, 1, Decimal.pow(0.75, challengeDepth("df")));

                    i = data.newPRai.sub(data.oldPRai).max(1);
                }
                setFactor(10, [2, 0], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, i), 2)}`, `${format(i)}`, inChallenge("df"), "col");

                tmp.value.main.prai.pending = i.floor().max(0);

                i = tmp.value.main.prai.pending.add(1).floor();
                if (Decimal.gte(getColResLevel(1), 1)) {
                    i = i.div(getColResEffect(1));
                }
                if (ifAchievement(2, 1)) {
                    i = i.div(5);
                }
                if (ifAchievement(1, 11)) {
                    i = i.div(getAchievementEffect(1, 11));
                }
                if (getKuaUpgrade("s", 8)) {
                    i = i.div(KUA_UPGRADES.KShards[7].eff!);
                }
                if (Decimal.gt(player.value.gameProgress.kua.kshards.amount, 0)) {
                    i = i.div(tmp.value.kua.effects.kshardPassive);
                }
                if (Decimal.gte(player.value.gameProgress.main.oneUpgrades[3], 1)) {
                    i = i.div(MAIN_ONE_UPGS[3].effect);
                }
                if (player.value.gameProgress.unlocks.pr2) {
                    i = i.div(tmp.value.main.pr2.effActive ? tmp.value.main.pr2.effect : 1);
                }
                i = i.log10().root(0.9).pow10().sub(1).div(tmp.value.main.prai.gainExp).add(1).root(tmp.value.main.prai.gainExp).mul(tmp.value.main.prai.req);
                tmp.value.main.prai.next = i.sub(player.value.gameProgress.main.totals[0]!);
            } else {
                tmp.value.main.prai.pending = Decimal.max(player.value.gameProgress.main.totals[0]!, 1e6).div(1e6).log(1e2).add(1).min(10).floor(); // hidden thing, usually 1 but when ppl decide to go further, they should get rewarded somehow
                tmp.value.main.prai.next = tmp.value.main.prai.req.sub(player.value.gameProgress.main.totals[0]!).div(tmp.value.main.pps);

                for (let j = 0; j < PRAI_GAIN_CALC.length; j++) {
                    setFactor(j, [2, 0], '', '', '', false);
                }
            }

            if (player.value.gameProgress.main.prai.auto) { 
                generate = tmp.value.main.prai.pending.mul(delta).mul(0.0001);
                if (player.value.gameProgress.kua.upgrades >= 1) {
                    generate = generate.mul(100);
                }
                if (inChallenge("df")) {
                    generate = generate.mul(10000);
                }
                player.value.gameProgress.main.prai.amount = Decimal.add(player.value.gameProgress.main.prai.amount, generate);
                updateAllTotal(player.value.gameProgress.main.prai.totals, generate);
                player.value.gameProgress.main.prai.totalEver = Decimal.add(player.value.gameProgress.main.prai.totalEver, generate);
            }

            NaNCheck(player.value.gameProgress.main.prai.amount, 'PRai amount is NaN!');

            j = D(4);
            if (ifAchievement(0, 5)) {
                j = j.mul(1.25);
            }

            i = D(player.value.gameProgress.main.prai.amount);
            setFactor(0, [2, 1], "Base", `${format(player.value.gameProgress.main.prai.amount)}`, `×${format(i, 2)}`, true);

            i = i.mul(j).add(1).log10().pow(0.975).pow10();
            setFactor(1, [2, 1], "Base Mult", `(${format(player.value.gameProgress.main.prai.amount)} × ${format(j)}) dilate ${format(0.975, 3)}`, `×${format(i, 2)}`, true);

            if (ifAchievement(0, 9)) {
                i = i.mul(2);
            }
            setFactor(2, [2, 1], "Achievement ID: (0, 9)", `×${format(2)}`, `×${format(i, 2)}`, ifAchievement(0, 9), "ach");

            if (ifAchievement(0, 17)) {
                i = i.mul(getAchievementEffect(0, 17));
            }
            setFactor(3, [2, 1], "Achievement ID: (0, 17)", `×${format(getAchievementEffect(0, 17), 2)}`, `×${format(i, 2)}`, ifAchievement(0, 17), "ach");

            if (getKuaUpgrade("s", 2)) {
                i = i.mul(KUA_UPGRADES.KShards[1].eff!);
            }
            setFactor(4, [2, 1], "KShard Upgrade 2", `×${format(KUA_UPGRADES.KShards[1].eff!, 2)}`, `×${format(i, 2)}`, getKuaUpgrade("s", 2), "kua");

            if (getKuaUpgrade("p", 5)) {
                i = i.pow(KUA_UPGRADES.KPower[4].eff!);
            }
            setFactor(5, [2, 1], "KPower Upgrade 5", `^${format(KUA_UPGRADES.KPower[4].eff!, 3)}`, `×${format(i, 2)}`, getKuaUpgrade("p", 5), "kua");

            if (inChallenge("su") && Decimal.gte(challengeDepth("su"), 9)) {
                i = i.pow(getColChalCondEffects("su")[3]);
            }
            setFactor(6, [2, 1], `Sabotaged Upgrades ×${format(challengeDepth("su"))}`, `^${format(getColChalCondEffects("su")[3], 3)}`, `×${format(i, 2)}`, inChallenge("su") && Decimal.gte(challengeDepth("su"), 9), "col");

            tmp.value.main.prai.effect = i;

            i = Decimal.add(player.value.gameProgress.main.prai.amount, tmp.value.main.prai.pending);
            i = i.mul(j).add(1).log10().pow(0.975).pow10();
            if (ifAchievement(0, 9)) {
                i = i.mul(2);
            }
            if (ifAchievement(0, 17)) {
                i = i.mul(getAchievementEffect(0, 17));
            }
            if (getKuaUpgrade("p", 2)) {
                i = i.mul(KUA_UPGRADES.KShards[1].eff!);
            } 
            if (getKuaUpgrade("p", 5)) {
                i = i.pow(KUA_UPGRADES.KPower[4].eff!);
            }
            if (inChallenge("su") && Decimal.gte(challengeDepth("su"), 9)) {
                i = i.pow(getColChalCondEffects("su")[3]);
            }
            tmp.value.main.prai.nextEffect = i;

            updateAllBest(player.value.gameProgress.main.prai.best, player.value.gameProgress.main.prai.amount);
            player.value.gameProgress.main.prai.bestEver = Decimal.max(player.value.gameProgress.main.prai.bestEver, player.value.gameProgress.main.prai.amount);
            tmp.value.main.prai.canDo = Decimal.gte(player.value.gameProgress.main.totals[0]!, tmp.value.main.prai.req);
            break;
        case 1: // pr2
            tmp.value.main.pr2.effActive = true;

            i = D(10);
            setFactor(0, [3, 1], "Base", `${format(10, 2)}`, `${format(i, 2)}^`, true);
            if (ifAchievement(0, 14)) {
                i = i.sub(1);
            }
            setFactor(1, [3, 1], "Achievement ID: (0, 14)", `-${format(1, 2)}`, `${format(i, 2)}^`, ifAchievement(0, 14), "ach");

            if (getKuaUpgrade("k", 3)) { 
                i = i.sub(1); 
            }
            setFactor(2, [3, 1], "Kuaraniai Upgrade 4", `-${format(1, 2)}`, `${format(i, 2)}^`, getKuaUpgrade("k", 3), "kua");

            if (getKuaUpgrade("k", 4)) { 
                i = i.sub(1);
            }
            setFactor(3, [3, 1], "Kuaraniai Upgrade 5", `-${format(1, 2)}`, `${format(i, 2)}^`, getKuaUpgrade("k", 4), "kua");

            tmp.value.main.pr2.cost = getPR2Cost(player.value.gameProgress.main.pr2.amount, false, true);

            tmp.value.main.pr2.target = getPR2Cost(player.value.gameProgress.main.prai.amount, true, false);

            if (player.value.gameProgress.main.pr2.auto) {
                player.value.gameProgress.main.pr2.amount = Decimal.max(player.value.gameProgress.main.pr2.amount, tmp.value.main.pr2.target.add(1).floor());
            }

            j = D(0.05);
            setFactor(0, [3, 3], "Base", `${format(0.05, 2)}`, `${format(j.add(1), 2)}^`, true);
            if (getKuaUpgrade("s", 5)) {
                j = j.mul(2);
            }
            setFactor(1, [3, 3], "KShard Upgrade 5", `×${format(2, 2)}`, `${format(j.add(1), 2)}^`, getKuaUpgrade("s", 5), "kua");

            i = D(player.value.gameProgress.main.pr2.amount);
            setFactor(0, [3, 2], "Base", `${format(player.value.gameProgress.main.pr2.amount)}`, `${format(i)} effective`, true);

            if (Decimal.gte(player.value.gameProgress.main.oneUpgrades[8], 1)) {
                i = i.add(MAIN_ONE_UPGS[8].effect);
            }
            setFactor(1, [3, 2], "One Upgrade #9", `+${format(MAIN_ONE_UPGS[8].effect, 2)}`, `${format(i)} effective`, Decimal.gte(player.value.gameProgress.main.oneUpgrades[8], 1));
            tmp.value.main.pr2.effective = i;

            i = tmp.value.main.pr2.effective.max(0).add(1).pow(tmp.value.main.pr2.effective.mul(j).add(1).ln().add(1));
            setFactor(2, [3, 2], "Resulting Effect", `(${format(tmp.value.main.pr2.effective)} + 1) ^ (1 + ln(1 + (${format(j, 2)})(${format(tmp.value.main.pr2.effective)})))`, `×${format(i)}`, true);

            if (getKuaUpgrade("p", 8)) {
                i = Decimal.pow(j.add(1), tmp.value.main.pr2.effective).mul(i);
            }
            setFactor(3, [3, 2], "KPower Upgrade 8", `×(1 + ${format(j, 2)}) ^ (${format(tmp.value.main.pr2.effective)})`, `×${format(i)}`, getKuaUpgrade("p", 8), "kua");

            tmp.value.main.pr2.effect = i;

            updateAllBest(player.value.gameProgress.main.pr2.best, player.value.gameProgress.main.pr2.amount);
            player.value.gameProgress.main.pr2.bestEver = Decimal.max(player.value.gameProgress.main.pr2.bestEver, player.value.gameProgress.main.pr2.amount);

            tmp.value.main.pr2.canDo = Decimal.gte(player.value.gameProgress.main.prai.amount, Decimal.sub(tmp.value.main.pr2.cost, 0.5));

            tmp.value.main.pr2.costTextColor = "#FFFFFF";
            if (player.value.settings.scaleSoftColors) {
                for (let i = getSCSLAttribute('pr2', true).length - 1; i >= 0; i--) {
                    if (Decimal.gte(player.value.gameProgress.main.pr2.amount, getSCSLAttribute('pr2', true)[i].start)) {
                        tmp.value.main.pr2.costTextColor = SCALE_ATTR[i].color;
                        break;
                    }
                }
            }

            tmp.value.main.pr2.textEffect = {when: D(0), txt: ''};
            if (Decimal.lte(player.value.gameProgress.main.pr2.amount, PR2_EFF[PR2_EFF.length - 1].when)) {
                // this feels cursed not putting a "let i"
                for (i = 0; i < PR2_EFF.length; i++) {
                    // console.log(`${format(player.value.gameProgress.main.pr2.amount)} < ${PR2_EFF[i].when} & ${PR2_EFF[i].show}`)
                    if (Decimal.lt(player.value.gameProgress.main.pr2.amount, PR2_EFF[i].when) && PR2_EFF[i].show) {
                        tmp.value.main.pr2.textEffect = {when: PR2_EFF[i].when, txt: PR2_EFF[i].text};
                        break;
                    }
                }
            }
            break;
        default:
            throw new RangeError(`updateStart threw! ${whatToUpdate} is not something that can be updated, or it doesn't exist!`)
    }
}

export const getPR2Cost = (x: DecimalSource, inverse: boolean, updateFact: boolean) => {
    let costExp = D(10);
    if (updateFact) {
        setFactor(0, [3, 1], "Base", `${format(10, 2)}`, `${format(costExp, 2)}^`, true);
    }

    if (ifAchievement(0, 14)) {
        costExp = costExp.sub(1);
    }
    if (updateFact) {
        setFactor(1, [3, 1], "Achievement ID: (0, 14)", `-${format(1, 2)}`, `${format(costExp, 2)}^`, ifAchievement(0, 14), "ach");
    }

    if (getKuaUpgrade("k", 3)) { 
        costExp = costExp.sub(1); 
    }
    if (updateFact) {
        setFactor(2, [3, 1], "Kuaraniai Upgrade 4", `-${format(1, 2)}`, `${format(costExp, 2)}^`, getKuaUpgrade("k", 3), "kua");
    }

    if (getKuaUpgrade("k", 4)) { 
        costExp = costExp.sub(1);
    }
    if (updateFact) {
        setFactor(3, [3, 1], "Kuaraniai Upgrade 5", `-${format(1, 2)}`, `${format(costExp, 2)}^`, getKuaUpgrade("k", 4), "kua");
    }

    let cost = D(x);
    if (inverse) {
        if (ifAchievement(0, 7)) {
            cost = cost.mul(1.5);
        }

        if (cost.lt(costExp)) {
            return D(0);
        }

        cost = smoothPoly(smoothExp(cost.log(costExp).sub(1), 1.03, true), 2, 200, true);

        cost = cost.mul(KUA_ENHANCERS.enhances[6].effect());

        cost = doAllScaling(cost, getSCSLAttribute('pr2', true), true);

        if (inChallenge("im")) {
            cost = cost.div(Decimal.pow(1.2, challengeDepth("im")))
        }
    } else {
        if (updateFact) {
            setFactor(0, [3, 0], "Base", `${format(cost)}`, `${format(cost)} effective`, true);
        }

        if (inChallenge("im")) {
            cost = cost.mul(Decimal.pow(1.2, challengeDepth("im")))
        }
        if (updateFact) {
            setFactor(1, [3, 0], `Inverted Mechanics ×${format(challengeDepth("im"))}`, `×${format(Decimal.pow(1.2, challengeDepth("im")), 3)}`, `${format(cost)} effective`, inChallenge("im"), "col");
        }

        cost = doAllScaling(cost, getSCSLAttribute('pr2', true), false);
        if (updateFact) {
            setFactor(2, [3, 0], "Scaling", `scaling(${format(cost)})`, `${format(cost)} effective`, true);
        }

        cost = cost.div(KUA_ENHANCERS.enhances[6].effect())

        const effective = cost;
        cost = smoothExp(smoothPoly(cost, 2, 200, false), 1.03, false).add(1).pow_base(costExp);
        if (updateFact) {
            setFactor(3, [3, 0], "Resulting Requirement", `${format(costExp, 2)} ^ (${format(effective)} × 1.03 ^ (${format(effective)}) ^ 2) (approx.)`, `${format(cost)}`, true);
        }

        if (ifAchievement(0, 7)) {
            cost = cost.div(1.5);
        }
        if (updateFact) {
            setFactor(4, [3, 0], "Achievement ID: (0, 7)", `/${format(1.5, 2)}`, `${format(cost)}`, ifAchievement(0, 7), "ach");
        }
    }

    return cost;
}