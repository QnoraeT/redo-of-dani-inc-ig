import Decimal, { type DecimalSource } from "break_eternity.js";
import { format } from "@/format";
import { player, tmp, updateAllBest, updateAllTotal } from "@/main";
import { D, linearAdd, sumHarmonicSeries } from "@/calc";
import { setAchievement } from "../../Game_Achievements/Game_Achievements";
import { reset } from "@/resets";
import { setFactor } from "../../Game_Stats/Game_Stats";

export type challengeIDList = "nk" | "su" | "df" | "im";
export const challengeIDListArr: Array<challengeIDList> = ["nk", "su", "df", "im"];

export type colChallenges = {
    nk: colChallengeData;
    su: colChallengeData;
    df: colChallengeData;
    im: colChallengeData;
};

export type colChallengeData = {
    type: number;
    num: number;
    id: challengeIDList;
    layer: number;
    name: string;
    goal: Decimal;
    resourceReq?: DecimalSource;
    goalDesc: string;
    desc: string;
    reward: string;
    cap: Decimal;
    show: boolean;
    canComplete: boolean;
    progress: Decimal;
    progDisplay: string;
    type1ChalCond?: Array<Array<Decimal>>
    type1ChalEff?: Array<Array<Decimal>>
};

export const getColChalDisplayedDifficulty = (id: challengeIDList) => {
    return player.value.gameProgress.inChallenge[id].overall ? Decimal.sub(challengeDepth(id), 1) : player.value.gameProgress.inChallenge[id].optionalDiff;
}

export const getColChalCondEffects = (id: challengeIDList) => {
    return COL_CHALLENGES[id].type1ChalCond![new Decimal(challengeDepth(id)).sub(1).max(0).toNumber()]!
}

export const getColChalRewEffects = (id: challengeIDList) => {
    return COL_CHALLENGES[id].type1ChalEff![new Decimal(timesCompleted(id)).max(0).toNumber()]
}

export const getColChalCondEffectsDec = (id: challengeIDList) => {
    return COL_CHALLENGES[id].type1ChalCond!
}

export const getColChalSelectedRew = (id: challengeIDList, which: number) => {
    return COL_CHALLENGES[id].type1ChalEff![new Decimal(getColChalDisplayedDifficulty(id)).add(1).toNumber()][which];
}

