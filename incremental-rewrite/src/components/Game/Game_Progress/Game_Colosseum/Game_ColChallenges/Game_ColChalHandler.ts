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
    return player.value.prog.inChallenge[id].overall ? Decimal.sub(challengeDepth(id), 1) : player.value.prog.inChallenge[id].optionalDiff;
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
    return player.value.prog.inChallenge[id].depths;
};

export const timesCompleted = (id: challengeIDList): DecimalSource => {
    if (player.value.prog.col.completed[id] === undefined) {
        return D(0);
    }
    return player.value.prog.col.completed[id];
};

export const completedChallenge = (id: challengeIDList): boolean => {
    if (player.value.prog.col.completed[id] === undefined) {
        return false;
    }
    return Decimal.gte(player.value.prog.col.completed[id], COL_CHALLENGES[id].cap);
};

export const inChallenge = (id: challengeIDList): boolean => {
    if (player.value.prog.inChallenge[id] === undefined) {
        return false;
    }
    return player.value.prog.inChallenge[id].entered;
};

// we have to do this because js passes objects by reference and stuff
export type colChallengesSavedData = {
    points: DecimalSource,
    upgradesBought: Array<DecimalSource>,
    upgradesAuto: Array<boolean>,
    boughtInKua: Array<DecimalSource>,
    oneUpgrades: Array<DecimalSource>,
    pointBestPRai: DecimalSource,
    pointBestLayer4: DecimalSource,
    pointTotalPRai: DecimalSource,
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
            totalInLayer4: DecimalSource,
            bestInLayer4: DecimalSource,
            upgrades: number
        },
        kpower: {
            amount: DecimalSource,
            totalInLayer4: DecimalSource,
            bestInLayer4: DecimalSource,
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
            bestInLayer4: DecimalSource,
            upgrades: Array<DecimalSource>
        },
        proofs: {
            amount: DecimalSource,
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
            },
            finicky: {
                amount: DecimalSource,
                hiddenExp: DecimalSource,
                times: DecimalSource,
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
    },
    prai: {
        auto: boolean,
        amount: DecimalSource,
        timeInPRai: DecimalSource,
        bestInKua: DecimalSource,
        totalInKua: DecimalSource,
        times: DecimalSource
    }
}

