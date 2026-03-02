import { D } from "@/calc";
import { player } from "@/main";
import Decimal, { type DecimalSource } from "break_eternity.js";
import { getColChalDisplayedDifficulty, getColChalSelectedCond, getColChalSelectedRew, timesCompleted } from "./Game_ColChalHandler";
import { format } from "@/format";
import { computed, type ComputedRef } from "vue";

export type challengeIDList = "nk" | "su" | "df" | "im" | "dc" | 'sn';
export const challengeIDListArr: Array<challengeIDList> = ["nk", "su", "df", "im", "dc", "sn"];

export type Challenge = {
    nk: ChallengeData,
    su: ChallengeData,
    df: ChallengeData,
    im: ChallengeData,
    dc: ChallengeData,
    sn: ChallengeData
};

export type colChallenges = {
    nk: colChallengeData,
    su: colChallengeData,
    df: colChallengeData,
    im: colChallengeData,
    dc: colChallengeData,
    sn: colChallengeData
};

export type ChallengeData = {
    name: string,
    goalDesc: string,
    entered: boolean,
    trapped: boolean,
    overall: boolean,
    depths: DecimalSource,
    optionalDiff: DecimalSource,
    enteredDiff: DecimalSource
};

export type colChallengeData = {
    type: number,
    num: number,
    id: challengeIDList,
    layer: number,
    name: string,
    labelEff: ComputedRef<string>,
    labelRew: ComputedRef<string>,
    goal: ComputedRef<Decimal>,
    resourceReq?: ComputedRef<DecimalSource>,
    goalDesc: ComputedRef<string>,
    desc: ComputedRef<string>,
    reward: ComputedRef<string>,
    cap: Decimal,
    show: ComputedRef<boolean>,
    canComplete: ComputedRef<boolean>,
    progress: ComputedRef<Decimal>,
    progDisplay: ComputedRef<string>,
    type1ChalCond?: Array<Array<Decimal>>,
    type1ChalEff?: Array<Array<Decimal>>,
    // there's no type2Cond because that's gonna screw things up when stuff goes retroactively, see the "reducing points by ^0.5 but it overflows first tick and screws up" issue
    type2ChalEff?: ComputedRef<Array<Decimal>>,
    // use type 3 when you want a repeatable challenge to be endless at some point
    type3ChalCond?: (x: DecimalSource) => Array<Decimal>,
    type3ChalEff?: (x: DecimalSource) => Array<Decimal>
};

/**
 * type
 * 0 = One-Time only
 * 1 = Can complete multiple times (Decimal)
 * 2 = Continuous (Decimal, best)
 *
 * layer
 * 0 = kua (it probably should be 2 but there should NOT be a col challenge for anything earlier than 2 because then it will just trivialize the challenge)
 * 1 = tax (skipping col)
 */