export const getColChalSelectedCond = (id: challengeIDList, which: number) => {
    return COL_CHALLENGES[id].type1ChalCond![new Decimal(getColChalDisplayedDifficulty(id)).toNumber()][which];
}

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
        goal: D(1e25),
        get goalDesc() {
            return `Reach ${format(this.goal)} Points.`;
        },
        desc: `All Kuaraniai resources and upgrades are disabled.`,
        reward: `Unlock another tab in Colosseum, and unlock another challenge.`,
        cap: D(1),
        show: true,
        get canComplete() {
            return Decimal.gte(player.value.gameProgress.main.best[3]!, this.goal);
        },
        get progress() {
            return Decimal.max(player.value.gameProgress.main.best[3]!, 1)
                .log10()
                .div(this.goal.log10())
                .min(1);
        },
        get progDisplay() {
            return `${format(player.value.gameProgress.main.best[3]!)} / ${format(this.goal)} (${format(this.progress.mul(100), 3)}%)`;
        }
    },
    su: {
        type: 1,
        num: 2,
        id: "su",
        layer: 0,
        name: `Sabotaged Upgrades`,
        get goal() {
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
        },
        get goalDesc() {
            return `Reach ${format(this.goal)} Points.`;
        },
        get desc() {
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), this.cap)) {
                return `winner you complete it all`;
            }
            let txt = `Your PPS is restricted to only Upgrades, PRai, PR2, and Dotgenous.`;
            txt += ` All upgrades scale ${format(getColChalSelectedCond(this.id, 0), 1)}× faster.`;
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), 1)) {
                txt += ` Upgrade 1's base is reduced by -${format(getColChalSelectedCond(this.id, 1), 3)}.`;
            }
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), 4)) {
                txt += ` Upgrade 2's effect is dilated to the ^${format(getColChalSelectedCond(this.id, 2), 2)}.`;
            }
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), 7)) {
                txt += ` Upgrades 4, 5, and 6 are disabled.`;
            }
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), 8)) {
                txt += ` PRai's effect is raised to the ^${format(getColChalSelectedCond(this.id, 3), 2)}.`;
            }
            return txt;
        },
        get reward() {
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), this.cap)) {
                return `winner you complete it all`;
            }
            let txt = `Colosseum Power weakens the Upgrade 1 and 2 softcaps. (Effectiveness: ${format(getColChalSelectedRew(this.id, 0).mul(100), 1)}%)`;
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), 3)) {
                txt += ` Upgrade 1's Hyper scaling is ${format(Decimal.sub(1, getColChalSelectedRew(this.id, 1)).mul(100), 1)}% weaker.`;
            }
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), 5)) {
                txt += ` Upgrade 2's base is increased by +${format(getColChalSelectedRew(this.id, 2).sub(1).mul(100))}%.`;
            }
            if (Decimal.gte(getColChalDisplayedDifficulty("su"), 7)) {
                txt += ` Point taxation starts ${format(getColChalSelectedRew(this.id, 3))}× later.`;
            }
            if (Decimal.eq(getColChalDisplayedDifficulty("su"), 0)) {
                txt += ` Unlock a new challenge.`;
            }
            return txt;
        },
        // trying not to completely hardcode in everything in *different files* and for js trying not to create 1,000 arrays for one thing sfgsdgnisudb
        // ! FOR CHALLENGES THAT ARE MEANT TO SUPPORT *DECIMAL* CAPS, MAKE internalChallengeCond AND internalChallengeEffect A GET() INSTEAD OF AN ARRAY SO ITS COMPATIBLE
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
        get show() {
            return Decimal.gte(timesCompleted("nk"), 1);
        },
        get canComplete() {
            return Decimal.gte(player.value.gameProgress.main.best[3]!, this.goal);
        },
        get progress() {
            return Decimal.max(player.value.gameProgress.main.best[3]!, 1)
                .log10()
                .div(this.goal.log10())
                .min(1);
        },
        get progDisplay() {
            return `${format(player.value.gameProgress.main.best[3]!)} / ${format(this.goal)} (${format(this.progress.mul(100), 3)}%)`;
        }
    },
    df: {
        type: 0,
        num: 3,
        id: "df",
        layer: 0,
        name: `Decaying Feeling`,
        goal: D(1e20),
        get goalDesc() {
            return `Reach ${format(this.goal)} Points.`;
        },
        get desc() { return `Points, PRai, and all Kuaraniai resources gain less the more you have. However, PRai's auto-generator is always unlocked, and always runs at ${format(100)}%.`; },
        get reward() { return `Colosseum Power speeds up research, increase all Kuaraniai resources by ${format(2)}×, boost Points and PRai by ${format(10)}×, and Unlock another challenge.`; },
        cap: D(1),
        get show() {
            return Decimal.gte(timesCompleted("su"), 1);
        },
        get canComplete() {
            return Decimal.gte(player.value.gameProgress.main.best[3]!, this.goal);
        },
        get progress() {
            return Decimal.max(player.value.gameProgress.main.best[3]!, 1)
                .log10()
                .div(this.goal.log10())
                .min(1);
        },
        get progDisplay() {
            return `${format(player.value.gameProgress.main.best[3]!)} / ${format(this.goal)} (${format(this.progress.mul(100), 3)}%)`;
        }
    },
    im: {
        type: 2,
        num: 4,
        id: "im",
        layer: 0,
        name: `Inverted Mechanics`,
        goal: D(1e70),
        get resourceReq() { return player.value.gameProgress.main.points; },
        get goalDesc() {
            return `PB: ${format(timesCompleted(this.id))} / ${format(this.goal)} Points.`;
        },
        get desc() { return `All Upgrades can only be bought once, but One-Upgrades are repeatable. Upgrade 2 and 5 change to boosting point gain. Point and PRai gain are raised to the ^${format(0.8, 3)} and PR2 scales ${format(1.2, 2)}× faster.`; },
        reward: `Something here.`,
        cap: D(Infinity),
        get show() {
            return Decimal.gte(timesCompleted("df"), 1);
        },
        canComplete: false,
        get progress() {
            return Decimal.max(player.value.gameProgress.main.best[3]!, 1)
                .log10()
                .div(Decimal.log10(Decimal.max(timesCompleted(this.id), 10)))
                .min(1);
        },
        get progDisplay() {
            return `${format(player.value.gameProgress.main.best[3]!)} / ${format(timesCompleted(this.id))} (${format(this.progress.mul(100), 3)}%)`;
        }
    }
};

