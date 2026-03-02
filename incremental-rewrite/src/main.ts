"use strict";
import "./assets/main.css";

import { computed, createApp, ref, type ComputedRef, type Ref } from "vue";
import App from "./App.vue";
import Decimal, { type DecimalSource } from "break_eternity.js";
import { type Tab } from "./components/MainTabs/MainTabs";
import { D, expQuadCostGrowth, linearAdd, mixColor, scale, smoothExp, smoothPoly } from "./calc";
import { format } from "./format";
import { saveID, SAVE_MODES, saveTheFrickingGame, resetTheWholeGame, decompressSave } from "./saving";
import { getSCSLAttribute, setSCSLEffectDisp, compileScalSoftList, updateAllSCSL } from "./softcapScaling";
import { ACHIEVEMENT_DATA, fixAchievements, getAchievementEffect, ifAchievement, setAchievement } from "./components/Game/Game_Achievements/Game_Achievements";
import { diePopupsDie } from "./popups";
import { ALL_FACTORS, LABELS, pushFactor, resetFactor, setFactor, type FactorColorID } from "./components/Game/Game_Stats/Game_Stats";
import { updatePlayerData } from "./versionControl";
import { reset } from "./resets";
import { UPDATE_LOG } from "./components/Game/Game_Options/Game_Options";
import { compressToBase64, decompressFromBase64 } from "lz-string";
import { challengeDepth, inChallenge, timesCompleted, type colChallengesSavedData } from "./components/Game/Game_Progress/Game_Colosseum/Game_ColChallenges/Game_ColChalHandler";
import { COL_CHALLENGES, type Challenge, type challengeIDList } from "./components/Game/Game_Progress/Game_Colosseum/Game_ColChallenges/Game_ColChalData";
import { getKuaUpgrade } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_KuaUpgrades/Game_KuaUpgrades";
import { getColResEffect, getColXPtoNext } from "./components/Game/Game_Progress/Game_Colosseum/Game_ColResearches/Game_ColResearches";
import { initAllKBlessingUpgrades, KUA_BLESS_UPGS } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_KuaBlessings/Game_KuaBlessings";
import { initAllKProofUpgrades, KUA_PROOF_UPGS, type KuaProofUpgTypes, type TmpKProofUpgs } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_KuaProofs/Game_KuaProofs";
import { updateAllCol } from "./components/Game/Game_Progress/Game_Colosseum/Game_Colosseum";
import { updateAllKua } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_Kuaraniai";
import { initAllMainUpgrades, MAIN_UPG_DATA, type TmpMainUpgrade } from "./components/Game/Game_Progress/Game_Main/Game_MainUpgrades/Game_MainUpgrades";
import { initAllMainOneUpgrades, MAIN_ONE_UPGS } from "./components/Game/Game_Progress/Game_Main/Game_OneUpgrades/Game_OneUpgrades";
import { updateAllStart } from "./components/Game/Game_Progress/Game_Main/Game_Main";
import { GROWAN_DATA, GROWAN_UPGS, initGroEquations } from "./components/Game/Game_Progress/Game_Layer4/Game_Growan/Game_Growan";
import { updateAllLayer4 } from "./components/Game/Game_Progress/Game_Layer4/Game_Layer4";
import { speedToConsume, timeSpeedBoost } from "./components/Game/Game_Progress/Game_Stored_Time/Game_Stored_Time";

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
        shown: computed(() => {
            return Decimal.gte(player.value.prog.main.prai.bestEver, 3);
        }),
        done: computed(() => {
            return Decimal.gte(player.value.prog.main.prai.bestEver, 9.5);
        }),
        dispPart1: computed(() => {
            return `${format(player.value.prog.main.prai.bestEver)} / ${format(10)}`;
        }),
        dispPart2: `PRai to unlock the next layer.`,
        color: computed(() => { return "#ffffff"; })
    },
    {
        shown: computed(() => {
            return Decimal.gte(player.value.prog.main.pr2.bestEver, 3);
        }),
        done: computed(() => {
            return player.value.prog.unlocks.kua;
        }),
        dispPart1: computed(() => {
            return `${format(player.value.prog.main.pr2.bestEver)} / ${format(10)}`;
        }),
        dispPart2: `PR2 to unlock the next layer.`,
        color: computed(() => { return "#7958ff"; })
    },
    // {
    //     shown: computed(() => { return player.value.gameProgress.kua.kpower.upgrades >= 2; }),
    //     done: computed(() => { return player.value.gameProgress.unlocks.kuaEnhancers; }),
    //     dispPart1: computed(() => { return `${format(player.value.gameProgress.kua.amount, 3)} / ${format(0.01, 2)}`; }),
    //     dispPart2: `Kuaraniai to unlock the next feature.`,
    //     color: "#a040ff"
    // },
    {
        shown: computed(() => {
            return player.value.prog.kua.kpower.upgrades >= 2;
        }),
        done: computed(() => {
            return player.value.prog.unlocks.col;
        }),
        dispPart1: computed(() => {
            return `${format(player.value.prog.kua.amount, 3)} / ${format(100)}`;
        }),
        dispPart2: `Kuaraniai to unlock the next feature.`,
        color: computed(() => { return "#ff6000"; })
    },
    {
        shown: computed(() => {
            return player.value.prog.kua.kpower.upgrades >= 8;
        }),
        done: computed(() => {
            return player.value.prog.unlocks.kblessings;
        }),
        dispPart1: computed(() => {
            return `${format(player.value.prog.kua.amount)} / ${format(1e6)}`;
        }),
        dispPart2: `Kuaraniai to unlock the next feature.`,
        color: computed(() => { return "#00ff00"; })
    },
    {
        shown: computed(() => {
            return player.value.prog.unlocks.kblessings;
        }),
        done: computed(() => {
            return player.value.prog.kua.upgrades >= 3 || (player.value.prog.unlocks.kproofs === undefined ? false : player.value.prog.unlocks.kproofs.main);
        }),
        dispPart1: computed(() => {
            return `${player.value.prog.kua.upgrades} / 3`;
        }),
        dispPart2: `Kuaraniai Upgrades to unlock the next feature.`,
        color: computed(() => { return "#00ffff"; })
    },
    {
        shown: computed(() => {
            return player.value.prog.unlocks.kproofs === undefined ? false : player.value.prog.unlocks.kproofs.main;
        }),
        done: computed(() => {
            return player.value.prog.unlocks.kproofs.strange;
        }),
        dispPart1: computed(() => {
            return `${format(player.value.prog.kua.proofs.amount)} / ${format(1e24)}`;
        }),
        dispPart2: `KProofs to unlock the next sub-feature.`,
        color: computed(() => { return "#ffff00"; })
    },
    {
        shown: computed(() => {
            return Decimal.gte(player.value.prog.unlocks.kproofs === undefined ? 0 : player.value.prog.kua.proofs.strange.amount, 1e5);
        }),
        done: computed(() => {
            return player.value.prog.unlocks.kproofs.finicky;
        }),
        dispPart1: computed(() => {
            return `${format(player.value.prog.kua.proofs.strange.amount)} / ${format(1e7)}`;
        }),
        dispPart2: `Strange KProofs to unlock the next sub-feature.`,
        color: computed(() => { return "#00ff00"; })
    },
    {
        shown: computed(() => {
            return Decimal.gte(player.value.prog.main.bestInLayer4, "ee3");
        }),
        done: computed(() => {
            return player.value.prog.unlocks.tax;
        }),
        dispPart1: computed(() => {
            return `${format(player.value.prog.main.bestInLayer4)} / ${format("e1500")}`;
        }),
        dispPart2: `Points to unlock the next layers.`,
        color: computed(() => {
            return mixColor('#ffff00', '#804000', 'Linear', (Math.sin(gameVars.value.sessionTime * Math.PI) + 1) / 2);
        })
    },
    {
        shown: computed(() => {
            return player.value.prog.layer4 === undefined ? false : player.value.prog.layer4.pickedFirst !== 0 && Decimal.gte(player.value.prog.main.bestInLayer4, "e2000");
        }),
        done: computed(() => {
            return false;
        }),
        dispPart1: computed(() => {
            return `${format(player.value.prog.main.bestInLayer4)} / ${format("e10000")}`;
        }),
        dispPart2: `Points to unlock the next layers.`,
        color: computed(() => { return '#9e9bff' })
    },
];

