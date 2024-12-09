import "./assets/main.css";

import { createApp, ref, type Ref } from "vue";
import App from "./App.vue";
import Decimal, { type DecimalSource } from "break_eternity.js";
import { type Tab } from "./components/MainTabs/MainTabs";
import { D, expQuadCostGrowth, linearAdd, scale, smoothExp, smoothPoly } from "./calc";
import { format } from "./format";
import { saveID, SAVE_MODES, saveTheFrickingGame, resetTheWholeGame } from "./saving";
import { getSCSLAttribute, setSCSLEffectDisp, compileScalSoftList, updateAllSCSL } from "./softcapScaling";
import { updateAllStart, initAllMainUpgrades, initAllMainOneUpgrades, MAIN_ONE_UPGS, type TmpMainUpgrade } from "./components/Game/Game_Progress/Game_Main/Game_Main";
import { ACHIEVEMENT_DATA, fixAchievements, getAchievementEffect, ifAchievement, setAchievement } from "./components/Game/Game_Achievements/Game_Achievements";
import { getKuaUpgrade, initAllKBlessingUpgrades, initAllKProofUpgrades, KUA_BLESS_UPGS, KUA_PROOF_UPGS, updateAllKua, type KuaProofUpgTypes, type TmpKProofUpgs } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_Kuaraniai";
import { diePopupsDie } from "./popups";
import { challengeDepth, COL_CHALLENGES, getColResEffect, getColXPtoNext, inChallenge, timesCompleted, updateAllCol, type Challenge, type challengeIDList, type colChallengesSavedData } from "./components/Game/Game_Progress/Game_Colosseum/Game_Colosseum";
import { updateAllTax } from "./components/Game/Game_Progress/Game_Taxation/Game_Taxation";
import { ALL_FACTORS, initStatsFactors, setFactor, type FactorColorID } from "./components/Game/Game_Stats/Game_Stats";
import { updatePlayerData } from "./versionControl";
import { reset } from "./resets";
import { speedToConsume, timeSpeedBoost } from "./components/Game/Game_Progress/Game_Stored_Time/Game_Stored_Time";
import { UPDATE_LOG } from "./components/Game/Game_Options/Game_Options";

// this may slow down calculations!!
export const NAN_CHECKER = true;

export const NaNCheck = (num: DecimalSource, error = 'NaN detected!') => {
    if (NAN_CHECKER) {
        if (Decimal.isNaN(num)) {
            throw new Error(error);
        }
    }
}

export const NEXT_UNLOCKS = [
    {
        get shown() {
            return Decimal.gte(player.value.gameProgress.main.prai.bestEver, 3);
        },
        get done() {
            return Decimal.gte(player.value.gameProgress.main.prai.bestEver, 9.5);
        },
        get dispPart1() {
            return `${format(player.value.gameProgress.main.prai.bestEver)} / ${format(10)}`;
        },
        dispPart2: `PRai to unlock the next layer.`,
        color: "#ffffff"
    },
    {
        get shown() {
            return Decimal.gte(player.value.gameProgress.main.pr2.bestEver, 3);
        },
        get done() {
            return player.value.gameProgress.unlocks.kua;
        },
        get dispPart1() {
            return `${format(player.value.gameProgress.main.pr2.bestEver)} / ${format(10)}`;
        },
        dispPart2: `PR2 to unlock the next layer.`,
        color: "#7958ff"
    },
    // {
    //     get shown() { return player.value.gameProgress.kua.kpower.upgrades >= 2; },
    //     get done() { return player.value.gameProgress.unlocks.kuaEnhancers; },
    //     get dispPart1() { return `${format(player.value.gameProgress.kua.amount, 3)} / ${format(0.01, 2)}`; },
    //     dispPart2: `Kuaraniai to unlock the next feature.`,
    //     color: "#a040ff"
    // },
    {
        get shown() {
            return player.value.gameProgress.kua.kpower.upgrades >= 2;
        },
        get done() {
            return player.value.gameProgress.unlocks.col;
        },
        get dispPart1() {
            return `${format(player.value.gameProgress.kua.amount, 3)} / ${format(100)}`;
        },
        dispPart2: `Kuaraniai to unlock the next feature.`,
        color: "#ff6000"
    },
    {
        get shown() {
            return player.value.gameProgress.kua.kpower.upgrades >= 8;
        },
        get done() {
            return player.value.gameProgress.unlocks.kblessings;
        },
        get dispPart1() {
            return `${format(player.value.gameProgress.kua.amount)} / ${format(1e6)}`;
        },
        dispPart2: `Kuaraniai to unlock the next feature.`,
        color: "#00ff00"
    },
    {
        get shown() {
            return player.value.gameProgress.unlocks.kblessings;
        },
        get done() {
            return player.value.gameProgress.kua.upgrades >= 3 || (player.value.gameProgress.unlocks.kproofs === undefined ? false : player.value.gameProgress.unlocks.kproofs.main);
        },
        get dispPart1() {
            return `${player.value.gameProgress.kua.upgrades} / 3`;
        },
        dispPart2: `Kuaraniai Upgrades to unlock the next feature.`,
        color: "#00ffff"
    },
    {
        get shown() {
            return player.value.gameProgress.unlocks.kproofs === undefined ? false : player.value.gameProgress.unlocks.kproofs.main;
        },
        get done() {
            return player.value.gameProgress.unlocks.kproofs.strange;
        },
        get dispPart1() {
            return `${format(tmp.value.kua.proofs.exp, 2)} / ${format(12, 2)}`;
        },
        dispPart2: `KProof Exponent to unlock the next sub-feature.`,
        color: "#ffff00"
    },
    {
        get shown() {
            return Decimal.gte(player.value.gameProgress.unlocks.kproofs === undefined ? 0 : player.value.gameProgress.kua.proofs.strange.amount, 1e6);
        },
        get done() {
            return player.value.gameProgress.unlocks.kproofs.finicky;
        },
        get dispPart1() {
            return `${format(player.value.gameProgress.kua.proofs.strange.amount)} / ${format(1e10)}`;
        },
        dispPart2: `Strange KProofs to unlock the next sub-feature.`,
        color: "#00ff00"
    },
    // {
    //     get shown() {
    //         return Decimal.gte(player.value.gameProgress.main.best[3]!, "e500");
    //     },
    //     get done() {
    //         return player.value.gameProgress.unlocks.tax;
    //     },
    //     get dispPart1() {
    //         return `${format(player.value.gameProgress.main.best[3]!)} / ${format("ee3")}`;
    //     },
    //     dispPart2: `Points to unlock the next layers.`,
    //     color: "#f0d000"
    // }
];