export const getColXPtoNext = (id: number) => {
    return Decimal.sub(player.value.gameProgress.col.research.xpTotal[id], getColResLevel(id).floor());
}

export const getColResLevel = (id: number) => {
    return COL_RESEARCH[id].scoreToLevel(player.value.gameProgress.col.research.xpTotal[id]);
};

export const getColResEffect = (id: number) => {
    return COL_RESEARCH[id].effect(getColResLevel(id).floor());
};

export const allocColResearch = (id: number) => {
    if (player.value.gameProgress.col.research.enabled[id]) {
        tmp.value.col.researchesAllocated -= 1;
        player.value.gameProgress.col.research.enabled[id] = false;
    } else {
        if (tmp.value.col.researchesAllocated < tmp.value.col.researchesAtOnce) {
            tmp.value.col.researchesAllocated += 1;
            player.value.gameProgress.col.research.enabled[id] = true;
        }
    }
};

export const COL_RESEARCH = [
    {
        unlocked: true,
        name: "Dotgenous",
        effectDesc(level: DecimalSource) {
            return `Multiply point gain by ${format(this.effect(level), 2)}×.`;
        },
        effectDescLevel(level: DecimalSource) {
            return `Multiply point gain by ${format(this.effect(Decimal.add(level, 1)).div(this.effect(level)), 3)}× for this level.`;
        },
        effect(level: DecimalSource) {
            const effect = Decimal.sqrt(level).pow10();
            return effect;
        },
        scoreToLevel(score: DecimalSource) {
            if (Decimal.lt(score, 2)) {
                return D(0);
            }
            const level = linearAdd(score, 2, 2, true);
            return level;
        },
        levelToScore(level: DecimalSource) {
            const score = linearAdd(level, 2, 2, false);
            return score;
        }
    },
    {
        unlocked: true,
        name: "Firsterious",
        effectDesc(level: DecimalSource) {
            return `Multiply PRai gain by ${format(this.effect(level), 2)}×.`;
        },
        effectDescLevel(level: DecimalSource) {
            return `Multiply PRai gain by ${format(this.effect(Decimal.add(level, 1)).div(this.effect(level)), 3)}× for this level.`;
        },
        effect(level: DecimalSource) {
            const effect = Decimal.cbrt(level).pow_base(4);
            return effect;
        },
        scoreToLevel(score: DecimalSource) {
            if (Decimal.lt(score, 10)) {
                return D(0);
            }
            const level = linearAdd(score, 10, 10, true);
            return level;
        },
        levelToScore(level: DecimalSource) {
            const score = linearAdd(level, 10, 10, false);
            return score;
        }
    },
    {
        unlocked: true,
        name: "Kyston",
        effectDesc(level: DecimalSource) {
            return `Increase Kuaraniai gain exponent by +${format(this.effect(level), 3)}.`;
        },
        effectDescLevel(level: DecimalSource) {
            return `+${format(this.effect(Decimal.add(level, 1)).sub(this.effect(level)), 4)} Kuaraniai gain exponent for this level.`;
        },
        effect(level: DecimalSource) {
            const effect = sumHarmonicSeries(level).div(100);
            return effect;
        },
        scoreToLevel(score: DecimalSource) {
            if (Decimal.lt(score, 100)) {
                return D(0);
            }
            const level = linearAdd(score, 100, 20, true);
            return level;
        },
        levelToScore(level: DecimalSource) {
            const score = linearAdd(level, 100, 20, false);
            return score;
        }
    }
];

export const timesCompleted = (id: challengeIDList): DecimalSource => {
    if (player.value.gameProgress.col.completed[id] === undefined) {
        return D(0);
    }
    return player.value.gameProgress.col.completed[id];
};

export const completedChallenge = (id: challengeIDList): boolean => {
    if (player.value.gameProgress.col.completed[id] === undefined) {
        return false;
    }
    return Decimal.gte(player.value.gameProgress.col.completed[id], COL_CHALLENGES[id].cap);
};

export const inChallenge = (id: challengeIDList): boolean => {
    if (player.value.gameProgress.inChallenge[id] === undefined) {
        return false;
    }
    return player.value.gameProgress.inChallenge[id].entered;
};

