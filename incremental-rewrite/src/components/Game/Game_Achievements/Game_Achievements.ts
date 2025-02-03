import Decimal from "break_eternity.js";
import { format, formatPerc, formatTime } from "@/format";
import { gameVars, player, tmp } from "@/main";
import { colorChange, D, mixColor } from "@/calc";
import { spawnPopup } from "@/popups";
import { challengeDepth, inChallenge, timesCompleted } from "../Game_Progress/Game_Colosseum/Game_ColChallenges/Game_ColChalHandler";
import { getColResLevel } from "../Game_Progress/Game_Colosseum/Game_ColResearches/Game_ColResearches";
import { getKuaUpgrade } from "../Game_Progress/Game_Kuaraniai/Game_KuaUpgrades/Game_KuaUpgrades";
import { computed, type ComputedRef } from "vue";
import { GROWAN_DATA } from "../Game_Progress/Game_Layer4/Game_Growan/Game_Growan";

export type Ach_Types = "main" | "kua" | "col" | "l4";
export const Ach_Types_List: Array<Ach_Types> = ["main", "kua", "col", "l4"];

export const ACH_DEF_COLORS = {
    main: {
        unable: computed(() => { return "#ff3333"; }),
        canComplete: computed(() => { return "#aaaaaa"; }),
        complete: computed(() => { return "#19ff33"; })
    },
    kua: {
        unable: computed(() => { return "#1f0099"; }),
        canComplete: computed(() => { return "#400077"; }),
        complete: computed(() => { return "#a019ff"; })
    },
    col: {
        unable: computed(() => { return "#500000"; }),
        canComplete: computed(() => { return "#771500"; }),
        complete: computed(() => { return "#ff2300"; })
    },
    l4: {
        unable: computed(() => { return colorChange(mixColor('#ffff00', '#804000', 'Linear', (Math.sin(gameVars.value.sessionTime * Math.PI / 2) + 1) / 2), 0.5, 0.5); }),
        canComplete: computed(() => { return colorChange(mixColor('#ffff00', '#804000', 'Linear', (Math.sin(gameVars.value.sessionTime * Math.PI / 2) + 1) / 2), 0.5, 1.0); }),
        complete: computed(() => { return mixColor('#ffff00', '#804000', 'Linear', (Math.sin(gameVars.value.sessionTime * Math.PI / 2) + 1) / 2); })
    }
};

type Ach_Data = Array<{
    type: Ach_Types;
    show: ComputedRef<boolean>;
    list: Array<{
        ordering: number;
        name: ComputedRef<string>;
        desc: ComputedRef<string>;
        cond: ComputedRef<boolean>;
        autoComplete?: boolean;
        reward: ComputedRef<string>;
        eff?: ComputedRef<Decimal>;
        show: ComputedRef<boolean>;
        status: ComputedRef<boolean | string>;
        extra?: string;
    }>;
    rewAll: ComputedRef<string>;
    eff: ComputedRef<Decimal>;
}>;