type Game = {
    currentSave: number;
    autoSaveInterval: number;
    idGen: number;
    list: Array<{
        id: number;
        name: string;
        modes: Array<number>;
        data: Player;
    }>;
};

export type Player = {
    lastUpdated: number,
    offlineTime: DecimalSource,
    totalRealTime: number,
    gameTime: DecimalSource,
    setTimeSpeed: DecimalSource,
    version: number,
    displayVersion: string,
    settings: {
        notation: number,
        scaleSoftColors: boolean
        scaledUpgBase: boolean
    },

    gameProgress: {
        dilatedTime: {
            normalized: boolean,
            normalizeTime: number,
            paused: boolean,
            speed: number,
            speedEnabled: boolean
        },
        achievements: Array<Array<number>>,
        inChallenge: Challenge,
        unlocks: {
            pr2: boolean,
            kua: boolean,
            kenhancers: boolean,
            kblessings: boolean,
            kproofs: {
                main: boolean,
                strange: boolean,
                finicky: boolean
            },
            col: boolean,
            tax: boolean
        },
        main: {
            points: DecimalSource,
            totals: Array<null | DecimalSource>, // prai, pr2, kua, col, tax
            best: Array<null | DecimalSource>, // prai, pr2, kua, col, tax
            totalEver: DecimalSource,
            bestEver: DecimalSource,
            upgrades: Array<{
                bought: DecimalSource,
                best: DecimalSource,
                auto: boolean,
                boughtInReset: Array<DecimalSource> // prai, pr2, kua, col, tax
                accumulated: DecimalSource
            }>,
            oneUpgrades: Array<DecimalSource>,
            prai: {
                totals: Array<null | DecimalSource>, // null, pr2, kua, col, tax
                best: Array<null | DecimalSource>, // null, pr2, kua, col, tax
                totalEver: DecimalSource,
                bestEver: DecimalSource,
                amount: DecimalSource,
                timeInPRai: DecimalSource,
                auto: boolean,
                times: DecimalSource
            },
            pr2: {
                best: Array<null | DecimalSource>, // null, null, kua, col, tax
                bestEver: DecimalSource,
                amount: DecimalSource,
                timeInPR2: DecimalSource,
                auto: boolean
            }
        },
        kua: {
            auto: boolean,
            amount: DecimalSource,
            totals: Array<null | DecimalSource>, // null, null, null, col, tax
            best: Array<null | DecimalSource>, // null, null, null, col, tax
            totalEver: DecimalSource,
            bestEver: DecimalSource,
            timeInKua: DecimalSource,
            times: DecimalSource,
            upgrades: number
            kshards: {
                amount: DecimalSource,
                totals: Array<null | DecimalSource>, // null, null, null, col, tax
                best: Array<null | DecimalSource>, // null, null, null, col, tax
                totalEver: DecimalSource,
                bestEver: DecimalSource,
                upgrades: number
            },
            kpower: {
                amount: DecimalSource,
                totals: Array<null | DecimalSource>, // null, null, null, col, tax
                best: Array<null | DecimalSource>, // null, null, null, col, tax
                totalEver: DecimalSource,
                bestEver: DecimalSource,
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
                totals: Array<null | DecimalSource>, // null, null, null, col, tax
                best: Array<null | DecimalSource>, // null, null, null, col, tax
                totalEver: DecimalSource,
                bestEver: DecimalSource,
                upgrades: Array<DecimalSource>
            },
            proofs: {
                amount: DecimalSource,
                totals: Array<null | DecimalSource>, // null, null, null, col, tax
                best: Array<null | DecimalSource>, // null, null, null, col, tax
                totalEver: DecimalSource,
                bestEver: DecimalSource,
                automationBought: {
                    other: Array<boolean>,
                    effect: Array<boolean>,
                    kp: Array<boolean>,
                    skp: Array<boolean>,
                    fkp: Array<boolean>
                },
                automationEnabled: {
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
                    cooldown: DecimalSource,
                    amount: DecimalSource,
                    hiddenExp: DecimalSource,
                    times: DecimalSource,
                    totals: Array<null | DecimalSource>, // null, null, null, col, tax
                    best: Array<null | DecimalSource>, // null, null, null, col, tax
                    totalEver: DecimalSource,
                    bestEver: DecimalSource
                },
                finicky: {
                    cooldown: DecimalSource,
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
                },
            }
        },
        col: {
            inAChallenge: boolean,
            completed: {
                nk: DecimalSource,
                su: DecimalSource,
                df: DecimalSource,
                im: DecimalSource,
                dc: DecimalSource,
                sn: DecimalSource
            },
            challengeOrder: { chalID: Array<challengeIDList>, layer: Array<number> },
            completedAll: boolean,
            saved: {
                nk: colChallengesSavedData | null,
                su: colChallengesSavedData | null,
                df: colChallengesSavedData | null,
                im: colChallengesSavedData | null,
                dc: colChallengesSavedData | null,
                sn: colChallengesSavedData | null
            },
            power: DecimalSource,
            totals: Array<null | DecimalSource>, // null, null, null, null, tax
            best: Array<null | DecimalSource>, // null, null, null, null, tax
            totalEver: DecimalSource,
            bestEver: DecimalSource,
            time: DecimalSource,
            maxTime: DecimalSource,
            research: {
                xpTotal: Array<DecimalSource>,
                enabled: Array<boolean>
            }
        },
        tax: {
            timeInTax: DecimalSource,
            auto: boolean,
            amount: DecimalSource,
            totals: Array<null | DecimalSource>, // null, null, null, null, null
            best: Array<null | DecimalSource>, // null, null, null, null, null
            totalEver: DecimalSource,
            bestEver: DecimalSource,
            times: DecimalSource,
            upgrades: Array<DecimalSource>
        }
    }
};

export const initGameBeforeSave = (): Game => {
    const data: Player = initPlayer();

    return {
        currentSave: 0,
        autoSaveInterval: 5,
        idGen: 0,
        list: [
            {
                id: 0,
                name: "Save #1",
                modes: [],
                data: data
            }
        ]
    };
};

export const makeChallengeInfo = () => {
    return {
        id: 0,
        name: "",
        goalDesc: "",
        entered: false,
        trapped: false,
        overall: false,
        depths: D(0),
        optionalDiff: D(0),
        enteredDiff: D(0)
    };
};