export const challengeDepth = (id: challengeIDList): DecimalSource => {
    return player.value.gameProgress.inChallenge[id].depths;
};

export const makeColChallengeSaveData = (): colChallengesSavedData => {
    const obj: colChallengesSavedData = {
        points: player.value.gameProgress.main.points,
        upgradesBought: [],
        upgradesAuto: [],
        upgradesResetHistory: [],
        oneUpgrades: [],
        pointBest: [
            player.value.gameProgress.main.best[0],
            player.value.gameProgress.main.best[1],
            player.value.gameProgress.main.best[2]
        ],
        pointTotals: [
            player.value.gameProgress.main.totals[0],
            player.value.gameProgress.main.totals[1],
            player.value.gameProgress.main.totals[2]
        ],
        kua: {
            auto: player.value.gameProgress.kua.auto,
            amount: player.value.gameProgress.kua.amount,
            timeInKua: player.value.gameProgress.kua.timeInKua,
            times: player.value.gameProgress.kua.times,
            kshards: {
                amount: player.value.gameProgress.kua.kshards.amount,
                totals: [],
                best: [],
                upgrades: player.value.gameProgress.kua.kshards.upgrades
            },
            kpower: {
                amount: player.value.gameProgress.kua.kpower.amount,
                totals: [],
                best: [],
                upgrades: player.value.gameProgress.kua.kpower.upgrades
            },
            enhancers: {
                autoSources: player.value.gameProgress.kua.enhancers.autoSources,
                sources: player.value.gameProgress.kua.enhancers.sources,
                enhancers: player.value.gameProgress.kua.enhancers.enhancers,
                enhanceXP: player.value.gameProgress.kua.enhancers.enhanceXP,
                enhancePow: player.value.gameProgress.kua.enhancers.enhancePow,
                xpSpread: player.value.gameProgress.kua.enhancers.xpSpread,
                inExtraction: player.value.gameProgress.kua.enhancers.inExtraction,
                extractionXP: player.value.gameProgress.kua.enhancers.extractionXP,
                upgrades: player.value.gameProgress.kua.enhancers.upgrades
            }
        },
        pr2: {
            auto: player.value.gameProgress.main.pr2.auto,
            amount: player.value.gameProgress.main.pr2.amount,
            timeInPR2: player.value.gameProgress.main.pr2.timeInPR2,
            best: [null, null, player.value.gameProgress.main.pr2.best[2]]
        },
        prai: {
            auto: player.value.gameProgress.main.prai.auto,
            amount: player.value.gameProgress.main.prai.amount,
            timeInPRai: player.value.gameProgress.main.prai.timeInPRai,
            best: [
                null,
                player.value.gameProgress.main.prai.best[1],
                player.value.gameProgress.main.prai.best[2]
            ],
            totals: [
                null,
                player.value.gameProgress.main.prai.totals[1],
                player.value.gameProgress.main.prai.totals[2]
            ],
            times: player.value.gameProgress.main.prai.times
        }
    };
    for (let i = 0; i < player.value.gameProgress.main.upgrades.length; i++) {
        obj.upgradesBought.push(player.value.gameProgress.main.upgrades[i].bought);
        obj.upgradesAuto.push(player.value.gameProgress.main.upgrades[i].auto);
        const arr: Array<DecimalSource> = [];
        for (let j = 0; j < player.value.gameProgress.main.upgrades[i].boughtInReset.length; j++) {
            arr.push(player.value.gameProgress.main.upgrades[i].boughtInReset[j]);
        }
        obj.upgradesResetHistory.push(arr);
    }
    for (let i = 0; i < player.value.gameProgress.main.oneUpgrades.length; i++) {
        obj.oneUpgrades.push(player.value.gameProgress.main.oneUpgrades[i]);
    }
    // ! remember this update aaaa
    for (let i = 0; i < player.value.gameProgress.kua.kshards.totals.length; i++) {
        obj.kua.kshards.totals[i] = player.value.gameProgress.kua.kshards.totals[i];
        obj.kua.kshards.best[i] = player.value.gameProgress.kua.kshards.best[i];
        obj.kua.kpower.totals[i] = player.value.gameProgress.kua.kpower.totals[i];
        obj.kua.kpower.best[i] = player.value.gameProgress.kua.kpower.best[i];
    }
    return obj;
};

