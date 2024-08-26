import Decimal from 'break_eternity.js'
import { format, formatPerc, formatTime } from '@/format'
import { player, tmp } from '@/main'
import { D } from '@/calc'
import { getKuaUpgrade } from '../Game_Progress/Game_Kuaraniai/Game_Kuaraniai'

export type Ach_Types = "main" | "kua" | "col" | "tax" | "kb"
export const Ach_Types_List: Array<Ach_Types> = ["main", "kua", "col", "tax", "kb"]

export const ACH_DEF_COLORS = {
    main: {
        unable: "#ff3333",
        canComplete: "#aaaaaa",
        complete: "#19ff33"
    },
    kua: {
        unable: "#1f0099",
        canComplete: "#400077",
        complete: "#a019ff"
    },
    col: {
        unable: "#8a0037",
        canComplete: "#992000",
        complete: "#ff2300"
    },
    tax: {
        unable: "#807000",
        canComplete: "#a06500",
        complete: "#d5c000"
    },
    kb: {
        unable: "#2e3b32",
        canComplete: "#366d46",
        complete: "#7fffa3"
    }
}

type Ach_Data = Array<{
    id: number
    type: Ach_Types
    show: boolean
    list: Array<{
        id: number
        name: string
        desc: string
        cond: boolean
        autoComplete?: boolean
        reward: string
        eff?: Decimal
        show: boolean
        status: boolean | string
    }>
    rewAll: string
    eff: Decimal
}>