export const initPlayer = (set = false): Player => {
    const mainUpgrades = [];
    for (let i = 0; i < 9; i++) {
        mainUpgrades.push({
            bought: D(0),
            best: D(0),
            auto: false,
            boughtInReset: [D(0), D(0), D(0), D(0), D(0)],
            accumulated: D(0)
        });
    }
    const data = {
        lastUpdated: Date.now(),
        offlineTime: 0,
        totalRealTime: 0,
        gameTime: D(0),
        setTimeSpeed: D(1),
        version: 0,
        displayVersion: "v1.0.0",
        settings: {
            notation: 0,
            scaleSoftColors: false,
            scaledUpgBase: true
        },

        gameProgress: {
            dilatedTime: {
                normalized: false,
                normalizeTime: 0.05,
                paused: false,
                speed: 1,
                speedEnabled: false
            },
            unlocks: {
                pr2: false,
                kua: false,
                kenhancers: false,
                kblessings: false,
                kproofs: {
                    main: false,
                    strange: false,
                    finicky: false
                },
                col: false,
                tax: false
            },
            achievements: [],
            inChallenge: {
                nk: makeChallengeInfo(),
                su: makeChallengeInfo(),
                df: makeChallengeInfo(),
                im: makeChallengeInfo(),
                dc: makeChallengeInfo(),
                sn: makeChallengeInfo()
            },
            main: {
                points: D(0),
                totals: [D(0), D(0), D(0), D(0), D(0)],
                best: [D(0), D(0), D(0), D(0), D(0)],
                totalEver: D(0),
                bestEver: D(0),
                upgrades: mainUpgrades,
                oneUpgrades: [],
                prai: {
                    totals: [null, D(0), D(0), D(0), D(0)],
                    best: [null, D(0), D(0), D(0), D(0)],
                    totalEver: D(0),
                    bestEver: D(0),
                    amount: D(0),
                    timeInPRai: D(0),
                    auto: false,
                    times: D(0)
                },
                pr2: {
                    best: [null, null, D(0), D(0), D(0)],
                    bestEver: D(0),
                    amount: D(0),
                    timeInPR2: D(0),
                    auto: false
                }
            },
            kua: {
                auto: false,
                amount: D(0),
                totals: [null, null, null, D(0), D(0)],
                best: [null, null, null, D(0), D(0)],
                totalEver: D(0),
                bestEver: D(0),
                timeInKua: D(0),
                times: D(0),
                upgrades: 0,
                kshards: {
                    amount: D(0),
                    totals: [null, null, null, D(0), D(0)],
                    best: [null, null, null, D(0), D(0)],
                    totalEver: D(0),
                    bestEver: D(0),
                    upgrades: 0
                },
                kpower: {
                    amount: D(0),
                    totals: [null, null, null, D(0), D(0)],
                    best: [null, null, null, D(0), D(0)],
                    totalEver: D(0),
                    bestEver: D(0),
                    upgrades: 0
                },
                enhancers: {
                    autoSources: false,
                    sources: [D(0), D(0), D(0)],
                    enhancers: [D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                    enhanceXP: [D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                    enhancePow: [D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                    xpSpread: D(1),
                    inExtraction: 0,
                    extractionXP: [D(0), D(0), D(0)],
                    upgrades: []
                },
                blessings: {
                    amount: D(0),
                    totals: [null, null, null, D(0), D(0)],
                    best: [null, null, null, D(0), D(0)],
                    totalEver: D(0),
                    bestEver: D(0),
                    upgrades: [D(0), D(0), D(0), D(0)]
                },
                proofs: {
                    amount: D(0),
                    totals: [null, null, null, D(0), D(0)],
                    best: [null, null, null, D(0), D(0)],
                    totalEver: D(0),
                    bestEver: D(0),
                    automationBought: {
                        other: [false, false, false],
                        effect: [false, false, false, false, false, false, false, false, false],
                        kp: [false, false, false, false, false, false, false, false, false],
                        skp: [false, false, false, false, false, false, false, false, false],
                        fkp: [false, false, false, false, false, false, false, false, false]
                    },
                    automationEnabled: {
                        other: [false, false, false],
                        effect: [false, false, false, false, false, false, false, false, false],
                        kp: [false, false, false, false, false, false, false, false, false],
                        skp: [false, false, false, false, false, false, false, false, false],
                        fkp: [false, false, false, false, false, false, false, false, false]
                    },
                    upgrades: {
                        effect: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                        kp: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                        skp: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                        fkp: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)]
                    },
                    strange: {
                        cooldown: D(0),
                        amount: D(0),
                        hiddenExp: D(0),
                        times: D(0),
                        totals: [null, null, null, D(0), D(0)],
                        best: [null, null, null, D(0), D(0)],
                        totalEver: D(0),
                        bestEver: D(0)
                    },
                    finicky: {
                        cooldown: D(0),
                        amount: D(0),
                        hiddenExp: D(0),
                        times: D(0),
                        totals: [null, null, null, D(0), D(0)],
                        best: [null, null, null, D(0), D(0)],
                        totalEver: D(0),
                        bestEver: D(0),
                        powers: {
                            white: {
                                alloc: D(0),
                                amount: D(0),
                                upgrades: D(0)
                            },
                            cyan: {
                                alloc: D(0),
                                amount: D(0),
                                upgrades: D(0)
                            },
                            yellow: {
                                alloc: D(0),
                                amount: D(0),
                                upgrades: D(0)
                            },
                        }
                    },
                }
            },
            col: {
                inAChallenge: false,
                completed: {
                    nk: D(0),
                    su: D(0),
                    df: D(0),
                    im: D(0),
                    dc: D(0),
                    sn: D(0)
                },
                challengeOrder: { chalID: [], layer: [] },
                completedAll: false,
                saved: {
                    nk: null,
                    su: null,
                    df: null,
                    im: null,
                    dc: null,
                    sn: null
                },
                power: D(0),
                totals: [null, null, null, null, D(0)],
                best: [null, null, null, null, D(0)],
                totalEver: D(0),
                bestEver: D(0),
                time: D(0),
                maxTime: D(0),
                research: {
                    xpTotal: [],
                    enabled: []
                }
            },
            tax: {
                timeInTax: D(0),
                auto: false,
                unlocked: false,
                amount: D(0),
                totals: [null, null, null, null, null],
                best: [null, null, null, null, null],
                totalEver: D(0),
                bestEver: D(0),
                times: D(0),
                upgrades: []
            }
        }
    };
    if (set) {
        player.value = data;
    }
    return data;
};

export const setPlayerFromSave = (save: string, id: number): void => {
    const procSave = JSON.parse(atob(save));
    game.value.list[id] = procSave;
    if (game.value.currentSave === id) {
        player.value = procSave.data;
    }
    player.value = updatePlayerData(player.value);
};

export const setGameFromSave = (save: string): void => {
    const procSave = JSON.parse(atob(save));
    game.value = procSave;
    player.value = game.value.list[game.value.currentSave].data;
    player.value = updatePlayerData(player.value);
};

type Tmp = {
    gameTimeSpeed: Decimal,
    main: {
        pps: Decimal,
        ppsNullified: boolean,
        upgrades: Array<TmpMainUpgrade>,
        oneUpgrades: Array<{
            canBuy: boolean
        }>,
        canBuyUpg: boolean,
        prai: {
            canDo: boolean,
            pending: Decimal,
            next: Decimal,
            effect: Decimal,
            nextEffect: Decimal,
            gainExp: Decimal,
            req: Decimal,
            effActive: boolean
        },
        pr2: {
            canDo: boolean,
            target: Decimal,
            cost: Decimal,
            effect: Decimal,
            textEffect: { when: Decimal, txt: string },
            costTextColor: string,
            effActive: boolean,
            effective: Decimal
        }
    },
    kua: {
        effectiveKS: Decimal,
        effectiveKP: Decimal,
        shardGen: Decimal,
        powGen: Decimal,
        effects: {
            kshardPassive: Decimal,
            kpowerPassive: Decimal,
            upg4: Decimal,
            upg5: Decimal,
            upg6: Decimal,
            upg1Scaling: Decimal,
            upg1SuperScaling: Decimal,
            ptPower: Decimal,
            upg2Softcap: Decimal,
            kshardPrai: Decimal,
            kpower: Decimal,
            pts: Decimal,
            bless: Decimal
        },
        canBuyUpg: boolean,
        upgCanBuyUpg: boolean,
        req: Decimal,
        mult: Decimal,
        exp: Decimal,
        effectivePrai: Decimal,
        canDo: boolean,
        pending: Decimal,
        active: {
            proofs: {
                gain: boolean,
                upgrades: {
                    effect: Array<boolean>,
                    kp: Array<boolean>,
                    skp: Array<boolean>,
                    fkp: Array<boolean>
                }
            },
            blessings: {
                gain: boolean,
                effects: boolean,
                upgrades: Array<boolean>,
                ranks: {
                    rank: boolean,
                    tier: boolean,
                    tetr: boolean
                }
            },
            kpower: {
                upgrades: boolean,
                effects: boolean,
                gain: boolean
            },
            kshards: {
                upgrades: boolean,
                effects: boolean,
                gain: boolean
            },
            upgrades: boolean,
            effects: boolean,
            gain: boolean
        },
        baseSourceXPGen: Array<Decimal>,
        kuaTrueSourceXPGen: Array<Decimal>,
        trueEnhPower: Array<Decimal>,
        sourcesCanBuy: Array<boolean>,
        totalEnhSources: Decimal,
        enhSourcesUsed: Decimal,
        enhShowSlow: boolean,
        enhSlowdown: Decimal,
        blessings: {
            canBuyUpg: boolean,
            perSec: Decimal,
            perClick: Decimal,
            rank: Decimal,
            tier: Decimal,
            tetr: Decimal,
            upg1Base: Decimal,
            upg2Base: Decimal,
            kuaEff: Decimal,
            upgrades: Array<{
                canBuy: boolean
            }>
        },
        proofs: {
            exp: Decimal,
            expPerSec: Decimal,
            skpExp: Decimal,
            skpEff: Decimal,
            fkpExp: Decimal,
            fkpGain: Decimal,
            fkpEff: Decimal,
            canBuyUpg: boolean,
            canBuyUpgs: {
                auto: boolean,
                effect: boolean,
                kp: boolean,
                skp: boolean,
                fkp: boolean
            },
            upgrades: {
                effect: Array<TmpKProofUpgs>,
                kp: Array<TmpKProofUpgs>,
                skp: Array<TmpKProofUpgs>,
                fkp: Array<TmpKProofUpgs>
            }
        }
    },
    col: {
        totalColChalComp: Decimal,
        truePowGen: Decimal,
        powGen: Decimal,
        researchesAtOnce: number,
        researchesAllocated: number,
        researchSpeed: Decimal,
        effects: {
            upg1a2sc: Decimal
            res: Decimal
        }
    },
    tax: {
        req: Decimal,
        canDo: boolean,
        pending: Decimal,
        ptsEff: Decimal
    },
    gameIsRunning: boolean,
    saveModes: Array<boolean>,
    scaleSoftcapNames: {
        points: string,
        upg1: string,
        upg2: string,
        upg3: string,
        upg4: string,
        upg5: string,
        upg6: string,
        upg7: string,
        upg8: string,
        upg9: string,
        pr2: string,
        kuaupg4base: string,
        kuaupg5base: string,
        kuaupg6base: string,
        kba: string,
        kbi: string,
        kp: string,
        skp: string
    },
    scaleList: Array<{
        id: number,
        list: Array<{
            id: number,
            txt: string
        }>
    }>,
    softList: Array<{
        id: number,
        list: Array<{
            id: number,
            txt: string
        }>
    }>,
    achievementList: Array<Array<number>>
};

type gameVars = {
    delta: number,
    trueDelta: number,
    lastFPSCheck: number,
    fpsList: Array<number>,
    lastSave: number,
    sessionTime: number,
    sessionStart: number,
    fps: number,
    displayedFPS: string
};

export const tmp: Ref<Tmp> = ref(initTemp());
export const game: Ref<Game> = ref(initGameBeforeSave());
export const player: Ref<Player> = ref(game.value.list[game.value.currentSave].data);

export const gameVars: Ref<gameVars> = ref({
    delta: 0,
    trueDelta: 0,
    lastFPSCheck: 0,
    fpsList: [],
    lastSave: 0,
    sessionTime: 0,
    sessionStart: 0,
    fps: 0,
    displayedFPS: "0.0"
});

export const tab: Ref<Tab> = ref({
    currentTab: 0,
    // fill this with values
    tabList: [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]
});

function initTemp(): Tmp {
    const obj: Tmp = {
        gameTimeSpeed: D(1),
        main: {
            pps: D(0),
            ppsNullified: false,
            upgrades: initAllMainUpgrades(),
            oneUpgrades: initAllMainOneUpgrades(),
            canBuyUpg: false,
            prai: {
                canDo: false,
                pending: D(0),
                next: D(0),
                effect: D(1),
                nextEffect: D(1),
                gainExp: D(1 / 3),
                req: D(1e6),
                effActive: true
            },
            pr2: {
                canDo: false,
                target: D(0),
                cost: D(Infinity),
                effect: D(0),
                textEffect: { when: D(0), txt: "" },
                costTextColor: "#ffffff",
                effActive: true,
                effective: D(0)
            }
        },
        kua: {
            effectiveKS: D(0),
            effectiveKP: D(0),
            shardGen: D(0),
            powGen: D(0),
            effects: {
                kshardPassive: D(1),
                kpowerPassive: D(1),
                upg4: D(1),
                upg5: D(1),
                upg6: D(0),
                upg1Scaling: D(1),
                upg1SuperScaling: D(1),
                ptPower: D(1),
                upg2Softcap: D(1),
                kshardPrai: D(1),
                kpower: D(1),
                pts: D(1),
                bless: D(1)
            },
            upgCanBuyUpg: false,
            canBuyUpg: false,
            req: D(1e10),
            mult: D(0.0001),
            exp: D(3),
            effectivePrai: D(0),
            canDo: false,
            pending: D(0),
            active: {
                proofs: {
                    gain: true,
                    upgrades: {
                        effect: [],
                        kp: [],
                        skp: [],
                        fkp: []
                    }
                },
                blessings: {
                    gain: true,
                    effects: true,
                    upgrades: [],
                    ranks: {
                        rank: true,
                        tier: true,
                        tetr: true
                    }
                },
                kpower: {
                    upgrades: true,
                    effects: true,
                    gain: true
                },
                kshards: {
                    upgrades: true,
                    effects: true,
                    gain: true
                },
                upgrades: true,
                effects: true,
                gain: true
            },
            baseSourceXPGen: [],
            kuaTrueSourceXPGen: [],
            trueEnhPower: [],
            sourcesCanBuy: [false, false, false],
            totalEnhSources: D(0),
            enhSourcesUsed: D(0),
            enhShowSlow: false,
            enhSlowdown: D(1),
            blessings: {
                canBuyUpg: false,
                perSec: D(0),
                perClick: D(0),
                rank: D(0),
                tier: D(0),
                tetr: D(0),
                upg1Base: D(0),
                upg2Base: D(0),
                kuaEff: D(1),
                upgrades: initAllKBlessingUpgrades()
            },
            proofs: {
                exp: D(1),
                expPerSec: D(1),
                skpExp: D(1),
                skpEff: D(1),
                fkpExp: D(1),
                fkpGain: D(1),
                fkpEff: D(1),
                canBuyUpg: false,
                canBuyUpgs: {
                    auto: false,
                    effect: false,
                    kp: false,
                    skp: false,
                    fkp: false
                },
                upgrades: {
                    effect: initAllKProofUpgrades('effect'),
                    kp: initAllKProofUpgrades('kp'),
                    skp: initAllKProofUpgrades('skp'),
                    fkp: initAllKProofUpgrades('fkp')
                }
            }
        },
        col: {
            totalColChalComp: D(0),
            powGen: D(0),
            truePowGen: D(0),
            effects: {
                upg1a2sc: D(1),
                res: D(1)
            },
            researchesAtOnce: 1,
            researchesAllocated: 0,
            researchSpeed: D(1)
        },
        tax: {
            req: D(Number.MAX_VALUE),
            canDo: false,
            pending: D(0),
            ptsEff: D(1)
        },
        gameIsRunning: true,
        saveModes: Array(SAVE_MODES.length).fill(false),
        scaleSoftcapNames: {
            points: "Points",
            upg1: "Upgrade 1",
            upg2: "Upgrade 2",
            upg3: "Upgrade 3",
            upg4: "Upgrade 4",
            upg5: "Upgrade 5",
            upg6: "Upgrade 6",
            upg7: "Upgrade 7",
            upg8: "Upgrade 8",
            upg9: "Upgrade 9",
            pr2: "PR2",
            kuaupg4base: "Upgrade 4's Base",
            kuaupg5base: "Upgrade 5's Base",
            kuaupg6base: "Upgrade 6's Base",
            kba: "KBlessings Per Click",
            kbi: "KBlessings Per Second",
            kp: "KProofs",
            skp: "Strange KProofs"
        },
        scaleList: [],
        softList: [],
        achievementList: []
    };
    for (let i = 0; i < 10; i++) {
        obj.scaleList.push({ id: i, list: [] });
    }
    for (let i = 0; i < 10; i++) {
        obj.softList.push({ id: i, list: [] });
    }
    for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
        obj.kua.active.blessings.upgrades[i] = true;
    }
    for (const i in KUA_PROOF_UPGS) {
        for (let j = 0; j < KUA_PROOF_UPGS[i as KuaProofUpgTypes].length; j++) {
            obj.kua.active.proofs.upgrades[i as KuaProofUpgTypes][j] = true;
        }
    }

    return obj;
}

