// SAVE ALL PROGRESS FROM EVERYTHING EARLIER THAN COLOSSEUM

import type { DecimalSource } from "break_eternity.js"
import { player } from "@/main"
import { resetStage } from "@/resets"
import { COL_CHALLENGES, type challengeIDList } from "./Game_ColChalData"
import Decimal from "break_eternity.js"
import { D } from "@/calc"
import { KUA_BLESS_UPGS } from "../../Game_Kuaraniai/Game_KuaBlessings/Game_KuaBlessings"
import { KUA_PROOF_UPGS, type KuaProofUpgTypes } from "../../Game_Kuaraniai/Game_KuaProofs/Game_KuaProofs"
import { KUA_PROOF_AUTO, type KuaProofAutoTypes } from "../../Game_Kuaraniai/Game_KuaProofs/Game_KuaProofAuto/Game_KuaProofAuto"
import { KUA_ENHANCERS } from "../../Game_Kuaraniai/Game_KuaEnhancers/Game.KuaEnhancers"
import { hasGrowanMilestone } from "../../Game_Layer4/Game_Growan/Game_Growan"
import { setAchievement } from "@/components/Game/Game_Achievements/Game_Achievements"

export const getColChalDisplayedDifficulty = (id: challengeIDList) => {
    return player.value.gameProgress.inChallenge[id].overall ? Decimal.sub(challengeDepth(id), 1) : player.value.gameProgress.inChallenge[id].optionalDiff;
}

export const getColChalCondEffects = (id: challengeIDList) => {
    return COL_CHALLENGES[id].type1ChalCond![new Decimal(challengeDepth(id)).sub(1).max(0).toNumber()]!
}

export const getColChalRewEffects = (id: challengeIDList) => {
    return COL_CHALLENGES[id].type === 3
        ? COL_CHALLENGES[id].type3ChalEff!(Decimal.sub(timesCompleted(id), 1))
        : COL_CHALLENGES[id].type1ChalEff![new Decimal(timesCompleted(id)).max(0).toNumber()]
}

export const getColChalCondEffectsDec = (id: challengeIDList) => {
    return COL_CHALLENGES[id].type1ChalCond!;
}

export const getColChalSelectedRew = (id: challengeIDList, which: number) => {
    return COL_CHALLENGES[id].type1ChalEff![new Decimal(getColChalDisplayedDifficulty(id)).add(1).toNumber()][which];
}

export const getColChalSelectedCond = (id: challengeIDList, which: number) => {
    return COL_CHALLENGES[id].type1ChalCond![new Decimal(getColChalDisplayedDifficulty(id)).toNumber()][which];
}

export const challengeDepth = (id: challengeIDList): DecimalSource => {
    return player.value.gameProgress.inChallenge[id].depths;
};

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