export const exitChallenge = (id: challengeIDList) => {
    const chalIdCheck = player.value.gameProgress.col.challengeOrder.chalID.pop();
    if (chalIdCheck !== id) {
        player.value.gameProgress.col.challengeOrder.chalID.push(chalIdCheck!);
        throw new Error(
            "major error! check player.value.gameProgress.col.challengeOrder because challenge order is wrong!!"
        );
    }
    player.value.gameProgress.col.challengeOrder.layer.pop();
    player.value.gameProgress.inChallenge[id].entered = false;

    const savedColData = player.value.gameProgress.col.saved[id]!;
    for (let i = 0; i < player.value.gameProgress.main.upgrades.length; i++) {
        player.value.gameProgress.main.upgrades[i].bought = savedColData.upgradesBought[i];
        player.value.gameProgress.main.upgrades[i].auto = savedColData.upgradesAuto[i];
        for (let j = 0; j < player.value.gameProgress.main.upgrades[i].boughtInReset.length; j++) {
            player.value.gameProgress.main.upgrades[i].boughtInReset[j] =
                savedColData.upgradesResetHistory[i][j];
        }
    }

    for (let i = 0; i < player.value.gameProgress.main.oneUpgrades.length; i++) {
        player.value.gameProgress.main.oneUpgrades[i] = savedColData.oneUpgrades[i];
    }

    player.value.gameProgress.main.points = savedColData.points;
    player.value.gameProgress.main.best[0] = savedColData.pointBest[0];
    player.value.gameProgress.main.best[1] = savedColData.pointBest[1];
    player.value.gameProgress.main.best[2] = savedColData.pointBest[2];
    player.value.gameProgress.main.best[3] = savedColData.pointBest[3];
    player.value.gameProgress.main.totals[0] = savedColData.pointTotals[0];
    player.value.gameProgress.main.totals[1] = savedColData.pointTotals[1];
    player.value.gameProgress.main.totals[2] = savedColData.pointTotals[2];
    player.value.gameProgress.main.totals[3] = savedColData.pointTotals[3];

    player.value.gameProgress.main.pr2.auto = savedColData.pr2.auto;
    player.value.gameProgress.main.pr2.amount = savedColData.pr2.amount;
    player.value.gameProgress.main.pr2.timeInPR2 = savedColData.pr2.timeInPR2;
    player.value.gameProgress.main.pr2.best[2] = savedColData.pr2.best[2];
    player.value.gameProgress.main.pr2.best[3] = savedColData.pr2.best[3];

    player.value.gameProgress.main.prai.auto = savedColData.prai.auto;
    player.value.gameProgress.main.prai.amount = savedColData.prai.amount;
    player.value.gameProgress.main.prai.times = savedColData.prai.times;
    player.value.gameProgress.main.prai.timeInPRai = savedColData.prai.timeInPRai;
    player.value.gameProgress.main.prai.best[1] = savedColData.prai.best[1];
    player.value.gameProgress.main.prai.best[2] = savedColData.prai.best[2];
    player.value.gameProgress.main.prai.best[3] = savedColData.prai.best[3];
    player.value.gameProgress.main.prai.totals[1] = savedColData.prai.totals[1];
    player.value.gameProgress.main.prai.totals[2] = savedColData.prai.totals[2];
    player.value.gameProgress.main.prai.totals[3] = savedColData.prai.totals[3];

    player.value.gameProgress.kua.auto = savedColData.kua.auto;
    player.value.gameProgress.kua.amount = savedColData.kua.amount;
    player.value.gameProgress.kua.timeInKua = savedColData.kua.timeInKua;
    player.value.gameProgress.kua.times = savedColData.kua.times;

    player.value.gameProgress.kua.kshards.amount = savedColData.kua.kshards.amount;
    player.value.gameProgress.kua.kshards.upgrades = savedColData.kua.kshards.upgrades;
    player.value.gameProgress.kua.kshards.totals[2] = savedColData.kua.kshards.totals[2];
    player.value.gameProgress.kua.kshards.best[2] = savedColData.kua.kshards.best[2];
    player.value.gameProgress.kua.kshards.totals[3] = savedColData.kua.kshards.totals[3];
    player.value.gameProgress.kua.kshards.best[3] = savedColData.kua.kshards.best[3];

    player.value.gameProgress.kua.kpower.amount = savedColData.kua.kpower.amount;
    player.value.gameProgress.kua.kpower.totals[2] = savedColData.kua.kpower.totals[2];
    player.value.gameProgress.kua.kpower.best[2] = savedColData.kua.kpower.best[2];
    player.value.gameProgress.kua.kpower.totals[3] = savedColData.kua.kpower.totals[3];
    player.value.gameProgress.kua.kpower.best[3] = savedColData.kua.kpower.best[3];
    player.value.gameProgress.kua.kpower.upgrades = savedColData.kua.kpower.upgrades;

    player.value.gameProgress.kua.enhancers.autoSources = savedColData.kua.enhancers.autoSources;
    player.value.gameProgress.kua.enhancers.sources = savedColData.kua.enhancers.sources;
    player.value.gameProgress.kua.enhancers.enhancers = savedColData.kua.enhancers.enhancers;
    player.value.gameProgress.kua.enhancers.enhanceXP = savedColData.kua.enhancers.enhanceXP;
    player.value.gameProgress.kua.enhancers.enhancePow = savedColData.kua.enhancers.enhancePow;
    player.value.gameProgress.kua.enhancers.xpSpread = savedColData.kua.enhancers.xpSpread;
    player.value.gameProgress.kua.enhancers.inExtraction = savedColData.kua.enhancers.inExtraction;
    player.value.gameProgress.kua.enhancers.extractionXP = savedColData.kua.enhancers.extractionXP;
    player.value.gameProgress.kua.enhancers.upgrades = savedColData.kua.enhancers.upgrades;
};