type Game = {
    currentSave: number;
    autoSaveInterval: number;
    list: Array<{
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
        scaledUpgBase: boolean,
        notationLimit: number
    },

    prog: {
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
            bestInPrai: DecimalSource,
            bestInCol: DecimalSource,
            bestInLayer4: DecimalSource,
            bestEver: DecimalSource,
            totalInPrai: DecimalSource
            upgrades: Array<{
                bought: DecimalSource,
                best: DecimalSource,
                auto: boolean,
                accumulated: DecimalSource
                boughtInKua: DecimalSource
            }>,
            oneUpgrades: Array<DecimalSource>,
            prai: {
                bestEver: DecimalSource,
                totalInKua: DecimalSource,
                bestInKua: DecimalSource,
                amount: DecimalSource,
                timeInPRai: DecimalSource,
                auto: boolean,
                times: DecimalSource
            },
            pr2: {
                bestEver: DecimalSource,
                bestInLayer4: DecimalSource,
                amount: DecimalSource,
                timeInPR2: DecimalSource,
                auto: boolean
            }
        },
        kua: {
            auto: boolean,
            amount: DecimalSource,
            bestInLayer4: DecimalSource,
            timeInKua: DecimalSource,
            times: DecimalSource,
            upgrades: number
            kshards: {
                amount: DecimalSource,
                totalInCol: DecimalSource,
                totalInLayer4: DecimalSource,
                bestInLayer4: DecimalSource,
                upgrades: number
            },
            kpower: {
                amount: DecimalSource,
                totalInCol: DecimalSource,
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
                clickCooldown: DecimalSource,
                bestInCol: DecimalSource,
                bestInLayer4: DecimalSource,
                upgrades: Array<DecimalSource>
            },
            proofs: {
                amount: DecimalSource,
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
                },
                finicky: {
                    cooldown: DecimalSource,
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
            timeInCol: DecimalSource
            time: DecimalSource,
            maxTime: DecimalSource,
            research: {
                xpTotal: Array<DecimalSource>,
                enabled: Array<boolean>
            }
        },
        layer4: {
            timeInL4R: DecimalSource
            pickedFirst: number // none = 0 gro = 1, tax = 2, both = 3
            gro: {
                totalAmt: DecimalSource,
                amount: DecimalSource,
                auto: boolean,
                upgrades: {
                    active: Array<number>,
                    overall: Array<number>,
                    idle: Array<number>
                }
                gEAmount: DecimalSource
                bestGEA: DecimalSource
                growanEqu: Array<{
                    bought: DecimalSource
                    accumulated: DecimalSource
                }>
                equCancel: DecimalSource
                tick: DecimalSource
                gal: DecimalSource
            }
            tax: {
                auto: boolean,
                amount: DecimalSource,
                times: DecimalSource,
                upgrades: Array<DecimalSource>
                invest: Array<{
                    alloc: DecimalSource
                    produced: DecimalSource
                }>
            }
        }
    }
};