// we have to do this because js passes objects by reference and stuff
export type colChallengesSavedData = {
    points: DecimalSource,
    upgradesBought: Array<DecimalSource>,
    upgradesAuto: Array<boolean>,
    upgradesResetHistory: Array<Array<DecimalSource>>,
    oneUpgrades: Array<DecimalSource>,
    pointBest: Array<DecimalSource | null>,
    pointTotals: Array<DecimalSource | null>,
    col: {
        timeInCol: DecimalSource
    }
    kua: {
        auto: boolean,
        amount: DecimalSource,
        timeInKua: DecimalSource,
        times: DecimalSource,
        upgrades: number,
        kshards: {
            amount: DecimalSource,
            totals: Array<null | DecimalSource>,
            best: Array<null | DecimalSource>,
            upgrades: number
        },
        kpower: {
            amount: DecimalSource,
            totals: Array<null | DecimalSource>,
            best: Array<null | DecimalSource>,
            upgrades: number
        },
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
        },
        blessings: {
            amount: DecimalSource,
            totals: Array<DecimalSource | null>,
            best: Array<DecimalSource | null>,
            totalEver: DecimalSource,
            bestEver: DecimalSource,
            upgrades: Array<DecimalSource>
        },
        proofs: {
            amount: DecimalSource,
            totals: Array<null | DecimalSource>,
            best: Array<null | DecimalSource>,
            totalEver: DecimalSource,
            bestEver: DecimalSource,
            auto: {
                other: Array<boolean>,
                effect: Array<boolean>,
                kp: Array<boolean>,
                skp: Array<boolean>,
                fkp: Array<boolean>
            },
            upgrades: {
                effect: Array<DecimalSource>,
                kp: Array<DecimalSource>,
                skp: Array<DecimalSource>,
                fkp: Array<DecimalSource>
            },
            strange: {
                amount: DecimalSource,
                hiddenExp: DecimalSource,
                times: DecimalSource,
                totals: Array<null | DecimalSource>,
                best: Array<null | DecimalSource>,
                totalEver: DecimalSource,
                bestEver: DecimalSource,
            },
            finicky: {
                amount: DecimalSource,
                hiddenExp: DecimalSource,
                times: DecimalSource,
                totals: Array<null | DecimalSource>, // null, null, null, col, tax
                best: Array<null | DecimalSource>, // null, null, null, col, tax
                totalEver: DecimalSource,
                bestEver: DecimalSource,
                powers: {
                    white: {
                        alloc: DecimalSource,
                        amount: DecimalSource,
                        upgrades: DecimalSource
                    },
                    cyan: {
                        alloc: DecimalSource,
                        amount: DecimalSource,
                        upgrades: DecimalSource
                    },
                    yellow: {
                        alloc: DecimalSource,
                        amount: DecimalSource,
                        upgrades: DecimalSource
                    }
                }
            }
        }
    },
    pr2: {
        auto: boolean,
        amount: DecimalSource,
        timeInPR2: DecimalSource,
        best: Array<DecimalSource | null>
    },
    prai: {
        auto: boolean,
        amount: DecimalSource,
        timeInPRai: DecimalSource,
        best: Array<DecimalSource | null>,
        totals: Array<DecimalSource | null>,
        times: DecimalSource
    }
}

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
        col: {
            timeInCol: player.value.gameProgress.col.timeInCol
        },
        kua: {
            auto: player.value.gameProgress.kua.auto,
            amount: player.value.gameProgress.kua.amount,
            timeInKua: player.value.gameProgress.kua.timeInKua,
            times: player.value.gameProgress.kua.times,
            upgrades: player.value.gameProgress.kua.upgrades,
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
                sources: [],
                enhancers: [],
                enhanceXP: [],
                enhancePow: [],
                xpSpread: player.value.gameProgress.kua.enhancers.xpSpread,
                inExtraction: player.value.gameProgress.kua.enhancers.inExtraction,
                extractionXP: [],
                upgrades: []
            },
            blessings: {
                amount: player.value.gameProgress.kua.blessings.amount,
                totals: [],
                best: [],
                totalEver: player.value.gameProgress.kua.blessings.totalEver,
                bestEver: player.value.gameProgress.kua.blessings.bestEver,
                upgrades: []
            },
            proofs: {
                amount: player.value.gameProgress.kua.proofs.amount,
                totals: [],
                best: [],
                totalEver: player.value.gameProgress.kua.proofs.totalEver,
                bestEver: player.value.gameProgress.kua.proofs.bestEver,
                auto: {
                    other: [],
                    effect: [],
                    kp: [],
                    skp: [],
                    fkp: []
                },
                upgrades: {
                    effect: [],
                    kp: [],
                    skp: [],
                    fkp: []
                },
                strange: {
                    amount: player.value.gameProgress.kua.proofs.strange.amount,
                    hiddenExp: player.value.gameProgress.kua.proofs.strange.hiddenExp,
                    times: player.value.gameProgress.kua.proofs.strange.times,
                    totals: [],
                    best: [],
                    totalEver: player.value.gameProgress.kua.proofs.strange.totalEver,
                    bestEver: player.value.gameProgress.kua.proofs.strange.bestEver,
                },
                finicky: {
                    amount: player.value.gameProgress.kua.proofs.finicky.amount,
                    hiddenExp: player.value.gameProgress.kua.proofs.finicky.hiddenExp,
                    times: player.value.gameProgress.kua.proofs.finicky.times,
                    totals: [],
                    best: [],
                    totalEver: player.value.gameProgress.kua.proofs.finicky.totalEver,
                    bestEver: player.value.gameProgress.kua.proofs.finicky.bestEver,
                    powers: {
                        white: {
                            alloc: player.value.gameProgress.kua.proofs.finicky.powers.white.alloc,
                            amount: player.value.gameProgress.kua.proofs.finicky.powers.white.amount,
                            upgrades: player.value.gameProgress.kua.proofs.finicky.powers.white.upgrades
                        },
                        cyan: {
                            alloc: player.value.gameProgress.kua.proofs.finicky.powers.cyan.alloc,
                            amount: player.value.gameProgress.kua.proofs.finicky.powers.cyan.amount,
                            upgrades: player.value.gameProgress.kua.proofs.finicky.powers.cyan.upgrades
                        },
                        yellow: {
                            alloc: player.value.gameProgress.kua.proofs.finicky.powers.white.alloc,
                            amount: player.value.gameProgress.kua.proofs.finicky.powers.white.amount,
                            upgrades: player.value.gameProgress.kua.proofs.finicky.powers.white.upgrades
                        }
                    }
                }
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

    for (let i = 0; i < player.value.gameProgress.kua.kshards.totals.length; i++) {
        obj.kua.kshards.totals[i] = player.value.gameProgress.kua.kshards.totals[i];
        obj.kua.kshards.best[i] = player.value.gameProgress.kua.kshards.best[i];
        obj.kua.kpower.totals[i] = player.value.gameProgress.kua.kpower.totals[i];
        obj.kua.kpower.best[i] = player.value.gameProgress.kua.kpower.best[i];
        obj.kua.blessings.totals[i] = player.value.gameProgress.kua.blessings.totals[i];
        obj.kua.blessings.best[i] = player.value.gameProgress.kua.blessings.best[i];
        obj.kua.proofs.totals[i] = player.value.gameProgress.kua.proofs.totals[i];
        obj.kua.proofs.best[i] = player.value.gameProgress.kua.proofs.best[i];
        obj.kua.proofs.strange.totals[i] = player.value.gameProgress.kua.proofs.strange.totals[i];
        obj.kua.proofs.strange.best[i] = player.value.gameProgress.kua.proofs.strange.best[i];
        obj.kua.proofs.finicky.totals[i] = player.value.gameProgress.kua.proofs.finicky.totals[i];
        obj.kua.proofs.finicky.best[i] = player.value.gameProgress.kua.proofs.finicky.best[i];
    }

    for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
        obj.kua.blessings.upgrades[i] = player.value.gameProgress.kua.blessings.upgrades[i];
    }

    for (const i in KUA_PROOF_UPGS) {
        for (let j = 0; j < KUA_PROOF_UPGS[i as KuaProofUpgTypes].length; j++) {
            obj.kua.proofs.upgrades[i as KuaProofUpgTypes][j] = player.value.gameProgress.kua.proofs.upgrades[i as KuaProofUpgTypes][j];
        }
    }

    for (const i in KUA_PROOF_AUTO) {
        for (let j = 0; j < KUA_PROOF_AUTO[i as KuaProofAutoTypes].length; j++) {
            obj.kua.proofs.auto[i as KuaProofAutoTypes][j] = player.value.gameProgress.kua.proofs.automationBought[i as KuaProofAutoTypes][j];
        }
    }
    return obj;
};