export const ACHIEVEMENT_DATA: Ach_Data = [
    {
        type: "main",
        show: computed(() => { return true; }),
        list: [
            // ! ordering is for display only! do not change the ordering inside of the array as that will break mechanics! change the ordering instead!
            {
                // id: 0
                ordering: 0,
                name: computed(() => {
                    return `Starting off?`;
                }),
                desc: computed(() => {
                    return `Get ${format(1)} UP1.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 1);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => { return true; }),
                status: computed(() => { return true; })
            },
            {
                // id: 1
                ordering: 1,
                name: computed(() => {
                    return `Let me show you how cruel I was with this...`;
                }),
                desc: computed(() => {
                    return `Get ${format(20)} UP1.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 20);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => { return true; }),
                status: computed(() => { return true; })
            },
            {
                // id: 2
                ordering: 2,
                name: computed(() => {
                    return `Not my progress!`;
                }),
                desc: computed(() => {
                    return `Do your first PRai reset.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.prai.bestEver, 1);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => { return true; }),
                status: computed(() => { return true; })
            },
            {
                // id: 3
                ordering: 3,
                name: computed(() => {
                    return `Are you rich now?`;
                }),
                desc: computed(() => {
                    return `Have at least ${format(10)} PRai.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.prai.bestEver, 10);
                }),
                reward: computed(() => {
                    return `Increase your number generation by ${format(20)}%.`;
                }),
                show: computed(() => { return true; }),
                status: computed(() => { return true; })
            },
            {
                // id: 4
                ordering: 4,
                name: computed(() => {
                    return `No! Not again! This is not Distance Incremental!`;
                }),
                desc: computed(() => {
                    return `Get your first softcap.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(tmp.value.main.upgrades[1].effect, 10);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => { return true; }),
                status: computed(() => { return true; })
            },
            {
                // id: 5
                ordering: 5,
                name: computed(() => {
                    return `All that time wasted...`;
                }),
                desc: computed(() => {
                    return `Have ${format(1e18)} points without doing a PRai reset.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.best[1]!, 1e18) && Decimal.lt(player.value.gameProgress.main.prai.times, 1);
                }),
                reward: computed(() => {
                    return `Your PRai's multiplier goes from ${format(4)}× -> ${format(5)}×.`;
                }),
                show: computed(() => { return true; }),
                status: computed(() => { return Decimal.lt(player.value.gameProgress.main.prai.times, 1) ? true : `Failed due to having PRai reset ${format(player.value.gameProgress.main.prai.times)} times.`; }),
                extra: `This may require you to do a higher level reset (like PR2) if you had already done a PRai reset!`
            },
            {
                // id: 6
                ordering: 6,
                name: computed(() => {
                    return `This cannot be endgame.`;
                }),
                desc: computed(() => {
                    return `Do a PR2 reset twice.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.pr2.bestEver, 2);
                }),
                reward: computed(() => {
                    return `UP1's scaling is weakened based off of PRai. Currently: ${formatPerc(ACHIEVEMENT_DATA[0].list[6].eff!.value, 3)} weaker.`;
                }),
                eff: computed(() => {
                    return Decimal.max(player.value.gameProgress.main.prai.amount, 10)
                        .log10()
                        .root(3)
                        .sub(1)
                        .div(4)
                        .add(1);
                }),
                show: computed(() => { return true; }),
                status: computed(() => { return true; })
            },
            {
                // id: 7
                ordering: 7,
                name: computed(() => {
                    return `Instant gratification.`;
                }),
                desc: computed(() => {
                    return `Receive ${format(1e3)} PRai in a single PRai reset.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(tmp.value.main.prai.pending, 1e3);
                }),
                autoComplete: false,
                reward: computed(() => {
                    return `PR2 requirement is reduced by ${formatPerc(1.5)}.`;
                }),
                show: computed(() => { return true; }),
                status: computed(() => { return true; })
            },
            {
                // id: 8
                ordering: 8,
                name: computed(() => {
                    return `This really is a clone of Distance Incremental!`;
                }),
                desc: computed(() => {
                    return `Have at least ${format(100)} UP1.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 100);
                }),
                reward: computed(() => {
                    return `PRai effect is increased by ${format(100)}%.`;
                }),
                show: computed(() => { return true; }),
                status: computed(() => { return true; })
            },
            {
                // id: 9
                ordering: 9,
                name: computed(() => {
                    return `What once was part of a bygone era...`;
                }),
                desc: computed(() => {
                    return `Do a PR2 reset ${format(4)} times in total.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.pr2.bestEver, 4);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.prai.bestEver, 9.5);
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 10
                ordering: 10,
                name: computed(() => {
                    return `Going even further beyond!`;
                }),
                desc: computed(() => {
                    return `Do a PR2 reset ${format(11)} times.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.pr2.bestEver, 11);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.prai.bestEver, 9.5);
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 11
                ordering: 11,
                name: computed(() => {
                    return `A prelude 1`;
                }),
                desc: computed(() => {
                    return `Have ${format(1e45)} points without buying Upgrade 3.`;
                }),
                cond: computed(() => {
                    return (
                        Decimal.gte(player.value.gameProgress.main.points, 1e45) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0)
                    );
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.prai.bestEver, 9.5);
                }),
                status: computed(() => {
                    return Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0)
                        ? true
                        : `Failed due to having Upgrade 3`;
                })
            },
            {
                // id: 12
                ordering: 12,
                name: computed(() => {
                    return `A prelude 2`;
                }),
                desc: computed(() => {
                    return `Have ${format(1e63)} points without buying Upgrade 2 and 3.`;
                }),
                cond: computed(() => {
                    return (
                        Decimal.gte(player.value.gameProgress.main.points, 1e63) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0)
                    );
                }),
                reward: computed(() => {
                    return `Increase UP2's base by +${format(0.05, 3)}.`;
                }),
                show: computed(() => {
                    return ifAchievement(0, 11);
                }),
                status: computed(() => {
                    if (
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0)
                    ) {
                        return true;
                    }
                    const fail = [
                        !Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0),
                        !Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0)
                    ];
                    let txt = `Failed due to having Upgrade `;
                    if (fail[0] && fail[1]) {
                        txt += `2 and 3.`;
                    } else {
                        if (fail[0]) {
                            txt += `2.`;
                        }
                        if (fail[1]) {
                            txt += `3.`;
                        }
                    }
                    return txt;
                })
            },
            {
                // id: 13
                ordering: 13,
                name: computed(() => {
                    return `A prelude 3`;
                }),
                desc: computed(() => {
                    return `Have ${format(1e90)} points without buying Upgrades 1, 2, and 3 in the current PRai run.`;
                }),
                cond: computed(() => {
                    return (
                        Decimal.gte(player.value.gameProgress.main.points, 1e90) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[0].bought, 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0)
                    );
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return ifAchievement(0, 12);
                }),
                status: computed(() => {
                    if (
                        Decimal.lte(player.value.gameProgress.main.upgrades[0].bought, 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0)
                    ) {
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
                })
            },
            {
                // id: 14
                ordering: 14,
                name: computed(() => {
                    return `Enhancing 1`;
                }),
                desc: computed(() => {
                    return `Make Upgrade 1's base reach ×${format(1.6, 3)}`;
                }),
                cond: computed(() => {
                    return Decimal.gte(tmp.value.main.upgrades[0].effectBase, 1.6);
                }),
                reward: computed(() => {
                    return `PR2's cost base is decreased from ${format(10)} to ${format(9)}.`;
                }),
                show: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.pr2.bestEver, 5);
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 15
                ordering: 15,
                name: computed(() => {
                    return `Enhancing 2`;
                }),
                desc: computed(() => {
                    return `Make Upgrade 1's base reach ×${format(2, 3)}`;
                }),
                cond: computed(() => {
                    return Decimal.gte(tmp.value.main.upgrades[0].effectBase, 2);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return ifAchievement(0, 14);
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 16
                ordering: 16,
                name: computed(() => {
                    return `Enhancing 3`;
                }),
                desc: computed(() => {
                    return `Make Upgrade 1's base reach ×${format(3, 3)}`;
                }),
                cond: computed(() => {
                    return Decimal.gte(tmp.value.main.upgrades[0].effectBase, 3);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return ifAchievement(0, 15);
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 17
                ordering: 17,
                name: computed(() => {
                    return `Apparently Upgrades 4-6 are all you need.`;
                }),
                desc: computed(() => {
                    return `Get ${format(1e30)} points without having Upgrades 1-3 and without more than ${format(10)} PRai for this Kuaraniai run.`;
                }),
                autoComplete: false,
                cond: computed(() => {
                    return Decimal.lte(player.value.gameProgress.main.upgrades[0].boughtInReset[2], 0) &&
                    Decimal.lte(player.value.gameProgress.main.upgrades[1].boughtInReset[2], 0) &&
                    Decimal.lte(player.value.gameProgress.main.upgrades[2].boughtInReset[2], 0) &&
                    Decimal.lte(player.value.gameProgress.main.prai.totals[2]!, 10) &&
                    Decimal.gte(player.value.gameProgress.main.best[2]!, 1e30);
                }),
                reward: computed(() => {
                    return `PRai's effect is slightly boosted by ×${format(ACHIEVEMENT_DATA[0].list[17].eff!.value, 2)} based off your time in PRai.`;
                }),
                eff: computed(() => {
                    return Decimal.max(player.value.gameProgress.main.prai.timeInPRai, 1)
                        .sqrt()
                        .pow_base(1.5)
                        .min(10);
                }),
                show: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.pr2.bestEver, 10);
                }),
                status: computed(() => {
                    if (
                        Decimal.lte(player.value.gameProgress.main.upgrades[0].boughtInReset[2], 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].boughtInReset[2], 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[2].boughtInReset[2], 0)
                    ) {
                        return Decimal.lte(player.value.gameProgress.main.prai.totals[2]!, 10)
                            ? true
                            : `Failed due to having more than ${format(10)} PRai.`;
                    }
                    const fail: Array<number> = [];
                    for (let i = 0; i < 3; i++) {
                        if (
                            !Decimal.lte(
                                player.value.gameProgress.main.upgrades[i].boughtInReset[2],
                                0
                            )
                        ) {
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
                    if (Decimal.gt(player.value.gameProgress.main.prai.totals[2]!, 10)) {
                        txt += ` Failed due to having more than ${format(10)} PRai.`;
                    }
                    return txt;
                }),
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 18
                ordering: 18,
                name: computed(() => {
                    return `You can't escape the IRS, fool!`;
                }),
                desc: computed(() => {
                    return `Reach ${format(Number.MAX_VALUE)} points.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.bestEver, Number.MAX_VALUE);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.bestEver, 1e100);
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 19
                ordering: 19,
                name: computed(() => {
                    return `Ordered`;
                }),
                desc: computed(() => {
                    return `Every upgrade from 1-6 must have #×${format(10)} of themselves. (Upgrade 1 must be bought ${format(10)} times, Upgrade 2 ${format(20)} times, etc.)`;
                }),
                cond: computed(() => {
                    return Decimal.eq(player.value.gameProgress.main.upgrades[0].bought, 10) &&
                        Decimal.eq(player.value.gameProgress.main.upgrades[1].bought, 20) &&
                        Decimal.eq(player.value.gameProgress.main.upgrades[2].bought, 30) &&
                        Decimal.eq(player.value.gameProgress.main.upgrades[3].bought, 40) &&
                        Decimal.eq(player.value.gameProgress.main.upgrades[4].bought, 50) &&
                        Decimal.eq(player.value.gameProgress.main.upgrades[5].bought, 60)
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.col;
                }),
                status: computed(() => {
                    const fail: Array<number> = [];
                    for (let i = 0; i < 6; i++) {
                        if (Decimal.neq(player.value.gameProgress.main.upgrades[i].bought, 10*(i+1))) {
                            fail.push(i);
                        }
                    }
                    if (fail.length === 0) {
                        return true;
                    }
                    let txt = `Failed due to Upgrades `;
                    for (let i = 0; i < fail.length - 1; i++) {
                        txt += `${fail[i] + 1}, `;
                    }
                    if (fail.length > 1) {
                        txt += ` and ${fail[fail.length - 1] + 1}`;
                    } else {
                        txt += `${fail[0] + 1}`;
                    }
                    txt += ` not meeting their target value.`
                    return txt;
                }),
                extra: `Hint: What resets Upgrades 4-6?`
            },
            {
                // id: 20
                ordering: 20,
                name: computed(() => {
                    return `Jumping to conclusions.`;
                }),
                desc: computed(() => {
                    return `Reach ${format(1e100)} PRai while doing no more than ${format(5)} PRai resets.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.prai.amount, 1e100) && Decimal.lte(player.value.gameProgress.main.prai.times, 5);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.col;
                }),
                status: computed(() => {
                    return Decimal.lte(player.value.gameProgress.main.prai.times, 5) ? true : `Failed due to having PRai reset ${format(player.value.gameProgress.main.prai.times)} times.`
                })
            },
            {
                // id: 21
                ordering: 21,
                name: computed(() => {
                    return `Reach Infinity, again!`;
                }),
                desc: computed(() => {
                    return `Reach ${format(Decimal.pow(Number.MAX_VALUE, 2))} Points.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.points, Decimal.pow(Number.MAX_VALUE, 2));
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.col;
                }),
                status: computed(() => { return true; }),
            },
            {
                // id: 22
                ordering: 22,
                name: computed(() => {
                    return `I wonder why this wasn't here for so long?`;
                }),
                desc: computed(() => {
                    return `Have over ${format(10)} effective Upgrade 1s without buying any.`;
                }),
                cond: computed(() => {
                    return Decimal.gt(tmp.value.main.upgrades[0].effective, 10) && Decimal.eq(player.value.gameProgress.main.upgrades[0].bought, 0);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kproofs === undefined ? false : player.value.gameProgress.unlocks.kproofs.main;
                }),
                status: computed(() => {
                    return Decimal.eq(player.value.gameProgress.main.upgrades[0].bought, 0) ? true : `Failed due to having bought Upgrade 1.`
                })
            },
            // {
            //     // id: 23
            //     ordering: 23,
            //     name: computed(() => {
            //         return `There are 2 constants in life. Death, and Taxes. Evade one of them.`;
            //     }),
            //     desc: computed(() => {
            //         return `Delay the tax man by ${format(1e50)}×!`;
            //     }),
            //     cond: computed(() => {
            //         return getSCSLAttribute('points', false)[0].start.gte(Decimal.mul(Number.MAX_VALUE, 1e50));
            //     }),
            //     reward: computed(() => { return ``; }),
            //     show: computed(() => {
            //         return player.value.gameProgress.unlocks.kproofs === undefined ? false : player.value.gameProgress.unlocks.kproofs.main;
            //     }),
            //     status: computed(() => {
            //         return `You need to evade your taxes by ${format(Decimal.mul(Number.MAX_VALUE, 1e50).div(getSCSLAttribute('points', false)[0].start), 2)}× more! (In layman's terms, delay the points softcap.)`
            //     })
            // },
        ],
        rewAll: computed(() => {
            return `Point gain is increased by ${format(ACHIEVEMENT_DATA[0].eff.value.sub(1).mul(100), 2)}%. (×1.1 per main achievement)`;
        }),
        eff: computed(() => {
            let eff = D(1.1);
            eff = Decimal.pow(eff, player.value.gameProgress.achievements[0].length);
            return eff;
        })
    },
    {
        type: "kua",
        show: computed(() => {
            return Decimal.gte(player.value.gameProgress.main.pr2.bestEver, 10);
        }),
        list: [
            {
                // id: 0
                ordering: 0,
                name: computed(() => {
                    return `What even is this thing? Why do I have so little of it?`;
                }),
                desc: computed(() => {
                    return `Convert all of your PRai to Kuaraniai.`;
                }),
                cond: computed(() => {
                    return Decimal.gt(player.value.gameProgress.kua.amount, 0);
                }),
                reward: computed(() => {
                    return `Your number generation is increased by ${format(1e2)}%.`;
                }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kua;
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 1
                ordering: 1,
                name: computed(() => {
                    return `Stockpiler`;
                }),
                desc: computed(() => {
                    return `Save up ${format(1e12)} PRai on a Kuaraniai run.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.prai.amount, 1e12);
                }),
                reward: computed(() => {
                    return `UP2 also boosts number gain at a reduced rate. Currently: ×${format(ACHIEVEMENT_DATA[1].list[1].eff!.value, 2)}`;
                }),
                eff: computed(() => {
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
                }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kua;
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 2
                ordering: 2,
                name: computed(() => {
                    return `Gathering Pieces Together`;
                }),
                desc: computed(() => {
                    return `Have ${format(0.01, 3)} Kuaraniai.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.kua.amount, 0.01);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kua;
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 3
                ordering: 3,
                name: computed(() => {
                    return `You like making progress, don't you?`;
                }),
                desc: computed(() => {
                    return `Have ${format(0.1, 2)} Kuaraniai.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.kua.amount, 0.095);
                }),
                reward: computed(() => {
                    return `Kuaraniai gain is increased by ${format(50)}%, and KShards produce another point multiplier. Currently: ×${format(ACHIEVEMENT_DATA[1].list[3].eff!.value, 2)}`;
                }),
                eff: computed(() => {
                    return Decimal.gte(player.value.gameProgress.kua.kshards.totals[3]!, 5e11)
                        ? Decimal.max(player.value.gameProgress.kua.kshards.totals[3]!, 0).div(50).root(5).mul(10000)
                        : Decimal.max(player.value.gameProgress.kua.kshards.totals[3]!, 0).mul(8).add(1).sqrt().sub(1).div(2).add(1);
                }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kua;
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 4
                ordering: 4,
                name: computed(() => {
                    return `This upgrade was unnecessary`;
                }),
                desc: computed(() => {
                    return `Have ${format(1e80)} points without Upgrade 3 in the current Kuaraniai run.`;
                }),
                autoComplete: false,
                cond: computed(() => {
                    return (
                        Decimal.gte(player.value.gameProgress.main.points, 1e80) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[2].boughtInReset[2], 0)
                    );
                }),
                reward: computed(() => {
                    return `Upgrade 3 gets a small ${format(1, 2)}% boost to effectiveness.`;
                }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kua;
                }),
                status: computed(() => {
                    return Decimal.lte(player.value.gameProgress.main.upgrades[2].boughtInReset[2], 0)
                        ? true
                        : `Failed due to having Upgrade 3.`;
                }),
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 5
                ordering: 5,
                name: computed(() => {
                    return `Quite interesting`;
                }),
                desc: computed(() => {
                    return `Get ${format(1e2)} Upgrade 1 without having over ${format(10)} PRai.`;
                }),
                cond: computed(() => {
                    return (
                        Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 100) &&
                        Decimal.lte(player.value.gameProgress.main.prai.totals[2]!, 10)
                    );
                }),
                reward: computed(() => {
                    return `Upgrade 1's effectiveness is slightly increased based off of your PRai. Currently: ${format(ACHIEVEMENT_DATA[1].list[5].eff!.value.sub(1).mul(1e2), 3)}%`;
                }),
                eff: computed(() => {
                    let eff = D(player.value.gameProgress.main.prai.amount);
                    if (eff.gte(1e216)) {
                        eff = eff.log10().log(6).div(300).add(1)
                    } else {
                        eff = eff.max(10).log10().cbrt().sub(1).div(500).add(1);
                    }
                    return eff;
                }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kua;
                }),
                status: computed(() => {
                    return Decimal.lte(player.value.gameProgress.main.prai.amount, 10)
                        ? true
                        : `Failed due to having more than ${format(10)} PRai.`;
                })
            },
            {
                // id: 6
                ordering: 6,
                name: computed(() => {
                    return `Actually, these are useless!`;
                }),
                desc: computed(() => {
                    return `Reach ${format(1e20)} PRai without Upgrades 1, 2, and 3 in the current Kuaraniai run.`;
                }),
                autoComplete: false,
                cond: computed(() => {
                    return (
                        Decimal.gte(player.value.gameProgress.main.prai.best[2]!, 1e20) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[0].boughtInReset[2], 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].boughtInReset[2], 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[2].boughtInReset[2], 0)
                    );
                }),
                reward: computed(() => {
                    return `All upgrades' cost scaling is slightly slowed down based off of your time in this PRai reset. Currently: ${formatPerc(ACHIEVEMENT_DATA[1].list[6].eff!.value, 3)} slower`;
                }),
                eff: computed(() => {
                    let eff = Decimal.div(player.value.gameProgress.main.prai.timeInPRai, 60);
                    eff = eff.div(eff.mul(198).add(1)).add(1);
                    return eff;
                }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kua;
                }),
                status: computed(() => {
                    if (Decimal.lte(player.value.gameProgress.main.upgrades[0].boughtInReset[2], 0) &&Decimal.lte(player.value.gameProgress.main.upgrades[1].boughtInReset[2], 0) &&Decimal.lte(player.value.gameProgress.main.upgrades[2].boughtInReset[2], 0)) {
                        return true;
                    }
                    const fail: Array<number> = [];
                    for (let i = 0; i < 3; i++) {
                        if (Decimal.gt(player.value.gameProgress.main.upgrades[i].boughtInReset[2], 0)) {
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
                }),
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 7
                ordering: 7,
                name: computed(() => {
                    return `This softcap won't hurt me!`;
                }),
                desc: computed(() => {
                    return `Upgrade 2's effect must reach /${format(1e17)}.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(tmp.value.main.upgrades[1].effect, 1e17);
                }),
                reward: computed(() => {
                    return `Upgrade 2's softcap is ${format(5)}% weaker.`;
                }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kua;
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 8
                ordering: 8,
                name: computed(() => {
                    return `Make this obsolete, I dare you. >:3`;
                }),
                desc: computed(() => {
                    return `Gain ${format(2.5, 2)} Kuaraniai without doing a single PRai reset.`;
                }),
                cond: computed(() => {
                    return (
                        Decimal.gte(tmp.value.kua.pending, 2.5) &&
                        Decimal.lte(player.value.gameProgress.main.prai.times, 0)
                    );
                }),
                autoComplete: false,
                reward: computed(() => {
                    return `Increase PRai's gain exponent from ^${format(1 / 3, 3)} to ^${format(0.335, 3)}`;
                }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kua;
                }),
                status: computed(() => {
                    return Decimal.lte(player.value.gameProgress.main.prai.times, 0)
                        ? true
                        : `Failed due to having reset PRai ${format(player.value.gameProgress.main.prai.times)} times.`;
                }),
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 9
                ordering: 9,
                name: computed(() => {
                    return `oh we might make this obsolete`;
                }),
                desc: computed(() => {
                    return `Have ${format(300)} Upgrade 1 without having more than ${format(10)} PRai.`;
                }),
                autoComplete: false,
                cond: computed(() => {
                    return (
                        Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 300) &&
                        Decimal.lte(player.value.gameProgress.main.prai.amount, 10)
                    );
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kua;
                }),
                status: computed(() => {
                    return Decimal.lte(player.value.gameProgress.main.prai.amount, 10)
                        ? true
                        : `Failed due to having more than ${format(10)} PRai.`;
                }),
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 10
                ordering: 10,
                name: computed(() => {
                    return `"End-game" pass filter`;
                }),
                desc: computed(() => {
                    return `Reach ${format(1e80)} points without buying Upgrades 1, 2, and 3 in the current Kuaraniai run.`;
                }),
                autoComplete: false,
                cond: computed(() => {
                    return (
                        Decimal.gte(player.value.gameProgress.main.best[2]!, 1e80) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[0].boughtInReset[2], 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].boughtInReset[2], 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[2].boughtInReset[2], 0)
                    );
                }),
                reward: computed(() => {
                    return `Every upgrades' base is increased by ${format(1, 2)}%.`;
                }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kua;
                }),
                status: computed(() => {
                    if (
                        Decimal.lte(player.value.gameProgress.main.upgrades[0].boughtInReset[2], 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].boughtInReset[2], 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[2].boughtInReset[2], 0)
                    ) {
                        return true;
                    }
                    const fail: Array<number> = [];
                    for (let i = 0; i < 3; i++) {
                        if (Decimal.gt(player.value.gameProgress.main.upgrades[i].boughtInReset[2], 0)) {
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
                }),
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 11
                ordering: 11,
                name: computed(() => {
                    return `I don't think this does much`;
                }),
                desc: computed(() => {
                    return `Reach ${format(300)} Upgrade 1 without Upgrade 2 in the current Kuaraniai run.`;
                }),
                cond: computed(() => {
                    return (
                        Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 300) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].boughtInReset[2], 0)
                    );
                }),
                autoComplete: false,
                reward: computed(() => {
                    return `Upgrade 2 also boosts PRai gain at a drastically reduced rate. Currently: ×${format(ACHIEVEMENT_DATA[1].list[11].eff!.value, 2)}`;
                }),
                eff: computed(() => {
                    let eff = Decimal.max(tmp.value.main.upgrades[1].effect, 1e10);
                    if (getKuaUpgrade("p", 7)) {
                        eff = eff.root(3).max(1e10);
                    }
                    eff = eff.div(1e10).pow(0.015);
                    return eff;
                }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kua;
                }),
                status: computed(() => {
                    return Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0)
                        ? true
                        : `Failed due to having Upgrade 2.`;
                }),
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 12
                ordering: 12,
                name: computed(() => {
                    return `What if the upgrades didn't chain boost each other and instead also directly boosted the thing`;
                }),
                desc: computed(() => {
                    return `Get ${format(1e35)} points without Upgrades 1 and 2 in the current Kuaraniai run.`;
                }),
                cond: computed(() => {
                    return (
                        Decimal.gte(player.value.gameProgress.main.best[2]!, 1e35) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[0].boughtInReset[2], 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].boughtInReset[2], 0)
                    );
                }),
                autoComplete: false,
                reward: computed(() => {
                    return `Achievement "Stockpiler" is boosted.`;
                }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kua;
                }),
                status: computed(() => {
                    if (
                        Decimal.lte(player.value.gameProgress.main.upgrades[0].boughtInReset[2], 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].boughtInReset[2], 0)
                    ) {
                        return true;
                    }
                    const fail = [
                        !Decimal.lte(player.value.gameProgress.main.upgrades[0].boughtInReset[2], 0),
                        !Decimal.lte(player.value.gameProgress.main.upgrades[1].boughtInReset[2], 0)
                    ];
                    let txt = `Failed due to having Upgrade `;
                    if (fail[0] && fail[1]) {
                        txt += `1 and 2.`;
                    } else {
                        if (fail[0]) {
                            txt += `1.`;
                        }
                        if (fail[1]) {
                            txt += `2.`;
                        }
                    }
                    return txt;
                }),
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 13
                ordering: 13,
                name: computed(() => {
                    return `speedrun? :o`;
                }),
                desc: computed(() => {
                    return `Reach ${format(1e260)} points in the first ${format(5, 2)} seconds in a Kuaraniai run.`;
                }),
                cond: computed(() => {
                    return (
                        Decimal.gte(player.value.gameProgress.main.points, 1e260) &&
                        Decimal.lte(player.value.gameProgress.kua.timeInKua, 5)
                    );
                }),
                reward: computed(() => {
                    return `Point gain is boosted but it decays over the next ${format(60, 2)} seconds. Currently: ×${format(ACHIEVEMENT_DATA[1].list[13].eff!.value, 2)}`;
                }),
                eff: computed(() => {
                    let eff = Decimal.max(player.value.gameProgress.main.prai.timeInPRai, 5).min(60);
                    eff = Decimal.pow(1e2, Decimal.sub(55, eff.sub(5)).div(0.55).div(1e2).pow(2));
                    return eff;
                }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kua;
                }),
                status: computed(() => {
                    return Decimal.lte(player.value.gameProgress.kua.timeInKua, 5)
                        ? true
                        : `Failed due to taking ${formatTime(player.value.gameProgress.kua.timeInKua)} / ${formatTime(5)} in the current Kuaraniai run.`;
                })
            },
            {
                // id: 14
                ordering: 14,
                name: computed(() => {
                    return `imagine PR3 as "tiers" if PR2 is "ranks"`;
                }),
                desc: computed(() => {
                    return `Reach ${format(25)} PR2.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.pr2.bestEver, 25);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kua;
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 15
                ordering: 15,
                name: computed(() => {
                    return `Stockpiler 2`;
                }),
                desc: computed(() => {
                    return `Save up ${format(1e85)} PRai on a Kuaraniai run.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.prai.bestEver, 1e85);
                }),
                reward: computed(() => {
                    return `Achievement "Stockpiler" is boosted again.`;
                }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kua;
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 16
                ordering: 16,
                name: computed(() => {
                    return `:softcapkisser:`;
                }),
                desc: computed(() => {
                    return `Get ${format(1e7)} Kuaraniai.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.kua.amount, 1e7);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kua;
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 17
                ordering: 17,
                name: computed(() => {
                    return `Collector`;
                }),
                desc: computed(() => {
                    return `Buy 10 KShard and KPower upgrades.`;
                }),
                cond: computed(() => {
                    return player.value.gameProgress.kua.kshards.upgrades >= 10 && player.value.gameProgress.kua.kpower.upgrades >= 10;
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.col;
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 18
                ordering: 18,
                name: computed(() => {
                    return `Don't need em.`;
                }),
                desc: computed(() => {
                    return `Reach ${format(1e130)} points while buying only KShard or KPower upgrades.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.main.points, 1e130) &&
                        (player.value.gameProgress.kua.upgrades === 0 &&
                        (player.value.gameProgress.kua.kshards.upgrades >= 0 && player.value.gameProgress.kua.kpower.upgrades === 0) ||
                        (player.value.gameProgress.kua.kpower.upgrades >= 0 && player.value.gameProgress.kua.kshards.upgrades === 0));
                }),
                autoComplete: false,
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.col;
                }),
                status: computed(() => {
                    if (player.value.gameProgress.kua.upgrades !== 0) {
                        return `Failed due to buying Kuaraniai upgrades.`;
                    }
                    if (!(player.value.gameProgress.kua.kshards.upgrades >= 0 && player.value.gameProgress.kua.kpower.upgrades === 0) ||
                    (player.value.gameProgress.kua.kpower.upgrades >= 0 && player.value.gameProgress.kua.kshards.upgrades === 0)) {
                        if (!(player.value.gameProgress.kua.kpower.upgrades >= 0 && player.value.gameProgress.kua.kshards.upgrades === 0)) {
                            return `Failed due to buying KShard upgrades while having KPower upgrades.`;
                        }
                        if (!(player.value.gameProgress.kua.kshards.upgrades >= 0 && player.value.gameProgress.kua.kpower.upgrades === 0)) {
                            return `Failed due to buying kPower upgrades while having KShard upgrades.`;
                        }
                    }
                    return true;
                }),
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 19
                ordering: 19,
                name: computed(() => {
                    return `Wait what?`;
                }),
                desc: computed(() => {
                    return `Have your KProof amount higher than your points.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.kua.proofs.amount, player.value.gameProgress.main.points);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.kproofs === undefined ? false : player.value.gameProgress.unlocks.kproofs.main;
                }),
                status: computed(() => { return true; })
            },
        ],
        rewAll: computed(() => {
            return `Kuaraniai's effects are ${format(ACHIEVEMENT_DATA[1].eff.value.sub(1).mul(100), 2)}% stronger. (+1% per Kuaraniai achievement)`;
        }),
        eff: computed(() => {
            let eff = D(0.01);
            eff = Decimal.mul(eff, player.value.gameProgress.achievements[1].length);
            eff = eff.add(1);
            return eff;
        })
    },
    {
        type: "col",
        show: computed(() => {
            return player.value.gameProgress.unlocks.col;
        }),
        list: [
            {
                // id: 0
                ordering: 0,
                name: computed(() => {
                    return `Does every incremental game need to have a challenge like this? Probably.`;
                }),
                desc: computed(() => {
                    return `Complete Colosseum Challenge 'No Kuaraniai.'`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.col.completed.nk, 1);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.col;
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 1
                ordering: 1,
                name: computed(() => {
                    return `In a time crunch.`;
                }),
                desc: computed(() => {
                    return `Fully complete a challenge with less than ${formatTime(10)} to spare.`;
                }),
                cond: computed(() => {
                    return Decimal.lte(player.value.gameProgress.col.time, 10);
                }),
                autoComplete: false,
                reward: computed(() => {
                    return `PRai gain is multiplied by ${format(5)}×.`;
                }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.col;
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 2
                ordering: 2,
                name: computed(() => {
                    return `this challenge is only gonna more: computed( d =>ifficult`;
                }),
                desc: computed(() => {
                    return `Complete "Sabotaged Upgrades" 5 times.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(timesCompleted("su"), 5);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.col;
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 3
                ordering: 3,
                name: computed(() => {
                    return `Ruining the point`;
                }),
                desc: computed(() => {
                    return `Complete "Sabotaged Upgrades" on difficulty 1 without buying any upgrade.`;
                }),
                cond: computed(() => {
                    return inChallenge('su') && Decimal.eq(challengeDepth('su'), 1) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[0].bought, 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[3].bought, 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[4].bought, 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[5].bought, 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[6].bought, 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[7].bought, 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[8].bought, 0)
                }),
                autoComplete: false,
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.col;
                }),
                status: computed(() => {
                    if (!inChallenge('su')) {
                        return `Failed due to not being in challenge 'Sabotaged Upgrades'.`
                    }
                    if (Decimal.neq(challengeDepth('su'), 1)) {
                        return `Failed due to not being in difficulty ${format(1)} of 'Sabotaged Upgrades'.`
                    }

                    const fail: Array<number> = [];
                    for (let i = 0; i < 9; i++) {
                        if (Decimal.gt(player.value.gameProgress.main.upgrades[i].boughtInReset[2], 0)) {
                            fail.push(i);
                        }
                    }
                    if (fail.length === 0) {
                        return true;
                    }
                    let txt = `Failed due to having Upgrades `;
                    for (let i = 0; i < fail.length - 1; i++) {
                        txt += `${fail[i] + 1}, `;
                    }
                    if (fail.length > 1) {
                        txt += ` and ${fail[fail.length - 1] + 1}.`;
                    } else {
                        txt += `${fail[0] + 1}.`;
                    }
                    return txt;
                }),
                extra: `Complete the challenge to this: computed( a =>chievement!`
            },
            {
                // id: 4
                ordering: 4,
                name: computed(() => {
                    return `There wasn't any point in doing that.`;
                }),
                desc: computed(() => {
                    return `Reach ${format(1e100)} points in No Kuaraniai.`;
                }),
                cond: computed(() => {
                    return (
                        player.value.gameProgress.inChallenge.nk.overall &&
                        Decimal.gte(player.value.gameProgress.main.best[3]!, 1e100)
                    );
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.col;
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 5
                ordering: 5,
                name: computed(() => {
                    return `smort`;
                }),
                desc: computed(() => {
                    return `Reach Level ${format(1e2)} in Dotgenous.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(getColResLevel(0), 100);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.col;
                }),
                status: computed(() => { return true; })
            },
            {
                // id: 6
                ordering: 6,
                name: computed(() => {
                    return `This is weird wtf`;
                }),
                desc: computed(() => {
                    return `Reach a PB of ${format(1e35)} in Inverted Mechanics.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(timesCompleted('im'), 1e35);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => {
                    return player.value.gameProgress.unlocks.col;
                }),
                status: computed(() => { return true; })
            },
        ],
        rewAll: computed(() => {
            return `Points gain in colosseum challenges are increased the lower your time is. (100%: ^${format(ACHIEVEMENT_DATA[2].eff.value.mul(0.25).add(1), 3)}, 50%: ^${format(ACHIEVEMENT_DATA[2].eff.value.mul(0.5).add(1), 3)}, 0%: ^${format(ACHIEVEMENT_DATA[2].eff.value.add(1), 3)})`;
        }),
        eff: computed(() => {
            let eff = D(0.004);
            eff = Decimal.mul(eff, player.value.gameProgress.achievements[2].length);
            return eff;
        })
    },
    {
        type: "l4",
        show: computed(() => {
            return player.value.gameProgress.layer4.timeInL4R !== 0;
        }),
        list: [
            {
                // id: 0
                ordering: 0,
                name: computed(() => {
                    return `Antimatter dimensions ripoff real`;
                }),
                desc: computed(() => {
                    return `Gain at least ${format(1e12)} Grōwan Solutions.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.layer4.gro.gEAmount, 1e12);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => { return player.value.gameProgress.layer4.pickedFirst === 1; }),
                status: computed(() => { return true; })
            },
            {
                // id: 1
                ordering: 1,
                name: computed(() => {
                    return `The 'Dimension Boosts' be acting different`;
                }),
                desc: computed(() => {
                    return `Reduce Grōwan Equation costs by -${format(2)}.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(GROWAN_DATA.equCancel.eff.value, 2);
                }),
                reward: computed(() => { return ``; }),
                show: computed(() => { return player.value.gameProgress.layer4.pickedFirst === 1; }),
                status: computed(() => { return true; })
            },
            {
                // id: 2
                ordering: 2,
                name: computed(() => {
                    return `Taking advantage of the start?`;
                }),
                desc: computed(() => {
                    return `Complete No Kuaraniai in the first ${formatTime(240)} of a layer 4 reset.`;
                }),
                cond: computed(() => {
                    return Decimal.gte(player.value.gameProgress.col.completed.nk, 1) && Decimal.lt(player.value.gameProgress.layer4.timeInL4R, 240);
                }),
                autoComplete: false,
                reward: computed(() => { return ``; }),
                show: computed(() => { return player.value.gameProgress.layer4.pickedFirst === 1; }),
                status: computed(() => { return Decimal.lt(player.value.gameProgress.layer4.timeInL4R, 240) ? true : `Failed due to taking ${formatTime(player.value.gameProgress.layer4.timeInL4R)} in a layer 4 reset.`; })
            },
        ],
        rewAll: computed(() => {
            return `KBlessings gain is increased by ${format(ACHIEVEMENT_DATA[3].eff.value.sub(1).mul(100), 2)}%. (×1.05 per Layer 4 achievement)`;
        }),
        eff: computed(() => {
            let eff = D(1.05);
            eff = Decimal.pow(eff, player.value.gameProgress.achievements[3].length);
            return eff;
        })
    }
];

export const setAchievement = (type: number, id: number) => {
    if (!ifAchievement(type, id) && ACHIEVEMENT_DATA[type].list[id].cond.value) {
        player.value.gameProgress.achievements[type].push(id);
        spawnPopup(0, ACHIEVEMENT_DATA[type].list[id].desc.value, ACHIEVEMENT_DATA[type].list[id].name.value, 3, `#FFFF00`);
    }
    // return [ACHIEVEMENT_DATA[type].list[tmp.value.achievementList[type][id]].cond, ifAchievement(type, id), tmp.value.achievementList[type][id], player.value.gameProgress.achievements[type]]
};

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
                if (ACHIEVEMENT_DATA[k].list[j].ordering === i) {
                    tmp.value.achievementList[k].push(j);
                    failure = false;
                    break;
                }
            }
            if (failure) {
                console.warn(`Achievement with internal ID ${i} in category ${k} was not found!!`);
            }
        }
    }
    const missing = ACHIEVEMENT_DATA.length - player.value.gameProgress.achievements.length;
    for (let i = 0; i < missing; i++) {
        player.value.gameProgress.achievements.push([]);
    }
};

export const getAchievementEffect = (type: number, id: number) => {
    if (Decimal.isNaN(ACHIEVEMENT_DATA[type].list[id].eff!.value) || ACHIEVEMENT_DATA[type].list[id].eff!.value === undefined) {
        console.error(ACHIEVEMENT_DATA[type].list[id]);
        throw new Error(`Achievement ${type}, ${id}'s effect either does not exist or is NaN!`);
    }
    return ACHIEVEMENT_DATA[type].list[id].eff!.value;
};

export const ifAchievement = (type: number, id: number) => {
    if (tmp.value.achievementList.length === 0) {
        // for some reason, Vue is not letting tmp initalize tmp.value.achievementList before it draws
        fixAchievements();
    }
    return player.value.gameProgress.achievements[type].includes(id);
};