export const gameReviver = setInterval(gameAlive, 1000);

function gameAlive(): void {
    if (!tmp.value.gameIsRunning) {
        tmp.value.gameIsRunning = true;
        loadGame();
    }
}

window.onload = function () {
    loadGame();
};

function loadGame(): void {
    gameVars.value.lastFPSCheck = 0;
    if (localStorage.getItem(saveID) !== null && localStorage.getItem(saveID) !== "null") {
        try {
            game.value = JSON.parse(atob(localStorage.getItem(saveID)!));
            player.value = updatePlayerData(game.value.list[game.value.currentSave].data);
        } catch (e) {
            console.error(`loading the game.value went wrong!`);
            console.error(e);
            console.error(localStorage.getItem(saveID)!);
        }
    }

    // initTmp part 2, account for save switching
    tmp.value = initTemp();
    fixAchievements();
    initStatsFactors();

    player.value.offlineTime = Decimal.add(player.value.offlineTime, Math.max(0, Date.now() - player.value.lastUpdated));
    gameVars.value.sessionStart = Date.now();
    player.value.lastUpdated = Date.now();

    window.requestAnimationFrame(gameLoop);
    return;
}

export type TrueFactor = {
    baseActive: boolean,
    active: boolean,
    name: string,
    effect: Decimal,
    color: FactorColorID,
    type: 'mult' | 'pow'
}