export const updateAllCol = (delta: DecimalSource) => {
    updateCol(1, delta);
    updateCol(0, delta);
};

export const updateCol = (type: number, delta: DecimalSource) => {
    let i, j, k, l, chalID, generate;
    switch (type) {
        case 1:
            // no reason for this to be a Decimal, there should not be >1.797e308 researches
            tmp.value.col.researchesAtOnce = 1;
            tmp.value.col.researchesAllocated = 0;
            tmp.value.col.researchSpeed = D(1);
            setFactor(0, [5, 1], "Base", `${format(1, 2)}`, `${format(tmp.value.col.researchSpeed, 2)}`, true);
            tmp.value.col.researchSpeed = tmp.value.col.researchSpeed.mul(tmp.value.col.effects.res);
            setFactor(1, [5, 1], `Decaying Feeling Completion ×${format(timesCompleted('df'))}`, `×${format(tmp.value.col.effects.res, 2)}`, `${format(tmp.value.col.researchSpeed, 2)}`, Decimal.gte(timesCompleted("df"), 1), "col");

            for (let i = 0; i < COL_RESEARCH.length; i++) {
                if (player.value.gameProgress.col.research.enabled[i] === undefined) {
                    player.value.gameProgress.col.research.enabled[i] = false;
                }
                if (player.value.gameProgress.col.research.xpTotal[i] === undefined) {
                    player.value.gameProgress.col.research.xpTotal[i] = 0;
                }

                if (player.value.gameProgress.col.research.enabled[i]) {
                    tmp.value.col.researchesAllocated++;
                    generate = tmp.value.col.researchSpeed.mul(delta);
                    player.value.gameProgress.col.research.xpTotal[i] = Decimal.add(
                        player.value.gameProgress.col.research.xpTotal[i],
                        generate
                    );
                }
            }
            break;
        case 0:
            if (Decimal.lte(player.value.gameProgress.col.time, 0) && player.value.gameProgress.col.inAChallenge) {
                for (let i = player.value.gameProgress.col.challengeOrder.chalID.length - 1; i >= 0; i--) {
                    exitChallenge(player.value.gameProgress.col.challengeOrder.chalID[i]);
                }
            }

            if (player.value.gameProgress.unlocks.col) {
                i = Decimal.max(player.value.gameProgress.kua.best[4]!, 100).div(100);
                setFactor(0, [5, 0], "Base", `${format(Decimal.max(player.value.gameProgress.kua.best[4]!, 100), 2)} / ${format(100)}`, `${format(i, 2)}`, true);
                tmp.value.col.powGen = i;
                i = Decimal.cbrt(player.value.gameProgress.col.power).mul(0.6).pow10().add(tmp.value.col.powGen).log10().div(0.6).pow(3).sub(player.value.gameProgress.col.power);
                setFactor(1, [5, 0], "Decay", `/${format(tmp.value.col.powGen.div(i), 2)}`, `${format(i, 2)}`, true);

                generate = tmp.value.col.powGen.mul(delta);
                i = player.value.gameProgress.col.power;
                player.value.gameProgress.col.power = Decimal.cbrt(player.value.gameProgress.col.power).mul(0.6).pow10().add(generate).log10().div(0.6).pow(3);
                tmp.value.col.truePowGen = Decimal.sub(player.value.gameProgress.col.power, i).div(delta);

                updateAllTotal(player.value.gameProgress.col.totals, generate);
                player.value.gameProgress.col.totalEver = Decimal.add(player.value.gameProgress.col.totalEver, tmp.value.col.truePowGen);
                updateAllBest(player.value.gameProgress.col.best, player.value.gameProgress.col.power);
                player.value.gameProgress.col.bestEver = Decimal.max(player.value.gameProgress.col.bestEver, player.value.gameProgress.col.power);

                i = Decimal.max(player.value.gameProgress.col.power, 1).cbrt().mul(5).add(40);
                player.value.gameProgress.col.maxTime = i;

                tmp.value.col.effects = {
                    upg1a2sc: D(1),
                    res: D(1)
                }

                tmp.value.col.effects.upg1a2sc = Decimal.gte(timesCompleted("su"), 1)
                    ? Decimal.max(player.value.gameProgress.col.power, 1).log10().mul(getColChalRewEffects("su")[0]).add(1)
                    : D(1)

                tmp.value.col.effects.res = Decimal.gte(timesCompleted("df"), 1)
                    ? Decimal.max(player.value.gameProgress.col.power, 10).log10()
                    : D(1)
            }

            k = 0;
            l = 0;
            player.value.gameProgress.col.inAChallenge = false;
            tmp.value.col.totalColChalComp = D(0);
            for (let i = 0; i < challengeIDListArr.length; i++) {
                chalID = challengeIDListArr[i];

                j = false;
                player.value.gameProgress.inChallenge[chalID].trapped = j;

                j = false;
                if ( player.value.gameProgress.inChallenge[chalID].entered || player.value.gameProgress.inChallenge[chalID].trapped) {
                    j = true;
                }

                if (j) {
                    if (COL_CHALLENGES[chalID].canComplete) {
                        k++;
                    }
                    l++;
                    player.value.gameProgress.col.inAChallenge = true;
                }
                player.value.gameProgress.inChallenge[chalID].overall = j;

                j = D(0);
                if (player.value.gameProgress.inChallenge[chalID].entered || player.value.gameProgress.inChallenge[chalID].trapped) {
                    j = D(1);
                }
                if (COL_CHALLENGES[chalID].type === 1) {
                    j = Decimal.add(player.value.gameProgress.inChallenge[chalID].enteredDiff, 1);
                }
                // anything after this replaces the selected value; as if a challenge sent you into another challenge with a set difficulty
                player.value.gameProgress.inChallenge[chalID].depths = j;

                if (COL_CHALLENGES[chalID].type === 2 && player.value.gameProgress.inChallenge[chalID].entered) {
                    player.value.gameProgress.col.completed[chalID] = Decimal.max(player.value.gameProgress.col.completed[chalID], COL_CHALLENGES[chalID].resourceReq!);
                }

                if (COL_CHALLENGES[chalID].type === 2) {
                    tmp.value.col.totalColChalComp = tmp.value.col.totalColChalComp.add(completedChallenge(chalID) ? 1 : 0);
                } else {
                    tmp.value.col.totalColChalComp = tmp.value.col.totalColChalComp.add(timesCompleted(chalID));
                }
            }

            player.value.gameProgress.col.completedAll = k === l && player.value.gameProgress.col.inAChallenge;

            if (player.value.gameProgress.col.inAChallenge) {
                if (!player.value.gameProgress.col.completedAll) {
                    player.value.gameProgress.col.time = Decimal.sub(
                        player.value.gameProgress.col.time,
                        delta
                    );
                }
            } else {
                player.value.gameProgress.col.time = player.value.gameProgress.col.maxTime;
            }
            break;
        default:
            throw new Error(`Colosseum area of the game does not contain ${type}`);
    }
};