export const ACHIEVEMENT_DATA: Ach_Data = [
    {
        id: 0,
        type: "main",
        show: true,
        list: [
            {
                id: 0,
                get name() { return `Starting off?`; },
                get desc() { return `Get ${format(1)} UP1.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 1) },
                reward: ``,
                show: true,
                status: true
            },
            {
                id: 1,
                get name() { return `Let me show you how cruel I was with this...`; },
                get desc() { return `Get ${format(20)} UP1.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 20) },
                reward: ``,
                show: true,
                status: true
            },
            {
                id: 2,
                get name() { return `Not my progress!`; },
                get desc() { return `Do your first PRai reset.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.prai.best.ever, 1) },
                reward: ``,
                show: true,
                status: true
            },
            {
                id: 3,
                get name() { return `Are you rich now?`; },
                get desc() { return `Have at least ${format(5)} PRai.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.prai.best.ever, 5) },
                get reward() { return `UP1's scaling starts ${format(1, 1)} later.`; },
                show: true,
                status: true
            },
            {
                id: 4,
                get name() { return `this is stupid cuz its redundant lol`; },
                get desc() { return `Do a PR2 reset once.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.pr2.best.ever, 1) },
                get reward() { return `Increase your number generation by ${format(20)}%.`; },
                get show() { return Decimal.gte(player.value.gameProgress.main.prai.best.ever, 9.5); },
                status: true
            },
            {
                id: 5,
                get name() { return `No! Not again! This is not Distance Incremental!`; },
                get desc() { return `Get your first softcap.`; },
                get cond() { return Decimal.gte(tmp.value.main.upgrades[1].effect, 10) },
                reward: ``,
                show: true,
                status: true
            },
            {
                id: 6,
                get name() { return `All that time wasted...`; },
                get desc() { return `Have ${format(1e18)} points without doing a PRai reset.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.best.prai, 1e18); },
                get reward() { return `Your PRai's multiplier goes from ${format(4)}x -> ${format(5)}x.`; },
                show: true,
                status: true
            },
            {
                id: 7,
                get name() { return `This cannot be endgame.`; },
                get desc() { return `Do a PR2 reset twice.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.pr2.best.ever, 2) },
                get reward() { return `UP1's scaling is weakened based off of PRai. Currently: ${formatPerc(this.eff!, 3)} weaker.`; },
                get eff() { return Decimal.max(player.value.gameProgress.main.prai.amount, 10).log10().root(3).sub(1).div(4).add(1) },
                show: true,
                status: true
            },
            {
                id: 8,
                get name() { return `Instant gratification.`; },
                get desc() { return `Receive ${format(1e3)} PRai in a single PRai reset.`; },
                get cond() { return Decimal.gte(tmp.value.main.prai.pending, 1e3); },
                autoComplete: false,
                get reward() { return `PR2 requirement is reduced by ${formatPerc(1.5)}.`; },
                show: true,
                get status() { return tmp.value.main.prai.pending.gte(1e3) ? true : `${format(tmp.value.main.prai.pending)} / ${format(1e3)} PRai pending` }
            },
            {
                id: 9,
                get name() { return `This really is a clone of Distance Incremental!`; },
                get desc() { return `Have at least ${format(100)} UP1.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 100) },
                get reward() { return `PRai effect is increased by ${format(100)}%.`; },
                show: true,
                status: true
            },
            {
                id: 10,
                get name() { return `What once was part of a bygone era...`; },
                get desc() { return `Do a PR2 reset ${format(4)} times in total.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.pr2.best.ever, 4); },
                reward: ``,
                get show() { return Decimal.gte(player.value.gameProgress.main.prai.best.ever, 9.5); },
                status: true
            },
            {
                id: 11,
                get name() { return `Going even further beyond!`; },
                get desc() { return `Do a PR2 reset ${format(11)} times.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.pr2.best.ever, 11); },
                reward: ``,
                get show() { return Decimal.gte(player.value.gameProgress.main.prai.best.ever, 9.5); },
                status: true
            },
            {
                id: 12,
                get name() { return `A prelude 1`; },
                get desc() { return `Have ${format(1e18)} points without buying Upgrade 3.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.best.prai, 1e18) && Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0); },
                reward: ``,
                get show() { return Decimal.gte(player.value.gameProgress.main.prai.best.ever, 9.5); },
                get status() { return Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0) ? true : `Failed due to having Upgrade 3`; }
            },
            {
                id: 13,
                get name() { return `A prelude 2`; },
                get desc() { return `Have ${format(1e25)} points without buying Upgrade 2 and 3.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.best.prai, 1e25) && Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0) && Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0); },
                get reward() { return `Increase UP2's base by +${format(0.05, 3)}.`; },
                get show() { return ifAchievement(0, 12); },
                get status() { 
                    if (Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0) && Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0)) {
                        return true;
                    }
                    const fail = [!Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0), !Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0)]
                    let txt = `Failed due to having Upgrade `
                    if (fail[0] && fail[1]) {
                        txt += `2 and 3.`
                    } else {
                        if (fail[0]) { txt += `2.` }
                        if (fail[1]) { txt += `3.` }
                    }
                    return txt
                }
            },
            {
                id: 14,
                get name() { return `A prelude 3`; },
                get desc() { return `Have ${format(1e20)} points without buying Upgrades 1, 2, and 3.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.best.prai, 1e20) && Decimal.lte(player.value.gameProgress.main.upgrades[0].bought, 0) && Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0) && Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0); },
                reward: ``,
                get show() { return ifAchievement(0, 13); },
                get status() { 
                    if (Decimal.lte(player.value.gameProgress.main.upgrades[0].bought, 0) && Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0) && Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0)) {
                        return true;
                    }
                    const fail: Array<number> = [];
                    for (let i = 0; i < 3; i++) {
                        if (!Decimal.lte(player.value.gameProgress.main.upgrades[i].bought, 0)) {
                            fail.push(i);
                        }
                    }
                    let txt = `Failed due to having Upgrade `;
                    for (let i = 0; i < fail.length - 1; i++) {
                        txt += `${fail[i] + 1}, `;
                    }
                    if (fail.length > 1) {
                        txt += ` and ${fail[fail.length - 1] + 1}.`;
                    } else {
                        txt += `${fail[0] + 1}.`;
                    }
                    return txt;
                }
            },
            {
                id: 15,
                get name() { return `Enhancing 1`; },
                get desc() { return `Make Upgrade 1's base reach x${format(1.6, 3)}`; },
                get cond() { return Decimal.gte(tmp.value.main.upgrades[0].effectBase, 1.6); },
                get reward() { return `PR2's cost base is decreased from ${format(10)} to ${format(9)}.`; },
                get show() { return Decimal.gte(player.value.gameProgress.main.pr2.best.ever, 5); },
                status: true
            },
            {
                id: 16,
                get name() { return `Enhancing 2`; },
                get desc() { return `Make Upgrade 1's base reach x${format(2, 3)}`; },
                get cond() { return Decimal.gte(tmp.value.main.upgrades[0].effectBase, 2); },
                reward: ``,
                get show() { return ifAchievement(0, 15); },
                status: true
            },
            {
                id: 17,
                get name() { return `Enhancing 3`; },
                get desc() { return `Make Upgrade 1's base reach x${format(3, 3)}`; },
                get cond() { return Decimal.gte(tmp.value.main.upgrades[0].effectBase, 3); },
                reward: ``,
                get show() { return ifAchievement(0, 16); },
                status: true
            },
        ],
        get rewAll() { return `Point gain is increased by ${format(this.eff.sub(1).mul(100), 2)}%. (x1.1 per main achievement)`; },
        get eff() {
            let eff = D(1.1);
            eff = Decimal.pow(eff, player.value.gameProgress.achievements[0].length);
            return eff;
        }
    },
    {
        id: 1,
        type: "kua",
        get show() { return Decimal.gte(player.value.gameProgress.main.pr2.best.ever, 10); },
        list: [
            {
                id: 0,
                get name() { return `What even is this thing? Why do I have so little of it?`; },
                get desc() { return `Convert all of your PRai to Kuaraniai.`; },
                get cond() { return Decimal.gt(player.value.gameProgress.kua.amount, 0); },
                get reward() { return `Your number generation is increased by ${format(1e2)}%.`; },
                get show() { return player.value.gameProgress.unlocks.kua; },
                status: true
            },
            {
                id: 1,
                get name() { return `Stockpiler`; },
                get desc() { return `Save up ${format(1e12)} PRai on a Kuaraniai run.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.prai.amount, 1e12); },
                get reward() { return `UP2 also boosts number gain at a reduced rate. Currently: ${format(this.eff!, 2)}x`; },
                get eff() { 
                    let pow = D(0.2);
                    if (ifAchievement(1, 12)) {
                        pow = pow.add(0.05);
                    }
                    if (ifAchievement(1, 15)) {
                        pow = pow.add(0.05);
                    }
        
                    let eff = Decimal.max(tmp.value.main.upgrades[1].effect, 1);
                    if (getKuaUpgrade("p", 7)) {
                        eff = eff.root(3);
                    }
                    eff = eff.pow(pow);
                    return eff;
                },
                get show() { return player.value.gameProgress.unlocks.kua; },
                status: true
            },
            { 
                id: 2,
                get name() { return `Gathering Pieces Together`; },
                get desc() { return `Have ${format(0.01, 3)} Kuaraniai.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.kua.amount, 0.01); },
                get reward() { return `KShard and KPower now passively boost points and PRai.`; },
                get show() { return player.value.gameProgress.unlocks.kua; },
                status: true
            },
            {
                id: 3,
                get name() { return `You like making progress, don't you?`; },
                get desc() { return `Have ${format(0.1, 2)} Kuaraniai.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.kua.amount, 0.1); },
                get reward() { return `Kuaraniai gain is increased by ${format(50)}%, and KShards produce another point multiplier. Currently: ${format(this.eff!, 2)}x`; },
                get eff() { return Decimal.max(player.value.gameProgress.kua.kshards.totals.col, 0).add(1).mul(8).sqrt().sub(1).div(2); },
                get show() { return player.value.gameProgress.unlocks.kua; },
                status: true
            },
            { 
                id: 4,
                get name() { return `This upgrade was unnecessary`; },
                get desc() { return `Have ${format(1e80)} points without Upgrade 3.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.points, 1e80) && Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0); },
                get reward() { return `Upgrade 3 gets a small ${format(1, 2)}% boost to effectiveness.`; },
                get show() { return player.value.gameProgress.unlocks.kua; },
                status: true
            },
            { 
                id: 5,
                get name() { return `Quite interesting`; },
                get desc() { return `Get ${format(1e2)} Upgrade 1 without having over ${format(10)} PRai.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 100) && Decimal.lte(player.value.gameProgress.main.prai.amount, 10); },
                get reward() { return `Upgrade 1's effectiveness is slightly increased based off of your PRai. Currently: ${format(this.eff!.sub(1).mul(1e2), 3)}%`; },
                get eff() { 
                    let eff = D(player.value.gameProgress.main.prai.amount)
                    eff = eff.max(10).log10().cbrt().sub(1).div(200).add(1)
                    return eff;
                },
                get show() { return player.value.gameProgress.unlocks.kua; },
                get status() { return Decimal.lte(player.value.gameProgress.main.prai.amount, 10) ? true : `Failed due to having more than ${format(10)} PRai.`; },
            },
            { 
                id: 6,
                get name() { return `Actually, these are useless!`; },
                get desc() { return `Reach ${format(1e20)} PRai without Upgrades 1, 2, and 3.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.prai.best.kua, 1e20) && Decimal.lte(player.value.gameProgress.main.upgrades[0].bought, 0) && Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0) && Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0); },
                get reward() { return `All upgrades' cost scaling is slightly slowed down based off of your time in this PRai reset. Currently: ${formatPerc(this.eff!, 3)} slower`; },
                get eff() { 
                    let eff = Decimal.div(player.value.gameProgress.main.prai.timeInPRai, 60);
                    eff = eff.div(eff.mul(9).add(1)).add(1)
                    return eff;
                },
                get show() { return player.value.gameProgress.unlocks.kua; },
                get status() { 
                    if (Decimal.lte(player.value.gameProgress.main.upgrades[0].bought, 0) && Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0) && Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0)) {
                        return true;
                    }
                    const fail: Array<number> = [];
                    for (let i = 0; i < 3; i++) {
                        if (!Decimal.lte(player.value.gameProgress.main.upgrades[i].bought, 0)) {
                            fail.push(i);
                        }
                    }
                    let txt = `Failed due to having Upgrade `;
                    for (let i = 0; i < fail.length - 1; i++) {
                        txt += `${fail[i] + 1}, `;
                    }
                    if (fail.length > 1) {
                        txt += ` and ${fail[fail.length - 1] + 1}.`;
                    } else {
                        txt += `${fail[0] + 1}.`;
                    }
                    return txt;
                }
            },
            { 
                id: 7,
                get name() { return `This softcap won't hurt me!`; },
                get desc() { return `Upgrade 2's effect must reach /${format(1e17)}.`; }, 
                get cond() { return Decimal.gte(tmp.value.main.upgrades[1].effect, 1e17); },
                get reward() { return `Upgrade 2's softcap is ${format(5)}% weaker.`; },
                get show() { return player.value.gameProgress.unlocks.kua; },
                status: true
            },
            {
                id: 8,
                get name() { return `Make this obsolete, I dare you. >:3`; },
                get desc() { return `Gain ${format(2.5, 2)} Kuaraniai without doing a single PRai reset.`; },
                get cond() { return Decimal.gte(tmp.value.kua.kuaPending, 2.5) && Decimal.lte(player.value.gameProgress.main.prai.times, 0); },
                autoComplete: false,
                get reward() { return `Increase PRai's gain exponent from ^${format(1 / 3, 3)} to ^${format(0.35, 3)}`; },
                get show() { return player.value.gameProgress.unlocks.kua; },
                get status() { return Decimal.lte(player.value.gameProgress.main.prai.times, 0) ? true : `Failed due to having reset PRai ${format(player.value.gameProgress.main.prai.times)} times.`; }
            },
            { 
                id: 9,
                get name() { return `oh we might make this obsolete`; },
                get desc() { return `Have ${format(300)} Upgrade 1 without having more than ${format(10)} PRai.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 300) && Decimal.lte(player.value.gameProgress.main.prai.amount, 10); },
                reward: ``,
                get show() { return player.value.gameProgress.unlocks.kua; },
                get status() { return Decimal.lte(player.value.gameProgress.main.prai.amount, 10) ? true : `Failed due to having more than ${format(10)} PRai.`; },
            },
            {
                id: 10,
                get name() { return `"End-game" pass filter`; },
                get desc() { return `Reach ${format(1e80)} points without buying Upgrades 1, 2, and 3.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.best.prai, 1e80) && Decimal.lte(player.value.gameProgress.main.upgrades[0].bought, 0) && Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0) && Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0); },
                get reward() { return `Every upgrades' base is increased by ${format(1, 2)}%.`; },
                get show() { return player.value.gameProgress.unlocks.kua; },
                get status() { 
                    if (Decimal.lte(player.value.gameProgress.main.upgrades[0].bought, 0) && Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0) && Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0)) {
                        return true;
                    }
                    const fail: Array<number> = [];
                    for (let i = 0; i < 3; i++) {
                        if (!Decimal.lte(player.value.gameProgress.main.upgrades[i].bought, 0)) {
                            fail.push(i);
                        }
                    }
                    let txt = `Failed due to having Upgrade `;
                    for (let i = 0; i < fail.length - 1; i++) {
                        txt += `${fail[i] + 1}, `;
                    }
                    if (fail.length > 1) {
                        txt += ` and ${fail[fail.length - 1] + 1}.`;
                    } else {
                        txt += `${fail[0] + 1}.`;
                    }
                    return txt;
                }
            },
            { 
                id: 11,
                get name() { return `I don't think this does much`; },
                get desc() { return `Reach ${format(300)} Upgrade 1 without Upgrade 2.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 300) && Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0); },
                get reward() { return `Upgrade 2 also boosts PRai gain at a drastically reduced rate. Currently: ${format(this.eff!, 2)}x`; },
                get eff() {
                    let eff = Decimal.max(tmp.value.main.upgrades[1].effect, 1e10);
                    if (getKuaUpgrade("p", 7)) {
                        eff = eff.root(3).max(1e10);
                    }
                    eff = eff.div(1e10).pow(0.015);
                    return eff;
                },
                get show() { return player.value.gameProgress.unlocks.kua; },
                get status() { return Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0) ? true : `Failed due to having Upgrade 2.`; },
            },
            { 
                id: 12,
                get name() { return `What if the upgrades didn't chain boost each other and instead also directly boosted the thing`; },
                get desc() { return `Get ${format(1e35)} points without Upgrades 1 and 2.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.best.prai, 1e35) && Decimal.lte(player.value.gameProgress.main.upgrades[0].bought, 0) && Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0); },
                get reward() { return `Achievement "Stockpiler" is boosted.`; },
                get show() { return player.value.gameProgress.unlocks.kua; },
                get status() { 
                    if (Decimal.lte(player.value.gameProgress.main.upgrades[0].bought, 0) && Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0)) {
                        return true;
                    }
                    const fail = [!Decimal.lte(player.value.gameProgress.main.upgrades[0].bought, 0), !Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0)]
                    let txt = `Failed due to having Upgrade `
                    if (fail[0] && fail[1]) {
                        txt += `1 and 2.`
                    } else {
                        if (fail[0]) { txt += `1.` }
                        if (fail[1]) { txt += `2.` }
                    }
                    return txt
                }
            },
            { 
                id: 13,
                get name() { return `speedrun? :o`; },
                get desc() { return `Reach ${format(1e260)} points in the first ${format(5, 2)} seconds in a Kuaraniai run.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.points, 1e260) && Decimal.lte(player.value.gameProgress.kua.timeInKua, 5); },
                get reward() { return `Point gain is boosted but it decays over the next ${format(60, 2)} seconds. Currently: ${format(this.eff!, 2)}x`; },
                get eff() {
                    let eff = Decimal.max(player.value.gameProgress.main.prai.timeInPRai, 5).min(60);
                    eff = Decimal.pow(1e2, Decimal.sub(55, eff.sub(5)).div(0.55).div(1e2).pow(2));
                    return eff;
                },
                get show() { return player.value.gameProgress.unlocks.kua; },
                get status() { return Decimal.lte(player.value.gameProgress.kua.timeInKua, 5) ? true : `Failed due to taking ${formatTime(player.value.gameProgress.kua.timeInKua)} / ${formatTime(5)} in the current Kuaraniai run.`; }
            },
            { 
                id: 14,
                get name() { return `imagine PR3 as "tiers" if PR2 is "ranks"`; },
                get desc() { return `Reach ${format(25)} PR2.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.pr2.best.ever, 25); },
                reward: ``,
                get show() { return player.value.gameProgress.unlocks.kua; },
                status: true
            },
            { 
                id: 15,
                get name() { return `Stockpiler 2`; },
                get desc() { return `Save up ${format(1e85)} PRai on a Kuaraniai run.`; },
                get cond() { return Decimal.gte(player.value.gameProgress.main.prai.best.ever, 1e85); },
                get reward() { return `Achievement "Stockpiler" is boosted again.`; },
                get show() { return player.value.gameProgress.unlocks.kua; },
                status: true
            },
        ],
        get rewAll() { return `Kuaraniai's effects are ${format(this.eff.sub(1).mul(100), 2)}% stronger. (+1% per Kuaraniai achievement)`; },
        get eff() {
            let eff = D(0.01);
            eff = Decimal.mul(eff, player.value.gameProgress.achievements[1].length);
            eff = eff.add(1);
            return eff;
        }
    },
]

