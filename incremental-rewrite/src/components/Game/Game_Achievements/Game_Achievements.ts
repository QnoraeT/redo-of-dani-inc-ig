import Decimal from "break_eternity.js";
import { format, formatPerc, formatTime } from "@/format";
import { player, tmp } from "@/main";
import { D } from "@/calc";
import { getKuaUpgrade } from "../Game_Progress/Game_Kuaraniai/Game_Kuaraniai";
import { spawnPopup } from "@/popups";
import { challengeDepth, getColResLevel, inChallenge, timesCompleted } from "../Game_Progress/Game_Colosseum/Game_Colosseum";

export type Ach_Types = "main" | "kua" | "col" |"tax";
export const Ach_Types_List: Array<Ach_Types> = ["main", "kua", "col", "tax"];

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
        unable: "#500000",
        canComplete: "#771500",
        complete: "#ff2300"
    },
    tax: {
        unable: "#807000",
        canComplete: "#a06500",
        complete: "#d5c000"
    }
};

type Ach_Data = Array<{
    type: Ach_Types;
    show: boolean;
    list: Array<{
        ordering: number;
        name: string;
        desc: string;
        cond: boolean;
        autoComplete?: boolean;
        reward: string;
        eff?: Decimal;
        show: boolean;
        status: boolean | string;
        extra?: string;
    }>;
    rewAll: string;
    eff: Decimal;
}>;