// SAVE ALL PROGRESS FROM EVERYTHING EARLIER THAN COLOSSEUM
// we have to do this because js passes objects by reference and stuff
export type colChallengesSavedData = {
    points: DecimalSource;
    upgradesBought: Array<DecimalSource>;
    upgradesAuto: Array<boolean>;
    upgradesResetHistory: Array<Array<DecimalSource>>;
    oneUpgrades: Array<DecimalSource>;
    pointBest: Array<DecimalSource | null>;
    pointTotals: Array<DecimalSource | null>;
    kua: {
        auto: boolean;
        amount: DecimalSource;
        timeInKua: DecimalSource;
        times: DecimalSource;
        kshards: {
            amount: DecimalSource;
            totals: Array<null | DecimalSource>;
            best: Array<null | DecimalSource>;
            upgrades: number;
        };
        kpower: {
            amount: DecimalSource;
            totals: Array<null | DecimalSource>;
            best: Array<null | DecimalSource>;
            upgrades: number;
        };
        enhancers: {
            autoSources: boolean,
            sources: Array<DecimalSource>,
            enhancers: Array<DecimalSource>,
            enhanceXP: Array<DecimalSource>,
            enhancePow: Array<DecimalSource>,
            xpSpread: DecimalSource,
            inExtraction: number,
            extractionXP: Array<DecimalSource>,
            upgrades: Array<number>
        }
    };
    pr2: {
        auto: boolean;
        amount: DecimalSource;
        timeInPR2: DecimalSource;
        best: Array<DecimalSource | null>;
    };
    prai: {
        auto: boolean;
        amount: DecimalSource;
        timeInPRai: DecimalSource;
        best: Array<DecimalSource | null>;
        totals: Array<DecimalSource | null>;
        times: DecimalSource;
    };
};