// export const ACHIEVEMENT_DATA: Ach_Data = {
//     rows: 4,
//     cols: 8,
//     // get status() = if its "canComplete" (true) or "unable" (anything else, this uses the description of why it can't be 1), if the achievement is already in player then it will be always marked as "complete"
//     list: [
//         {
//             internal: 0,
//             get name() { return `Starting off?`; },
//             get desc() { return `Get ${format(1)} UP1.`; },
//             type: `main`,
//             reward: ``,
//             show: true,
//             status: true
//         },
//         {
//             internal: 1,
//             get name() { return `Let me show you how cruel I was with this...`; },
//             get desc() { return `Get ${format(20)} UP1.`; },
//             type: `main`,
//             reward: ``,
//             show: true,
//             status: true
//         },
//         {
//             internal: 2,
//             get name() { return `Not my progress!`; },
//             get desc() { return `Do your first PRai reset.`; },
//             type: `main`,
//             reward: ``,
//             show: true,
//             status: true
//         },
//         {
//             internal: 3,
//             get name() { return `Are you rich now?`; },
//             get desc() { return `Have at least ${format(10)} PRai.`; },
//             type: `main`,
//             get reward() { return `UP1's scaling starts ${format(2.5, 1)} later.`; },
//             show: true,
//             status: true
//         },
//         {
//             internal: 5,
//             get name() { return `No! Not again! This is not Distance Incremental!`; },
//             get desc() { return `Get your first softcap.`; },
//             type: `main`,
//             reward: ``,
//             show: true,
//             status: true
//         },
//         {
//             internal: 6,
//             get name() { return `All that time wasted...`; },
//             get desc() { return `Have ${format(1e18)} points without doing a PRai reset.`; },
//             type: `main`,
//             get reward() { return `Your PRai's multiplier goes from ${format(4)}x -> ${format(10)}x.`; },
//             show: true,
//             status: true
//         },
//         {
//             internal: 7,
//             get name() { return `This cannot be endgame.`; },
//             get desc() { return `Do a PR2 reset twice.`; },
//             type: `main`,
//             get reward() { return `UP1's scaling is weakened based off of PRai. Currently: ${formatPerc(this.eff!, 3)} weaker.`; },
//             get eff() { return Decimal.max(player.value.gameProgress.main.prai.amount, 10).log10().root(3).sub(1).div(4).add(1) },
//             show: true,
//             status: true
//         },
//         {
//             internal: 8,
//             get name() { return `Instant gratification.`; },
//             get desc() { return `Receive ${format(1e3)} PRai in a single PRai reset.`; },
//             type: `main`,
//             get reward() { return `PR2 requirement is reduced by ${formatPerc(1_5)}.`; },
//             show: true,
//             get status() { return tmp.value.main.prai.pending.gte(1e3) ? true : `${format(tmp.value.main.prai.pending)} / ${format(1e3)} PRai pending` }
//         },
//         {
//             internal: 10,
//             get name() { return `This really is a clone of Distance Incremental!`; },
//             get desc() { return `Have at least ${format(1e2)} UP1.`; },
//             type: `main`,
//             get reward() { return `PRai effect is increased by ${format(1e2)}%.`; },
//             show: true,
//             status: true
//         },
//         {
//             internal: 4,
//             get name() { return `this is stupid cuz its redundant lol`; },
//             get desc() { return `Do a PR2 reset once.`; },
//             type: `main`,
//             get reward() { return `Increase your number generation by ${format(1e2)}%.`; },
//             get show() { return Decimal.gte(player.value.gameProgress.main.prai.best.ever, 9.5); },
//             status: true
//         },
//         {
//             internal: 9,
//             get name() { return `What once was part of a bygone era...`; },
//             get desc() { return `Do a PR2 reset ${format(4)} times in total.`; },
//             type: `main`,
//             reward: ``,
//             get show() { return Decimal.gte(player.value.gameProgress.main.prai.best.ever, 9.5); },
//             status: true
//         },
//         {
//             internal: 11,
//             get name() { return `What even is this thing? Why do I have so little of it?`; },
//             get desc() { return `Convert all of your PRai to Kuaraniai.`; },
//             type: `kua`,
//             get reward() { return `Your number generation is increased by ${format(1e2)}%, and you start at ${format(10)} PRai every Kuaraniai reset, but the starting PRai doesn't count for Kuaraniai gain.`; },
//             get show() { return player.value.gameProgress.unlocks.kua; },
//             status: true
//         },
//         {
//             internal: 12,
//             get name() { return `Stockpiler`; },
//             get desc() { return `Save up ${format(1e12)} PRai on a Kuaraniai run.`; },
//             type: `kua`,
//             get reward() { return `UP2 also boosts number gain at a reduced rate. Currently: ${format(this.eff!, 2)}x`; },
//             get eff() { 
//                 let pow = D(0.2);
//                 if (ifAchievement(24)) {
//                     pow = pow.add(0.05);
//                 }
//                 if (ifAchievement(30)) {
//                     pow = pow.add(0.05);
//                 }
    
