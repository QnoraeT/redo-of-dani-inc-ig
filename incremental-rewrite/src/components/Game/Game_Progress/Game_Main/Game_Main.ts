import Decimal, { type DecimalSource } from 'break_eternity.js'
import { format, formatPerc } from '@/format'
import { tmp, player, type TmpMainUpgrade, updateAllTotal, updateAllBest } from '@/main'
import { scale, D, smoothPoly, smoothExp, expQuadCostGrowth } from '@/calc'
import { getSCSLAttribute, setSCSLEffectDisp, SCALE_ATTR, SOFT_ATTR, doAllScaling, type ScSlItems } from '@/softcapScaling'
import { getAchievementEffect, ifAchievement } from '../../Game_Achievements/Game_Achievements'
import { getKuaUpgrade, KUA_ENHANCERS, KUA_UPGRADES } from '../Game_Kuaraniai/Game_Kuaraniai'
import { getColResEffect } from '../Game_Colosseum/Game_Colosseum'

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
        when: D(7),
        get text() { return `weaken the Upgrade 1 scaling by ${formatPerc(10 / 9, 3)}.`}
    },
    {
        show: true,
        when: D(9),
        get text() { return `increase UP1's base by +${format(0.05, 3)}.`}
    },
    {
        show: true,
        when: D(11),
        get text() { return `slow down Upgrade 3 cost by ${formatPerc(10 / 9, 3)}.`}
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
        show: true,
        when: D(15),
        get text() { return `decrease Upgrade 2's superscaling strength by ${formatPerc(8 / 7, 3)}`}
    },
    {
        get show() { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); },
        when: D(18),
        get text() { return `unlock the Upgrade 6 autobuyer.`}
    },
    {
        show: true,
        when: D(20),
        get text() { return `weaken Upgrade 1's cost scaling by ${format(10, 3)}%`}
    },
    {
        get show() { return Decimal.gte(player.value.gameProgress.kua.amount, 10); },
        when: D(25),
        get text() { return `makes upgrade 1 and 2's scaling and super scaling start ${format(15, 1)} later`}
    },
    {
        get show() { return getKuaUpgrade("s", 11) },
        when: D(31),
        get text() { return `boosts Kuaraniai effects based on how much PR2 you have`}
    },
]