export const PPS_CALC: Array<TrueFactor> = [
    {
        baseActive: true,
        active: true,
        name: 'Base',
        effect: D(1),
        color: 'norm',
        type: 'mult'
    },
    {
        baseActive: true,
        active: true,
        name: 'Upgrade 1',
        get effect() {
            return tmp.value.main.upgrades[0].effect;
        },
        color: 'norm',
        type: 'mult'
    },
    {
        baseActive: false,
        active: true,
        name: 'Upgrade 2',
        get effect() {
            return tmp.value.main.upgrades[1].effect;
        },
        color: 'col',
        type: 'mult'
    },
    {
        baseActive: true,
        active: true,
        name: 'Upgrade 4',
        get effect() {
            return tmp.value.main.upgrades[3].effect;
        },
        color: 'norm',
        type: 'mult'
    },
    {
        baseActive: false,
        active: true,
        name: 'Upgrade 5',
        get effect() {
            return tmp.value.main.upgrades[4].effect;
        },
        color: 'col',
        type: 'mult'
    },
    {
        baseActive: true,
        active: true,
        name: 'PRai',
        get effect() {
            return tmp.value.main.prai.effActive ? tmp.value.main.prai.effect : D(1);
        },
        color: 'norm',
        type: 'mult'
    },
    {
        baseActive: true,
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
            return Decimal.gte(player.value.gameProgress.main.oneUpgrades[9], 1);
        },
        active: true,
        name: 'One-Upgrade #10',
        get effect() {
            return MAIN_ONE_UPGS[9].effect!;
        },
        color: 'norm',
        type: 'mult'
    },
    {
        get baseActive() {
            return ifAchievement(0, 3);
        },
        active: true,
        name: 'Achievement ID (0, 3)',
        get effect() {
            return D(1.2);
        },
        color: 'ach',
        type: 'mult'
    },
    {
        baseActive: true,
        active: true,
        name: 'Achievement Tier 1',
        get effect() {
            return ACHIEVEMENT_DATA[0].eff;
        },
        color: 'ach',
        type: 'mult'
    },
    {
        get baseActive() {
            return player.value.gameProgress.unlocks.kua;
        },
        active: true,
        name: 'KPower Base Effect',
        get effect() {
            return tmp.value.kua.effects.kpowerPassive;
        },
        color: 'kua',
        type: 'mult'
    },
    {
        get baseActive() {
            return getKuaUpgrade("s", 7);
        },
        active: true,
        name: 'KShard Upgrade 7',
        get effect() {
            return tmp.value.kua.effects.pts;
        },
        color: 'kua',
        type: 'mult'
    },
    {
        get baseActive() {
            return ifAchievement(1, 0);
        },
        active: true,
        name: 'Achievement ID (1, 0)',
        get effect() {
            return D(2);
        },
        color: 'ach',
        type: 'mult'
    },
    {
        get baseActive() {
            return ifAchievement(1, 1);
        },
        active: true,
        name: 'Achievement ID (1, 1)',
        get effect() {
            return getAchievementEffect(1, 1);
        },
        color: 'ach',
        type: 'mult'
    },
    {
        get baseActive() {
            return ifAchievement(1, 3);
        },
        active: true,
        name: 'Achievement ID (1, 3)',
        get effect() {
            return getAchievementEffect(1, 3);
        },
        color: 'ach',
        type: 'mult'
    },
    {
        get baseActive() {
            return ifAchievement(1, 13);
        },
        active: true,
        name: 'Achievement ID (1, 13)',
        get effect() {
            return getAchievementEffect(1, 13);
        },
        color: 'ach',
        type: 'mult'
    },
    {
        get baseActive() {
            return Decimal.gte(timesCompleted("nk"), 1);
        },
        active: true,
        name: 'Dotgenous',
        get effect() {
            return getColResEffect(0);
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
            return player.value.gameProgress.unlocks.tax;
        },
        active: true,
        name: 'Taxed Coins',
        get effect() {
            return tmp.value.tax.ptsEff;
        },
        color: 'tax',
        type: 'mult'
    },
    {
        get baseActive() {
            return getKuaUpgrade("p", 3);
        },
        active: true,
        name: 'KPower Upgrade 3',
        get effect() {
            return tmp.value.kua.effects.ptPower;
        },
        color: 'kua',
        type: 'pow'
    },
    {
        get baseActive() {
            return Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[1], 12);
        },
        active: true,
        name: 'KBlessing Upgrade 2',
        get effect() {
            return KUA_BLESS_UPGS[1].eff()[2];
        },
        color: 'kb',
        type: 'pow'
    },
    {
        get baseActive() {
            return player.value.gameProgress.col.inAChallenge;
        },
        active: true,
        name: 'Achievement Tier 3',
        get effect() {
            return ACHIEVEMENT_DATA[2].eff
            .mul(
                Decimal.pow(
                    0.25,
                    Decimal.div(
                        player.value.gameProgress.col.time,
                        player.value.gameProgress.col.maxTime
                    ).max(0)
                )
            )
            .add(1);
        },
        color: 'ach',
        type: 'pow'
    },
    {
        get baseActive() {
            return Decimal.gte(player.value.gameProgress.main.oneUpgrades[19], 1);
        },
        active: true,
        name: 'One Upgrade #20',
        get effect() {
            return MAIN_ONE_UPGS[19].effect;
        },
        color: 'norm',
        type: 'pow'
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

function calcPPS(): Decimal {
    let pps = D(1), eff, txt;

    for (let i = 0; i < PPS_CALC.length; i++) {
        PPS_CALC[i].active = PPS_CALC[i].baseActive;
        if (inChallenge("su") && !(i >= 0 && i <= 6 || PPS_CALC[i].name === 'Dotgenous')) {
            PPS_CALC[i].active = false;
        }
        if (inChallenge("im") && !(i === 2 || i === 4)) {
            PPS_CALC[i].active = true;
        }

        txt = '';
        if (PPS_CALC[i].active) {
            eff = PPS_CALC[i].effect;

            if (PPS_CALC[i].type === 'mult') {
                if (inChallenge('dc') && PPS_CALC[i].name !== 'Upgrade 1') {
                    eff = eff.max(1).log10().add(1).pow(0.5).sub(1).pow10();
                }

                pps = pps.mul(eff);
                txt = `×${format(eff, 2)}`;
            }
            if (PPS_CALC[i].type === 'pow') {
                pps = pps.pow(eff);
                txt = `^${format(eff, 3)}`;
            }
        }
        setFactor(i, [0], PPS_CALC[i].name, txt, `${format(pps, 1)}`, PPS_CALC[i].active, PPS_CALC[i].color);
    }

    NaNCheck(pps);
    if (Decimal.lt(pps, 0)) {
        throw new Error(`aaa!! pps is negative`)
    }
    return pps;
}

export const getEndgame = () => {
    return D(0);
};

function gameLoop(): void {
    if (!tmp.value.gameIsRunning) {
        return;
    }

    try {
        gameVars.value.delta = (Date.now() - player.value.lastUpdated) / 1000;
        gameVars.value.trueDelta = (Date.now() - player.value.lastUpdated) / 1000;
        gameVars.value.sessionTime = (Date.now() - gameVars.value.sessionStart) / 1000;
        player.value.lastUpdated = Date.now();

        let generate: Decimal = D(0);
        if (gameVars.value.delta > 0) {
            gameVars.value.fpsList.push(gameVars.value.delta);
            if (gameVars.value.sessionTime > gameVars.value.lastFPSCheck) {
                gameVars.value.lastFPSCheck = gameVars.value.sessionTime + 0.5;
                gameVars.value.fps = 0;
                for (let i = 0; i < gameVars.value.fpsList.length; ++i) {
                    gameVars.value.fps += gameVars.value.fpsList[i];
                }
                gameVars.value.displayedFPS = (gameVars.value.fpsList.length / gameVars.value.fps).toFixed(1);
                gameVars.value.fpsList = [];
            }
        }

        if (player.value.gameProgress.dilatedTime.paused) {
            player.value.offlineTime = Decimal.add(player.value.offlineTime, gameVars.value.delta * 1000);
            gameVars.value.delta = 0;
        }
        if (player.value.gameProgress.dilatedTime.normalized) {
            if (gameVars.value.delta > player.value.gameProgress.dilatedTime.normalizeTime) {
                player.value.offlineTime = Decimal.add(player.value.offlineTime, (gameVars.value.delta - player.value.gameProgress.dilatedTime.normalizeTime) * 1000);
                gameVars.value.delta = player.value.gameProgress.dilatedTime.normalizeTime;
            }
        }

        player.value.totalRealTime += gameVars.value.delta;
        let gameDelta = Decimal.mul(gameVars.value.delta, tmp.value.gameTimeSpeed).mul(player.value.setTimeSpeed);
        if (player.value.gameProgress.dilatedTime.speedEnabled && gameVars.value.delta < 1) {
            const prev = player.value.offlineTime;
            player.value.offlineTime = Decimal.sub(player.value.offlineTime, Decimal.mul(gameDelta, speedToConsume()).mul(1000));
            gameDelta = Decimal.mul(gameDelta, timeSpeedBoost(prev));
        }

        player.value.gameTime = Decimal.add(player.value.gameTime, gameDelta);

        updateAllSCSL();
        updateAllTax(gameDelta);
        updateAllCol(gameDelta);
        updateAllKua(gameDelta);
        updateAllStart(gameDelta);

        tmp.value.main.pps = calcPPS();
        generate = Decimal.mul(tmp.value.main.pps, gameDelta);

        const data = {
            oldPPS: tmp.value.main.pps,
            converted: D(0),
            oldGen: generate,
            oldPts: D(0),
            newPts: D(0),
            scal: getSCSLAttribute("points", false)
        };
        data.oldPts = Decimal.max(player.value.gameProgress.main.points, 10);

        if (inChallenge("df")) {
            data.newPts = scale(scale(scale(scale(data.oldPts.max(10).log10(), 0.2, true, 1, 1, Decimal.pow(0.5, challengeDepth("df"))).pow10().add(generate).log10(), 0.2, false, 1, 1, Decimal.pow(0.5, challengeDepth("df"))).pow10(), 0.2, true, 10, 1, Decimal.pow(0.5, challengeDepth("df"))).add(generate), 0.2, false, 10, 1, Decimal.pow(0.5, challengeDepth("df")));

            generate = data.newPts.sub(data.oldPts).max(1);
            tmp.value.main.pps = generate.div(gameDelta);
        }
        // FIXME: every time PPS gets updated, check the id value for this (24)
        setFactor(24, [0], "Decaying Feeling", `/${format(Decimal.div(data.oldGen, generate), 2)}`, `${format(tmp.value.main.pps, 1)}`, inChallenge("df"), "col");

        data.oldPts = Decimal.max(player.value.gameProgress.main.points, data.scal[0].start);
        setSCSLEffectDisp("points", false, 0, `/${format(1, 2)}`);

        if (Decimal.add(player.value.gameProgress.main.points, generate).gte(data.scal[0].start) && Decimal.gte(generate, data.scal[0].start)) {
            data.newPts = scale(
                scale(
                    data.oldPts.log10(),
                    0.2,
                    true,
                    data.scal[0].start.log10(),
                    data.scal[0].power,
                    data.scal[0].basePow
                )
                    .pow10()
                    .add(generate)
                    .log10(),
                0.2,
                false,
                data.scal[0].start.log10(),
                data.scal[0].power,
                data.scal[0].basePow
            ).pow10();

            generate = data.newPts.sub(data.oldPts);

            tmp.value.main.pps = generate.div(gameDelta);

            if (generate.eq(0)) {
                data.converted = Decimal.div(data.oldPPS, 
                    scale(
                        data.oldPPS.log10(),
                        0.2,
                        false,
                        data.scal[0].start.log10(),
                        data.scal[0].power,
                        data.scal[0].basePow
                    ).pow10().mul(gameDelta));
            } else {
                data.converted = Decimal.div(data.oldPPS, generate).mul(gameDelta);
            }
            setSCSLEffectDisp("points", false, 0, `/${format(data.converted, 2)}`);
        }
        // FIXME: every time PPS gets updated, check the id value for this (25)
        setFactor(25, [0], "Taxation", `/${format(data.converted, 2)}`, `${format(tmp.value.main.pps, 1)}`, Decimal.add(player.value.gameProgress.main.points, generate).gte(data.scal[0].start) && Decimal.gte(generate, data.scal[0].start), "sc1");

        if (Decimal.isNaN(player.value.gameProgress.main.points)) {
            throw new Error(`weh?! points are NaN!`)
        }
        if (Decimal.lt(player.value.gameProgress.main.points, 0)) {
            throw new Error(`weh?! points are negative!`)
        }

        tmp.value.main.ppsNullified = generate.eq(0) && Decimal.gte(player.value.gameProgress.main.points, data.scal[0].start);
        if (tmp.value.main.ppsNullified) {
            tmp.value.main.pps = 
                scale(
                    data.oldPPS.log10(),
                    0.2,
                    false,
                    data.scal[0].start.log10(),
                    data.scal[0].power,
                    data.scal[0].basePow
                ).pow10().mul(gameDelta);
        } else {
            player.value.gameProgress.main.points = Decimal.add(player.value.gameProgress.main.points, generate);

            updateAllTotal(player.value.gameProgress.main.totals, generate);
            player.value.gameProgress.main.totalEver = Decimal.add(player.value.gameProgress.main.totalEver, generate);
            updateAllBest(player.value.gameProgress.main.best, player.value.gameProgress.main.points);
            player.value.gameProgress.main.bestEver = Decimal.max(player.value.gameProgress.main.bestEver, player.value.gameProgress.main.points);    
        }

        player.value.gameProgress.unlocks.pr2 = player.value.gameProgress.unlocks.pr2 || Decimal.gte(player.value.gameProgress.main.prai.amount, 9.5);
        player.value.gameProgress.unlocks.kua = player.value.gameProgress.unlocks.kua || Decimal.gte(player.value.gameProgress.main.pr2.amount, 10);
        player.value.gameProgress.unlocks.kenhancers = player.value.gameProgress.unlocks.kenhancers || Decimal.gte(player.value.gameProgress.kua.amount, 0.0095);
        player.value.gameProgress.unlocks.col = player.value.gameProgress.unlocks.col || (getKuaUpgrade('p', 2) && Decimal.gte(player.value.gameProgress.kua.amount, 100));
        player.value.gameProgress.unlocks.kblessings = player.value.gameProgress.unlocks.kblessings || (getKuaUpgrade('p', 8) && Decimal.gte(player.value.gameProgress.kua.amount, 1e6));
        player.value.gameProgress.unlocks.kproofs.main = player.value.gameProgress.unlocks.kproofs.main || getKuaUpgrade('k', 3);
        player.value.gameProgress.unlocks.kproofs.strange = player.value.gameProgress.unlocks.kproofs.strange || Decimal.gte(tmp.value.kua.proofs.exp, 12);
        player.value.gameProgress.unlocks.kproofs.finicky = player.value.gameProgress.unlocks.kproofs.finicky || Decimal.gte(player.value.gameProgress.kua.proofs.strange.amount, 1e10);
        player.value.gameProgress.unlocks.tax = player.value.gameProgress.unlocks.tax || Decimal.gte(player.value.gameProgress.main.points, "10^^10^307");

        for (let i = 0; i < ACHIEVEMENT_DATA.length; i++) {
            for (let j = 0; j < ACHIEVEMENT_DATA[i].list.length; j++) {
                if (ACHIEVEMENT_DATA[i].list[j].autoComplete === false) {
                    continue;
                }
                setAchievement(i, j);
            }
        }

        compileScalSoftList();
        diePopupsDie();

        if (gameVars.value.sessionTime > gameVars.value.lastSave + game.value.autoSaveInterval) {
            saveTheFrickingGame();
            gameVars.value.lastSave = gameVars.value.sessionTime;
            // spawnPopup(0, `The game has been saved!`, `Save`, 5, `#00FF00`)
        }

        // drawing();
    } catch (e) {
        clearInterval(gameReviver);
        console.error(e);
        console.error(`(Game)   Save List Data:`);
        console.error(game.value);
        console.error(`(Player) Save File Data:`);
        console.error(player.value);
        console.error(`Temporary Variables:`);
        console.error(tmp.value);
        console.warn(`If you cannot go to your saves at all; If you think you are utterly hopeless of playing this game again, run resetTheWholeGame() ! I'll try to make an interactive version of this sooner or later so you don't have to go into console...`);
        alert(
            `The game has crashed! Check the console to see the error(s) to report it to @TearonQ or @qnoraeT. \n\nYou can still export your save normally by going into Options -> Saving -> Save List -> Export Save or Export Save List to Clipboard. \nIf you see any NaNs, you might have a clue!`
        );
        console.error(
            `The game has crashed! Here is the error(s) to report it to @TearonQ or @qnoraeT. \n\nYou can still export your save normally by going into Options -> Saving -> Save List -> Export Save or Export Save List to Clipboard. \nIf you see any NaNs, you might have a clue!`
        );
        return;
    }

    window.requestAnimationFrame(gameLoop);
    return;
}

export const updateAllBest = (bestArray: Array<DecimalSource | null>, max: DecimalSource) => {
    for (let i = 0; i < bestArray.length; i++) {
        if (bestArray[i] !== null) {
            bestArray[i] = Decimal.max(bestArray[i]!, max);
        }
    }
};

export const updateAllTotal = (totalArray: Array<DecimalSource | null>, add: DecimalSource) => {
    for (let i = 0; i < totalArray.length; i++) {
        if (totalArray[i] !== null) {
            totalArray[i] = Decimal.add(totalArray[i]!, add);
        }
    }
};

export let shiftDown = false;
export let ctrlDown = false;

document.onkeydown = function (e) {
    shiftDown = e.shiftKey;
    ctrlDown = e.ctrlKey;
};

document.onkeyup = function (e) {
    shiftDown = e.shiftKey;
    ctrlDown = e.ctrlKey;
};

declare global {
    interface Window {
        player: typeof player;
        game: typeof game;
        tmp: typeof tmp;
        Decimal: typeof Decimal;
        ACHIEVEMENT_DATA: typeof ACHIEVEMENT_DATA;
        expQuadCostGrowth: typeof expQuadCostGrowth;
        ALL_FACTORS: typeof ALL_FACTORS;
        scale: typeof scale;
        getColXPtoNext: typeof getColXPtoNext;
        smoothPoly: typeof smoothPoly;
        smoothExp: typeof smoothExp;
        resetTheWholeGame: typeof resetTheWholeGame;
        reset: typeof reset;
        linearAdd: typeof linearAdd;
        format: typeof format;
        COL_CHALLENGES: typeof COL_CHALLENGES;
        UPDATE_LOG: typeof UPDATE_LOG;
    }
}

window.player = player;
window.game = game;
window.tmp = tmp;
window.Decimal = Decimal;
window.ACHIEVEMENT_DATA = ACHIEVEMENT_DATA;
window.expQuadCostGrowth = expQuadCostGrowth;
window.ALL_FACTORS = ALL_FACTORS;
window.scale = scale;
window.getColXPtoNext = getColXPtoNext;
window.smoothPoly = smoothPoly;
window.smoothExp = smoothExp;
window.resetTheWholeGame = resetTheWholeGame;
window.reset = reset;
window.linearAdd = linearAdd;
window.format = format;
window.COL_CHALLENGES = COL_CHALLENGES;
window.UPDATE_LOG = UPDATE_LOG;

createApp(App).mount("#app");