export const makeColChallengeSaveData = (): colChallengesSavedData => {
    const obj: colChallengesSavedData = {
        points: player.value.prog.main.points,
        upgradesBought: [],
        upgradesAuto: [],
        boughtInKua: [],
        oneUpgrades: [],
        pointBestPRai: player.value.prog.main.bestInPrai,
        pointBestLayer4: player.value.prog.main.bestInLayer4,
        pointTotalPRai: player.value.prog.main.totalInPrai,
        col: {
            timeInCol: player.value.prog.col.timeInCol
        },
        kua: {
            auto: player.value.prog.kua.auto,
            amount: player.value.prog.kua.amount,
            timeInKua: player.value.prog.kua.timeInKua,
            times: player.value.prog.kua.times,
            upgrades: player.value.prog.kua.upgrades,
            kshards: {
                amount: player.value.prog.kua.kshards.amount,
                totalInLayer4: player.value.prog.kua.kshards.totalInLayer4,
                bestInLayer4: player.value.prog.kua.kshards.bestInLayer4,
                upgrades: player.value.prog.kua.kshards.upgrades
            },
            kpower: {
                amount: player.value.prog.kua.kpower.amount,
                totalInLayer4: player.value.prog.kua.kpower.totalInLayer4,
                bestInLayer4: player.value.prog.kua.kpower.bestInLayer4,
                upgrades: player.value.prog.kua.kpower.upgrades
            },
            enhancers: {
                autoSources: player.value.prog.kua.enhancers.autoSources,
                sources: [],
                enhancers: [],
                enhanceXP: [],
                enhancePow: [],
                xpSpread: player.value.prog.kua.enhancers.xpSpread,
                inExtraction: player.value.prog.kua.enhancers.inExtraction,
                extractionXP: [],
                upgrades: []
            },
            blessings: {
                amount: player.value.prog.kua.blessings.amount,
                bestInLayer4: player.value.prog.kua.blessings.bestInLayer4,
                upgrades: []
            },
            proofs: {
                amount: player.value.prog.kua.proofs.amount,
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
                    amount: player.value.prog.kua.proofs.strange.amount,
                    hiddenExp: player.value.prog.kua.proofs.strange.hiddenExp,
                    times: player.value.prog.kua.proofs.strange.times,
                },
                finicky: {
                    amount: player.value.prog.kua.proofs.finicky.amount,
                    hiddenExp: player.value.prog.kua.proofs.finicky.hiddenExp,
                    times: player.value.prog.kua.proofs.finicky.times,
                    powers: {
                        white: {
                            alloc: player.value.prog.kua.proofs.finicky.powers.white.alloc,
                            amount: player.value.prog.kua.proofs.finicky.powers.white.amount,
                            upgrades: player.value.prog.kua.proofs.finicky.powers.white.upgrades
                        },
                        cyan: {
                            alloc: player.value.prog.kua.proofs.finicky.powers.cyan.alloc,
                            amount: player.value.prog.kua.proofs.finicky.powers.cyan.amount,
                            upgrades: player.value.prog.kua.proofs.finicky.powers.cyan.upgrades
                        },
                        yellow: {
                            alloc: player.value.prog.kua.proofs.finicky.powers.white.alloc,
                            amount: player.value.prog.kua.proofs.finicky.powers.white.amount,
                            upgrades: player.value.prog.kua.proofs.finicky.powers.white.upgrades
                        }
                    }
                }
            }
        },
        pr2: {
            auto: player.value.prog.main.pr2.auto,
            amount: player.value.prog.main.pr2.amount,
            timeInPR2: player.value.prog.main.pr2.timeInPR2,
        },
        prai: {
            auto: player.value.prog.main.prai.auto,
            amount: player.value.prog.main.prai.amount,
            timeInPRai: player.value.prog.main.prai.timeInPRai,
            bestInKua: player.value.prog.main.prai.bestInKua,
            totalInKua: player.value.prog.main.prai.totalInKua,
            times: player.value.prog.main.prai.times
        }
    };
    for (let i = 0; i < player.value.prog.main.upgrades.length; i++) {
        obj.upgradesBought.push(player.value.prog.main.upgrades[i].bought);
        obj.upgradesAuto.push(player.value.prog.main.upgrades[i].auto);
        obj.boughtInKua.push(player.value.prog.main.upgrades[i].boughtInKua);
    }

    for (let i = 0; i < player.value.prog.main.oneUpgrades.length; i++) {
        obj.oneUpgrades.push(player.value.prog.main.oneUpgrades[i]);
    }

    for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
        obj.kua.blessings.upgrades[i] = player.value.prog.kua.blessings.upgrades[i];
    }

    for (const i in KUA_PROOF_UPGS) {
        for (let j = 0; j < KUA_PROOF_UPGS[i as KuaProofUpgTypes].length; j++) {
            obj.kua.proofs.upgrades[i as KuaProofUpgTypes][j] = player.value.prog.kua.proofs.upgrades[i as KuaProofUpgTypes][j];
        }
    }

    for (const i in KUA_PROOF_AUTO) {
        for (let j = 0; j < KUA_PROOF_AUTO[i as KuaProofAutoTypes].length; j++) {
            obj.kua.proofs.auto[i as KuaProofAutoTypes][j] = player.value.prog.kua.proofs.automationBought[i as KuaProofAutoTypes][j];
        }
    }
    return obj;
};