export const COL_CHALLENGES: colChallenges = {
    nk: {
        type: 0,
        num: 1,
        id: "nk",
        layer: 0,
        name: `No Kuaraniai`,
        labelEff: computed(() => { return `${COL_CHALLENGES.nk.name} ×${format(timesCompleted('nk'))}`; }),
        labelRew: computed(() => { return `${COL_CHALLENGES.nk.name} Comp. ×${format(timesCompleted('nk'))}`; }),
        goal: computed(() => { return D(1e25); }),
        goalDesc: computed(() => {
            return `Reach ${format(COL_CHALLENGES.nk.goal.value)} Points.`;
        }),
        desc: computed(() => { return `All Kuaraniai resources and upgrades are disabled.`; }),
        reward: computed(() => { return `Unlock another tab in Colosseum, and unlock another challenge.`; }),
        cap: D(1),
        show: computed(() => { return true; }),
        canComplete: computed(() => {
            return Decimal.gte(player.value.prog.main.bestInCol, COL_CHALLENGES.nk.goal.value);
        }),
        progress: computed(() => {
            return Decimal.max(player.value.prog.main.bestInCol, 1)
                .log10()
                .div(COL_CHALLENGES.nk.goal.value.log10())
                .min(1);
        }),
        progDisplay: computed(() => {
            return `${format(player.value.prog.main.bestInCol)} / ${format(COL_CHALLENGES.nk.goal.value)} (${format(COL_CHALLENGES.nk.progress.value.mul(100), 3)}%)`;
        })
    },
    su: {
        type: 1,
        num: 2,
        id: "su",
        layer: 0,
        name: `Sabotaged Upgrades`,
        labelEff: computed(() => { return `${COL_CHALLENGES.su.name} ×${format(timesCompleted('su'))}`; }),
        labelRew: computed(() => { return `${COL_CHALLENGES.su.name} Comp. ×${format(timesCompleted('su'))}`; }),
        goal: computed(() => {
            return [
                D(1e24),
                D(1e33),
                D(1e40),
                D(1e50),
                D(1e65),
                D(1e80),
                D(1e100),
                D(1e140),
                D(1e200),
                D(1e300),
                D(Infinity)
            ][new Decimal(getColChalDisplayedDifficulty("su")).toNumber()];
        }),
        goalDesc: computed(() => {
            return `Reach ${format(COL_CHALLENGES.su.goal.value)} Points.`;
        }),
        desc: computed(() => {
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), COL_CHALLENGES.su.cap)) {
                return `winner you complete it all`;
            }
            let txt = `<li>Your PPS is restricted to only Upgrades, PRai, PR2, and Dotgenous.</li>`;
            txt += `<li>All upgrades scale ${format(getColChalSelectedCond(COL_CHALLENGES.su.id, 0), 1)}× faster.</li>`;
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), 1)) {
                txt += `<li>Upgrade 1's base is reduced by -${format(getColChalSelectedCond(COL_CHALLENGES.su.id, 1), 3)}.</li>`;
            }
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), 4)) {
                txt += `<li>Upgrade 2's effect is raised ^${format(getColChalSelectedCond(COL_CHALLENGES.su.id, 2), 2)} to the exponent.</li>`;
            }
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), 7)) {
                txt += `<li>Upgrades 4, 5, and 6 are disabled.</li>`;
            }
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), 8)) {
                txt += `<li>PRai's effect is raised to the ^${format(getColChalSelectedCond(COL_CHALLENGES.su.id, 3), 2)}.</li>`;
            }
            return txt;
        }),
        reward: computed(() => {
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), COL_CHALLENGES.su.cap)) {
                return `winner you complete it all`;
            }
            let txt = `<li>Colosseum Power weakens the Upgrade 1 and 2 softcaps. (Effectiveness: ${format(getColChalSelectedRew(COL_CHALLENGES.su.id, 0).mul(100), 1)}%)</li>`;
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), 3)) {
                txt += `<li>Upgrade 1's Hyper scaling is ${format(Decimal.sub(1, getColChalSelectedRew(COL_CHALLENGES.su.id, 1)).mul(100), 1)}% weaker.</li>`;
            }
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), 5)) {
                txt += `<li>Upgrade 2's base is increased by +${format(getColChalSelectedRew(COL_CHALLENGES.su.id, 2).sub(1).mul(100))}%.</li>`;
            }
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), 7)) {
                txt += `<li>Point taxation starts ${format(getColChalSelectedRew(COL_CHALLENGES.su.id, 3))}× later.</li>`;
            }
            if (Decimal.eq(getColChalDisplayedDifficulty("su"), 0)) {
                txt += `<li>Unlock a new challenge.</li>`;
            }
            return txt;
        }),
        type1ChalCond: [
            [D(1.5), D(0),     D(1),    D(1)],    // difficulty 1
            [D(2),   D(0.1),   D(1),    D(1)],    // difficulty 2
            [D(2.5), D(0.2),   D(1),    D(1)],    // difficulty 3
            [D(3),   D(0.25),  D(1),    D(1)],    // difficulty 4
            [D(4),   D(0.3),   D(0.95), D(1)],    // difficulty 5
            [D(5),   D(0.35),  D(0.9),  D(1)],    // difficulty 6
            [D(7.5), D(0.4),   D(0.85), D(1)],    // difficulty 7
            [D(10),  D(0.425), D(0.8),  D(1)],    // difficulty 8
            [D(15),  D(0.45),  D(0.75), D(0.75)], // difficulty 9
            [D(25),  D(0.475), D(0.7),  D(0.5)],  // difficulty 10
            [D(40),  D(0.5),   D(0.65), D(1/3)],  // difficulty 11
        ],
        type1ChalEff: [
            [D(0),     D(1),     D(1),     D(1)],    // reward 0
            [D(0.025), D(1),     D(1),     D(1)],    // reward 1
            [D(0.05),  D(1),     D(1),     D(1)],    // reward 2
            [D(0.075), D(1),     D(1),     D(1)],    // reward 3
            [D(0.1),   D(0.975), D(1),     D(1)],    // reward 4
            [D(0.15),  D(0.95),  D(1),     D(1)],    // reward 5
            [D(0.25),  D(0.925), D(1.05),  D(1)],    // reward 6
            [D(0.35),  D(0.9),   D(1.1),   D(1)],    // reward 7
            [D(0.5),   D(0.867), D(1.15),  D(100)],  // reward 8
            [D(0.75),  D(0.833), D(1.25),  D(1e6)],  // reward 9
            [D(1),     D(0.8),   D(1.35),  D(1e10)], // reward 10
            [D(1),     D(0.8),   D(1.35),  D(1e10)], // reward 11 (repeat cuz cap)
        ],
        cap: D(10),
        show: computed(() => {
            return Decimal.gte(timesCompleted("nk"), 1);
        }),
        canComplete: computed(() => {
            return Decimal.gte(player.value.prog.main.bestInCol, COL_CHALLENGES.su.goal.value);
        }),
        progress: computed(() => {
            return Decimal.max(player.value.prog.main.bestInCol, 1)
                .log10()
                .div(COL_CHALLENGES.su.goal.value.log10())
                .min(1);
        }),
        progDisplay: computed(() => {
            return `${format(player.value.prog.main.bestInCol)} / ${format(COL_CHALLENGES.su.goal.value)} (${format(COL_CHALLENGES.su.progress.value.mul(100), 3)}%)`;
        })
    },
    df: {
        type: 0,
        num: 3,
        id: "df",
        layer: 0,
        name: `Decaying Feeling`,
        labelEff: computed(() => { return `${COL_CHALLENGES.df.name} ×${format(timesCompleted('df'))}`; }),
        labelRew: computed(() => { return `${COL_CHALLENGES.df.name} Comp. ×${format(timesCompleted('df'))}`; }),
        goal: computed(() => { return D(1e20); }),
        goalDesc: computed(() => {
            return `Reach ${format(COL_CHALLENGES.df.goal.value)} Points.`;
        }),
        desc: computed(() => { return `
            <li>Points, PRai, and all Kuaraniai resources gain less the more you have.</li>
            <li>However, PRai's auto-generator is always unlocked, and always runs at ${format(100)}%.</li>`; }),
        reward: computed(() => { return `Colosseum Power speeds up research, increase all Kuaraniai resources by ${format(2)}×, boost Points and PRai by ${format(10)}×, and unlock another challenge.`; }),
        cap: D(1),
        show: computed(() => {
            return Decimal.gte(timesCompleted("su"), 1);
        }),
        canComplete: computed(() => {
            return Decimal.gte(player.value.prog.main.bestInCol, COL_CHALLENGES.df.goal.value);
        }),
        progress: computed(() => {
            return Decimal.max(player.value.prog.main.bestInCol, 1)
                .log10()
                .div(COL_CHALLENGES.df.goal.value.log10())
                .min(1);
        }),
        progDisplay: computed(() => {
            return `${format(player.value.prog.main.bestInCol)} / ${format(COL_CHALLENGES.df.goal.value)} (${format(COL_CHALLENGES.df.progress.value.mul(100), 3)}%)`;
        })
    },
    im: {
        type: 2,
        num: 4,
        id: "im",
        layer: 0,
        name: `Inverted Mechanics`,
        labelEff: computed(() => { return `I.M. ×${format(timesCompleted('im'))}`; }),
        labelRew: computed(() => { return `I.M. Comp. ×${format(timesCompleted('im'))}`; }),
        goal: computed(() => { return D(1e20); }),
        resourceReq: computed(() => { return player.value.prog.main.bestInCol; }),
        goalDesc: computed(() => {
            return `PB: ${format(timesCompleted(COL_CHALLENGES.im.id))} / ${format(COL_CHALLENGES.im.goal.value)} Points.`;
        }),
        desc: computed(() => { return `
            <li>All Upgrades can only be bought once, but One-Upgrades are repeatable.</li>
            <li>Upgrade 2 and 5 boosts point gain.</li>
            <li>Point and PRai gain are raised to the ^${format(0.8, 3)} and PR2 scales ${format(1.2, 2)}× faster.</li>`; }),
        reward: computed(() => {
            let txt = ``;
            // txt += `<li>Unlock the 4th research and 5th challenge.</li>`
            txt += `<li>Unlock the 4th research.</li>`
            if (Decimal.gte(timesCompleted(COL_CHALLENGES.im.id), 1e20)) {
                txt += `<li>Boost research speed based off of your Personal Best in this challenge. Currently: ×${format(COL_CHALLENGES.im.type2ChalEff!.value[0], 3)}</li>`
                txt += Decimal.gte(timesCompleted(COL_CHALLENGES.im.id), 1e33)
                        ? `<li>Unlock the 5th challenge, 5th and 6th research, and make KBlessings directly boost Upgrades' effects. Effectiveness: ^${format(COL_CHALLENGES.im.type2ChalEff!.value[1], 1)}</li>`
                        : `<li>Unlock another reward at a Personal Best of ${format(1e33)}.</li>`
            }
            return txt;
        }),
        type2ChalEff: computed(() => {
            return [
                Decimal.gte(timesCompleted(COL_CHALLENGES.im.id), 1e20) ? Decimal.max(timesCompleted(COL_CHALLENGES.im.id), 1e20).log10().sub(4).sqrt().div(2) : D(1),
                Decimal.max(timesCompleted(COL_CHALLENGES.im.id), 1e33).div(1e33).log2()
            ]
        }),
        cap: D(Infinity),
        show: computed(() => {
            return Decimal.gte(timesCompleted("df"), 1);
        }),
        canComplete: computed(() => { return false; }),
        progress: computed(() => {
            return Decimal.max(player.value.prog.main.bestInCol, 1)
                .log10()
                .div(Decimal.log10(Decimal.max(timesCompleted(COL_CHALLENGES.im.id), 10).max(COL_CHALLENGES.im.goal.value)))
                .min(1);
        }),
        progDisplay: computed(() => {
            return `${format(player.value.prog.main.bestInCol)} / ${format(Decimal.max(COL_CHALLENGES.im.goal.value, timesCompleted(COL_CHALLENGES.im.id)))} (${format(COL_CHALLENGES.im.progress.value.mul(100), 3)}%)`;
        })
    },
    dc: {
        type: 3,
        num: 5,
        id: "dc",
        layer: 0,
        name: `Dimension Crawler`,
        labelEff: computed(() => { return `${COL_CHALLENGES.dc.name} ×${format(timesCompleted('dc'))}`; }),
        labelRew: computed(() => { return `${COL_CHALLENGES.dc.name} Comp. ×${format(timesCompleted('dc'))}`; }),
        goal: computed(() => {
            if (Decimal.gte(getColChalDisplayedDifficulty("dc"), 20)) {
                return Decimal.sub(getColChalDisplayedDifficulty("dc"), 20).pow_base(1.02012).pow_base(1600).pow10();
            }
            return [
                D(1e32),    // difficulty 1
                D(1e48),    // difficulty 2
                D(1e64),    // difficulty 3
                D(1e80),    // difficulty 4
                D(1e96),    // difficulty 5
                D(1e112),   // difficulty 6
                D(1e128),   // difficulty 7
                D(1e160),   // difficulty 8
                D(1e192),   // difficulty 9
                D(1e256),   // difficulty 10
                D('e320'),  // difficulty 11
                D('e384'),  // difficulty 12
                D('e512'),  // difficulty 13
                D('e640'),  // difficulty 14
                D('e768'),  // difficulty 15
                D('e896'),  // difficulty 16
                D('e1024'), // difficulty 17
                D('e1152'), // difficulty 18
                D('e1280'), // difficulty 19
                D('e1600'), // difficulty 20
                D(Infinity)
            ][new Decimal(getColChalDisplayedDifficulty("dc")).toNumber()];
        }),
        goalDesc: computed(() => {
            return `Reach ${format(COL_CHALLENGES.dc.goal.value)} Points.`;
        }),
        desc: computed(() => {
            if (Decimal.gte(getColChalDisplayedDifficulty("dc"), COL_CHALLENGES.dc.cap)) {
                return `winner you complete it all`;
            }
            let txt = `
            <li>Upgs. now generate the previous upg. and all Upg. scalings and softcaps are removed. However, their effects are vastly reduced.</li>
            <li>Multipliers to PPS and PRai other than Upg. 1 and Points (respectively) are ^${format(0.5, 2)} to the exponent.</li>`;
            txt += `<li>Upgs.' effective costs are significantly increased.</li>`;
            if (Decimal.gte(getColChalDisplayedDifficulty("dc"), 10)) {
                txt += `<li>Upgs.' multipliers are raised to the ^${format(COL_CHALLENGES.dc.type3ChalCond!(Decimal.add(getColChalDisplayedDifficulty("dc"), 1))[2], 2)}.</li>`;
            }
            // let txt = `
            // All upgrades now generate the previous upgrade and all Upgrade scalings and softcaps are removed, however, their effects are vastly reduced down to log(Effective+1)^${format(COL_CHALLENGES.dc.type3ChalCond!(getColChalDisplayedDifficulty("dc"))[1], 2)}.
            // Every multiplier to points other than Upgrade 1 are dilated.
            // Every bought upgrade gives a ${format(COL_CHALLENGES.dc.type3ChalCond!(getColChalDisplayedDifficulty("dc"))[0], 2)}× multiplier.`;
            // if (Decimal.gte(getColChalDisplayedDifficulty("dc"), 10)) {
            //     txt += `All upgrades' multipliers are raised to the ^${format(COL_CHALLENGES.dc.type3ChalCond!(getColChalDisplayedDifficulty("dc"))[2], 3)}.`;
            // }
            // if (Decimal.gte(getColChalDisplayedDifficulty("dc"), 15)) {
            //     txt += `All upgrades' effective costs are raised to the ^${format(COL_CHALLENGES.dc.type3ChalCond!(getColChalDisplayedDifficulty("dc"))[3], 2)}.`;
            // }
            return txt;
        }),
        reward: computed(() => {
            if (Decimal.gte(getColChalDisplayedDifficulty("dc"), COL_CHALLENGES.dc.cap)) {
                return `winner you complete it all`;
            }
            let txt = `<li>Total upgrades bought boosts PRai gain. Currently: ×(${format(COL_CHALLENGES.dc.type3ChalEff!(getColChalDisplayedDifficulty("dc"))[0], 3)}^sqrt(x))</li>`;
            if (Decimal.gte(getColChalDisplayedDifficulty("dc"), 2)) {
                txt += `<li>Upgrades 1-6 gain +${format(COL_CHALLENGES.dc.type3ChalEff!(getColChalDisplayedDifficulty("dc"))[1])} free levels outside of Colosseum challenges.</li>`
            }
            if (Decimal.gte(getColChalDisplayedDifficulty("dc"), 5)) {
                txt += `<li>Upgrade 3's base is increased based off of your Colosseum Power. Currently: +${format(COL_CHALLENGES.dc.type3ChalEff!(getColChalDisplayedDifficulty("dc"))[2], 3)}</li>`
            }
            if (Decimal.gte(getColChalDisplayedDifficulty("dc"), 10)) {
                txt += `<li>All upgrades now accumulate outside of this challenge with reduced effect. Currently: ${format(COL_CHALLENGES.dc.type3ChalEff!(getColChalDisplayedDifficulty("dc"))[3], 3)}× per bought, ${format(COL_CHALLENGES.dc.type3ChalEff!(getColChalDisplayedDifficulty('dc'))[4].mul(100))}% eff.</li>`
            }
            return txt;
        }),
        type3ChalCond(x) {
            if (Decimal.gte(x, 20)) {
                return [
                    D(1.15).root(Decimal.sub(x, 21).div(5).add(1)),
                    D(0.3).div(Decimal.sub(x, 21).div(5).add(1)),
                    D(0.9).pow(Decimal.sub(x, 20)).div(3),
                    D(1.05).pow(Decimal.sub(x, 20)).mul(0.8)
                ]
            }
            return [
                [D(2),    D(1),     D(1),    D(0.25)],  // difficulty 0
                [D(2),    D(1),     D(1),    D(0.25)],  // difficulty 1
                [D(2),    D(0.95),  D(1),    D(0.275)], // difficulty 2
                [D(2),    D(0.9),   D(1),    D(0.3)],   // difficulty 3
                [D(1.95), D(0.85),  D(1),    D(0.325)], // difficulty 4
                [D(1.9),  D(0.8),   D(1),    D(0.350)], // difficulty 5
                [D(1.85), D(0.75),  D(1),    D(0.375)], // difficulty 6
                [D(1.8),  D(0.7),   D(1),    D(0.4)],   // difficulty 7
                [D(1.75), D(0.65),  D(1),    D(0.425)], // difficulty 8
                [D(1.7),  D(0.6),   D(1),    D(0.450)], // difficulty 9
                [D(1.65), D(0.55),  D(1),    D(0.475)], // difficulty 10
                [D(1.6),  D(0.5),   D(0.9),  D(0.5)],   // difficulty 11
                [D(1.55), D(0.467), D(0.81), D(0.533)], // difficulty 12
                [D(1.5),  D(0.433), D(0.72), D(0.567)], // difficulty 13
                [D(1.45), D(0.4),   D(0.65), D(0.6)],   // difficulty 14
                [D(1.4),  D(0.38),  D(0.58), D(0.633)], // difficulty 15
                [D(1.35), D(0.36),  D(0.5),  D(0.667)], // difficulty 16
                [D(1.3),  D(0.34),  D(0.45), D(0.7)],   // difficulty 17
                [D(1.25), D(0.32),  D(0.4),  D(0.733)], // difficulty 18
                [D(1.2),  D(0.3),   D(0.36), D(0.767)], // difficulty 19
                [D(1.15), D(0.3),   D(0.33), D(0.8)],   // difficulty 20
            ][new Decimal(x).toNumber()]
        },
        type3ChalEff(x) {
            const arr: Array<Decimal> = [];
            arr.push(Decimal.mul(x, 0.5).add(1));
            arr.push(
                Decimal.gte(x, 2)
                    ? Decimal.gte(x, 10)
                        ? Decimal.mul(x, 5).sub(5)
                        : Decimal.sub(x, 1).mul(x).div(2)
                    : D(0)
            )
            arr.push(
                Decimal.gte(x, 5)
                    ? Decimal.max(player.value.prog.col.power, 1000).cbrt().mul(Decimal.sub(x, 4)).div(20000)
                    : D(0)
            )
            arr.push(
                Decimal.gte(x, 9)
                    ? Decimal.sub(x, 9).pow_base(1.01)
                    : D(0)
            )
            arr.push(
                Decimal.gte(x, 9)
                    ? Decimal.div(x, 10).add(0.1)
                    : D(0)
            )
            return arr;
        },
        cap: D(20),
        show: computed(() => {
            return Decimal.gte(timesCompleted('im'), 1e33);
            // return false;
        }),
        canComplete: computed(() => {
            return Decimal.gte(player.value.prog.main.bestInCol, COL_CHALLENGES.dc.goal.value);
        }),
        progress: computed(() => {
            return Decimal.max(player.value.prog.main.bestInCol, 1)
                .log10()
                .div(COL_CHALLENGES.dc.goal.value.log10())
                .min(1);
        }),
        progDisplay: computed(() => {
            return `${format(player.value.prog.main.bestInCol)} / ${format(COL_CHALLENGES.dc.goal.value)} (${format(COL_CHALLENGES.dc.progress.value.mul(100), 3)}%)`;
        })
    },
    sn: {
        type: 0,
        num: 6,
        id: "sn",
        layer: 0,
        name: `Simple Nerfs`,
        labelEff: computed(() => { return `${COL_CHALLENGES.sn.name} ×${format(timesCompleted('sn'))}`; }),
        labelRew: computed(() => { return `${COL_CHALLENGES.sn.name} Comp. ×${format(timesCompleted('sn'))}`; }),
        goal: computed(() => { return D('9.999e999'); }),
        goalDesc: computed(() => {
            return `Reach ${format(COL_CHALLENGES.sn.goal.value)} Points.`;
        }),
        desc: computed(() => {
            return `<li>Point gain is raised ^${format(0.5, 2)}.</li>
            <li>PRai gain is raised ^${format(2/3, 2)}.</li>
            <li>Kuaraniai gain is decreased by /${format(10)}.</li>
            <li>KBlessing gain is decreased by /${format(10)}.</li>
            <li>KProof exponent is decreased by /${format(2)}.</li>`;
        }),
        reward: computed(() => { return 'Unlock The Color Wheel.'; }),
        cap: D(1),
        show: computed(() => {
            return false;
        }),
        canComplete: computed(() => {
            return Decimal.gte(player.value.prog.main.bestInCol, COL_CHALLENGES.sn.goal.value);
        }),
        progress: computed(() => {
            return Decimal.max(player.value.prog.main.bestInCol, 1)
                .log10()
                .div(COL_CHALLENGES.sn.goal.value.log10())
                .min(1);
        }),
        progDisplay: computed(() => {
            return `${format(player.value.prog.main.bestInCol)} / ${format(COL_CHALLENGES.sn.goal.value)} (${format(COL_CHALLENGES.sn.progress.value.mul(100), 3)}%)`;
        })
    },
};