export const initGameBeforeSave = (): Game => {
    const data: Player = initPlayer();

    return {
        currentSave: 0,
        autoSaveInterval: 5,
        list: [
            {
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
    for (let i = 0; i < MAIN_UPG_DATA.length; i++) {
        mainUpgrades.push({
            bought: D(0),
            best: D(0),
            auto: false,
            boughtInKua: D(0),
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
            scaleSoftColors: true,
            scaledUpgBase: true,
            notationLimit: 6
        },

        prog: {
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
                bestInPrai: D(0),
                bestInCol: D(0),
                bestInLayer4: D(0),
                totalInPrai: D(0),
                bestEver: D(0),
                upgrades: mainUpgrades,
                oneUpgrades: [],
                prai: {
                    amount: D(0),
                    bestEver: D(0),
                    totalInKua: D(0),
                    bestInKua: D(0),
                    timeInPRai: D(0),
                    auto: false,
                    times: D(0)
                },
                pr2: {
                    amount: D(0),
                    bestEver: D(0),
                    bestInLayer4: D(0),
                    timeInPR2: D(0),
                    auto: false
                }
            },
            kua: {
                auto: false,
                amount: D(0),
                bestInLayer4: D(0),
                timeInKua: D(0),
                times: D(0),
                upgrades: 0,
                kshards: {
                    amount: D(0),
                    totalInCol: D(0),
                    totalInLayer4: D(0),
                    bestInLayer4: D(0),
                    upgrades: 0
                },
                kpower: {
                    amount: D(0),
                    totalInCol: D(0),
                    totalInLayer4: D(0),
                    bestInLayer4: D(0),
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
                    clickCooldown: D(0),
                    bestInCol: D(0),
                    bestInLayer4: D(0),
                    upgrades: [D(0), D(0), D(0), D(0), D(0)]
                },
                proofs: {
                    amount: D(0),
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
                    },
                    finicky: {
                        cooldown: D(0),
                        amount: D(0),
                        hiddenExp: D(0),
                        times: D(0),
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
                timeInCol: D(0),
                time: D(0),
                maxTime: D(0),
                research: {
                    xpTotal: [],
                    enabled: []
                }
            },
            layer4: {
                timeInL4R: D(0),
                pickedFirst: 0, // none = 0 gro = 1, tax = 2, both = 3
                gro: {
                    totalAmt: D(0),
                    amount: D(0),
                    auto: false,
                    upgrades: {
                        active: [],
                        overall: [],
                        idle: []
                    },
                    gEAmount: D(0),
                    bestGEA: D(0),
                    growanEqu: initGroEquations(),
                    equCancel: D(0),
                    tick: D(0),
                    gal: D(0)
                },
                tax: {
                    auto: false,
                    amount: D(0),
                    times: D(0),
                    upgrades: [],
                    invest: [ 
                        { alloc: D(0), produced: D(0) }, 
                        { alloc: D(0), produced: D(0) }, 
                        { alloc: D(0), produced: D(0) }
                    ]
                }
            }
        }
    };
    if (set) {
        player.value = data;
    }
    return data;
};

export const setPlayerFromSave = (save: { id: number; name: string; modes: number[]; data: Player; }, id: number): void => {
    const procSave = save;
    game.value.list[id] = procSave;
    if (game.value.currentSave === id) {
        player.value = procSave.data;
    }
    player.value = updatePlayerData(player.value);
};

export const setGameFromSave = (save: Game): void => {
    const procSave = save;
    game.value = procSave;
    player.value = game.value.list[game.value.currentSave].data;
    player.value = updatePlayerData(player.value);
};

type Tmp = {
    gameTimeSpeed: Decimal,
    inputSaveList: string,
    offlineTime: {
        active: boolean,
        tickRemaining: number,
        tickMax: number,
        tickLength: number,
        returnTime: number,
    },
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
            nextEffect: Decimal,
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
            speed: Decimal,
            skpSpeed: Decimal,
            exp: Decimal,
            expPerSec: Decimal,
            skpPerSecCur: Decimal,
            skpPerSecNext: Decimal,
            skpExp: Decimal,
            skpEff: Decimal,
            skpEff2: Decimal,
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
    layer4: {
        growan: {
            active: boolean,
            req: Decimal,
            canDo: boolean,
            pending: Decimal,
            nextAt: Decimal,
            eff: {
                kuaGain: Decimal,
                groMult: Decimal
            },
            solEff: {
                prai: Decimal
            }
        },
        tax: {
            active: boolean,
            req: Decimal,
            canDo: boolean,
            pending: Decimal,
            ptsEff: Decimal
        },
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
        skp: string,
        ge: string,
        gtick: string,
        ec: string
    },
    scaleList: Array<Array<string>>,
    softList: Array<Array<string>>,
    achievementList: Array<Array<number>>
};

type gameVars = {
    delta: number,
    trueDelta: number,
    offlineTimeFailed: boolean,
    timespeedCheatConfirmation: boolean,
    lastFPSCheck: number,
    fpsList: Array<number>,
    lastSave: number,
    sessionTime: number,
    sessionStart: number,
    fps: number,
    displayedFPS: string,
    warnings: {
        negativePPS: boolean
    }
};

export const tmp: Ref<Tmp> = ref(initTemp());
export const game: Ref<Game> = ref(initGameBeforeSave());
export const player: Ref<Player> = ref(game.value.list[game.value.currentSave].data);

export const gameVars: Ref<gameVars> = ref({
    delta: 0,
    trueDelta: 0,
    offlineTimeFailed: false,
    timespeedCheatConfirmation: true,
    lastFPSCheck: 0,
    fpsList: [],
    lastSave: 0,
    sessionTime: 0,
    sessionStart: 0,
    fps: 0,
    displayedFPS: "0.0",
    warnings: {
        negativePPS: false
    }
});

export const tab: Ref<Tab> = ref({
    currentTab: 1,
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
        inputSaveList: 'Input your save list here!',
        offlineTime: {
            active: false,
            tickRemaining: 0,
            tickMax: 0,
            tickLength: 1,
            returnTime: 0,
        },
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
                effect: D(1),
                nextEffect: D(1),
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
                speed: D(1),
                skpSpeed: D(1),
                exp: D(1),
                expPerSec: D(1),
                skpPerSecCur: D(1),
                skpPerSecNext: D(1),
                skpExp: D(1),
                skpEff: D(1),
                skpEff2: D(1),
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
        layer4: {
            growan: {
                active: false,
                req: D(1e24),
                canDo: false,
                pending: D(0),
                nextAt: D(0),
                eff: {
                    kuaGain: D(1),
                    groMult: D(1)
                },
                solEff: {
                    prai: D(1)
                }
            },
            tax: {
                active: false,
                req: D('e1500'),
                canDo: false,
                pending: D(0),
                ptsEff: D(1)
            },
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
            skp: "Strange KProofs",
            ge: "Grōwan Equations",
            gtick: "Grōwan Tickspeed",
            ec: "Equation Cancelling"
        },
        scaleList: [],
        softList: [],
        achievementList: []
    };
    for (let i = 0; i < 10; i++) {
        obj.scaleList.push([]);
    }
    for (let i = 0; i < 10; i++) {
        obj.softList.push([]);
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
        clearInterval(gameTick);
        loadGame();
    }
}

window.onload = function () {
    loadGame();
};

let gameTick: number = -1;

function doGameLoopTicksLol() {
    gameTick = setInterval(gameLoop, 33)
}

function doOfflineTime() {
    if (gameVars.value.offlineTimeFailed) {
        return;
    }
    for (let i = 0; i < Math.min(tmp.value.offlineTime.tickRemaining, 32); i++) {
        try {
            gameLoop();
            tmp.value.offlineTime.tickRemaining -= 1;
        } catch(e) {
            console.error(`Offline time couldn't be done!`);
            console.error(e);
            gameVars.value.offlineTimeFailed = true;
            return;
        }
    }

    if (tmp.value.offlineTime.tickRemaining > 0) {
        window.setTimeout(doOfflineTime, 0);
    } else {
        tmp.value.offlineTime.active = false;
        doGameLoopTicksLol();
        console.log('offline time deactivated!');
    }
} 

function loadGame(): void {
    const LOADED_GAME = localStorage.getItem(saveID);
    gameVars.value.lastFPSCheck = 0;
    if (LOADED_GAME !== null && LOADED_GAME !== "null") {
        try {
            game.value = JSON.parse(decompressSave(LOADED_GAME));
            player.value = updatePlayerData(game.value.list[game.value.currentSave].data);
        } catch (e) {
            alert("Your save file list is corrupt! It is not recommended that you save the game in it's current state as you will LOSE your entire save file list!\n\nYour save has been automatically printed in the console.")
            console.error(`loading the game.value went wrong!`);
            console.error(e);
            console.error(LOADED_GAME);
        }
    }

    // initTmp part 2, account for save switching
    tmp.value = initTemp();
    fixAchievements();

    gameVars.value.sessionStart = Date.now();
    // ! this ruins offline time calculations :c, not sure what this is supposed to be for
    // player.value.lastUpdated = Date.now();

    doGameLoopTicksLol();
    return;
}

export type TrueFactor = {
    baseActive: ComputedRef<boolean>,
    active: boolean,
    name: ComputedRef<string>,
    effect: ComputedRef<Decimal>,
    color: FactorColorID,
    type: 'add' | 'mult' | 'pow' | 'dil'
}

export const PPS_CALC: Array<TrueFactor> = [
    {
        baseActive: computed(() => { return true; }),
        active: true,
        name: computed(() => { return 'Base'; }),
        effect: computed(() => { return D(1); }),
        color: 'norm',
        type: 'mult'
    },
    {
        baseActive: computed(() => { return true; }),
        active: true,
        name: computed(() => { return 'Upgrade 1'; }),
        effect: computed(() => {
            return MAIN_UPG_DATA[0].effect.value;
        }),
        color: 'norm',
        type: 'mult'
    },
    {
        baseActive: computed(() => { return inChallenge('im'); }),
        active: true,
        name: computed(() => { return 'Upgrade 2'; }),
        effect: computed(() => {
            return MAIN_UPG_DATA[1].effect.value;
        }),
        color: 'col',
        type: 'mult'
    },
    {
        baseActive: computed(() => { return true; }),
        active: true,
        name: computed(() => { return 'Upgrade 4'; }),
        effect: computed(() => {
            return MAIN_UPG_DATA[3].effect.value;
        }),
        color: 'norm',
        type: 'mult'
    },
    {
        baseActive: computed(() => { return inChallenge('im'); }),
        active: true,
        name: computed(() => { return 'Upgrade 5'; }),
        effect: computed(() => {
            return MAIN_UPG_DATA[4].effect.value;
        }),
        color: 'col',
        type: 'mult'
    },
    {
        baseActive: computed(() => { return true; }),
        active: true,
        name: computed(() => { return 'PRai'; }),
        effect: computed(() => {
            return tmp.value.main.prai.effActive ? tmp.value.main.prai.effect : D(1);
        }),
        color: 'norm',
        type: 'mult'
    },
    {
        baseActive: computed(() => { return true; }),
        active: true,
        name: computed(() => { return 'PR2'; }),
        effect: computed(() => {
            return tmp.value.main.pr2.effActive ? tmp.value.main.pr2.effect : D(1);
        }),
        color: 'norm',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return Decimal.gte(player.value.prog.main.oneUpgrades[9], 1);
        }),
        active: true,
        name: computed(() => { return 'One-Upgrade #10'; }),
        effect: computed(() => {
            return MAIN_ONE_UPGS[9].effect.value;
        }),
        color: 'norm',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return ifAchievement(0, 3);
        }),
        active: true,
        name: computed(() => { return 'Achievement ID (0, 3)'; }),
        effect: computed(() => {
            return D(1.2);
        }),
        color: 'ach',
        type: 'mult'
    },
    {
        baseActive: computed(() => { return true; }),
        active: true,
        name: computed(() => { return 'Achievement Tier 1'; }),
        effect: computed(() => {
            return ACHIEVEMENT_DATA[0].effect.value;
        }),
        color: 'ach',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return player.value.prog.unlocks.kua;
        }),
        active: true,
        name: computed(() => { return 'KPower Base Effect'; }),
        effect: computed(() => {
            return tmp.value.kua.effects.kpowerPassive;
        }),
        color: 'kua',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return getKuaUpgrade("s", 7);
        }),
        active: true,
        name: computed(() => { return 'KShard Upgrade 7'; }),
        effect: computed(() => {
            return tmp.value.kua.effects.pts;
        }),
        color: 'kua',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return ifAchievement(1, 0);
        }),
        active: true,
        name: computed(() => { return 'Achievement ID (1, 0)'; }),
        effect: computed(() => {
            return D(2);
        }),
        color: 'ach',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return ifAchievement(1, 1);
        }),
        active: true,
        name: computed(() => { return 'Achievement ID (1, 1)'; }),
        effect: computed(() => {
            return getAchievementEffect(1, 1);
        }),
        color: 'ach',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return ifAchievement(1, 3);
        }),
        active: true,
        name: computed(() => { return 'Achievement ID (1, 3)'; }),
        effect: computed(() => {
            return getAchievementEffect(1, 3);
        }),
        color: 'ach',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return ifAchievement(1, 13);
        }),
        active: true,
        name: computed(() => { return 'Achievement ID (1, 13)'; }),
        effect: computed(() => {
            return getAchievementEffect(1, 13);
        }),
        color: 'ach',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return Decimal.gte(timesCompleted("nk"), 1);
        }),
        active: true,
        name: computed(() => { return 'Dotgenous'; }),
        effect: computed(() => {
            return getColResEffect(0);
        }),
        color: 'col',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return Decimal.gte(timesCompleted("df"), 1);
        }),
        active: true,
        name: computed(() => {
            return `Decaying Feeling Completion ×${format(timesCompleted('df'))}`;
        }),
        effect: computed(() => {
            return D(10);
        }),
        color: 'col',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return player.value.prog.layer4.gro.upgrades.overall.includes(0);
        }),
        active: true,
        name: computed(() => { return 'Grōwan Overall Upg. 1'; }),
        effect: computed(() => {
            return GROWAN_UPGS.overall[0].eff!.value;
        }),
        color: 'growan',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return player.value.prog.layer4.gro.upgrades.overall.includes(1);
        }),
        active: true,
        name: computed(() => { return 'Grōwan Overall Upg. 2'; }),
        effect: computed(() => {
            return GROWAN_UPGS.overall[1].eff!.value.pts;
        }),
        color: 'growan',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return tmp.value.layer4.tax.active;
        }),
        active: true,
        name: computed(() => { return 'Taxed Coins'; }),
        effect: computed(() => {
            return tmp.value.layer4.tax.ptsEff;
        }),
        color: 'tax',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return Decimal.gte(player.value.prog.main.oneUpgrades[19], 1);
        }),
        active: true,
        name: computed(() => { return 'One Upgrade #20'; }),
        effect: computed(() => {
            return MAIN_ONE_UPGS[19].effect.value;
        }),
        color: 'norm',
        type: 'pow'
    },
    {
        baseActive: computed(() => {
            return getKuaUpgrade("p", 3);
        }),
        active: true,
        name: computed(() => { return 'KPower Upgrade 3'; }),
        effect: computed(() => {
            return tmp.value.kua.effects.ptPower;
        }),
        color: 'kua',
        type: 'pow'
    },
    {
        baseActive: computed(() => {
            return Decimal.gte(player.value.prog.kua.blessings.upgrades[1], 12);
        }),
        active: true,
        name: computed(() => { return 'KBlessing Upgrade 2'; }),
        effect: computed(() => {
            return KUA_BLESS_UPGS[1].eff.value[2];
        }),
        color: 'kb',
        type: 'pow'
    },
    {
        baseActive: computed(() => {
            return player.value.prog.col.inAChallenge;
        }),
        active: true,
        name: computed(() => { return 'Achievement Tier 3'; }),
        effect: computed(() => {
            return ACHIEVEMENT_DATA[2].effect.value
            .mul(
                Decimal.pow(
                    0.25,
                    Decimal.div(
                        player.value.prog.col.time,
                        player.value.prog.col.maxTime
                    ).max(0)
                )
            )
            .add(1);
        }),
        color: 'ach',
        type: 'pow'
    },
    {
        baseActive: computed(() => {
            return player.value.prog.layer4.gro.upgrades.active.includes(0);
        }),
        active: true,
        name: computed(() => { return 'Grōwan Active Upg. 1'; }),
        effect: computed(() => {
            return GROWAN_UPGS.active[0].eff!.value;
        }),
        color: 'growan',
        type: 'pow'
    },
    {
        baseActive: computed(() => {
            return inChallenge("im");
        }),
        active: true,
        name: computed(() => {
            return `Inverted Mechanics ×${format(challengeDepth("im"))}`;
        }),
        effect: computed(() => {
            return Decimal.pow(0.8, challengeDepth("im"));
        }),
        color: 'col',
        type: 'pow'
    },
];