export const exitChallenge = (id: challengeIDList) => {
    resetStage('col');
    const chalIdCheck = player.value.prog.col.challengeOrder.chalID.pop();
    if (chalIdCheck !== id) {
        player.value.prog.col.challengeOrder.chalID.push(chalIdCheck!);
        throw new Error(
            "major error! check player.value.gameProgress.col.challengeOrder because challenge order is wrong!!"
        );
    }
    player.value.prog.col.challengeOrder.layer.pop();
    player.value.prog.inChallenge[id].entered = false;

    const savedColData = player.value.prog.col.saved[id]!;
    for (let i = 0; i < player.value.prog.main.upgrades.length; i++) {
        player.value.prog.main.upgrades[i].bought = savedColData.upgradesBought[i];
        player.value.prog.main.upgrades[i].auto = savedColData.upgradesAuto[i];
        player.value.prog.main.upgrades[i].boughtInKua = savedColData.boughtInKua[i];
    }

    if (!hasGrowanMilestone(0)) {
        for (let i = 0; i < player.value.prog.main.oneUpgrades.length; i++) {
            player.value.prog.main.oneUpgrades[i] = savedColData.oneUpgrades[i];
        }
    }

    player.value.prog.main.points = savedColData.points;
    player.value.prog.main.bestInPrai = savedColData.pointBestPRai
    player.value.prog.main.bestInLayer4 = savedColData.pointBestLayer4
    player.value.prog.main.totalInPrai = savedColData.pointTotalPRai

    player.value.prog.main.pr2.auto = savedColData.pr2.auto;
    player.value.prog.main.pr2.timeInPR2 = savedColData.pr2.timeInPR2;
    if (!hasGrowanMilestone(0)) {
        player.value.prog.main.pr2.amount = savedColData.pr2.amount;
    }

    player.value.prog.main.prai.auto = savedColData.prai.auto;
    player.value.prog.main.prai.amount = savedColData.prai.amount;
    player.value.prog.main.prai.times = savedColData.prai.times;
    player.value.prog.main.prai.timeInPRai = savedColData.prai.timeInPRai;
    player.value.prog.main.prai.bestInKua = savedColData.prai.bestInKua;
    player.value.prog.main.prai.totalInKua = savedColData.prai.totalInKua;

    player.value.prog.kua.auto = savedColData.kua.auto;
    player.value.prog.kua.amount = savedColData.kua.amount;
    player.value.prog.kua.timeInKua = savedColData.kua.timeInKua;
    player.value.prog.kua.times = savedColData.kua.times;
    player.value.prog.kua.upgrades = savedColData.kua.upgrades;

    player.value.prog.kua.kshards.amount = savedColData.kua.kshards.amount;
    player.value.prog.kua.kshards.upgrades = savedColData.kua.kshards.upgrades;
    player.value.prog.kua.kshards.totalInLayer4 = savedColData.kua.kshards.totalInLayer4;
    player.value.prog.kua.kshards.bestInLayer4 = savedColData.kua.kshards.bestInLayer4;

    player.value.prog.kua.kpower.amount = savedColData.kua.kpower.amount;
    player.value.prog.kua.kpower.totalInLayer4 = savedColData.kua.kpower.totalInLayer4;
    player.value.prog.kua.kpower.bestInLayer4 = savedColData.kua.kpower.bestInLayer4;
    player.value.prog.kua.kpower.upgrades = savedColData.kua.kpower.upgrades;

    player.value.prog.kua.enhancers.autoSources = savedColData.kua.enhancers.autoSources;
    player.value.prog.kua.enhancers.xpSpread = savedColData.kua.enhancers.xpSpread;
    player.value.prog.kua.enhancers.inExtraction = savedColData.kua.enhancers.inExtraction;
    player.value.prog.kua.enhancers.upgrades = savedColData.kua.enhancers.upgrades;
    for (let i = 0; i < KUA_ENHANCERS.enhances.length; i++) {
        player.value.prog.kua.enhancers.enhancers[i] = savedColData.kua.enhancers.enhancers[i];
        player.value.prog.kua.enhancers.enhanceXP[i] = savedColData.kua.enhancers.enhanceXP[i];
        player.value.prog.kua.enhancers.enhancePow[i] = savedColData.kua.enhancers.enhancePow[i];
    }
    for (let i = 0; i < KUA_ENHANCERS.sources.length; i++) {
        player.value.prog.kua.enhancers.sources[i] = savedColData.kua.enhancers.sources[i];
        player.value.prog.kua.enhancers.extractionXP[i] = savedColData.kua.enhancers.extractionXP[i];
    }
    for (let i = 0; i < savedColData.kua.enhancers.upgrades.length; i++) {
        player.value.prog.kua.enhancers.upgrades[i] = savedColData.kua.enhancers.upgrades[i];
    }

    if (!hasGrowanMilestone(1)) {
        player.value.prog.kua.blessings.amount = savedColData.kua.blessings.amount;
        player.value.prog.kua.blessings.bestInLayer4 = savedColData.kua.blessings.bestInLayer4;
        for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
            player.value.prog.kua.blessings.upgrades[i] = savedColData.kua.blessings.upgrades[i];
        }
    }

    player.value.prog.kua.proofs.amount = savedColData.kua.proofs.amount;
    player.value.prog.kua.proofs.strange.amount = savedColData.kua.proofs.strange.amount;
    player.value.prog.kua.proofs.strange.hiddenExp = savedColData.kua.proofs.strange.hiddenExp;
    player.value.prog.kua.proofs.strange.times = savedColData.kua.proofs.strange.times;
    player.value.prog.kua.proofs.finicky.amount = savedColData.kua.proofs.finicky.amount;
    player.value.prog.kua.proofs.finicky.hiddenExp = savedColData.kua.proofs.finicky.hiddenExp;
    player.value.prog.kua.proofs.finicky.times = savedColData.kua.proofs.finicky.times;
    player.value.prog.kua.proofs.finicky.powers.white.alloc = savedColData.kua.proofs.finicky.powers.white.alloc;
    player.value.prog.kua.proofs.finicky.powers.white.amount = savedColData.kua.proofs.finicky.powers.white.amount;
    player.value.prog.kua.proofs.finicky.powers.white.upgrades = savedColData.kua.proofs.finicky.powers.white.upgrades;
    player.value.prog.kua.proofs.finicky.powers.cyan.alloc = savedColData.kua.proofs.finicky.powers.cyan.alloc;
    player.value.prog.kua.proofs.finicky.powers.cyan.amount = savedColData.kua.proofs.finicky.powers.cyan.amount;
    player.value.prog.kua.proofs.finicky.powers.cyan.upgrades = savedColData.kua.proofs.finicky.powers.cyan.upgrades;
    player.value.prog.kua.proofs.finicky.powers.yellow.alloc = savedColData.kua.proofs.finicky.powers.yellow.alloc;
    player.value.prog.kua.proofs.finicky.powers.yellow.amount = savedColData.kua.proofs.finicky.powers.yellow.amount;
    player.value.prog.kua.proofs.finicky.powers.yellow.upgrades = savedColData.kua.proofs.finicky.powers.yellow.upgrades;


    for (const i in KUA_PROOF_UPGS) {
        for (let j = 0; j < KUA_PROOF_UPGS[i as KuaProofUpgTypes].length; j++) {
            player.value.prog.kua.proofs.upgrades[i as KuaProofUpgTypes][j] = savedColData.kua.proofs.upgrades[i as KuaProofUpgTypes][j];
        }
    }

    for (const i in KUA_PROOF_AUTO) {
        for (let j = 0; j < KUA_PROOF_AUTO[i as KuaProofAutoTypes].length; j++) {
            player.value.prog.kua.proofs.automationBought[i as KuaProofAutoTypes][j] = savedColData.kua.proofs.auto[i as KuaProofAutoTypes][j];
        }
    }

    player.value.prog.col.timeInCol = savedColData.col.timeInCol;
};

