import "./assets/main.css";

import { computed, createApp, ref, type ComputedRef, type Ref } from "vue";
import App from "./App.vue";
import Decimal, { type DecimalSource } from "break_eternity.js";
import { type Tab } from "./components/MainTabs/MainTabs";
import { D, expQuadCostGrowth, linearAdd, mixColor, scale, smoothExp, smoothPoly } from "./calc";
import { format } from "./format";
import { saveID, SAVE_MODES, saveTheFrickingGame, resetTheWholeGame, decompressSave } from "./saving";
import { ACHIEVEMENT_DATA, fixAchievements, getAchievementEffect, ifAchievement, setAchievement } from "./components/Game/Game_Achievements/Game_Achievements";
import { diePopupsDie } from "./popups";
import { ALL_FACTORS, initStatsFactors, LABELS, resetFactor, setFactor, type FactorColorID } from "./components/Game/Game_Stats/Game_Stats";
import { updatePlayerData } from "./versionControl";
import { reset } from "./resets";
import { UPDATE_LOG } from "./components/Game/Game_Options/Game_Options";
import { compressToBase64, decompressFromBase64 } from "lz-string";
import { getKuaUpgrade } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_KuaUpgrades/Game_KuaUpgrades";
import { getColXPtoNext } from "./components/Game/Game_Progress/Game_Colosseum/Game_ColResearches/Game_ColResearches";
import { initAllKBlessingUpgrades, KUA_BLESS_UPGS } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_KuaBlessings/Game_KuaBlessings";
import { updateAllCol } from "./components/Game/Game_Progress/Game_Colosseum/Game_Colosseum";
import { updateAllKua } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_Kuaraniai";
import { initAllMainUpgrades, MAIN_UPG_DATA, type TmpMainUpgrade } from "./components/Game/Game_Progress/Game_Main/Game_MainUpgrades/Game_MainUpgrades";
import { initAllMainOneUpgrades, MAIN_ONE_UPGS } from "./components/Game/Game_Progress/Game_Main/Game_OneUpgrades/Game_OneUpgrades";
import { updateAllStart } from "./components/Game/Game_Progress/Game_Main/Game_Main";
import { GROWAN_DATA, GROWAN_UPGS } from "./components/Game/Game_Progress/Game_Layer4/Game_Growan/Game_Growan";
import { updateAllLayer4 } from "./components/Game/Game_Progress/Game_Layer4/Game_Layer4";

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
            return Decimal.gte(player.value.gameProgress.prai.amount, 3);
        }),
        done: computed(() => {
            return player.value.gameProgress.unlocks.pr2;
        }),
        dispPart1: computed(() => {
            return `${format(player.value.gameProgress.prai.amount)} / ${format(10)}`;
        }),
        dispPart2: `PRai to unlock the next layer.`,
        color: computed(() => { return "#ffffff"; })
    },
    {
        shown: computed(() => {
            return Decimal.gte(player.value.gameProgress.pr2.amount, 3);
        }),
        done: computed(() => {
            return player.value.gameProgress.unlocks.kua;
        }),
        dispPart1: computed(() => {
            return `${format(player.value.gameProgress.pr2.amount)} / ${format(10)}`;
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
            return player.value.gameProgress.kua.upgrades[1] >= 2;
        }),
        done: computed(() => {
            return player.value.gameProgress.unlocks.col;
        }),
        dispPart1: computed(() => {
            return `${format(player.value.gameProgress.kua.amount, 3)} / ${format(100)}`;
        }),
        dispPart2: `Kuaraniai to unlock the next feature.`,
        color: computed(() => { return "#ff6000"; })
    },
    {
        shown: computed(() => {
            return player.value.gameProgress.kua.upgrades[1] >= 8;
        }),
        done: computed(() => {
            return player.value.gameProgress.unlocks.kb;
        }),
        dispPart1: computed(() => {
            return `${format(player.value.gameProgress.kua.amount)} / ${format(1e6)}`;
        }),
        dispPart2: `Kuaraniai to unlock the next feature.`,
        color: computed(() => { return "#00ff00"; })
    },
    {
        shown: computed(() => {
            return player.value.gameProgress.unlocks.kb;
        }),
        done: computed(() => {
            return player.value.gameProgress.kua.upgrades[2] >= 3;
        }),
        dispPart1: computed(() => {
            return `${player.value.gameProgress.kua.upgrades} / 3`;
        }),
        dispPart2: `Kuaraniai Upgrades to unlock the next feature.`,
        color: computed(() => { return "#00ffff"; })
    },
    {
        shown: computed(() => {
            return Decimal.gte(player.value.gameProgress.bestPointsInL4, "ee3");
        }),
        done: computed(() => {
            return player.value.gameProgress.unlocks.l4;
        }),
        dispPart1: computed(() => {
            return `${format(player.value.gameProgress.bestPointsInL4)} / ${format("e1500")}`;
        }),
        dispPart2: `Points to unlock the next layers.`,
        color: computed(() => {
            return mixColor('#ffff00', '#804000', 'Linear', (Math.sin(gameVars.value.sessionTime * Math.PI) + 1) / 2);
        })
    },
    {
        shown: computed(() => {
            return player.value.gameProgress.layer4 === undefined ? false : player.value.gameProgress.layer4.pickedFirst !== 0 && Decimal.gte(player.value.gameProgress.bestPointsInL4, "e2000");
        }),
        done: computed(() => {
            return false;
        }),
        dispPart1: computed(() => {
            return `${format(player.value.gameProgress.bestPointsInL4)} / ${format("e10000")}`;
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
    settings: {
        notation: number,
        notationLimit: number
    },
    gameProgress: {
        achievements: Array<Array<number>>,
        unlocks: {
            pr2: boolean,
            kua: boolean,
            kb: boolean,
            kp: boolean,
            col: boolean,
            l4: boolean
        },
        points: DecimalSource,
        totalPointsInPrai: DecimalSource,
        bestPointsInL4: DecimalSource,
        upgrades: Array<{
            bought: DecimalSource,
            best: DecimalSource,
            auto: boolean,
            boughtInKua: DecimalSource
            accumulated: DecimalSource
        }>,
        oneUpgrades: Array<DecimalSource>,
        prai: {
            amount: DecimalSource,
            timeInPRai: DecimalSource,
            auto: boolean,
            times: DecimalSource
        },
        pr2: {
            amount: DecimalSource,
            timeInPR2: DecimalSource,
            auto: boolean
        },
        kua: {
            auto: boolean,
            amount: DecimalSource,
            timeInKua: DecimalSource,
            times: DecimalSource,
            upgrades: Array<number> // counts for ks, kp, and kua
            kshards: DecimalSource,
            totalKSInCol: DecimalSource,
            kpower: DecimalSource,
            totalKPInCol: DecimalSource,
            blessings: {
                amount: DecimalSource,
                totalKBInCol: DecimalSource,
                clickCooldown: DecimalSource,
                upgrades: Array<DecimalSource>
            },
            proofs: {
                amount: DecimalSource,
                upgrades: Array<DecimalSource>
            }
        },
        col: {
            inChallenge: number | null,
            completed: Array<DecimalSource>,
            power: DecimalSource,
            timeInCol: DecimalSource
            timeLeft: DecimalSource,
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
}

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
            notationLimit: 6
        },
        gameProgress: {
            achievements: [],
            unlocks: {
                pr2: false,
                kua: false,
                kb: false,
                kp: false,
                col: false,
                l4: false
            },
            points: D(0),
            totalPointsInPrai: D(0),
            bestPointsInL4: D(0),
            upgrades: [],
            oneUpgrades: [],
            prai: {
                amount: D(0),
                timeInPRai: D(0),
                auto: false,
                times: D(0)
            },
            pr2: {
                amount: D(0),
                timeInPR2: D(0),
                auto: false
            },
            kua: {
                auto: false,
                amount: D(0),
                timeInKua: D(0),
                times: D(0),
                upgrades: [0, 0, 0], // counts for ks, kp, and kua
                kshards: D(0),
                totalKSInCol: D(0),
                kpower: D(0),
                totalKPInCol: D(0),
                blessings: {
                    amount: D(0),
                    totalKBInCol: D(0),
                    clickCooldown: D(0),
                    upgrades: []
                },
                proofs: {
                    amount: D(0),
                    upgrades: []
                }
            },
            col: {
                inChallenge: null,
                completed: [],
                saved: [],
                power: D(0),
                timeInCol: D(0),
                timeLeft: D(0),
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
                    growanEqu: [],
                    equCancel: D(0),
                    tick: D(0),
                    gal: D(0)
                },
                tax: {
                    auto: false,
                    amount: D(0),
                    times: D(0),
                    upgrades: [],
                    invest: []
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
                effects: boolean,
                gain: boolean
            },
            kshards: {
                effects: boolean,
                gain: boolean
            },
            upgrades: Array<boolean>,
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
            perSec: Decimal
            canBuyUpg: boolean,
            canBuyUpgs: {
                auto: boolean,
                effect: boolean,
                kp: boolean,
                skp: boolean,
                fkp: boolean
            },
        }
    },
    col: {
        challengeData: Array<{
            active: boolean
            forced: boolean
        }>
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
        inputSaveList: 'Input your save list here!',
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
                    effects: true,
                    gain: true
                },
                kshards: {
                    effects: true,
                    gain: true
                },
                upgrades: [true, true, true],
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
                perSec: D(0),
                canBuyUpg: false,
                canBuyUpgs: {
                    auto: false,
                    effect: false,
                    kp: false,
                    skp: false,
                    fkp: false
                }
            }
        },
        col: {
            challengeData: [],
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
        achievementList: []
    };
    for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
        obj.kua.active.blessings.upgrades[i] = true;
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
            game.value = JSON.parse(decompressSave(localStorage.getItem(saveID)!));
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
            return MAIN_UPG_DATA[0].effect();
        }),
        color: 'norm',
        type: 'mult'
    },
    {
        baseActive: computed(() => { return true; }),
        active: true,
        name: computed(() => { return 'Upgrade 4'; }),
        effect: computed(() => {
            return MAIN_UPG_DATA[3].effect();
        }),
        color: 'norm',
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
            return Decimal.gte(player.value.gameProgress.oneUpgrades[9], 1);
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
            return player.value.gameProgress.unlocks.kua;
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
            return player.value.gameProgress.layer4.gro.upgrades.overall.includes(0);
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
            return player.value.gameProgress.layer4.gro.upgrades.overall.includes(1);
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
            return Decimal.gte(player.value.gameProgress.oneUpgrades[19], 1);
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
            return Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[1], 12);
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
            return player.value.gameProgress.col.inChallenge !== null;
        }),
        active: true,
        name: computed(() => { return 'Achievement Tier 3'; }),
        effect: computed(() => {
            return ACHIEVEMENT_DATA[2].effect.value
            .mul(
                Decimal.pow(
                    0.25,
                    Decimal.div(
                        player.value.gameProgress.col.timeLeft,
                        player.value.gameProgress.col.maxTime
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
            return player.value.gameProgress.layer4.gro.upgrades.active.includes(0);
        }),
        active: true,
        name: computed(() => { return 'Grōwan Active Upg. 1'; }),
        effect: computed(() => {
            return GROWAN_UPGS.active[0].eff!.value;
        }),
        color: 'growan',
        type: 'pow'
    },
];

function calcPPS(): Decimal {
    let pps = D(1), eff, txt;

    for (let i = 0; i < PPS_CALC.length; i++) {
        PPS_CALC[i].active = PPS_CALC[i].baseActive.value;

        txt = '';
        if (PPS_CALC[i].active) {
            eff = PPS_CALC[i].effect.value;

            if (PPS_CALC[i].type === 'mult') {

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

export const getEndgame = (x = player.value.gameProgress.points) => {
    return Decimal.max(x, 10).log10().log(4000).pow(2).min(1).mul(100);
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

        player.value.totalRealTime += gameVars.value.delta;
        const gameDelta = Decimal.mul(gameVars.value.delta, tmp.value.gameTimeSpeed).mul(player.value.setTimeSpeed);

        player.value.gameTime = Decimal.add(player.value.gameTime, gameDelta);

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
            newPts: D(0)
        };
        data.oldPts = Decimal.max(player.value.gameProgress.points, 10);

        if (Decimal.isNaN(player.value.gameProgress.points)) {
            throw new Error(`weh?! points are NaN!`)
        }
        if (Decimal.lt(player.value.gameProgress.points, 0)) {
            throw new Error(`weh?! points are negative!`)
        }

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
        player.value.gameProgress.points = Decimal.add(player.value.gameProgress.points, generate);

        player.value.gameProgress.bestPointsInL4 = Decimal.max(player.value.gameProgress.bestPointsInL4, player.value.gameProgress.points);    

        player.value.gameProgress.unlocks.pr2 = player.value.gameProgress.unlocks.pr2 || Decimal.gte(player.value.gameProgress.prai.amount, 9.5);
        player.value.gameProgress.unlocks.kua = player.value.gameProgress.unlocks.kua || Decimal.gte(player.value.gameProgress.pr2.amount, 10);
        player.value.gameProgress.unlocks.col = player.value.gameProgress.unlocks.col || (getKuaUpgrade('p', 2) && Decimal.gte(player.value.gameProgress.kua.amount, 100));
        player.value.gameProgress.unlocks.kb = player.value.gameProgress.unlocks.kb || (getKuaUpgrade('p', 8) && Decimal.gte(player.value.gameProgress.kua.amount, 1e6));
        player.value.gameProgress.unlocks.kp = player.value.gameProgress.unlocks.kp || getKuaUpgrade('k', 3);
        player.value.gameProgress.unlocks.l4 = player.value.gameProgress.unlocks.l4 || Decimal.gte(player.value.gameProgress.points, "e1500");

        for (let i = 0; i < ACHIEVEMENT_DATA.length; i++) {
            for (let j = 0; j < ACHIEVEMENT_DATA[i].list.length; j++) {
                if (ACHIEVEMENT_DATA[i].list[j].autoComplete === false) {
                    continue;
                }
                setAchievement(i, j);
            }
        }

        diePopupsDie();

        if (gameVars.value.sessionTime > gameVars.value.lastSave + game.value.autoSaveInterval) {
            saveTheFrickingGame();
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
window.UPDATE_LOG = UPDATE_LOG;
window.compressToBase64 = compressToBase64;
window.decompressFromBase64 = decompressFromBase64;
window.tab = tab;
window.GROWAN_DATA = GROWAN_DATA;
window.LABELS = LABELS;

createApp(App).mount("#app");
