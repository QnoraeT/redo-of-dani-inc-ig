import Decimal, { type DecimalSource } from "break_eternity.js";
import { format } from "@/format";
import { player, reset, tmp, updateAllBest, updateAllTotal } from "@/main";
import { D, linearAdd, sumHarmonicSeries } from "@/calc";
import { setAchievement } from "../../Game_Achievements/Game_Achievements";

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
    goalDesc: string;
    desc: string;
    reward: string;
    cap: DecimalSource;
    show: boolean;
    canComplete: boolean;
    progress: Decimal;
    progDisplay: string;
};
/**
 * type
 * 0 = One-Time only
 * 1 = Can complete multiple times (Decimal)
 * 2 = Continouous (Decimal, best)
 *
 * layer
 * 0 = kua
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
        cap: 1,
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
                D(1e60),
                D(1e55),
                D(1e52),
                D(1e55),
                D(1e60),
                D(1e70),
                D(1e95),
                D(1e120),
                D(1e165),
                D(1e200),
                D(Infinity)
            ][new Decimal(timesCompleted("su")).toNumber()];
        },
        get goalDesc() {
            return `Reach ${format(this.goal)} Points.`;
        },
        get desc() {
            return [
                `Your PPS is restricted to only Upgrades, PRai, and PR2 and all upgrades scale ${format(2, 1)}× faster.`,
                `Your PPS is restricted to only Upgrades, PRai, and PR2, all upgrades scale ${format(2.5, 1)}× faster, and Upgrade 1's softcap starts earlier by ×${format(1e20)}.`,
                `Your PPS is restricted to only Upgrades, PRai, and PR2, all upgrades scale ${format(3, 1)}× faster, and Upgrade 1's softcap starts earlier by ×${format(1e25)}.`,
                `Your PPS is restricted to only Upgrades, PRai, and PR2, all upgrades scale ${format(3.5, 1)}× faster, and Upgrade 1's softcap starts earlier by ×${format(1e30)}.`,
                `Your PPS is restricted to only Upgrades, PRai, and PR2, all upgrades scale ${format(4, 1)}× faster, Upgrade 1's softcap starts earlier by ×${format(1e35)}, and Upgrade 2's effect is dilated to the ^${format(0.95, 2)}.`,
                `Your PPS is restricted to only Upgrades, PRai, and PR2, all upgrades scale ${format(5, 1)}× faster, Upgrade 1's softcap starts earlier by ×${format(1e40)}, and Upgrade 2's effect is dilated to the ^${format(0.9, 2)}.`,
                `Your PPS is restricted to only Upgrades, PRai, and PR2, all upgrades scale ${format(7.5, 1)}× faster, Upgrade 1's softcap starts earlier by ×${format(1e50)}, and Upgrade 2's effect is dilated to the ^${format(0.85, 2)}.`,
                `Your PPS is restricted to only Upgrades, PRai, and PR2, all upgrades scale ${format(10, 1)}× faster, Upgrade 1's softcap starts earlier by ×${format(1e60)}, Upgrade 2's effect is dilated to the ^${format(0.8, 2)}, and Upgrades 4, 5, and 6 are disabled.`,
                `Your PPS is restricted to only Upgrades, PRai, and PR2, all upgrades scale ${format(15, 1)}× faster, Upgrade 1's softcap starts earlier by ×${format(1e75)}, Upgrade 2's effect is dilated to the ^${format(0.75, 2)}, Upgrades 4, 5, and 6 are disabled, and PRai's effect is raised to the ^${format(0.75, 2)}.`,
                `Your PPS is restricted to only Upgrades, PRai, and PR2, all upgrades scale ${format(25, 1)}× faster, Upgrade 1's softcap starts earlier by ×${format(1e90)}, Upgrade 2's effect is dilated to the ^${format(0.7, 2)}, Upgrades 4, 5, and 6 are disabled, PRai's effect is raised to the ^${format(0.5, 2)}.`,
                `winner you complete it all`
            ][new Decimal(timesCompleted("su")).toNumber()];
        },
        get reward() {
            return [
                `Colosseum Power weakens the Upgrade 1 and 2 softcaps. (Effectiveness: ${format(2.5, 1)}%), and unlock a new challenge.`,
                `Colosseum Power weakens the Upgrade 1 and 2 softcaps. (Effectiveness: ${format(5, 1)}%)`,
                `Colosseum Power weakens the Upgrade 1 and 2 softcaps. (Effectiveness: ${format(7.5, 1)}%)`,
                `Colosseum Power weakens the Upgrade 1 and 2 softcaps. (Effectiveness: ${format(10, 1)}%)`,
                `Colosseum Power weakens the Upgrade 1 and 2 softcaps. (Effectiveness: ${format(15, 1)}%)`,
                `Colosseum Power weakens the Upgrade 1 and 2 softcaps. (Effectiveness: ${format(25, 1)}%) and Upgrade 1's Hyper scaling is ${format(3)}% weaker.`,
                `Colosseum Power weakens the Upgrade 1 and 2 softcaps. (Effectiveness: ${format(35, 1)}%) and Upgrade 1's Hyper scaling is ${format(6)}% weaker.`,
                `Colosseum Power weakens the Upgrade 1 and 2 softcaps. (Effectiveness: ${format(50, 1)}%) and Upgrade 1's Hyper scaling is ${format(10)}% weaker.`,
                `Colosseum Power weakens the Upgrade 1 and 2 softcaps. (Effectiveness: ${format(65, 1)}%), Upgrade 1's Hyper scaling is ${format(13)}% weaker, and Upgrade 2's base is increased by +${format(1.5, 1)}%.`,
                `Colosseum Power weakens the Upgrade 1 and 2 softcaps. (Effectiveness: ${format(80, 1)}%), Upgrade 1's Hyper scaling is ${format(15)}% weaker, and Upgrade 2's base is increased by +${format(3, 1)}%.`,
                `Colosseum Power weakens the Upgrade 1 and 2 softcaps. (Effectiveness: ${format(100, 1)}%), Upgrade 1's Hyper scaling is ${format(20)}% weaker, Upgrade 2's base is increased by +${format(5, 1)}%, and Point taxation starts ${format(1e6)}× later.`
            ][new Decimal(timesCompleted("su")).toNumber()];
        },
        cap: 10,
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
        goal: D(10025),
        get goalDesc() {
            return `Reach ${format(this.goal)} Points.`;
        },
        desc: `Points, PRai, and all Kuaraniai resources gain less the more you have.`,
        reward: `insert something here and Unlock another challenge.`,
        cap: 1,
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
        get goalDesc() {
            return `Reach ${format(this.goal)} Points.`;
        },
        desc: `All Upgrades can only be bought once, but One-Upgrades are repeatable (Upgrade 2 and 5 change to boosting point gain), PRai is a static resource while PR2's amount scales normally. Kuaraniai and above will not be affected.`,
        reward: `Something here.`,
        cap: 1,
        get show() {
            return Decimal.gte(timesCompleted("df"), 1);
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
            if (
                Decimal.lte(player.value.gameProgress.col.time, 0) &&
                player.value.gameProgress.col.inAChallenge
            ) {
                for (
                    let i = player.value.gameProgress.col.challengeOrder.chalID.length - 1;
                    i >= 0;
                    i--
                ) {
                    exitChallenge(player.value.gameProgress.col.challengeOrder.chalID[i]);
                }
            }

            if (player.value.gameProgress.unlocks.col) {
                i = Decimal.max(player.value.gameProgress.kua.best[4]!, 100).div(100);
                tmp.value.col.powGen = i;

                generate = tmp.value.col.powGen.mul(delta);
                i = player.value.gameProgress.col.power;
                player.value.gameProgress.col.power = Decimal.cbrt(player.value.gameProgress.col.power).mul(0.6).pow10().add(generate).log10().div(0.6).pow(3);
                tmp.value.col.truePowGen = Decimal.sub(player.value.gameProgress.col.power, i).div(delta);

                updateAllTotal(player.value.gameProgress.col.totals, generate);
                player.value.gameProgress.col.totalEver = Decimal.add(
                    player.value.gameProgress.col.totalEver,
                    tmp.value.col.truePowGen
                );
                updateAllBest(
                    player.value.gameProgress.col.best,
                    player.value.gameProgress.col.power
                );
                player.value.gameProgress.col.bestEver = Decimal.max(
                    player.value.gameProgress.col.bestEver,
                    player.value.gameProgress.col.power
                );

                i = Decimal.max(player.value.gameProgress.col.power, 1).cbrt().mul(5).add(40);
                player.value.gameProgress.col.maxTime = i;
            }

            k = 0;
            l = 0;
            player.value.gameProgress.col.inAChallenge = false;
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
                player.value.gameProgress.inChallenge[chalID].depths = j;
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

// TODO: Make challenge depths be the difficulty of the challenge, and also make a prompt what difficulty 0 to compeleted
export const challengeToggle = (id: challengeIDList) => {
    if (!inChallenge(id)) {
        if (
            player.value.gameProgress.col.challengeOrder.layer[
                player.value.gameProgress.col.challengeOrder.layer.length - 1
            ] <= COL_CHALLENGES[id].layer
        ) {
            return;
        }

        player.value.gameProgress.inChallenge[id].name = COL_CHALLENGES[id].name;
        player.value.gameProgress.inChallenge[id].goalDesc = COL_CHALLENGES[id].goalDesc;
        player.value.gameProgress.inChallenge[id].entered = true;

        const obj: colChallengesSavedData = makeColChallengeSaveData();

        player.value.gameProgress.col.saved[id] = obj;
        player.value.gameProgress.col.challengeOrder.chalID.push(COL_CHALLENGES[id].id);
        player.value.gameProgress.col.challengeOrder.layer.push(COL_CHALLENGES[id].layer);
        reset(3, true);
    } else {
        if (COL_CHALLENGES[id].canComplete) {
            player.value.gameProgress.col.completed[id] = Decimal.add(
                player.value.gameProgress.col.completed[id],
                1
            ).min(COL_CHALLENGES[id].cap);
            setAchievement(2, 1);
        }

        const layerExited =
            player.value.gameProgress.col.challengeOrder.layer[
                player.value.gameProgress.col.challengeOrder.chalID.indexOf(id)
            ];
        for (let i = player.value.gameProgress.col.challengeOrder.chalID.length - 1; i >= 0; i--) {
            if (player.value.gameProgress.col.challengeOrder.layer[i] > layerExited) {
                break;
            }
            exitChallenge(player.value.gameProgress.col.challengeOrder.chalID[i]);
        }
    }
};