export const exitChallenge = (id: challengeIDList) => {
    resetStage('col');
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
            player.value.gameProgress.main.upgrades[i].boughtInReset[j] = savedColData.upgradesResetHistory[i][j];
        }
    }

    if (!hasGrowanMilestone(0)) {
        for (let i = 0; i < player.value.gameProgress.main.oneUpgrades.length; i++) {
            player.value.gameProgress.main.oneUpgrades[i] = savedColData.oneUpgrades[i];
        }
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
    player.value.gameProgress.main.pr2.timeInPR2 = savedColData.pr2.timeInPR2;
    if (!hasGrowanMilestone(0)) {
        player.value.gameProgress.main.pr2.amount = savedColData.pr2.amount;
        player.value.gameProgress.main.pr2.best[2] = savedColData.pr2.best[2];
        player.value.gameProgress.main.pr2.best[3] = savedColData.pr2.best[3];
    }

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
    player.value.gameProgress.kua.upgrades = savedColData.kua.upgrades;

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
    player.value.gameProgress.kua.enhancers.xpSpread = savedColData.kua.enhancers.xpSpread;
    player.value.gameProgress.kua.enhancers.inExtraction = savedColData.kua.enhancers.inExtraction;
    player.value.gameProgress.kua.enhancers.upgrades = savedColData.kua.enhancers.upgrades;
    for (let i = 0; i < KUA_ENHANCERS.enhances.length; i++) {
        player.value.gameProgress.kua.enhancers.enhancers[i] = savedColData.kua.enhancers.enhancers[i];
        player.value.gameProgress.kua.enhancers.enhanceXP[i] = savedColData.kua.enhancers.enhanceXP[i];
        player.value.gameProgress.kua.enhancers.enhancePow[i] = savedColData.kua.enhancers.enhancePow[i];
    }
    for (let i = 0; i < KUA_ENHANCERS.sources.length; i++) {
        player.value.gameProgress.kua.enhancers.sources[i] = savedColData.kua.enhancers.sources[i];
        player.value.gameProgress.kua.enhancers.extractionXP[i] = savedColData.kua.enhancers.extractionXP[i];
    }
    for (let i = 0; i < savedColData.kua.enhancers.upgrades.length; i++) {
        player.value.gameProgress.kua.enhancers.upgrades[i] = savedColData.kua.enhancers.upgrades[i];
    }

    if (!hasGrowanMilestone(1)) {
        player.value.gameProgress.kua.blessings.amount = savedColData.kua.blessings.amount;
        player.value.gameProgress.kua.blessings.totals[2] = savedColData.kua.blessings.totals[2];
        player.value.gameProgress.kua.blessings.best[2] = savedColData.kua.blessings.best[2];
        player.value.gameProgress.kua.blessings.totals[3] = savedColData.kua.blessings.totals[3];
        player.value.gameProgress.kua.blessings.best[3] = savedColData.kua.blessings.best[3];
        for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
            player.value.gameProgress.kua.blessings.upgrades[i] = savedColData.kua.blessings.upgrades[i];
        }
    }

    player.value.gameProgress.kua.proofs.amount = savedColData.kua.proofs.amount;
    player.value.gameProgress.kua.proofs.totals[2] = savedColData.kua.proofs.totals[2];
    player.value.gameProgress.kua.proofs.best[2] = savedColData.kua.proofs.best[2];
    player.value.gameProgress.kua.proofs.totals[3] = savedColData.kua.proofs.totals[3];
    player.value.gameProgress.kua.proofs.best[3] = savedColData.kua.proofs.best[3];
    player.value.gameProgress.kua.proofs.strange.amount = savedColData.kua.proofs.strange.amount;
    player.value.gameProgress.kua.proofs.strange.hiddenExp = savedColData.kua.proofs.strange.hiddenExp;
    player.value.gameProgress.kua.proofs.strange.times = savedColData.kua.proofs.strange.times;
    player.value.gameProgress.kua.proofs.strange.totals[2] = savedColData.kua.proofs.strange.totals[2];
    player.value.gameProgress.kua.proofs.strange.best[2] = savedColData.kua.proofs.strange.best[2];
    player.value.gameProgress.kua.proofs.strange.totals[3] = savedColData.kua.proofs.strange.totals[3];
    player.value.gameProgress.kua.proofs.strange.best[3] = savedColData.kua.proofs.strange.best[3];
    player.value.gameProgress.kua.proofs.finicky.amount = savedColData.kua.proofs.finicky.amount;
    player.value.gameProgress.kua.proofs.finicky.hiddenExp = savedColData.kua.proofs.finicky.hiddenExp;
    player.value.gameProgress.kua.proofs.finicky.times = savedColData.kua.proofs.finicky.times;
    player.value.gameProgress.kua.proofs.finicky.totals[2] = savedColData.kua.proofs.finicky.totals[2];
    player.value.gameProgress.kua.proofs.finicky.best[2] = savedColData.kua.proofs.finicky.best[2];
    player.value.gameProgress.kua.proofs.finicky.totals[3] = savedColData.kua.proofs.finicky.totals[3];
    player.value.gameProgress.kua.proofs.finicky.best[3] = savedColData.kua.proofs.finicky.best[3];
    player.value.gameProgress.kua.proofs.finicky.powers.white.alloc = savedColData.kua.proofs.finicky.powers.white.alloc;
    player.value.gameProgress.kua.proofs.finicky.powers.white.amount = savedColData.kua.proofs.finicky.powers.white.amount;
    player.value.gameProgress.kua.proofs.finicky.powers.white.upgrades = savedColData.kua.proofs.finicky.powers.white.upgrades;
    player.value.gameProgress.kua.proofs.finicky.powers.cyan.alloc = savedColData.kua.proofs.finicky.powers.cyan.alloc;
    player.value.gameProgress.kua.proofs.finicky.powers.cyan.amount = savedColData.kua.proofs.finicky.powers.cyan.amount;
    player.value.gameProgress.kua.proofs.finicky.powers.cyan.upgrades = savedColData.kua.proofs.finicky.powers.cyan.upgrades;
    player.value.gameProgress.kua.proofs.finicky.powers.yellow.alloc = savedColData.kua.proofs.finicky.powers.yellow.alloc;
    player.value.gameProgress.kua.proofs.finicky.powers.yellow.amount = savedColData.kua.proofs.finicky.powers.yellow.amount;
    player.value.gameProgress.kua.proofs.finicky.powers.yellow.upgrades = savedColData.kua.proofs.finicky.powers.yellow.upgrades;


    for (const i in KUA_PROOF_UPGS) {
        for (let j = 0; j < KUA_PROOF_UPGS[i as KuaProofUpgTypes].length; j++) {
            player.value.gameProgress.kua.proofs.upgrades[i as KuaProofUpgTypes][j] = savedColData.kua.proofs.upgrades[i as KuaProofUpgTypes][j];
        }
    }

    for (const i in KUA_PROOF_AUTO) {
        for (let j = 0; j < KUA_PROOF_AUTO[i as KuaProofAutoTypes].length; j++) {
            player.value.gameProgress.kua.proofs.automationBought[i as KuaProofAutoTypes][j] = savedColData.kua.proofs.auto[i as KuaProofAutoTypes][j];
        }
    }

    player.value.gameProgress.col.timeInCol = savedColData.col.timeInCol;
};