export const challengeToggle = (id: challengeIDList) => {
    if (!inChallenge(id)) {
        if (player.value.prog.col.challengeOrder.layer[player.value.prog.col.challengeOrder.layer.length - 1] <= COL_CHALLENGES[id].layer) {
            return;
        }

        player.value.prog.inChallenge[id].name = COL_CHALLENGES[id].name;
        player.value.prog.inChallenge[id].goalDesc = COL_CHALLENGES[id].goalDesc.value;
        player.value.prog.inChallenge[id].entered = true;
        player.value.prog.inChallenge[id].enteredDiff = player.value.prog.inChallenge[id].optionalDiff;

        const obj: colChallengesSavedData = makeColChallengeSaveData();

        player.value.prog.col.saved[id] = obj;
        player.value.prog.col.challengeOrder.chalID.push(COL_CHALLENGES[id].id);
        player.value.prog.col.challengeOrder.layer.push(COL_CHALLENGES[id].layer);
        resetStage('col');
        if (id === 'im' && !hasGrowanMilestone(0)) {
            player.value.prog.main.pr2.amount = D(1);
        }
    } else {
        if (player.value.prog.col.challengeOrder.chalID.length === 0 || player.value.prog.col.challengeOrder.layer.length === 0) {
            console.warn(`player.gameProgress.col.challengeOrder has no objects, but you are exiting a challenge! Exiting all challenges...`);
            for (const i in player.value.prog.inChallenge) {
                player.value.prog.inChallenge[i as challengeIDList].entered = false;
            }
            return;
        }
        if (COL_CHALLENGES[id].canComplete.value) {
            if (COL_CHALLENGES[id].type === 1 || COL_CHALLENGES[id].type === 3) {
                if (Decimal.eq(player.value.prog.inChallenge[id].enteredDiff, player.value.prog.col.completed[id])) {
                    player.value.prog.col.completed[id] = Decimal.add(player.value.prog.col.completed[id], 1).min(COL_CHALLENGES[id].cap);
                    player.value.prog.inChallenge[id].optionalDiff = Decimal.add(player.value.prog.inChallenge[id].optionalDiff, 1).min(COL_CHALLENGES[id].cap);
                }
            } else {
                player.value.prog.col.completed[id] = Decimal.add(player.value.prog.col.completed[id], 1).min(COL_CHALLENGES[id].cap);
            }

            setAchievement(3, 2);
            setAchievement(2, 3);
            setAchievement(2, 1);
        }

        let layerExited = player.value.prog.col.challengeOrder.layer[player.value.prog.col.challengeOrder.chalID.indexOf(id)];
        if (layerExited === undefined) {
            console.warn(`layerExited from exiting a COL challenge was left undefined! Defaulting to 0...`);
            layerExited = 0;
        }
        for (let i = player.value.prog.col.challengeOrder.chalID.length - 1; i >= 0; i--) {
            if (player.value.prog.col.challengeOrder.layer[i] > layerExited) {
                break;
            }
            exitChallenge(player.value.prog.col.challengeOrder.chalID[i]);
        }
    }
};