function calcPPS(): Decimal {
    let pps = D(1), eff, txt;

    for (let i = 0; i < PPS_CALC.length; i++) {
        PPS_CALC[i].active = PPS_CALC[i].baseActive.value;
        if (inChallenge("su") && !(i >= 0 && i <= 6 || PPS_CALC[i].name.value === 'Dotgenous')) {
            PPS_CALC[i].active = false;
        }
        if (inChallenge("im") && !(i === 2 || i === 4)) {
            PPS_CALC[i].active = true;
        }

        txt = '';
        if (PPS_CALC[i].active) {
            eff = PPS_CALC[i].effect.value;

            if (PPS_CALC[i].type === 'mult') {
                if (inChallenge('dc') && PPS_CALC[i].name.value !== 'Upgrade 1') {
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
        setFactor(i, [0], PPS_CALC[i].name.value, txt, `${format(pps, 1)}`, PPS_CALC[i].active, PPS_CALC[i].color);
    }

    NaNCheck(pps, 'PPS was NaN!');
    if (Decimal.lt(pps, 0)) {
        throw new Error(`aaa!! pps is negative`)
    }
    return pps;
}

export const getEndgame = (x = player.value.prog.main.bestEver) => {
    return Decimal.max(x, 10).log10().log(4000).pow(2).min(1).mul(100);
};

function gameLoop(): void {
    if (!tmp.value.gameIsRunning) {
        return;
    }

    try {
        gameVars.value.trueDelta = (Date.now() - player.value.lastUpdated) / 1000;

        let delta = gameVars.value.trueDelta
        if (!tmp.value.offlineTime.active) {
            player.value.lastUpdated = Date.now();
            if (delta >= 60) {
                console.log('offline time activated!');
                tmp.value.offlineTime.active = true;
                tmp.value.offlineTime.tickMax = Math.floor(delta / tmp.value.offlineTime.tickLength);
                const limit = player.value.prog.dilatedTime.paused ? 32768 : 1024;
                if (tmp.value.offlineTime.tickMax > limit) {
                    tmp.value.offlineTime.tickLength = tmp.value.offlineTime.tickLength * (tmp.value.offlineTime.tickMax / limit);
                    tmp.value.offlineTime.tickMax = tmp.value.offlineTime.tickMax / (tmp.value.offlineTime.tickMax / limit);
                }
                tmp.value.offlineTime.tickRemaining = tmp.value.offlineTime.tickMax;
                tmp.value.offlineTime.returnTime = gameVars.value.sessionTime + (tmp.value.offlineTime.tickLength * 10);
                doOfflineTime();
                clearInterval(gameTick);
                return;
            }
        } else {
            delta = tmp.value.offlineTime.tickLength
        }

        gameVars.value.delta = delta;
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

        if (player.value.prog.dilatedTime.paused) {
            player.value.offlineTime = Decimal.add(player.value.offlineTime, gameVars.value.delta * 1000);
            gameVars.value.delta = 0;
        }
        if (player.value.prog.dilatedTime.normalized) {
            if (gameVars.value.delta > player.value.prog.dilatedTime.normalizeTime) {
                player.value.offlineTime = Decimal.add(player.value.offlineTime, (gameVars.value.delta - player.value.prog.dilatedTime.normalizeTime) * 1000);
                gameVars.value.delta = player.value.prog.dilatedTime.normalizeTime;
            }
        }

        player.value.totalRealTime += gameVars.value.delta;
        let gameDelta = Decimal.mul(gameVars.value.delta, tmp.value.gameTimeSpeed).mul(player.value.setTimeSpeed);
        if (player.value.prog.dilatedTime.speedEnabled && gameVars.value.delta < 1) {
            const prev = player.value.offlineTime;
            player.value.offlineTime = Decimal.sub(player.value.offlineTime, Decimal.mul(gameDelta, speedToConsume()).mul(1000));
            gameDelta = Decimal.mul(gameDelta, timeSpeedBoost(prev));
        }
        // const gameDelta = Decimal.mul(gameVars.value.delta, tmp.value.gameTimeSpeed).mul(player.value.setTimeSpeed);

        player.value.gameTime = Decimal.add(player.value.gameTime, gameDelta);

        if (gameVars.value.delta === 0) {
            return;
        }

        updateAllSCSL();
        updateAllLayer4(gameDelta);
        updateAllCol(gameDelta);
        updateAllKua(gameDelta);
        updateAllStart(gameDelta);

        resetFactor([0]);
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
        data.oldPts = Decimal.max(player.value.prog.main.points, 10);

        if (inChallenge("df")) {
            data.newPts = scale(scale(scale(scale(data.oldPts.max(10).log10(), 0.2, true, 1, 1, Decimal.pow(0.5, challengeDepth("df"))).pow10().add(generate).log10(), 0.2, false, 1, 1, Decimal.pow(0.5, challengeDepth("df"))).pow10(), 0.2, true, 10, 1, Decimal.pow(0.5, challengeDepth("df"))).add(generate), 0.2, false, 10, 1, Decimal.pow(0.5, challengeDepth("df")));

            generate = data.newPts.sub(data.oldPts).max(1);
            tmp.value.main.pps = generate.div(gameDelta);

            pushFactor([0], "Decaying Feeling", `/${format(Decimal.div(data.oldGen, generate), 2)}`, `${format(tmp.value.main.pps, 1)}`, "col")
        }

        data.oldPts = Decimal.max(player.value.prog.main.points, data.scal[0].start);
        setSCSLEffectDisp("points", false, 0, `/${format(1, 2)}`);

        if (Decimal.add(player.value.prog.main.points, generate).gte(data.scal[0].start) && Decimal.gte(generate, data.scal[0].start)) {
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

            generate = data.newPts.sub(data.oldPts).max(0); // max 0 to fix negative PPS bug, probably floating point issues

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

            pushFactor([0], "Taxation", `/${format(data.converted, 2)}`, `${format(tmp.value.main.pps, 1)}`, "sc1")
        }

        if (Decimal.isNaN(player.value.prog.main.points)) {
            throw new Error(`weh?! points are NaN!`)
        }
        if (Decimal.lt(player.value.prog.main.points, 0)) {
            throw new Error(`weh?! points are negative!`)
        }

        tmp.value.main.ppsNullified = generate.eq(0) && Decimal.gte(player.value.prog.main.points, data.scal[0].start);
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
            if (generate.lt(0) && !gameVars.value.warnings.negativePPS) {
                gameVars.value.warnings.negativePPS = true;
                console.log(`generate: ${generate}`);
                console.warn(`PPS was trying to be negative! wtf?!`);
                console.warn(`Internal game information:`);
                console.warn({
                    saveFile: {
                        save: btoa(JSON.stringify(game.value.list[game.value.currentSave])),
                        cloggingConsole: true
                    },
                    gameVariables1: gameVars.value,
                    gameVariables2: tmp.value
                });
                console.table(ALL_FACTORS[0].factors);
                alert(`An error happened: your points was attempting to be negative! The error was prevented, but the game may run in an unstable state. The game's save file was automatically exported into console.`);
            }
            generate = generate.max(0);
            player.value.prog.main.points = Decimal.add(player.value.prog.main.points, generate);

            player.value.prog.main.totalInPrai = Decimal.add(player.value.prog.main.totalInPrai, generate);
            player.value.prog.main.bestInPrai = Decimal.max(player.value.prog.main.bestInPrai, player.value.prog.main.points);
            player.value.prog.main.bestInCol = Decimal.max(player.value.prog.main.bestInCol, player.value.prog.main.points);
            player.value.prog.main.bestInLayer4 = Decimal.max(player.value.prog.main.bestInLayer4, player.value.prog.main.points);
            player.value.prog.main.bestEver = Decimal.max(player.value.prog.main.bestEver, player.value.prog.main.points);
        }

        player.value.prog.unlocks.pr2 = player.value.prog.unlocks.pr2 || Decimal.gte(player.value.prog.main.prai.amount, 9.5);
        player.value.prog.unlocks.kua = player.value.prog.unlocks.kua || Decimal.gte(player.value.prog.main.pr2.amount, 10);
        player.value.prog.unlocks.kenhancers = player.value.prog.unlocks.kenhancers || Decimal.gte(player.value.prog.kua.amount, 0.0095);
        player.value.prog.unlocks.col = player.value.prog.unlocks.col || (getKuaUpgrade('p', 2) && Decimal.gte(player.value.prog.kua.amount, 100));
        player.value.prog.unlocks.kblessings = player.value.prog.unlocks.kblessings || (getKuaUpgrade('p', 8) && Decimal.gte(player.value.prog.kua.amount, 1e6));
        player.value.prog.unlocks.kproofs.main = player.value.prog.unlocks.kproofs.main || getKuaUpgrade('k', 3);
        player.value.prog.unlocks.kproofs.strange = player.value.prog.unlocks.kproofs.strange || Decimal.gte(player.value.prog.kua.proofs.amount, 1e24);
        player.value.prog.unlocks.kproofs.finicky = player.value.prog.unlocks.kproofs.finicky || Decimal.gte(player.value.prog.kua.proofs.strange.amount, 1e7);
        player.value.prog.unlocks.tax = player.value.prog.unlocks.tax || Decimal.gte(player.value.prog.main.points, "e1500");

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
            // spawnPopup(0, `The game has been saved!`, `Save`, 5, `#00FF00`)
        }

        // drawing();
    } catch (e) {
        clearInterval(gameReviver);
        clearInterval(gameTick);
        console.error(e);
        console.error(`(Game)   Save List Data:`);
        console.error(game.value);
        console.error(`(Player) Save File Data:`);
        console.error(player.value);
        console.error(`Temporary Variables:`);
        console.error(tmp.value);
        console.warn(`If you cannot go to your saves at all; If you think you are utterly hopeless of playing this game again, run resetTheWholeGame() ! I'll try to make an interactive version of this sooner or later so you don't have to go into console...`);
        alert(
            `The game has crashed! Check the console to see the error(s) to report it to @TearonQ or @qnoraeT. \n\nYou may still be able to export your save normally by going into Options -> Saving -> Save List -> Export Save or Export Save List to Clipboard. \nIf you see any NaNs, you might have a clue!`
        );
        // throws back out the error because the offlineTime needs to detect an error
        throw new Error(
            `The game has crashed! Here is the error(s) to report it to @TearonQ or @qnoraeT. \n\nYou may still be able to export your save normally by going into Options -> Saving -> Save List -> Export Save or Export Save List to Clipboard. \nIf you see any NaNs, you might have a clue!`
        );
    }
}

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
        gameVars: typeof gameVars;
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
        compressToBase64: typeof compressToBase64;
        decompressFromBase64: typeof decompressFromBase64;
        tab: typeof tab;
        GROWAN_DATA: typeof GROWAN_DATA;
        LABELS: typeof LABELS;
    }
}

window.player = player;
window.game = game;
window.tmp = tmp;
window.gameVars = gameVars;
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
window.compressToBase64 = compressToBase64;
window.decompressFromBase64 = decompressFromBase64;
window.tab = tab;
window.GROWAN_DATA = GROWAN_DATA;
window.LABELS = LABELS;

createApp(App).mount("#app");