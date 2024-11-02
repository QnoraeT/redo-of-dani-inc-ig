import "./assets/main.css";

import { createApp, ref, type Ref } from "vue";
import App from "./App.vue";
import Decimal, { type DecimalSource } from "break_eternity.js";
import { type Tab } from "./components/MainTabs/MainTabs";
import { D, expQuadCostGrowth, scale, smoothExp, smoothPoly } from "./calc";
import { format } from "./format";
import { saveID, SAVE_MODES, saveTheFrickingGame, resetTheWholeGame } from "./saving";
import { getSCSLAttribute, setSCSLEffectDisp, compileScalSoftList, updateAllSCSL } from "./softcapScaling";
import { updateAllStart, initAllMainUpgrades, initAllMainOneUpgrades, MAIN_ONE_UPGS } from "./components/Game/Game_Progress/Game_Main/Game_Main";
import { ACHIEVEMENT_DATA, fixAchievements, getAchievementEffect, ifAchievement, setAchievement } from "./components/Game/Game_Achievements/Game_Achievements";
import { getKuaUpgrade, updateAllKua } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_Kuaraniai";
import { diePopupsDie } from "./popups";
import { challengeDepth, getColResEffect, getColXPtoNext, inChallenge, timesCompleted, updateAllCol, type challengeIDList, type colChallengesSavedData } from "./components/Game/Game_Progress/Game_Colosseum/Game_Colosseum";
import { updateAllTax } from "./components/Game/Game_Progress/Game_Taxation/Game_Taxation";
import { ALL_FACTORS, initStatsFactors, setFactor } from "./components/Game/Game_Stats/Game_Stats";
import { updatePlayerData } from "./versionControl";
import { reset } from "./resets";
import { speedToConsume, timeSpeedBoost } from "./components/Game/Game_Progress/Game_Stored_Time/Game_Stored_Time";

// this may slow down calculations!!
const NAN_CHECKER = true;