export const challengeToggle = (id: challengeIDList) => {
    if (!inChallenge(id)) {
        if (player.value.gameProgress.col.challengeOrder.layer[player.value.gameProgress.col.challengeOrder.layer.length - 1] <= COL_CHALLENGES[id].layer) {
            return;
        }

        player.value.gameProgress.inChallenge[id].name = COL_CHALLENGES[id].name;
        player.value.gameProgress.inChallenge[id].goalDesc = COL_CHALLENGES[id].goalDesc;
        player.value.gameProgress.inChallenge[id].entered = true;
        player.value.gameProgress.inChallenge[id].enteredDiff = player.value.gameProgress.inChallenge[id].optionalDiff;

        const obj: colChallengesSavedData = makeColChallengeSaveData();

        player.value.gameProgress.col.saved[id] = obj;
        player.value.gameProgress.col.challengeOrder.chalID.push(COL_CHALLENGES[id].id);
        player.value.gameProgress.col.challengeOrder.layer.push(COL_CHALLENGES[id].layer);
        reset(3, true);
        if (id === 'im') {
            player.value.gameProgress.main.pr2.amount = D(1);
        }
    } else {
        if (COL_CHALLENGES[id].canComplete) {
            if (COL_CHALLENGES[id].type === 1) {
                if (Decimal.eq(player.value.gameProgress.inChallenge[id].enteredDiff, player.value.gameProgress.col.completed[id])) {
                    player.value.gameProgress.col.completed[id] = Decimal.add(player.value.gameProgress.col.completed[id], 1).min(COL_CHALLENGES[id].cap);
                    player.value.gameProgress.inChallenge[id].optionalDiff = Decimal.add(player.value.gameProgress.inChallenge[id].optionalDiff, 1).min(COL_CHALLENGES[id].cap);
                }
            } else {
                player.value.gameProgress.col.completed[id] = Decimal.add(player.value.gameProgress.col.completed[id], 1).min(COL_CHALLENGES[id].cap);
            }

            setAchievement(2, 1);
        }

        const layerExited = player.value.gameProgress.col.challengeOrder.layer[player.value.gameProgress.col.challengeOrder.chalID.indexOf(id)];
        for (let i = player.value.gameProgress.col.challengeOrder.chalID.length - 1; i >= 0; i--) {
            if (player.value.gameProgress.col.challengeOrder.layer[i] > layerExited) {
                break;
            }
            exitChallenge(player.value.gameProgress.col.challengeOrder.chalID[i]);
        }
    }
};