export const buyGenUPG = (id: number): void => {
    if (Decimal.gte(player.value.gameProgress.main.points, tmp.value.main.upgrades[id].cost)) {
        player.value.gameProgress.main.points = Decimal.sub(player.value.gameProgress.main.points, tmp.value.main.upgrades[id].cost);
        player.value.gameProgress.main.upgrades[id].bought = Decimal.add(player.value.gameProgress.main.upgrades[id].bought, 1);
        for (let i = 0; i < player.value.gameProgress.main.upgrades[id].boughtInReset.length; i++) {
            player.value.gameProgress.main.upgrades[id].boughtInReset[i] = player.value.gameProgress.main.upgrades[id].bought;
        }
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
}

export const MAIN_UPGS: Array<MainUpgrade> = [
    { // UPG1
        shown: true,
        get freeExtra() {
            const i = D(0);
            return i;
        },
        effective(x) {
            let i = D(x);
            i = i.add(this.freeExtra)
            if (ifAchievement(1, 5)) {
                i = i.mul(getAchievementEffect(1, 5));
            }
            return i;
        },
        get effectBase() {
            let i = D(1.5);
            i = i.add(tmp.value.main.upgrades[2].effect ?? 0);
            i = i.add(tmp.value.main.upgrades[5].effect ?? 0);
            if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 9)) {
                i = i.add(0.05);
            }
            i = i.add(KUA_ENHANCERS.enhances[0].effect());
            if (ifAchievement(1, 10)) {
                i = i.mul(1.01);
            }
            return i;
        },
        effect(x = player.value.gameProgress.main.upgrades[0].bought) {
            if (!tmp.value.main.upgrades[0].active) {
                return D(1);
            }
            let eff = this.effective(x);

            eff = this.effectBase.pow(eff);
            if (getKuaUpgrade("p", 8)) {
                eff = eff.max(1).log10().pow(1.01).pow10();
            }
            const data = {
                prevEff: eff,
                scal: getSCSLAttribute('upg1', false)
            }

            eff = scale(eff, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('upg1', false, 0, `^${format(eff.log(data.prevEff), 3)}`);
            return eff;
        },
        get calcEB() {
            if (Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 1e10)) {
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
            const i = D(0);
            return i;
        },
        get effectBase() {
            let i = D(1.2);
            if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 4)) {
                i = i.add(0.1);
            }
            if (ifAchievement(0, 13)) {
                i = i.add(0.05);
            }
            if (getKuaUpgrade("s", 5)) {
                i = i.mul(1.125);
            }
            if (getKuaUpgrade("p", 1)) {
                i = i.add(KUA_UPGRADES.KPower[0].eff!);
            }
            i = i.add(KUA_ENHANCERS.enhances[1].effect());
            if (ifAchievement(1, 10)) {
                i = i.mul(1.01);
            }
            return i;
        },
        effective(x) {
            let i = D(x);
            i = i.add(this.freeExtra);
            return i;
        },
        effect(x = player.value.gameProgress.main.upgrades[1].bought) {
            if (!tmp.value.main.upgrades[1].active) {
                return D(1);
            }
            let eff = this.effective(x)

            eff = this.effectBase.pow(eff);
            const data = {
                prevEff: eff,
                scal: getSCSLAttribute('upg2', false)
            }

            eff = scale(eff, 0, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('upg2', false, 0, `/${format(data.prevEff.div(eff), 3)}`);

            if (getKuaUpgrade("p", 7)) {
                eff = eff.pow(3);
            }

            data.prevEff = eff

            eff = scale(eff, 2.1, false, data.scal[1].start, data.scal[1].power, data.scal[1].basePow);
            setSCSLEffectDisp('upg2', false, 1, `/${format(data.prevEff.div(eff), 3)}`);
            return eff;
        },
        get calcEB() {
            if (Decimal.gte(player.value.gameProgress.main.upgrades[1].bought, 1e10)) {
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
            const i = D(0);
            return i;
        },
        get effectBase() {
            let i = D(0.01);
            i = i.add(KUA_ENHANCERS.enhances[2].effect());
            if (ifAchievement(1, 10)) {
                i = i.mul(1.01);
            }
            return i;
        },
        effective(x) {
            let i = D(x);
            i = i.add(this.freeExtra);
            if (getKuaUpgrade("p", 2)) {
                i = i.mul(KUA_UPGRADES.KPower[1].eff!);
            }
            if (ifAchievement(1, 5)) {
                i = i.mul(1.01);
            }
            return i;
        },
        effect(x = player.value.gameProgress.main.upgrades[2].bought) {
            if (!tmp.value.main.upgrades[2].active) {
                return D(0);
            }
            let eff = this.effective(x);

            eff = this.effectBase.mul(eff);
            const data = {
                prevEff: eff,
                scal: getSCSLAttribute('upg3', false)
            }

            eff = scale(eff, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('upg3', false, 0, `/${format(data.prevEff.div(eff), 3)}`);
            return eff;
        },
        get calcEB() {
            if (Decimal.gte(player.value.gameProgress.main.upgrades[2].bought, 1e10)) {
                return this.effectBase;
            } else {
                return this.effect(Decimal.add(player.value.gameProgress.main.upgrades[2].bought, 1)).sub(this.effect());
            }
        },
        get shown() {
            return Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 5);
        },
        get autoUnlocked() {
            return getKuaUpgrade('s', 5);
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
            const i = D(0);
            return i;
        },
        get effectBase() {
            let i = tmp.value.kua.effects.up4;
            if (ifAchievement(1, 10)) {
                i = i.mul(1.01);
            }
            return i;
        },
        effective(x) {
            let i = D(x);
            i = i.add(this.freeExtra);
            return i;
        },
        effect(x = player.value.gameProgress.main.upgrades[3].bought) {
            if (!tmp.value.main.upgrades[3].active) {
                return D(1);
            }
            let eff = this.effective(x);

            eff = this.effectBase.pow(eff);

            const data = {
                prevEff: eff,
                scal: getSCSLAttribute('upg4', false)
            }

            eff = scale(eff, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('upg4', false, 0, `^${format(eff.log(data.prevEff), 3)}`);
            return eff;
        },
        get calcEB() {
            if (Decimal.gte(player.value.gameProgress.main.upgrades[3].bought, 1e10)) {
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
            const i = D(0);
            return i;
        },
        get effectBase() {
            let i = tmp.value.kua.effects.up5;
            if (ifAchievement(1, 10)) {
                i = i.mul(1.01);
            }
            return i;
        },
        effective(x) {
            let i = D(x);
            i = i.add(this.freeExtra);
            return i;
        },
        effect(x = player.value.gameProgress.main.upgrades[4].bought) {
            if (!tmp.value.main.upgrades[4].active) {
                return D(0);
            }
            let eff = this.effective(x);

            eff = this.effectBase.pow(eff);
            const data = {
                prevEff: eff,
                scal: getSCSLAttribute('upg5', false)
            }

            eff = scale(eff, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('upg5', false, 0, `^${format(eff.log(data.prevEff), 3)}`);
            return eff;
        },
        get calcEB() {
            if (Decimal.gte(player.value.gameProgress.main.upgrades[4].bought, 1e10)) {
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
            const i = D(0);
            return i;
        },
        get effectBase() {
            let i = tmp.value.kua.effects.up6;
            if (ifAchievement(1, 10)) {
                i = i.mul(1.01);
            }
            return i;
        },
        effective(x) {
            let i = D(x);
            i = i.add(this.freeExtra);
            return i
        },
        effect(x = player.value.gameProgress.main.upgrades[5].bought) {
            if (!tmp.value.main.upgrades[5].active) {
                return D(0);
            }
            let eff = this.effective(x);

            eff = this.effectBase.mul(eff);
            const data = {
                prevEff: eff,
                scal: getSCSLAttribute('upg6', false)
            }

            eff = scale(eff, 0, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('upg6', false, 0, `/${format(data.prevEff.div(eff), 2)}`);

            data.prevEff = eff
            eff = scale(eff, 0.2, false, data.scal[1].start, data.scal[1].power, data.scal[1].basePow);
            setSCSLEffectDisp('upg6', false, 1, `/${format(data.prevEff.div(eff), 2)}`);
            return eff;
        },
        get calcEB() {
            if (Decimal.gte(player.value.gameProgress.main.upgrades[5].bought, 1e10)) {
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
]

export const initAllMainUpgrades = (): Array<TmpMainUpgrade> => {
    const arr = [];
    for (let i = MAIN_UPGS.length - 1; i >= 0; i--) {
        arr.push(
            {
                effect: D(1),
                cost: D(Infinity),
                target: D(0),
                canBuy: false,
                effectTextColor: "#ffffff",
                costTextColor: "#ffffff",
                active: true,
                costBase: {exp: D(0), scale: [D(1), D(2), D(2)]},
                freeExtra: D(0),
                effectBase: D(1),
                calculatedEB: D(1)
            }
        );
    }
    return arr;
}

export const updateAllStart = (delta: DecimalSource) => {
    updateStart(1, delta);
    updateStart(0, delta);
    for (let i = player.value.gameProgress.main.upgrades.length - 1; i >= 0; i--) {
        updateStart(-(i + 1), delta);
    }
}

export const updateStart = (whatToUpdate: number, delta: DecimalSource) => {
    let i, j, generate, scal, upgID;
    switch (whatToUpdate) {
        case -6:
        case -5:
        case -4:
        case -3:
        case -2:
        case -1:
            upgID = -1 - whatToUpdate
            tmp.value.main.upgrades[upgID].costBase = [
                {exp: D(0), scale: [D(5),    D(1.55), D(1)     ]},
                {exp: D(0), scale: [D(1e3),  D(1.25), D(1)     ]},
                {exp: D(0), scale: [D(1e10), D(100),  D(1.05)  ]},
                {exp: D(0), scale: [D(1e13), D(1.02), D(1.0003)]},
                {exp: D(0), scale: [D(1e20), D(1.03), D(1.0002)]},
                {exp: D(0), scale: [D(1e33), D(2),    D(1.025) ]},
            ][upgID];

            if (upgID === 0) {
                if (getKuaUpgrade("s", 7)) {
                    tmp.value.main.upgrades[upgID].costBase.scale[1] = tmp.value.main.upgrades[upgID].costBase.scale[1].sub(0.05);
                }
            }

            scal = D(player.value.gameProgress.main.upgrades[upgID].bought);
            scal = doAllScaling(scal, getSCSLAttribute(`upg${upgID + 1}` as ScSlItems, true), false);
            if (ifAchievement(1, 6)) {
                scal = scal.div(getAchievementEffect(1, 6));
            }
            if (upgID === 0) {
                if (getKuaUpgrade("p", 10)) {
                    scal = scal.div(KUA_UPGRADES.KPower[9].eff!)
                }
            }
            if (upgID === 1) {
                if (getKuaUpgrade("s", 9)) {
                    scal = scal.sub(KUA_UPGRADES.KShards[8].eff!);
                }
                if (getKuaUpgrade("p", 10)) {
                    scal = scal.div(KUA_UPGRADES.KPower[9].eff!)
                }
            }
            if (upgID === 2) {
                if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 11)) {
                    scal = scal.div(10 / 9);
                }
            }
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

            if (upgID === 0) {
                tmp.value.main.upgrades[upgID].cost = tmp.value.main.upgrades[upgID].cost.div(tmp.value.main.upgrades[1].effect ?? 1);
                tmp.value.main.upgrades[upgID].cost = tmp.value.main.upgrades[upgID].cost.div(tmp.value.main.upgrades[4].effect ?? 1);
            }

            tmp.value.main.upgrades[upgID].target = D(0);
            if (Decimal.gte(player.value.gameProgress.main.points, tmp.value.main.upgrades[upgID].costBase.scale[0])) {
                i = D(player.value.gameProgress.main.points);
                if (upgID === 0) {
                    i = i.mul(tmp.value.main.upgrades[4].effect ?? 1);
                    i = i.mul(tmp.value.main.upgrades[1].effect ?? 1);
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
                }
                if (ifAchievement(1, 6)) {
                    scal = scal.mul(getAchievementEffect(1, 6));
                }
                scal = doAllScaling(scal, getSCSLAttribute(`upg${upgID + 1}`  as ScSlItems, true), true);
                tmp.value.main.upgrades[upgID].target = scal;
            }

            tmp.value.main.upgrades[upgID].effect = MAIN_UPGS[upgID].effect();
            tmp.value.main.upgrades[upgID].freeExtra = MAIN_UPGS[upgID].freeExtra;
            tmp.value.main.upgrades[upgID].effectBase = MAIN_UPGS[upgID].effectBase;
            tmp.value.main.upgrades[upgID].calculatedEB = MAIN_UPGS[upgID].calcEB;

            tmp.value.main.upgrades[upgID].effectTextColor = `#FFFFFF`;
            if (player.value.settings.scaleSoftColors) {
                for (let i = getSCSLAttribute(`upg${upgID + 1}` as ScSlItems, false).length - 1; i >= 0; i--) {
                    if (Decimal.gte(tmp.value.main.upgrades[upgID].effect, getSCSLAttribute(`upg${upgID + 1}` as ScSlItems, false)[i].start)) {
                        tmp.value.main.upgrades[upgID].effectTextColor = SOFT_ATTR[i].color;
                        break;
                    }
                }
            }

            tmp.value.main.upgrades[upgID].costTextColor = `#FFFFFF`;
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
            if (ifAchievement(1, 8)) {
                tmp.value.main.prai.gainExp = D(0.35);
            }

            if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 1) && Decimal.gte(player.value.gameProgress.main.totals[0]!, tmp.value.main.prai.req)) {
                i = D(player.value.gameProgress.main.totals[0]!);
                i = i.max(0).div(tmp.value.main.prai.req).pow(tmp.value.main.prai.gainExp).sub(1).mul(tmp.value.main.prai.gainExp).add(1).log10().pow(0.9).pow10();
                i = i.mul(tmp.value.main.pr2.effActive ? tmp.value.main.pr2.effect : 1);
                if (ifAchievement(2, 1)) {
                    i = i.mul(5);
                }
                if (ifAchievement(1, 11)) {
                    i = i.mul(getAchievementEffect(1, 11));
                }
                if (getKuaUpgrade("s", 8)) {
                    i = i.mul(KUA_UPGRADES.KShards[7].eff!);
                }
                i = i.mul(getColResEffect(1));
                i = i.mul(tmp.value.kua.effects.kshardPassive)
                tmp.value.main.prai.pending = i.floor();

                i = tmp.value.main.prai.pending.add(1).floor();
                i = i.div(tmp.value.main.pr2.effect);
                i = i.log10().root(0.9).pow10().sub(1).div(tmp.value.main.prai.gainExp).add(1).root(tmp.value.main.prai.gainExp).mul(tmp.value.main.prai.req);
                tmp.value.main.prai.next = i.sub(player.value.gameProgress.main.totals[0]!);
            } else {
                tmp.value.main.prai.pending = Decimal.max(player.value.gameProgress.main.totals[0]!, 1e6).div(1e6).log(1e2).add(1).min(10).floor(); // hidden thing, usually 1 but when ppl decide to go further, they should get rewarded somehow
                tmp.value.main.prai.next = tmp.value.main.prai.req.sub(player.value.gameProgress.main.totals[0]!).div(tmp.value.main.pps);
            }

            if (player.value.gameProgress.main.prai.auto) { 
                generate = tmp.value.main.prai.pending.mul(delta).mul(0.0001);
                player.value.gameProgress.main.prai.amount = Decimal.add(player.value.gameProgress.main.prai.amount, generate);
                updateAllTotal(player.value.gameProgress.main.prai.totals, generate);
                player.value.gameProgress.main.prai.totalEver = Decimal.add(player.value.gameProgress.main.prai.totalEver, generate);
            }

            j = D(4);
            if (ifAchievement(0, 6)) {
                j = j.mul(1.25);
            }

            i = D(player.value.gameProgress.main.prai.amount);
            i = i.mul(j).add(1).log10().pow(0.975).pow10();
            if (ifAchievement(0, 10)) {
                i = i.mul(2);
            }
            if (getKuaUpgrade("p", 2)) {
                i = i.mul(KUA_UPGRADES.KShards[1].eff!);
            } 
            if (getKuaUpgrade("p", 5)) {
                i = i.pow(KUA_UPGRADES.KPower[4].eff!);
            }
            tmp.value.main.prai.effect = i;

            i = Decimal.add(player.value.gameProgress.main.prai.amount, tmp.value.main.prai.pending);
            i = i.mul(j).add(1).log10().pow(0.975).pow10();
            if (ifAchievement(0, 10)) {
                i = i.mul(2);
            }
            if (getKuaUpgrade("p", 2)) {
                i = i.mul(KUA_UPGRADES.KShards[1].eff!);
            } 
            if (getKuaUpgrade("p", 5)) {
                i = i.pow(KUA_UPGRADES.KPower[4].eff!);
            }
            tmp.value.main.prai.nextEffect = i;

            updateAllBest(player.value.gameProgress.main.prai.best, player.value.gameProgress.main.prai.amount);
            player.value.gameProgress.main.prai.bestEver = Decimal.max(player.value.gameProgress.main.prai.bestEver, player.value.gameProgress.main.prai.amount);
            tmp.value.main.prai.canDo = Decimal.gte(player.value.gameProgress.main.totals[0]!, tmp.value.main.prai.req);
            break;
        case 1: // pr2
            tmp.value.main.pr2.effActive = true;

            i = D(10);
            if (ifAchievement(0, 15)) {
                i = i.sub(1);
            }

            scal = D(player.value.gameProgress.main.pr2.amount);
            scal = doAllScaling(scal, getSCSLAttribute('pr2', true), false);

            scal = scal.div(KUA_ENHANCERS.enhances[6].effect())

            tmp.value.main.pr2.cost = smoothExp(smoothPoly(scal, 2, 200, false), 1.03, false).add(1).pow_base(i);
            if (ifAchievement(0, 8)) {
                tmp.value.main.pr2.cost = tmp.value.main.pr2.cost.div(1.5);
            }

            if (Decimal.gte(player.value.gameProgress.main.prai.amount, 10)) {
                scal = D(player.value.gameProgress.main.prai.amount)
                if (ifAchievement(0, 8)) {
                    scal = scal.mul(1.5);
                }
                scal = smoothPoly(smoothExp(scal.log(i).sub(1), 1.03, true), 2, 200, true);

                scal = scal.mul(KUA_ENHANCERS.enhances[6].effect())

                scal = doAllScaling(scal, getSCSLAttribute('pr2', true), true);

                tmp.value.main.pr2.target = scal;
            } else {
                tmp.value.main.pr2.target = D(0);
            }

            if (player.value.gameProgress.main.pr2.auto) {
                player.value.gameProgress.main.pr2.amount = Decimal.max(player.value.gameProgress.main.pr2.amount, tmp.value.main.pr2.target.add(1).floor());
            }

            i = D(player.value.gameProgress.main.pr2.amount);
            tmp.value.main.pr2.effective = i;

            j = D(0.05);
            if (getKuaUpgrade("s", 5)) {
                j = j.mul(2);
            }

            i = tmp.value.main.pr2.effective.max(0).add(1).pow(tmp.value.main.pr2.effective.mul(j).add(1).ln().add(1));
            if (getKuaUpgrade("p", 8)) {
                i = Decimal.pow(j.add(1).pow(5), tmp.value.main.pr2.effective).max(i)
            }
            tmp.value.main.pr2.effect = i;

            updateAllBest(player.value.gameProgress.main.pr2.best, player.value.gameProgress.main.pr2.amount);
            player.value.gameProgress.main.pr2.bestEver = Decimal.max(player.value.gameProgress.main.pr2.bestEver, player.value.gameProgress.main.pr2.amount);

            tmp.value.main.pr2.canDo = Decimal.gte(player.value.gameProgress.main.prai.amount, Decimal.sub(tmp.value.main.pr2.cost, 0.5));

            tmp.value.main.pr2.costTextColor = `#FFFFFF`
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