//                 let eff = Decimal.max(tmp.value.main.upgrades[1].effect, 1);
//                 // if (getKuaUpgrade("p", 7)) {
//                 //     eff = eff.root(3);
//                 // }
//                 eff = eff.pow(pow);
//                 return eff;
//             },
//             get show() { return player.value.gameProgress.unlocks.kua; },
//             status: true
//         },
//         { 
//             internal: 34,
//             get name() { return `Gathering Pieces Together`; },
//             get desc() { return `Have ${format(0.01, 3)} Kuaraniai.`; },
//             type: `kua`,
//             get reward() { return `KShard and KPower now passively boost points and PRai.`; },
//             get show() { return player.value.gameProgress.unlocks.kua; },
//             status: true
//         },
//         // {
//         //     internal: 13,
//         //     get name() { return `You like making progress, don't you?`; },
//         //     get desc() { return `Have ${format(0.1, 2)} Kuaraniai.`; },
//         //     type: `kua`,
//         //     get reward() { return `Kuaraniai gain is increased by ${format(50)}%, and KShards produce another point multiplier. Currently: ${format(this.eff!, 2)}x`; },
//         //     get eff() { return Decimal.max(player.value.gameProgress.kua.kshards.totals.col, 0).add(1).mul(8).sqrt().sub(1).div(2); },
//         //     get show() { return player.value.gameProgress.unlocks.kua; },
//         //     status: true
//         // },
//         { 
//             internal: 15,
//             get name() { return `This upgrade was unnecessary`; },
//             get desc() { return `Have ${format(1e80)} points without Upgrade 3.`; },
//             type: `main`,
//             get reward() { return `Upgrade 3 gets a small ${format(1, 2)}% boost to effectiveness.`; },
//             get show() { return player.value.gameProgress.unlocks.kua; },
//             status: true
//         },
//         { 
//             internal: 16,
//             get name() { return `Quite interesting`; },
//             get desc() { return `Get ${format(1e2)} Upgrade 1 without having over ${format(10)} PRai.`; },
//             type: `main`,
//             get reward() { return `Upgrade 1's effectiveness is slightly increased based off of your PRai. Currently: ${format(this.eff!.sub(1).mul(1e2), 3)}%`; },
//             get eff() { 
//                 let eff = D(player.value.gameProgress.main.prai.amount)
//                 eff = eff.max(10).log10().cbrt().sub(1).div(200).add(1)
//                 return eff;
//             },
//             get show() { return player.value.gameProgress.unlocks.kua; },
//             status: true
//         },
//         { 
//             internal: 17,
//             get name() { return `Actually, these are useless!`; },
//             get desc() { return `Reach ${format(1e24)} Points without any upgrade.`; },
//             type: `main`,
//             get reward() { return `All upgrades' cost scaling is slightly slowed down based off of your time in this PRai reset. Currently: ${formatPerc(this.eff!, 3)} slower`; },
//             get eff() { 
//                 let eff = Decimal.div(player.value.gameProgress.main.prai.timeInPRai, 60);
//                 eff = eff.div(eff.mul(9).add(1)).add(1)
//                 return eff;
//             },
//             get show() { return player.value.gameProgress.unlocks.kua; },
//             status: true
//         },
//         { 
//             internal: 18,
//             get name() { return `This softcap won't hurt me!`; },
//             get desc() { return `Upgrade 2's effect must reach /${format(1e17)}.`; },
//             type: `main`,
//             get reward() { return `Upgrade 2's softcap is ${format(5)}% weaker.`; },
//             get show() { return player.value.gameProgress.unlocks.kua; },
//             status: true
//         },
//         {
//             internal: 19,
//             get name() { return `Make this obsolete, I dare you. >:3`; },
//             get desc() { return `Gain ${format(2_5, 2)} Kuaraniai without doing a single PRai reset.`; },
//             type: `kua`,
//             get reward() { return `Increase PRai's gain exponent from ^${format(1 / 3, 3)} to ^${format(0.35, 3)}`; },
//             get show() { return player.value.gameProgress.unlocks.kua; },
//             status: true
//         },
//         { 
//             internal: 21,
//             get name() { return `oh we might make this obsolete`; },
//             get desc() { return `Have ${format(300)} Upgrade 1 without any PRai.`; },
//             type: `main`,
//             reward: ``,
//             get show() { return player.value.gameProgress.unlocks.kua; },
//             status: true
//         },
//         {
//             internal: 22,
//             get name() { return `"End-game" pass filter`; },
//             get desc() { return `Reach ${format(1e80)} points without buying any upgrade.`; },
//             type: `main`,
//             get reward() { return `Every upgrades' base is increased by ${format(1, 2)}%.`; },
//             get show() { return player.value.gameProgress.unlocks.kua; },
//             status: true
//         },
//         { 
//             internal: 23,
//             get name() { return `I don't think this does much`; },
//             get desc() { return `Reach ${format(300)} Upgrade 1 without Upgrade 2.`; },
//             type: `main`,
//             get reward() { return `Upgrade 2 also boosts PRai gain at a drastically reduced rate. Currently: ${format(this.eff!, 2)}x`; },
//             get eff() {
//                 let eff = Decimal.max(tmp.value.main.upgrades[1].effect, 1e10);
//                 // if (getKuaUpgrade("p", 7)) {
//                 //     eff = eff.root(3).max(1e10);
//                 // }
//                 eff = eff.div(1e10).pow(0.015);
//                 return eff;
//             },
//             get show() { return player.value.gameProgress.unlocks.kua; },
//             status: true
//         },
//         { 
//             internal: 24,
//             get name() { return `What if the upgrades didn't chain boost each other and instead also directly boosted the thing`; },
//             get desc() { return `Get ${format(1e35)} points without Upgrades 1 and 2.`; },
//             type: `main`,
//             get reward() { return `Achievement "Stockpiler" is boosted.`; },
//             get show() { return player.value.gameProgress.unlocks.kua; },
//             status: true
//         },
//         { 
//             internal: 25,
//             get name() { return `speedrun? :o`; },
//             get desc() { return `Reach ${format(1e260)} points in the first ${format(5, 2)} seconds in a Kuaraniai run.`; },
//             type: `main`,
//             get reward() { return `Point gain is boosted but it decays over the next ${format(60, 2)} seconds. Currently: ${format(this.eff!, 2)}x`; },
//             get eff() {
//                 let eff = Decimal.max(player.value.gameProgress.main.prai.timeInPRai, 5).min(60);
//                 eff = Decimal.pow(1e2, Decimal.sub(55, eff.sub(5)).div(0.55).div(1e2).pow(2));
//                 return eff;
//             },
//             get show() { return player.value.gameProgress.unlocks.kua; },
//             status: true
//         },
//         { 
//             internal: 26,
//             get name() { return `imagine PR3 as "tiers" if PR2 is "ranks"`; },
//             get desc() { return `Reach ${format(25)} PR2.`; },
//             type: `main`,
//             reward: ``,
//             get show() { return player.value.gameProgress.unlocks.kua; },
//             status: true
//         },
//         { 
//             internal: 30,
//             get name() { return `Stockpiler 2`; },
//             get desc() { return `Save up ${format(1e85)} PRai on a Kuaraniai run.`; },
//             type: `main`,
//             get reward() { return `Achievement "Stockpiler" is boosted again.`; },
//             get show() { return player.value.gameProgress.unlocks.kua; },
//             status: true
//         },
//         {
//             internal: 14,
//             get name() { return `Does every incremental game need to have a challenge like this? Probably.`; },
//             get desc() { return `Complete Colosseum Challenge 'No Kuaraniai.'`; },
//             type: `col`,
//             reward: ``,
//             get show() { return player.value.gameProgress.unlocks.col; },
//             status: true
//         },
//         {
//             internal: 20,
//             get name() { return `In a time crunch.`; },
//             get desc() { return `Fully complete a challenge with less than ${formatTime(10)} to spare.`; },
//             type: `col`,
//             get reward() { return `PRai gain is multiplied by ${format(5)}x.`; },
//             get show() { return player.value.gameProgress.unlocks.col; },
//             status: true
//         },
//         { // ! Unable
//             internal: 27,
//             get name() { return `this challenge is only gonna get more difficult`; },
//             get desc() { return `Complete "Sabotaged Upgrades" 5 times.`; },
//             type: `col`,
//             reward: ``,
//             get show() { return player.value.gameProgress.unlocks.col; },
//             status: true
//         },
//         { // ! Unable
//             internal: 28,
//             get name() { return `Ruining the point`; },
//             get desc() { return `Complete "Sabotaged Upgrades" on difficulty 1 without buying any upgrade.`; },
//             type: `col`,
//             get reward() { return `Colosseum Power buffs Upgrade 1's base. Currently: `; },
//             get eff() {
//                 const eff = D(1);
//                 return eff;
//             },
//             get show() { return player.value.gameProgress.unlocks.col; },
//             status: true
//         },
//         { 
//             internal: 29,
//             get name() { return `:softcapkisser:`; },
//             get desc() { return `Get ${format(1e7)} Kuaraniai.`; },
//             type: `kua`,
//             reward: ``,
//             get show() { return player.value.gameProgress.unlocks.kua; },
//             status: true
//         },
//         { // ! Unable
//             internal: 31,
//             get name() { return `Heaven ...?`; },
//             get desc() { return `Unlock Kuaraniai Blessings.`; },
//             type: `kb`,
//             reward: ``,
//             get show() { return player.value.gameProgress.unlocks.col; },
//             status: true
//         },
//         { 
//             internal: 32,
//             get name() { return `There wasn't any point in doing that.`; },
//             get desc() { return `Reach ${format(1e100)} points in No Kuaraniai.`; },
//             type: `col`,
//             reward: ``,
//             get show() { return player.value.gameProgress.unlocks.tax; },
//             status: true
//         },
//         { 
//             internal: 33,
//             get name() { return `smort`; },
//             get desc() { return `Reach Level ${format(1e2)} in Dotgenous.`; },
//             type: `col`,
//             reward: ``,
//             get show() { return player.value.gameProgress.unlocks.tax; },
//             status: true
//         },
//     ]
// }