export const ACHIEVEMENT_DATA: Ach_Data = [
    {
        type: "main",
        show: true,
        list: [
            // ! ordering is for display only! do not change the ordering inside of the array as that will break mechanics! change the ordering instead!
            {
                // id: 0
                ordering: 0,
                get name() {
                    return `Starting off?`;
                },
                get desc() {
                    return `Get ${format(1)} UP1.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 1);
                },
                reward: ``,
                show: true,
                status: true
            },
            {
                // id: 1
                ordering: 1,
                get name() {
                    return `Let me show you how cruel I was with this...`;
                },
                get desc() {
                    return `Get ${format(20)} UP1.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 20);
                },
                reward: ``,
                show: true,
                status: true
            },
            {
                // id: 2
                ordering: 2,
                get name() {
                    return `Not my progress!`;
                },
                get desc() {
                    return `Do your first PRai reset.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.main.prai.bestEver, 1);
                },
                reward: ``,
                show: true,
                status: true
            },
            {
                // id: 3
                ordering: 3,
                get name() {
                    return `Are you rich now?`;
                },
                get desc() {
                    return `Have at least ${format(10)} PRai.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.main.prai.bestEver, 10);
                },
                get reward() {
                    return `Increase your number generation by ${format(20)}%.`;
                },
                show: true,
                status: true
            },
            {
                // id: 4
                ordering: 4,
                get name() {
                    return `No! Not again! This is not Distance Incremental!`;
                },
                get desc() {
                    return `Get your first softcap.`;
                },
                get cond() {
                    return Decimal.gte(tmp.value.main.upgrades[1].effect, 10);
                },
                reward: ``,
                show: true,
                status: true
            },
            {
                // id: 5
                ordering: 5,
                get name() {
                    return `All that time wasted...`;
                },
                get desc() {
                    return `Have ${format(1e18)} points without doing a PRai reset.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.main.best[1]!, 1e18) && Decimal.lt(player.value.gameProgress.main.prai.times, 1);
                },
                get reward() {
                    return `Your PRai's multiplier goes from ${format(4)}× -> ${format(5)}×.`;
                },
                show: true,
                get status() { return Decimal.lt(player.value.gameProgress.main.prai.times, 1) ? true : `Failed due to having PRai reset ${format(player.value.gameProgress.main.prai.times)} times.`; },
                extra: `This may require you to do a higher level reset (like PR2) if you had already done a PRai reset!`
            },
            {
                // id: 6
                ordering: 6,
                get name() {
                    return `This cannot be endgame.`;
                },
                get desc() {
                    return `Do a PR2 reset twice.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.main.pr2.bestEver, 2);
                },
                get reward() {
                    return `UP1's scaling is weakened based off of PRai. Currently: ${formatPerc(this.eff!, 3)} weaker.`;
                },
                get eff() {
                    return Decimal.max(player.value.gameProgress.main.prai.amount, 10)
                        .log10()
                        .root(3)
                        .sub(1)
                        .div(4)
                        .add(1);
                },
                show: true,
                status: true
            },
            {
                // id: 7
                ordering: 7,
                get name() {
                    return `Instant gratification.`;
                },
                get desc() {
                    return `Receive ${format(1e3)} PRai in a single PRai reset.`;
                },
                get cond() {
                    return Decimal.gte(tmp.value.main.prai.pending, 1e3);
                },
                autoComplete: false,
                get reward() {
                    return `PR2 requirement is reduced by ${formatPerc(1.5)}.`;
                },
                show: true,
                status: true
            },
            {
                // id: 8
                ordering: 8,
                get name() {
                    return `This really is a clone of Distance Incremental!`;
                },
                get desc() {
                    return `Have at least ${format(100)} UP1.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 100);
                },
                get reward() {
                    return `PRai effect is increased by ${format(100)}%.`;
                },
                show: true,
                status: true
            },
            {
                // id: 9
                ordering: 9,
                get name() {
                    return `What once was part of a bygone era...`;
                },
                get desc() {
                    return `Do a PR2 reset ${format(4)} times in total.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.main.pr2.bestEver, 4);
                },
                reward: ``,
                get show() {
                    return Decimal.gte(player.value.gameProgress.main.prai.bestEver, 9.5);
                },
                status: true
            },
            {
                // id: 10
                ordering: 10,
                get name() {
                    return `Going even further beyond!`;
                },
                get desc() {
                    return `Do a PR2 reset ${format(11)} times.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.main.pr2.bestEver, 11);
                },
                reward: ``,
                get show() {
                    return Decimal.gte(player.value.gameProgress.main.prai.bestEver, 9.5);
                },
                status: true
            },
            {
                // id: 11
                ordering: 11,
                get name() {
                    return `A prelude 1`;
                },
                get desc() {
                    return `Have ${format(1e45)} points without buying Upgrade 3.`;
                },
                get cond() {
                    return (
                        Decimal.gte(player.value.gameProgress.main.points, 1e45) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0)
                    );
                },
                reward: ``,
                get show() {
                    return Decimal.gte(player.value.gameProgress.main.prai.bestEver, 9.5);
                },
                get status() {
                    return Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0)
                        ? true
                        : `Failed due to having Upgrade 3`;
                }
            },
            {
                // id: 12
                ordering: 12,
                get name() {
                    return `A prelude 2`;
                },
                get desc() {
                    return `Have ${format(1e63)} points without buying Upgrade 2 and 3.`;
                },
                get cond() {
                    return (
                        Decimal.gte(player.value.gameProgress.main.points, 1e63) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0)
                    );
                },
                get reward() {
                    return `Increase UP2's base by +${format(0.05, 3)}.`;
                },
                get show() {
                    return ifAchievement(0, 11);
                },
                get status() {
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
                }
            },
            {
                // id: 13
                ordering: 13,
                get name() {
                    return `A prelude 3`;
                },
                get desc() {
                    return `Have ${format(1e90)} points without buying Upgrades 1, 2, and 3 in the current PRai run.`;
                },
                get cond() {
                    return (
                        Decimal.gte(player.value.gameProgress.main.points, 1e90) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[0].bought, 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[2].bought, 0)
                    );
                },
                reward: ``,
                get show() {
                    return ifAchievement(0, 12);
                },
                get status() {
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
                }
            },
            {
                // id: 14
                ordering: 14,
                get name() {
                    return `Enhancing 1`;
                },
                get desc() {
                    return `Make Upgrade 1's base reach ×${format(1.6, 3)}`;
                },
                get cond() {
                    return Decimal.gte(tmp.value.main.upgrades[0].effectBase, 1.6);
                },
                get reward() {
                    return `PR2's cost base is decreased from ${format(10)} to ${format(9)}.`;
                },
                get show() {
                    return Decimal.gte(player.value.gameProgress.main.pr2.bestEver, 5);
                },
                status: true
            },
            {
                // id: 15
                ordering: 15,
                get name() {
                    return `Enhancing 2`;
                },
                get desc() {
                    return `Make Upgrade 1's base reach ×${format(2, 3)}`;
                },
                get cond() {
                    return Decimal.gte(tmp.value.main.upgrades[0].effectBase, 2);
                },
                reward: ``,
                get show() {
                    return ifAchievement(0, 14);
                },
                status: true
            },
            {
                // id: 16
                ordering: 16,
                get name() {
                    return `Enhancing 3`;
                },
                get desc() {
                    return `Make Upgrade 1's base reach ×${format(3, 3)}`;
                },
                get cond() {
                    return Decimal.gte(tmp.value.main.upgrades[0].effectBase, 3);
                },
                reward: ``,
                get show() {
                    return ifAchievement(0, 15);
                },
                status: true
            },
            {
                // id: 17
                ordering: 17,
                get name() {
                    return `Apparently Upgrades 4-6 are all you need.`;
                },
                get desc() {
                    return `Get ${format(1e30)} points without having Upgrades 1-3 and without more than ${format(10)} PRai for this Kuaraniai run.`;
                },
                autoComplete: false,
                get cond() {
                    return Decimal.lte(player.value.gameProgress.main.upgrades[0].boughtInReset[2], 0) &&
                    Decimal.lte(player.value.gameProgress.main.upgrades[1].boughtInReset[2], 0) &&
                    Decimal.lte(player.value.gameProgress.main.upgrades[2].boughtInReset[2], 0) &&
                    Decimal.lte(player.value.gameProgress.main.prai.totals[2]!, 10) &&
                    Decimal.gte(player.value.gameProgress.main.best[2]!, 1e30);
                },
                get reward() {
                    return `PRai's effect is slightly boosted by ×${format(this.eff!, 2)} based off your time in PRai.`;
                },
                get eff() {
                    return Decimal.max(player.value.gameProgress.main.prai.timeInPRai, 1)
                        .sqrt()
                        .pow_base(1.5)
                        .min(10);
                },
                get show() {
                    return Decimal.gte(player.value.gameProgress.main.pr2.bestEver, 10);
                },
                get status() {
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
                },
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 18
                ordering: 18,
                get name() {
                    return `You can't escape the IRS, fool!`;
                },
                get desc() {
                    return `Reach ${format(Number.MAX_VALUE)} points.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.main.bestEver, Number.MAX_VALUE);
                },
                reward: ``,
                get show() {
                    return Decimal.gte(player.value.gameProgress.main.bestEver, 1e100);
                },
                status: true
            },
            {
                // id: 19
                ordering: 19,
                get name() {
                    return `Ordered`;
                },
                get desc() {
                    return `Every upgrade from 1-6 must have #×${format(10)} of themselves. (Upgrade 1 must be bought ${format(10)} times, Upgrade 2 ${format(20)} times, etc.)`;
                },
                get cond() {
                    return Decimal.eq(player.value.gameProgress.main.upgrades[0].bought, 10) &&
                        Decimal.eq(player.value.gameProgress.main.upgrades[1].bought, 20) &&
                        Decimal.eq(player.value.gameProgress.main.upgrades[2].bought, 30) &&
                        Decimal.eq(player.value.gameProgress.main.upgrades[3].bought, 40) &&
                        Decimal.eq(player.value.gameProgress.main.upgrades[4].bought, 50) &&
                        Decimal.eq(player.value.gameProgress.main.upgrades[5].bought, 60)
                },
                reward: ``,
                get show() {
                    return player.value.gameProgress.unlocks.col;
                },
                get status() {
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
                },
                extra: `Hint: What resets Upgrades 4-6?`
            },
            {
                // id: 20
                ordering: 20,
                get name() {
                    return `Jumping to conclusions.`;
                },
                get desc() {
                    return `Reach ${format(1e100)} PRai while doing no more than ${format(5)} PRai resets.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.main.prai.amount, 1e100) && Decimal.lte(player.value.gameProgress.main.prai.times, 5);
                },
                reward: ``,
                get show() {
                    return player.value.gameProgress.unlocks.col;
                },
                get status() {
                    return Decimal.lte(player.value.gameProgress.main.prai.times, 5) ? true : `Failed due to having PRai reset ${format(player.value.gameProgress.main.prai.times)} times.`
                }
            },
            {
                // id: 21
                ordering: 21,
                get name() {
                    return `Reach Infinity, again!`;
                },
                get desc() {
                    return `Reach ${format(Decimal.pow(Number.MAX_VALUE, 2))} Points.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.main.points, Decimal.pow(Number.MAX_VALUE, 2));
                },
                reward: ``,
                get show() {
                    return player.value.gameProgress.unlocks.col;
                },
                status: true,
            },
            {
                // id: 22
                ordering: 22,
                get name() {
                    return `I wonder why this wasn't here for so long?`;
                },
                get desc() {
                    return `Have over ${format(10)} effective Upgrade 1s without buying any.`;
                },
                get cond() {
                    return Decimal.gt(tmp.value.main.upgrades[0].effective, 10) && Decimal.eq(player.value.gameProgress.main.upgrades[0].bought, 0);
                },
                reward: ``,
                get show() {
                    return player.value.gameProgress.unlocks.kproofs === undefined ? false : player.value.gameProgress.unlocks.kproofs.main;
                },
                get status() {
                    return Decimal.eq(player.value.gameProgress.main.upgrades[0].bought, 0) ? true : `Failed due to having bought Upgrade 1.`
                }
            },
            // {
            //     // id: 23
            //     ordering: 23,
            //     get name() {
            //         return `There are 2 constants in life. Death, and Taxes. Evade one of them.`;
            //     },
            //     get desc() {
            //         return `Delay the tax man by ${format(1e50)}×!`;
            //     },
            //     get cond() {
            //         return getSCSLAttribute('points', false)[0].start.gte(Decimal.mul(Number.MAX_VALUE, 1e50));
            //     },
            //     reward: ``,
            //     get show() {
            //         return player.value.gameProgress.unlocks.kproofs === undefined ? false : player.value.gameProgress.unlocks.kproofs.main;
            //     },
            //     get status() {
            //         return `You need to evade your taxes by ${format(Decimal.mul(Number.MAX_VALUE, 1e50).div(getSCSLAttribute('points', false)[0].start), 2)}× more! (In layman's terms, delay the points softcap.)`
            //     }
            // },
        ],
        get rewAll() {
            return `Point gain is increased by ${format(this.eff.sub(1).mul(100), 2)}%. (×1.1 per main achievement)`;
        },
        get eff() {
            let eff = D(1.1);
            eff = Decimal.pow(eff, player.value.gameProgress.achievements[0].length);
            return eff;
        }
    },
    {
        type: "kua",
        get show() {
            return Decimal.gte(player.value.gameProgress.main.pr2.bestEver, 10);
        },
        list: [
            {
                // id: 0
                ordering: 0,
                get name() {
                    return `What even is this thing? Why do I have so little of it?`;
                },
                get desc() {
                    return `Convert all of your PRai to Kuaraniai.`;
                },
                get cond() {
                    return Decimal.gt(player.value.gameProgress.kua.amount, 0);
                },
                get reward() {
                    return `Your number generation is increased by ${format(1e2)}%.`;
                },
                get show() {
                    return player.value.gameProgress.unlocks.kua;
                },
                status: true
            },
            {
                // id: 1
                ordering: 1,
                get name() {
                    return `Stockpiler`;
                },
                get desc() {
                    return `Save up ${format(1e12)} PRai on a Kuaraniai run.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.main.prai.amount, 1e12);
                },
                get reward() {
                    return `UP2 also boosts number gain at a reduced rate. Currently: ×${format(this.eff!, 2)}`;
                },
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
                get show() {
                    return player.value.gameProgress.unlocks.kua;
                },
                status: true
            },
            {
                // id: 2
                ordering: 2,
                get name() {
                    return `Gathering Pieces Together`;
                },
                get desc() {
                    return `Have ${format(0.01, 3)} Kuaraniai.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.kua.amount, 0.01);
                },
                reward: ``,
                get show() {
                    return player.value.gameProgress.unlocks.kua;
                },
                status: true
            },
            {
                // id: 3
                ordering: 3,
                get name() {
                    return `You like making progress, don't you?`;
                },
                get desc() {
                    return `Have ${format(0.1, 2)} Kuaraniai.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.kua.amount, 0.095);
                },
                get reward() {
                    return `Kuaraniai gain is increased by ${format(50)}%, and KShards produce another point multiplier. Currently: ×${format(this.eff!, 2)}`;
                },
                get eff() {
                    return Decimal.gte(player.value.gameProgress.kua.kshards.totals[3]!, 5e11)
                        ? Decimal.max(player.value.gameProgress.kua.kshards.totals[3]!, 0).div(50).root(5).mul(10000)
                        : Decimal.max(player.value.gameProgress.kua.kshards.totals[3]!, 0).mul(8).add(1).sqrt().sub(1).div(2).add(1);
                },
                get show() {
                    return player.value.gameProgress.unlocks.kua;
                },
                status: true
            },
            {
                // id: 4
                ordering: 4,
                get name() {
                    return `This upgrade was unnecessary`;
                },
                get desc() {
                    return `Have ${format(1e80)} points without Upgrade 3 in the current Kuaraniai run.`;
                },
                autoComplete: false,
                get cond() {
                    return (
                        Decimal.gte(player.value.gameProgress.main.points, 1e80) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[2].boughtInReset[2], 0)
                    );
                },
                get reward() {
                    return `Upgrade 3 gets a small ${format(1, 2)}% boost to effectiveness.`;
                },
                get show() {
                    return player.value.gameProgress.unlocks.kua;
                },
                get status() {
                    return Decimal.lte(player.value.gameProgress.main.upgrades[2].boughtInReset[2], 0)
                        ? true
                        : `Failed due to having Upgrade 3.`;
                },
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 5
                ordering: 5,
                get name() {
                    return `Quite interesting`;
                },
                get desc() {
                    return `Get ${format(1e2)} Upgrade 1 without having over ${format(10)} PRai.`;
                },
                get cond() {
                    return (
                        Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 100) &&
                        Decimal.lte(player.value.gameProgress.main.prai.totals[2]!, 10)
                    );
                },
                get reward() {
                    return `Upgrade 1's effectiveness is slightly increased based off of your PRai. Currently: ${format(this.eff!.sub(1).mul(1e2), 3)}%`;
                },
                get eff() {
                    let eff = D(player.value.gameProgress.main.prai.amount);
                    if (eff.gte(1e216)) {
                        eff = eff.log10().log(6).div(300).add(1)
                    } else {
                        eff = eff.max(10).log10().cbrt().sub(1).div(500).add(1);
                    }
                    return eff;
                },
                get show() {
                    return player.value.gameProgress.unlocks.kua;
                },
                get status() {
                    return Decimal.lte(player.value.gameProgress.main.prai.amount, 10)
                        ? true
                        : `Failed due to having more than ${format(10)} PRai.`;
                }
            },
            {
                // id: 6
                ordering: 6,
                get name() {
                    return `Actually, these are useless!`;
                },
                get desc() {
                    return `Reach ${format(1e20)} PRai without Upgrades 1, 2, and 3 in the current Kuaraniai run.`;
                },
                autoComplete: false,
                get cond() {
                    return (
                        Decimal.gte(player.value.gameProgress.main.prai.best[2]!, 1e20) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[0].boughtInReset[2], 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].boughtInReset[2], 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[2].boughtInReset[2], 0)
                    );
                },
                get reward() {
                    return `All upgrades' cost scaling is slightly slowed down based off of your time in this PRai reset. Currently: ${formatPerc(this.eff!, 3)} slower`;
                },
                get eff() {
                    let eff = Decimal.div(player.value.gameProgress.main.prai.timeInPRai, 60);
                    eff = eff.div(eff.mul(198).add(1)).add(1);
                    return eff;
                },
                get show() {
                    return player.value.gameProgress.unlocks.kua;
                },
                get status() {
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
                },
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 7
                ordering: 7,
                get name() {
                    return `This softcap won't hurt me!`;
                },
                get desc() {
                    return `Upgrade 2's effect must reach /${format(1e17)}.`;
                },
                get cond() {
                    return Decimal.gte(tmp.value.main.upgrades[1].effect, 1e17);
                },
                get reward() {
                    return `Upgrade 2's softcap is ${format(5)}% weaker.`;
                },
                get show() {
                    return player.value.gameProgress.unlocks.kua;
                },
                status: true
            },
            {
                // id: 8
                ordering: 8,
                get name() {
                    return `Make this obsolete, I dare you. >:3`;
                },
                get desc() {
                    return `Gain ${format(2.5, 2)} Kuaraniai without doing a single PRai reset.`;
                },
                get cond() {
                    return (
                        Decimal.gte(tmp.value.kua.pending, 2.5) &&
                        Decimal.lte(player.value.gameProgress.main.prai.times, 0)
                    );
                },
                autoComplete: false,
                get reward() {
                    return `Increase PRai's gain exponent from ^${format(1 / 3, 3)} to ^${format(0.335, 3)}`;
                },
                get show() {
                    return player.value.gameProgress.unlocks.kua;
                },
                get status() {
                    return Decimal.lte(player.value.gameProgress.main.prai.times, 0)
                        ? true
                        : `Failed due to having reset PRai ${format(player.value.gameProgress.main.prai.times)} times.`;
                },
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 9
                ordering: 9,
                get name() {
                    return `oh we might make this obsolete`;
                },
                get desc() {
                    return `Have ${format(300)} Upgrade 1 without having more than ${format(10)} PRai.`;
                },
                autoComplete: false,
                get cond() {
                    return (
                        Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 300) &&
                        Decimal.lte(player.value.gameProgress.main.prai.amount, 10)
                    );
                },
                reward: ``,
                get show() {
                    return player.value.gameProgress.unlocks.kua;
                },
                get status() {
                    return Decimal.lte(player.value.gameProgress.main.prai.amount, 10)
                        ? true
                        : `Failed due to having more than ${format(10)} PRai.`;
                },
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 10
                ordering: 10,
                get name() {
                    return `"End-game" pass filter`;
                },
                get desc() {
                    return `Reach ${format(1e80)} points without buying Upgrades 1, 2, and 3 in the current Kuaraniai run.`;
                },
                autoComplete: false,
                get cond() {
                    return (
                        Decimal.gte(player.value.gameProgress.main.best[2]!, 1e80) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[0].boughtInReset[2], 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].boughtInReset[2], 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[2].boughtInReset[2], 0)
                    );
                },
                get reward() {
                    return `Every upgrades' base is increased by ${format(1, 2)}%.`;
                },
                get show() {
                    return player.value.gameProgress.unlocks.kua;
                },
                get status() {
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
                },
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 11
                ordering: 11,
                get name() {
                    return `I don't think this does much`;
                },
                get desc() {
                    return `Reach ${format(300)} Upgrade 1 without Upgrade 2 in the current Kuaraniai run.`;
                },
                get cond() {
                    return (
                        Decimal.gte(player.value.gameProgress.main.upgrades[0].bought, 300) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].boughtInReset[2], 0)
                    );
                },
                autoComplete: false,
                get reward() {
                    return `Upgrade 2 also boosts PRai gain at a drastically reduced rate. Currently: ×${format(this.eff!, 2)}`;
                },
                get eff() {
                    let eff = Decimal.max(tmp.value.main.upgrades[1].effect, 1e10);
                    if (getKuaUpgrade("p", 7)) {
                        eff = eff.root(3).max(1e10);
                    }
                    eff = eff.div(1e10).pow(0.015);
                    return eff;
                },
                get show() {
                    return player.value.gameProgress.unlocks.kua;
                },
                get status() {
                    return Decimal.lte(player.value.gameProgress.main.upgrades[1].bought, 0)
                        ? true
                        : `Failed due to having Upgrade 2.`;
                },
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 12
                ordering: 12,
                get name() {
                    return `What if the upgrades didn't chain boost each other and instead also directly boosted the thing`;
                },
                get desc() {
                    return `Get ${format(1e35)} points without Upgrades 1 and 2 in the current Kuaraniai run.`;
                },
                get cond() {
                    return (
                        Decimal.gte(player.value.gameProgress.main.best[2]!, 1e35) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[0].boughtInReset[2], 0) &&
                        Decimal.lte(player.value.gameProgress.main.upgrades[1].boughtInReset[2], 0)
                    );
                },
                autoComplete: false,
                get reward() {
                    return `Achievement "Stockpiler" is boosted.`;
                },
                get show() {
                    return player.value.gameProgress.unlocks.kua;
                },
                get status() {
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
                },
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 13
                ordering: 13,
                get name() {
                    return `speedrun? :o`;
                },
                get desc() {
                    return `Reach ${format(1e260)} points in the first ${format(5, 2)} seconds in a Kuaraniai run.`;
                },
                get cond() {
                    return (
                        Decimal.gte(player.value.gameProgress.main.points, 1e260) &&
                        Decimal.lte(player.value.gameProgress.kua.timeInKua, 5)
                    );
                },
                get reward() {
                    return `Point gain is boosted but it decays over the next ${format(60, 2)} seconds. Currently: ×${format(this.eff!, 2)}`;
                },
                get eff() {
                    let eff = Decimal.max(player.value.gameProgress.main.prai.timeInPRai, 5).min(60);
                    eff = Decimal.pow(1e2, Decimal.sub(55, eff.sub(5)).div(0.55).div(1e2).pow(2));
                    return eff;
                },
                get show() {
                    return player.value.gameProgress.unlocks.kua;
                },
                get status() {
                    return Decimal.lte(player.value.gameProgress.kua.timeInKua, 5)
                        ? true
                        : `Failed due to taking ${formatTime(player.value.gameProgress.kua.timeInKua)} / ${formatTime(5)} in the current Kuaraniai run.`;
                }
            },
            {
                // id: 14
                ordering: 14,
                get name() {
                    return `imagine PR3 as "tiers" if PR2 is "ranks"`;
                },
                get desc() {
                    return `Reach ${format(25)} PR2.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.main.pr2.bestEver, 25);
                },
                reward: ``,
                get show() {
                    return player.value.gameProgress.unlocks.kua;
                },
                status: true
            },
            {
                // id: 15
                ordering: 15,
                get name() {
                    return `Stockpiler 2`;
                },
                get desc() {
                    return `Save up ${format(1e85)} PRai on a Kuaraniai run.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.main.prai.bestEver, 1e85);
                },
                get reward() {
                    return `Achievement "Stockpiler" is boosted again.`;
                },
                get show() {
                    return player.value.gameProgress.unlocks.kua;
                },
                status: true
            },
            {
                // id: 16
                ordering: 16,
                get name() {
                    return `:softcapkisser:`;
                },
                get desc() {
                    return `Get ${format(1e7)} Kuaraniai.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.kua.amount, 1e7);
                },
                reward: ``,
                get show() {
                    return player.value.gameProgress.unlocks.kua;
                },
                status: true
            },
            {
                // id: 17
                ordering: 17,
                get name() {
                    return `Collector`;
                },
                get desc() {
                    return `Buy 10 KShard and KPower upgrades.`;
                },
                get cond() {
                    return player.value.gameProgress.kua.kshards.upgrades >= 10 && player.value.gameProgress.kua.kpower.upgrades >= 10;
                },
                reward: ``,
                get show() {
                    return player.value.gameProgress.unlocks.col;
                },
                status: true
            },
            {
                // id: 18
                ordering: 18,
                get name() {
                    return `Don't need em.`;
                },
                get desc() {
                    return `Reach ${format(1e130)} points while buying only KShard or KPower upgrades.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.main.points, 1e130) &&
                        (player.value.gameProgress.kua.upgrades === 0 &&
                        (player.value.gameProgress.kua.kshards.upgrades >= 0 && player.value.gameProgress.kua.kpower.upgrades === 0) ||
                        (player.value.gameProgress.kua.kpower.upgrades >= 0 && player.value.gameProgress.kua.kshards.upgrades === 0));
                },
                autoComplete: false,
                reward: ``,
                get show() {
                    return player.value.gameProgress.unlocks.col;
                },
                get status() {
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
                },
                extra: `You must do a Kuaraniai reset to earn this achievement!`
            },
            {
                // id: 19
                ordering: 19,
                get name() {
                    return `Wait what?`;
                },
                get desc() {
                    return `Have your KProof amount higher than your points.`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.kua.proofs.amount, player.value.gameProgress.main.points);
                },
                reward: ``,
                get show() {
                    return player.value.gameProgress.unlocks.kproofs === undefined ? false : player.value.gameProgress.unlocks.kproofs.main;
                },
                status: true
            },
        ],
        get rewAll() {
            return `Kuaraniai's effects are ${format(this.eff.sub(1).mul(100), 2)}% stronger. (+1% per Kuaraniai achievement)`;
        },
        get eff() {
            let eff = D(0.01);
            eff = Decimal.mul(eff, player.value.gameProgress.achievements[1].length);
            eff = eff.add(1);
            return eff;
        }
    },
    {
        type: "col",
        get show() {
            return player.value.gameProgress.unlocks.col;
        },
        list: [
            {
                // id: 0
                ordering: 0,
                get name() {
                    return `Does every incremental game need to have a challenge like this? Probably.`;
                },
                get desc() {
                    return `Complete Colosseum Challenge 'No Kuaraniai.'`;
                },
                get cond() {
                    return Decimal.gte(player.value.gameProgress.col.completed.nk, 1);
                },
                reward: ``,
                get show() {
                    return player.value.gameProgress.unlocks.col;
                },
                status: true
            },
            {
                // id: 1
                ordering: 1,
                get name() {
                    return `In a time crunch.`;
                },
                get desc() {
                    return `Fully complete a challenge with less than ${formatTime(10)} to spare.`;
                },
                get cond() {
                    return Decimal.lte(player.value.gameProgress.col.time, 10);
                },
                autoComplete: false,
                get reward() {
                    return `PRai gain is multiplied by ${format(5)}×.`;
                },
                get show() {
                    return player.value.gameProgress.unlocks.col;
                },
                status: true
            },
            {
                // id: 2
                ordering: 2,
                get name() {
                    return `this challenge is only gonna get more difficult`;
                },
                get desc() {
                    return `Complete "Sabotaged Upgrades" 5 times.`;
                },
                get cond() {
                    return Decimal.gte(timesCompleted("su"), 5);
                },
                reward: ``,
                get show() {
                    return player.value.gameProgress.unlocks.col;
                },
                status: true
            },
            {
                // id: 3
                ordering: 3,
                get name() {
                    return `Ruining the point`;
                },
                get desc() {
                    return `Complete "Sabotaged Upgrades" on difficulty 1 without buying any upgrade.`;
                },
                get cond() {
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
                },
                autoComplete: false,
                reward: ``,
                get show() {
                    return player.value.gameProgress.unlocks.col;
                },
                get status() {
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
                },
                extra: `Complete the challenge to get this achievement!`
            },
            {
                // id: 4
                ordering: 4,
                get name() {
                    return `There wasn't any point in doing that.`;
                },
                get desc() {
                    return `Reach ${format(1e100)} points in No Kuaraniai.`;
                },
                get cond() {
                    return (
                        player.value.gameProgress.inChallenge.nk.overall &&
                        Decimal.gte(player.value.gameProgress.main.best[3]!, 1e100)
                    );
                },
                reward: ``,
                get show() {
                    return player.value.gameProgress.unlocks.col;
                },
                status: true
            },
            {
                // id: 5
                ordering: 5,
                get name() {
                    return `smort`;
                },
                get desc() {
                    return `Reach Level ${format(1e2)} in Dotgenous.`;
                },
                get cond() {
                    return Decimal.gte(getColResLevel(0), 100);
                },
                reward: ``,
                get show() {
                    return player.value.gameProgress.unlocks.col;
                },
                status: true
            },
            {
                // id: 6
                ordering: 6,
                get name() {
                    return `This is weird wtf`;
                },
                get desc() {
                    return `Reach a PB of ${format(1e35)} in Inverted Mechanics.`;
                },
                get cond() {
                    return Decimal.gte(timesCompleted('im'), 1e35);
                },
                reward: ``,
                get show() {
                    return player.value.gameProgress.unlocks.col;
                },
                status: true
            },
        ],
        get rewAll() {
            return `Points gain in colosseum challenges are increased the lower your time is. (100%: ^${format(this.eff.mul(0.25).add(1), 3)}, 50%: ^${format(this.eff.mul(0.5).add(1), 3)}, 0%: ^${format(this.eff.add(1), 3)})`;
        },
        get eff() {
            let eff = D(0.004);
            eff = Decimal.mul(eff, player.value.gameProgress.achievements[2].length);
            return eff;
        }
    },
    // {
    //     type: "tax",
    //     get show() {
    //         return player.value.gameProgress.unlocks.tax;
    //     },
    //     list: [
    //         {
    //             // id: 0
    //             ordering: 0,
    //             get name() {
    //                 return `The same issue as before, why so little of it?!`;
    //             },
    //             get desc() {
    //                 return `Obtain at least ${format(1)} KBlessing.`;
    //             },
    //             get cond() {
    //                 return Decimal.gte(player.value.gameProgress.kua.blessings.amount, 1);
    //             },
    //             reward: ``,
    //             show: true,
    //             status: true
    //         },
    //     ],
    //     get rewAll() {
    //         return `KBlessings gain is increased by ${format(this.eff.sub(1).mul(100), 2)}%. (×1.051 per KB achievement)`;
    //     },
    //     get eff() {
    //         let eff = D(1.05);
    //         eff = Decimal.pow(eff, player.value.gameProgress.achievements[3].length);
    //         return eff;
    //     }
    // }
];

export const setAchievement = (type: number, id: number) => {
    if (!ifAchievement(type, id) && ACHIEVEMENT_DATA[type].list[id].cond) {
        player.value.gameProgress.achievements[type].push(id);
        spawnPopup(0, ACHIEVEMENT_DATA[type].list[id].desc, ACHIEVEMENT_DATA[type].list[id].name, 3, `#FFFF00`);
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
    if (Decimal.isNaN(ACHIEVEMENT_DATA[type].list[id].eff!) || ACHIEVEMENT_DATA[type].list[id].eff! === undefined) {
        throw new Error(`Achievement ${type}, ${id}`);
    }
    return ACHIEVEMENT_DATA[type].list[id].eff!;
};

export const getAchievementData = (type: number, id: number) => {
    return ACHIEVEMENT_DATA[type].list[id];
};

export const ifAchievement = (type: number, id: number) => {
    if (tmp.value.achievementList.length === 0) {
        // for some reason, Vue is not letting tmp initalize tmp.value.achievementList before it draws
        fixAchievements();
    }
    return player.value.gameProgress.achievements[type].includes(id);
};