export const NaNCheck = (num: DecimalSource) => {
    if (NAN_CHECKER) {
        if (Decimal.isNaN(num)) {
            throw new Error(`NaN detected!`);
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
            return Decimal.gte(player.value.gameProgress.main.points, "e500");
        },
        get done() {
            return player.value.gameProgress.unlocks.tax;
        },
        get dispPart1() {
            return `${format(player.value.gameProgress.main.points)} / ${format("ee3")}`;
        },
        dispPart2: `Points to unlock the next layer.`,
        color: "#f0d000"
    }
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
            kuaEnhancers: boolean,
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
            }
        },
        col: {
            inAChallenge: boolean,
            completed: {
                nk: DecimalSource,
                su: DecimalSource,
                df: DecimalSource,
                im: DecimalSource
            },
            challengeOrder: { chalID: Array<challengeIDList>, layer: Array<number> },
            completedAll: boolean,
            saved: {
                nk: colChallengesSavedData | null,
                su: colChallengesSavedData | null,
                df: colChallengesSavedData | null,
                im: colChallengesSavedData | null
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
            boughtInReset: [D(0), D(0), D(0), D(0), D(0)]
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
            scaleSoftColors: false
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
                kuaEnhancers: false,
                col: false,
                tax: false
            },
            achievements: [],
            inChallenge: {
                nk: makeChallengeInfo(),
                su: makeChallengeInfo(),
                df: makeChallengeInfo(),
                im: makeChallengeInfo()
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
                }
            },
            col: {
                inAChallenge: false,
                completed: {
                    nk: D(0),
                    su: D(0),
                    df: D(0),
                    im: D(0)
                },
                challengeOrder: { chalID: [], layer: [] },
                completedAll: false,
                saved: {
                    nk: null,
                    su: null,
                    df: null,
                    im: null
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

export type Challenge = {
    nk: ChallengeData;
    su: ChallengeData;
    df: ChallengeData;
    im: ChallengeData;
};

export type ChallengeData = {
    id: number;
    name: string;
    goalDesc: string;
    entered: boolean;
    trapped: boolean;
    overall: boolean;
    depths: DecimalSource;
    optionalDiff: DecimalSource;
    enteredDiff: DecimalSource
};

export type TmpMainUpgrade = {
    effect: Decimal;
    effective: Decimal;
    cost: Decimal;
    target: Decimal;
    canBuy: boolean;
    effectTextColor: string;
    costTextColor: string;
    active: boolean;
    costBase: {
        exp: Decimal;
        scale: Array<Decimal>;
    };
    freeExtra: DecimalSource;
    effectBase: Decimal;
    calculatedEB: Decimal;
};

type Tmp = {
    gameTimeSpeed: Decimal;
    main: {
        pps: Decimal;
        upgrades: Array<TmpMainUpgrade>;
        oneUpgrades: Array<{
            canBuy: boolean;
        }>;
        prai: {
            canDo: boolean;
            pending: Decimal;
            next: Decimal;
            effect: Decimal;
            nextEffect: Decimal;
            gainExp: Decimal;
            req: Decimal;
            effActive: boolean;
        };
        pr2: {
            canDo: boolean;
            target: Decimal;
            cost: Decimal;
            effect: Decimal;
            textEffect: { when: Decimal; txt: string };
            costTextColor: string;
            effActive: boolean;
            effective: Decimal;
        };
    };
    kua: {
        shardGen: Decimal;
        powGen: Decimal;
        effects: {
            kshardPassive: Decimal;
            kpowerPassive: Decimal;
            upg4: Decimal;
            upg5: Decimal;
            upg6: Decimal;
            upg1Scaling: Decimal;
            upg1SuperScaling: Decimal;
            ptPower: Decimal;
            upg2Softcap: Decimal;
            kshardPrai: Decimal;
            kpower: Decimal;
            pts: Decimal;
        };
        req: Decimal;
        mult: Decimal;
        exp: Decimal;
        effectivePrai: Decimal;
        canDo: boolean;
        pending: Decimal;
        active: {
            kpower: {
                upgrades: boolean;
                effects: boolean;
                gain: boolean;
            };
            kshards: {
                upgrades: boolean;
                effects: boolean;
                gain: boolean;
            };
            spUpgrades: boolean;
            effects: boolean;
            gain: boolean;
        };
        baseSourceXPGen: Array<Decimal>;
        kuaTrueSourceXPGen: Array<Decimal>;
        trueEnhPower: Array<Decimal>;
        sourcesCanBuy: Array<boolean>;
        totalEnhSources: Decimal;
        enhSourcesUsed: Decimal;
        enhShowSlow: boolean;
        enhSlowdown: Decimal;
    };
    col: {
        totalColChalComp: Decimal;
        powGenExp: Decimal;
        truePowGen: Decimal;
        powGen: Decimal;
        researchesAtOnce: number;
        researchesAllocated: number;
        researchSpeed: Decimal;
        effects: {
            upg1a2sc: Decimal
            res: Decimal
        };
    };
    tax: {
        req: Decimal;
        canDo: boolean;
        pending: Decimal;
        ptsEff: Decimal;
    };
    gameIsRunning: boolean;
    saveModes: Array<boolean>;
    scaleSoftcapNames: {
        points: string;
        upg1: string;
        upg2: string;
        upg3: string;
        upg4: string;
        upg5: string;
        upg6: string;
        upg7: string;
        upg8: string;
        upg9: string;
        pr2: string;
        kuaupg4base: string;
        kuaupg5base: string;
        kuaupg6base: string;
    };
    scaleList: Array<{
        id: number;
        list: Array<{
            id: number;
            txt: string;
        }>;
    }>;
    softList: Array<{
        id: number;
        list: Array<{
            id: number;
            txt: string;
        }>;
    }>;
    achievementList: Array<Array<number>>;
};

type gameVars = {
    delta: number;
    lastFPSCheck: number;
    fpsList: Array<number>;
    lastSave: number;
    sessionTime: number;
    sessionStart: number;
    fps: number;
    displayedFPS: string;
};

export const tmp: Ref<Tmp> = ref(initTemp());
export const game: Ref<Game> = ref(initGameBeforeSave());
export const player: Ref<Player> = ref(game.value.list[game.value.currentSave].data);

export const gameVars: Ref<gameVars> = ref({
    delta: 0,
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

export const gameReviver = setInterval(gameAlive, 1000);

function initTemp(): Tmp {
    const emptyScaleList = [];
    for (let i = 0; i < 10; i++) {
        emptyScaleList.push({ id: i, list: [] });
    }
    const emptySoftList = [];
    for (let i = 0; i < 10; i++) {
        emptySoftList.push({ id: i, list: [] });
    }
    return {
        gameTimeSpeed: D(1),
        main: {
            pps: D(0),
            upgrades: initAllMainUpgrades(),
            oneUpgrades: initAllMainOneUpgrades(),
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
                pts: D(1)
            },
            req: D(1e10),
            mult: D(0.0001),
            exp: D(3),
            effectivePrai: D(0),
            canDo: false,
            pending: D(0),
            active: {
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
                spUpgrades: true,
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
            enhSlowdown: D(1)
        },
        col: {
            totalColChalComp: D(0),
            powGenExp: D(0.4),
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
            kuaupg6base: "Upgrade 6's Base"
        },
        scaleList: emptyScaleList,
        softList: emptySoftList,
        achievementList: []
    };
}

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

    // initTmp part 2
    fixAchievements();
    initStatsFactors();

    player.value.offlineTime = Decimal.add(player.value.offlineTime, Math.max(0, Date.now() - player.value.lastUpdated));
    gameVars.value.sessionStart = Date.now();
    player.value.lastUpdated = Date.now();
    window.requestAnimationFrame(gameLoop);
}

// const draw = document.getElementById("canvas")! as HTMLCanvasElement;
// const pen = draw.getContext("2d")!;

// const mainParticles: Array<MainParticle> = [];
// const stats = {
//     norm: 0
// }

// type MainParticle = {
//     type: 0,
//     dir: number,
//     x: number,
//     y: number,
//     life: number,
//     maxLife: number,
//     size: number,
//     defGhost: number
// }

// const drawing = () => {
//     draw.width = window.innerWidth;
//     draw.height = window.innerHeight;

//     let alpha;

//     stats.norm += gameVars.value.delta;
//     if (stats.norm >= 0.1) {
//         if (stats.norm >= 10) {
//             stats.norm = 0.1;
//         }

//         for (let atmps = 0; atmps < 10 && stats.norm >= 0.1; atmps++) {
//             stats.norm -= 0.1;

//             const obj: MainParticle = {
//                 type: 0,
//                 dir: (Math.round(Math.random()) - 0.5) * 2,
//                 x: 0,
//                 y: Math.random() * 60,
//                 maxLife: 2.0 + 1.5 * Math.random(),
//                 life: 0.0,
//                 size: 12 + 8 * Math.random(),
//                 defGhost: 32 + 32 * Math.random()
//             }

//             obj.life = obj.maxLife;
//             obj.x = obj.dir === 1 ? -100 : (draw.width + 100);

//             mainParticles.push(obj);
//         }
//     }
//     // stats.kua += gameVars.value.gameVars.value.delta
//     // if (stats.kua >= 0.1) {
//     //     if (stats.kua >= 10) {
//     //         stats.kua = 0.1
//     //     }

//     //     for (let atmps = 0; atmps < 10 && stats.kua >= 0.1; atmps++) {
//     //         stats.kua -= 0.1

//     //         let obj = {
//     //             type: 1,
//     //             dir: (Math.round(Math.random()) - 0.5) * 2,
//     //             y: Math.random() * 60,
//     //             maxLife: 2.0 + 1.5 * Math.random(),
//     //             size: 12 + 8 * Math.random(),
//     //             defGhost: 32 + 32 * Math.random()
//     //         }

//     //         obj.life = obj.maxLife kuaGain
//     //         obj.x = obj.dir === 1 ? element.getBoundingClientRect().x

//     //         mainParticles.push(obj)
//     //     }
//     // }

//     for (let i = 0; i < mainParticles.length; i++) {
//         switch (mainParticles[i].type) {
//             case 0:
//                 mainParticles[i].life -= gameVars.value.delta
//                 if (mainParticles[i].life <= 0) {
//                     mainParticles.splice(i, 1);
//                     i--;
//                     break;
//                 }
//                 mainParticles[i].x += gameVars.value.delta * (mainParticles[i].dir * (mainParticles[i].life + 1)) * ((1 + 2 * Math.random()) / 3) * 100;
//                 mainParticles[i].y += gameVars.value.delta * (4 * (Math.random() - 0.5));
//                 mainParticles[i].y = lerp(1 - (0.75 ** gameVars.value.delta), mainParticles[i].y, 30);

//                 pen.beginPath();
//                 alpha = mainParticles[i].defGhost * mainParticles[i].life / mainParticles[i].maxLife;
//                 pen.fillStyle = `hsla(0, 100%, 100%, ${alpha / 255})`;

//                 pen.arc(mainParticles[i].x,
//                     mainParticles[i].y,
//                     mainParticles[i].size,
//                     0,
//                     2 * Math.PI);
//                 pen.fill();
//                 break;
//             default:
//                 throw new Error(`Particle type ${mainParticles[i].type} is not a valid type :c`);
//         }
//         // dots[i][4] += Math.random() - 0.5;
//         // dots[i][5] += Math.random() - 0.5;
//         // dots[i][4] = lerp(1 - (0.9 ** gameVars.value.delta), dots[i][4], 0);
//         // dots[i][5] = lerp(1 - (0.9 ** gameVars.value.delta), dots[i][5], 0);
//         // dots[i][1] += dots[i][3] * gameVars.value.delta * dots[i][4];
//         // dots[i][2] += dots[i][3] * gameVars.value.delta * dots[i][5];

//         // pen.beginPath();
//         // let alpha;
//         // if (dots[i][0] === 0) {
//         //     alpha = 20 + (4 * Math.cos((sessionTime + 11 * i) / 50));
//         // } else {
//         //     alpha = 160 + (64 * Math.cos((sessionTime + 11 * i) / 50));
//         // }
//         // pen.fillStyle = `hsla(${sessionTime + (i * (dots[i][0] === 0 ? 1 : 0.1))}, 100%, 50%, ${alpha / 255})`;
//         // let j = Math.cos((sessionTime * dots[i][3] + i) / (2 * Math.PI));
//         // pen.arc((Math.abs(dots[i][1] % 3800) - 700),
//         //     (Math.abs(dots[i][2] % 2400) - 700),
//         //     dots[i][0] == 0 ? (300 + 100 * j) : (10 + 4 * j),
//         //     0,
//         //     2 * Math.PI);
//         // pen.fill();
//     }
// }

function calcPPS(): Decimal {
    let pps = D(1);
    setFactor(0, [0], "Base", "1.0", `${format(pps, 1)}`, true);

    pps = pps.mul(tmp.value.main.upgrades[0].effect);
    setFactor(1, [0], "Upgrade 1", `×${format(tmp.value.main.upgrades[0].effect, 2)}`, `${format(pps, 1)}`, true);

    if (Decimal.gte(player.value.gameProgress.main.upgrades[1].bought, 1) && inChallenge("im")) {
        pps = pps.mul(tmp.value.main.upgrades[1].effect);
    }
    setFactor(2, [0], "Upgrade 2", `×${format(tmp.value.main.upgrades[1].effect, 2)}`, `${format(pps, 1)}`, Decimal.gte(player.value.gameProgress.main.upgrades[1].bought, 1) && inChallenge("im"), "col");

    if (Decimal.gte(player.value.gameProgress.main.upgrades[3].bought, 1)) {
        pps = pps.mul(tmp.value.main.upgrades[3].effect);
    }
    setFactor(3, [0], "Upgrade 4", `×${format(tmp.value.main.upgrades[3].effect, 2)}`, `${format(pps, 1)}`, Decimal.gte(player.value.gameProgress.main.upgrades[3].bought, 1));

    if (Decimal.gte(player.value.gameProgress.main.upgrades[4].bought, 1) && inChallenge("im")) {
        pps = pps.mul(tmp.value.main.upgrades[4].effect);
    }
    setFactor(4, [0], "Upgrade 5", `×${format(tmp.value.main.upgrades[4].effect, 2)}`, `${format(pps, 1)}`, Decimal.gte(player.value.gameProgress.main.upgrades[4].bought, 1) && inChallenge("im"), "col");

    pps = pps.mul(tmp.value.main.prai.effActive ? tmp.value.main.prai.effect : 1);
    setFactor(5, [0], "PRai", `×${format(tmp.value.main.prai.effActive ? tmp.value.main.prai.effect : 1, 2)}`, `${format(pps, 1)}`, true);

    if (player.value.gameProgress.unlocks.pr2) {
        pps = pps.mul(tmp.value.main.pr2.effActive ? tmp.value.main.pr2.effect : 1);
    }
    setFactor(6, [0], "PR2", `×${format(tmp.value.main.pr2.effActive ? tmp.value.main.pr2.effect : 1, 2)}`, `${format(pps, 1)}`,  player.value.gameProgress.unlocks.pr2);

    if (Decimal.gte(player.value.gameProgress.main.oneUpgrades[9], 1) && !inChallenge("su")) {
        pps = pps.mul(MAIN_ONE_UPGS[9].effect!);
    }
    setFactor(7, [0], "One-Upgrade #10", `×${format(MAIN_ONE_UPGS[9].effect!, 2)}`, `${format(pps, 1)}`, Decimal.gte(player.value.gameProgress.main.oneUpgrades[9], 1) && !inChallenge("su"));
    
    if (ifAchievement(0, 3) && !inChallenge("su")) {
        pps = pps.mul(1.2);
    }
    setFactor(8, [0], "Achievement ID (0, 3)", `×${format(1.2, 2)}`, `${format(pps, 1)}`, ifAchievement(0, 3) && !inChallenge("su"), "ach");

    if (!inChallenge("su")) {
        pps = pps.mul(ACHIEVEMENT_DATA[0].eff);
    }
    setFactor(9, [0], "Achievement Tier 1", `×${format(ACHIEVEMENT_DATA[0].eff, 2)}`, `${format(pps, 1)}`, !inChallenge("su"), "ach");

    if (player.value.gameProgress.unlocks.kua && !inChallenge("su")) {
        pps = pps.mul(tmp.value.kua.effects.kpowerPassive);
    }
    setFactor(10, [0], "KPower Base Effect", `×${format(tmp.value.kua.effects.kpowerPassive, 2)}`, `${format(pps, 1)}`, player.value.gameProgress.unlocks.kua && !inChallenge("su"), "kua");

    if (getKuaUpgrade("s", 7) && !inChallenge("su")) {
        pps = pps.mul(tmp.value.kua.effects.pts);
    }
    setFactor(11, [0], "KShard Upgrade 7", `×${format(tmp.value.kua.effects.pts, 2)}`, `${format(pps, 1)}`, getKuaUpgrade("s", 7) && !inChallenge("su"), "kua");

    if (ifAchievement(1, 0) && !inChallenge("su")) {
        pps = pps.mul(2);
    }
    setFactor(12, [0], "Achievement ID (1, 0)", `×${format(2, 2)}`, `${format(pps, 1)}`, ifAchievement(1, 0) && !inChallenge("su"), "ach");

    if (ifAchievement(1, 1) && !inChallenge("su")) {
        pps = pps.mul(getAchievementEffect(1, 1));
    }
    setFactor(13, [0], "Achievement ID (1, 1)", `×${format(getAchievementEffect(1, 1), 2)}`, `${format(pps, 1)}`, ifAchievement(1, 1) && !inChallenge("su"), "ach");

    if (ifAchievement(1, 3) && !inChallenge("su")) {
        pps = pps.mul(getAchievementEffect(1, 3));
    }
    setFactor(14, [0], "Achievement ID (1, 3)", `×${format(getAchievementEffect(1, 3), 2)}`, `${format(pps, 1)}`, ifAchievement(1, 3) && !inChallenge("su"), "ach");

    if (ifAchievement(1, 13) && !inChallenge("su")) {
        pps = pps.mul(getAchievementEffect(1, 13));
    }
    setFactor(15, [0], "Achievement ID (1, 13)", `×${format(getAchievementEffect(1, 13), 2)}`, `${format(pps, 1)}`, ifAchievement(1, 13) && !inChallenge("su"), "ach");

    if (player.value.gameProgress.unlocks.col) {
        pps = pps.mul(getColResEffect(0));
    }
    setFactor(16, [0], "Dotgenous", `×${format(getColResEffect(0), 2)}`, `${format(pps, 1)}`, Decimal.gte(timesCompleted("nk"), 1), "col");

    if (Decimal.gte(timesCompleted("df"), 1) && !inChallenge("su")) {
        pps = pps.mul(10);
    }
    setFactor(17, [0], `Decaying Feeling Completion ×${format(timesCompleted('df'))}`, `×${format(10, 2)}`, `${format(pps, 1)}`, Decimal.gte(timesCompleted("df"), 1) && !inChallenge("su"), "col");

    if (player.value.gameProgress.unlocks.tax && !inChallenge("su")) {
        pps = pps.mul(tmp.value.tax.ptsEff);
    }
    setFactor(18, [0], "Taxed Coins", `×${format(tmp.value.tax.ptsEff, 2)}`, `${format(pps, 1)}`, player.value.gameProgress.unlocks.tax && !inChallenge("su"), "tax");

    if (getKuaUpgrade("p", 3) && !inChallenge("su")) {
        pps = pps.pow(tmp.value.kua.effects.ptPower);
    }
    setFactor(19, [0], "KPower Upgrade 3", `^${format(tmp.value.kua.effects.ptPower, 3)}`, `${format(pps, 1)}`, getKuaUpgrade("p", 3) && !inChallenge("su"), "kua");

    if (player.value.gameProgress.col.inAChallenge && !inChallenge("su")) {
        pps = pps.pow(
            ACHIEVEMENT_DATA[2].eff
                .mul(
                    Decimal.pow(
                        0.25,
                        Decimal.div(
                            player.value.gameProgress.col.time,
                            player.value.gameProgress.col.maxTime
                        ).max(0)
                    )
                )
                .add(1)
        );
    }
    setFactor(20, [0], "Achievement Tier 3", `^${format(ACHIEVEMENT_DATA[2].eff.mul(Decimal.pow(0.25, Decimal.div(player.value.gameProgress.col.time, player.value.gameProgress.col.maxTime).max(0))).add(1), 3)}`, `${format(pps, 1)}`, player.value.gameProgress.col.inAChallenge && !inChallenge("su"), "ach");

    if (inChallenge("im")) {
        pps = pps.pow(Decimal.pow(0.8, challengeDepth("im")))
    }
    setFactor(21, [0], `Inverted Mechanics ×${format(challengeDepth("im"))}`, `^${format(Decimal.pow(0.8, challengeDepth("im")), 3)}`, `${format(pps, 1)}`, inChallenge("im"), "col");

    NaNCheck(pps);
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
        if (player.value.gameProgress.dilatedTime.speedEnabled) {
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
        // FIXME: every time PPS gets updated, check the id value for this (21)
        setFactor(21, [0], "Decaying Feeling", `/${format(Decimal.div(data.oldGen, generate), 2)}`, `${format(tmp.value.main.pps, 1)}`, inChallenge("df"), "col");

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

            generate = data.newPts.sub(data.oldPts).max(data.scal[0].start);
            tmp.value.main.pps = generate.div(gameDelta);
            setSCSLEffectDisp(
                "points",
                false,
                0,
                `/${format(Decimal.div(data.oldGen, generate), 2)}`
            );
        }
        // FIXME: every time PPS gets updated, check the id value for this (22)
        setFactor(22, [0], "Taxation", `/${format(Decimal.div(data.oldGen, generate), 2)}`, `${format(tmp.value.main.pps, 1)}`, Decimal.add(player.value.gameProgress.main.points, generate).gte(data.scal[0].start) && Decimal.gte(generate, data.scal[0].start), "sc1");

        player.value.gameProgress.main.points = Decimal.add(player.value.gameProgress.main.points, generate);

        updateAllTotal(player.value.gameProgress.main.totals, generate);
        player.value.gameProgress.main.totalEver = Decimal.add(player.value.gameProgress.main.totalEver, generate);
        updateAllBest(player.value.gameProgress.main.best, player.value.gameProgress.main.points);
        player.value.gameProgress.main.bestEver = Decimal.max(player.value.gameProgress.main.bestEver, player.value.gameProgress.main.points);

        player.value.gameProgress.unlocks.pr2 = player.value.gameProgress.unlocks.pr2 || Decimal.gte(player.value.gameProgress.main.prai.amount, 9.5);
        player.value.gameProgress.unlocks.kua = player.value.gameProgress.unlocks.kua || Decimal.gte(player.value.gameProgress.main.pr2.amount, 10);
        player.value.gameProgress.unlocks.kuaEnhancers = player.value.gameProgress.unlocks.kuaEnhancers || Decimal.gte(player.value.gameProgress.kua.amount, 0.0095);
        player.value.gameProgress.unlocks.col = player.value.gameProgress.unlocks.col || (player.value.gameProgress.kua.kpower.upgrades >= 2 && Decimal.gte(player.value.gameProgress.kua.amount, 100));
        player.value.gameProgress.unlocks.tax = player.value.gameProgress.unlocks.tax || Decimal.gte(player.value.gameProgress.main.points, "ee6");

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
        alert(
            `The game has crashed! Check the console to see the error(s) to report it to @TearonQ or @qnoraeT. \n\nYou can still export your save normally by going into Options -> Saving -> Save List -> Export Save or Export Save List to Clipboard. \nIf you see any NaNs, you might have a clue!`
        );
        console.error(
            `The game has crashed! Here is the error(s) to report it to @TearonQ or @qnoraeT. \n\nYou can still export your save normally by going into Options -> Saving -> Save List -> Export Save or Export Save List to Clipboard. \nIf you see any NaNs, you might have a clue!`
        );
        console.error(e);
        console.error(`(Game)   Save List Data:`);
        console.error(game.value);
        console.error(`(Player) Save File Data:`);
        console.error(player.value);
        console.error(`Temporary Variables:`);
        console.error(tmp.value);
        console.warn(`If you cannot go to your saves at all; If you think you are utterly hopeless of playing this game again, run resetTheWholeGame() ! I'll try to make an interactive version of this sooner or later so you don't have to go into console...`)
        clearInterval(gameReviver);
        return;
    }

    window.requestAnimationFrame(gameLoop);
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

createApp(App).mount("#app");