export const setAchievement = (type: number, id: number, bool: boolean) => {
    if (!ifAchievement(type, id) && bool) {
        console.log(`Gained Achievement ${type}, ${id + 1}!`)
        player.value.gameProgress.achievements[type].push(tmp.value.achievementList[type][id]);
        // notify("Achievement", `You gained Achievement `)
    }
}

export const fixAchievements = () => {
    let failure = false;
    tmp.value.achievementList = [];
    for (let i = 0; i < ACHIEVEMENT_DATA.length; i++) {
        tmp.value.achievementList.push([]);
    }
    for (let k = 0; k < ACHIEVEMENT_DATA.length; k++) {
        for (let i = 0; i < ACHIEVEMENT_DATA[k].list.length; i++) {
            failure = true;
            for (let j = 0; j < ACHIEVEMENT_DATA[k].list.length; j++) {
                if (ACHIEVEMENT_DATA[k].list[j].id === i) {
                    tmp.value.achievementList[k].push(j);
                    failure = false;
                    break;
                }
            }
            if (failure) { console.warn(`Achievement with internal ID ${i} in category ${k} was not found!!`); }
        }
    }
    const missing = ACHIEVEMENT_DATA.length - player.value.gameProgress.achievements.length;
    for (let i = 0; i < missing; i++) {
        player.value.gameProgress.achievements.push([]);
    }
}

export const getAchievementEffect = (type: number, id: number) => {
    if (Decimal.isNaN(ACHIEVEMENT_DATA[type].list[tmp.value.achievementList[type][id]].eff!) || ACHIEVEMENT_DATA[type].list[tmp.value.achievementList[type][id]].eff! === undefined) {
        throw new Error(`Achievement ${type}, ${id}`)
    }
    return ACHIEVEMENT_DATA[type].list[tmp.value.achievementList[type][id]].eff!;
}

export const getAchievementData = (type: number, id: number) => {
    return ACHIEVEMENT_DATA[type].list[tmp.value.achievementList[type][id]];
}

export const ifAchievement = (type: number, id: number) => {
    if (tmp.value.achievementList.length === 0) {
        // for some reason, Vue is not letting tmp initalize tmp.value.achievementList before it draws
        fixAchievements();
    }
    return player.value.gameProgress.achievements[type].includes(tmp.value.achievementList[type][id]);
}