export const challengeToggle = (id: challengeIDList) => {
    if (!inChallenge(id)) {
        if (player.value.gameProgress.col.challengeOrder.layer[player.value.gameProgress.col.challengeOrder.layer.length - 1] <= COL_CHALLENGES[id].layer) {
            return;
        }

        player.value.gameProgress.inChallenge[id].name = COL_CHALLENGES[id].name;
        player.value.gameProgress.inChallenge[id].goalDesc = COL_CHALLENGES[id].goalDesc.value;
        player.value.gameProgress.inChallenge[id].entered = true;
        player.value.gameProgress.inChallenge[id].enteredDiff = player.value.gameProgress.inChallenge[id].optionalDiff;

        const obj: colChallengesSavedData = makeColChallengeSaveData();

        player.value.gameProgress.col.saved[id] = obj;
        player.value.gameProgress.col.challengeOrder.chalID.push(COL_CHALLENGES[id].id);
        player.value.gameProgress.col.challengeOrder.layer.push(COL_CHALLENGES[id].layer);
        resetStage('col');
        if (id === 'im' && !hasGrowanMilestone(0)) {
            player.value.gameProgress.main.pr2.amount = D(1);
        }
    } else {
        if (player.value.gameProgress.col.challengeOrder.chalID.length === 0 || player.value.gameProgress.col.challengeOrder.layer.length === 0) {
            console.warn(`player.gameProgress.col.challengeOrder has no objects, but you are exiting a challenge! Exiting all challenges...`);
            for (const i in player.value.gameProgress.inChallenge) {
                player.value.gameProgress.inChallenge[i as challengeIDList].entered = false;
            }
            return;
        }
        if (COL_CHALLENGES[id].canComplete.value) {
            if (COL_CHALLENGES[id].type === 1 || COL_CHALLENGES[id].type === 3) {
                if (Decimal.eq(player.value.gameProgress.inChallenge[id].enteredDiff, player.value.gameProgress.col.completed[id])) {
                    player.value.gameProgress.col.completed[id] = Decimal.add(player.value.gameProgress.col.completed[id], 1).min(COL_CHALLENGES[id].cap);
                    player.value.gameProgress.inChallenge[id].optionalDiff = Decimal.add(player.value.gameProgress.inChallenge[id].optionalDiff, 1).min(COL_CHALLENGES[id].cap);
                }
            } else {
                player.value.gameProgress.col.completed[id] = Decimal.add(player.value.gameProgress.col.completed[id], 1).min(COL_CHALLENGES[id].cap);
            }

            setAchievement(3, 2);
            setAchievement(2, 3);
            setAchievement(2, 1);
        }

        let layerExited = player.value.gameProgress.col.challengeOrder.layer[player.value.gameProgress.col.challengeOrder.chalID.indexOf(id)];
        if (layerExited === undefined) {
            console.warn(`layerExited from exiting a COL challenge was left undefined! Defaulting to 0...`);
            layerExited = 0;
        }
        for (let i = player.value.gameProgress.col.challengeOrder.chalID.length - 1; i >= 0; i--) {
            if (player.value.gameProgress.col.challengeOrder.layer[i] > layerExited) {
                break;
            }
            exitChallenge(player.value.gameProgress.col.challengeOrder.chalID[i]);
        }
    }
};