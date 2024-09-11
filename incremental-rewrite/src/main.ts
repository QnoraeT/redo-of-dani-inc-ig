import './assets/main.css'

import { createApp, ref, type Ref } from 'vue'
import App from './App.vue'
import Decimal, { type DecimalSource } from 'break_eternity.js'
import { type Tab } from './components/MainTabs/MainTabs'
import { D, scale } from './calc'
import { format } from './format'
import { saveID, SAVE_MODES, saveTheFrickingGame } from './saving'
import { getSCSLAttribute, setSCSLEffectDisp, compileScalSoftList, updateAllSCSL } from './softcapScaling'
import { updateAllStart, updateStart, initAllMainUpgrades } from './components/Game/Game_Progress/Game_Main/Game_Main'
import { ACHIEVEMENT_DATA, fixAchievements, getAchievementEffect, ifAchievement, setAchievement } from './components/Game/Game_Achievements/Game_Achievements'
import { getKuaUpgrade, updateAllKua } from './components/Game/Game_Progress/Game_Kuaraniai/Game_Kuaraniai'
import { diePopupsDie } from './popups'
import { getColResEffect, updateAllCol, type challengeIDList, type colChallengesSavedData } from './components/Game/Game_Progress/Game_Colosseum/Game_Colosseum'
import { updateAllTax } from './components/Game/Game_Progress/Game_Taxation/Game_Taxation'

export const NEXT_UNLOCKS = [
    {
        get shown() { return Decimal.gte(player.value.gameProgress.main.prai.bestEver, 3); },
        get done() { return Decimal.gte(player.value.gameProgress.main.prai.bestEver, 9.5); },
        get dispPart1() { return `${format(player.value.gameProgress.main.prai.bestEver)} / ${format(10)}`; },
        dispPart2: `PRai to unlock the next layer.`,
        color: "#ffffff",
    },
    {
        get shown() { return Decimal.gte(player.value.gameProgress.main.pr2.bestEver, 3); },
        get done() { return player.value.gameProgress.unlocks.kua; },
        get dispPart1() { return `${format(player.value.gameProgress.main.pr2.bestEver)} / ${format(10)}`; },
        dispPart2: `PR2 to unlock the next layer.`,
        color: "#7958ff"
    },
    {
        get shown() { return player.value.gameProgress.kua.kpower.upgrades >= 2; },
        get done() { return player.value.gameProgress.unlocks.kuaEnhancers; },
        get dispPart1() { return `${format(player.value.gameProgress.kua.amount, 3)} / ${format(0.01, 2)}`; },
        dispPart2: `Kuaraniai to unlock the next feature.`,
        color: "#a040ff"
    },
    {
        get shown() { return player.value.gameProgress.kua.kpower.upgrades >= 2; },
        get done() { return player.value.gameProgress.unlocks.col; },
        get dispPart1() { return `${format(player.value.gameProgress.kua.amount, 3)} / ${format(100)}`; },
        dispPart2: `Kuaraniai to unlock the next feature.`,
        color: "#ff6000"
    },
    {
        get shown() { return Decimal.gte(player.value.gameProgress.main.points, 1e250); },
        get done() { return player.value.gameProgress.unlocks.tax; },
        get dispPart1() { return `${format(player.value.gameProgress.main.points)} / ${format(Number.MAX_VALUE)}`; },
        dispPart2: `Points to unlock the next layer.`,
        color: "#f0d000"
    },
]

type Game = {
    currentSave: number
    autoSaveInterval: number
    idGen: number
    list: Array<{
        id: number
        name: string
        modes: Array<number>
        data: Player
    }>
}

type Player = {
    lastUpdated: number
    offlineTime: number
    totalRealTime: number
    gameTime: DecimalSource
    setTimeSpeed: DecimalSource
    version: number
    displayVersion: string
    settings: {
        notation: number
        scaleSoftColors: boolean
    }

    gameProgress: {
        achievements: Array<Array<number>>
        inChallenge: Challenge
        unlocks: {
            pr2: boolean
            kua: boolean
            kuaEnhancers: boolean
            col: boolean
            tax: boolean
        }
        main: {
            points: DecimalSource
            totals: Array<null | DecimalSource> // prai, pr2, kua, col, tax
            best: Array<null | DecimalSource> // prai, pr2, kua, col, tax
            totalEver: DecimalSource
            bestEver: DecimalSource
            upgrades: Array<
                {
                    bought: DecimalSource
                    best: DecimalSource
                    auto: boolean
                    boughtInReset: Array<DecimalSource> // prai, pr2, kua, col, tax
                }
            >
            prai: {
                totals: Array<null | DecimalSource> // null, pr2, kua, col, tax
                best: Array<null | DecimalSource> // null, pr2, kua, col, tax
                totalEver: DecimalSource
                bestEver: DecimalSource
                amount: DecimalSource
                timeInPRai: DecimalSource
                auto: boolean
                times: DecimalSource
            }
            pr2: {
                best: Array<null | DecimalSource> // null, null, kua, col, tax
                bestEver: DecimalSource
                amount: DecimalSource
                timeInPR2: DecimalSource
                auto: boolean
            }
        }
        kua: {
            auto: boolean
            amount: DecimalSource
            totals: Array<null | DecimalSource> // null, null, null, col, tax
            best: Array<null | DecimalSource> // null, null, null, col, tax
            totalEver: DecimalSource
            bestEver: DecimalSource
            timeInKua: DecimalSource
            times: DecimalSource
            kshards: {
                amount: DecimalSource
                totals: Array<null | DecimalSource> // null, null, null, col, tax
                best: Array<null | DecimalSource> // null, null, null, col, tax
                totalEver: DecimalSource
                bestEver: DecimalSource
                upgrades: number
            }
            kpower: {
                amount: DecimalSource
                totals: Array<null | DecimalSource> // null, null, null, col, tax
                best: Array<null | DecimalSource> // null, null, null, col, tax
                totalEver: DecimalSource
                bestEver: DecimalSource
                upgrades: number
            }
            enhancers: {
                autoSources: boolean
                sources: Array<DecimalSource>
                enhancers: Array<DecimalSource>
                enhanceXP: Array<DecimalSource>
                enhancePow: Array<DecimalSource>
                xpSpread: DecimalSource
                inExtraction: number
                extractionXP: Array<DecimalSource>
                upgrades: Array<number>
            }
        }
        col: {
            inAChallenge: boolean
            completed: {
                nk: DecimalSource
            }
            challengeOrder: {chalID: Array<challengeIDList>, layer: Array<number>}
            completedAll: boolean
            saved: {
                nk: colChallengesSavedData | null
            }
            power: DecimalSource
            totals: Array<null | DecimalSource> // null, null, null, null, tax
            best: Array<null | DecimalSource> // null, null, null, null, tax
            totalEver: DecimalSource
            bestEver: DecimalSource
            time: DecimalSource
            maxTime: DecimalSource
            research: {
                xpTotal: Array<DecimalSource>
                enabled: Array<boolean>
            }
        }
        tax: {
            auto: boolean
            amount: DecimalSource,
            totals: Array<null | DecimalSource> // null, null, null, null, null
            best: Array<null | DecimalSource> // null, null, null, null, null
            totalEver: DecimalSource
            bestEver: DecimalSource
            times: DecimalSource,
            upgrades: Array<number>
        }
    }
}

export const initGameBeforeSave = (): Game => {
    const data: Player = initPlayer()

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
}

export const initPlayer = (set = false): Player => {
    const mainUpgrades = [];
    for (let i = 0; i < 6; i++) {
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
            unlocks: {
                pr2: false,
                kua: false,
                kuaEnhancers: false,
                col: false,
                tax: false
            },
            achievements: [],
            inChallenge: {
                nk: {
                    id: 0,
                    name: '',
                    goalDesc: '',
                    entered: false,
                    trapped: false,
                    overall: false,
                    depths: D(0)
                }
            },
            main: {
                points: D(0),
                totals: [D(0), D(0), D(0), D(0), D(0)],
                best: [D(0), D(0), D(0), D(0), D(0)],
                totalEver: D(0),
                bestEver: D(0),
                upgrades: mainUpgrades,
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
                    nk: D(0)
                },
                challengeOrder: {chalID: [], layer: []},
                completedAll: false,
                saved: {
                    nk: null
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
    }
    if (set) { player.value = data; }
    return data;
}

export const setPlayerFromSave = (save: string, id: number): void => {
    const procSave = JSON.parse(atob(save));
    game.value.list[id] = procSave;
    if (game.value.currentSave === id) {
        player.value = procSave.data;
    }
    player.value = updatePlayerData(player.value);
}

export const setGameFromSave = (save: string): void => {
    const procSave = JSON.parse(atob(save));
    game.value = procSave;
    player.value = game.value.list[game.value.currentSave].data;
    player.value = updatePlayerData(player.value);
}

export type Challenge = {
    nk: ChallengeData
}

export type ChallengeData = {
    id: number
    name: string
    goalDesc: string
    entered: boolean
    trapped: boolean
    overall: boolean
    depths: DecimalSource
}

export type TmpMainUpgrade = {
    effect: Decimal
    cost: Decimal
    target: Decimal
    canBuy: boolean
    effectTextColor: string
    costTextColor: string
    active: boolean
    costBase: {
        exp: Decimal, 
        scale: Array<Decimal>
    }
    freeExtra: DecimalSource
    effectBase: Decimal
    calculatedEB: Decimal
}

type Tmp = {
    gameTimeSpeed: Decimal
    main: {
        pps: Decimal
        upgrades: Array<TmpMainUpgrade>
        prai: {
            canDo: boolean
            pending: Decimal
            next: Decimal
            effect: Decimal
            nextEffect: Decimal
            gainExp: Decimal
            req: Decimal
            effActive: boolean
        }
        pr2: {
            canDo: boolean
            target: Decimal
            cost: Decimal
            effect: Decimal
            textEffect: { when: Decimal, txt: string }
            costTextColor: string
            effActive: boolean
            effective: Decimal
        }
    }
    kua: {
        shardGen: Decimal
        powGen: Decimal
        effects: { 
            kshardPassive: Decimal,
            kpowerPassive: Decimal,
            up4: Decimal, 
            up5: Decimal, 
            up6: Decimal, 
            upg1Scaling: Decimal, 
            upg1SuperScaling: Decimal, 
            ptPower: Decimal, 
            upg2Softcap: Decimal, 
            kshardPrai: Decimal, 
            kpower: Decimal, 
            pts: Decimal 
        }
        req: Decimal,
        mult: Decimal,
        exp: Decimal,
        effectivePrai: Decimal,
        canDo: boolean,
        pending: Decimal,
        active: {
            kpower: {
                upgrades: boolean
                effects: boolean
                gain: boolean
            }
            kshards: {
                upgrades: boolean
                effects: boolean
                gain: boolean
            }
            spUpgrades: boolean
            effects: boolean
            gain: boolean
        }
        baseSourceXPGen: Array<Decimal>
        kuaTrueSourceXPGen: Array<Decimal>
        trueEnhPower: Array<Decimal>
        sourcesCanBuy: Array<boolean>
        totalEnhSources: Decimal
        enhSourcesUsed: Decimal
        enhShowSlow: boolean
        enhSlowdown: Decimal
    }
    col: {
        powGenExp: Decimal
        powGen: Decimal
        researchesAtOnce: number
        researchesAllocated: number
        researchSpeed: Decimal
    }
    tax: {
        req: Decimal
        canDo: boolean
        pending: Decimal
        ptsEff: Decimal
    }
    gameIsRunning: boolean
    saveModes: Array<boolean>
    scaleSoftcapNames: {
        points: string
        upg1: string
        upg2: string
        upg3: string
        upg4: string
        upg5: string
        upg6: string
        pr2: string
    }
    scaleList: Array<{
        id: number
        list: Array<{
            id: number
            txt: string
        }>
    }>
    softList: Array<{
        id: number
        list: Array<{
            id: number
            txt: string
        }>
    }>
    achievementList: Array<Array<number>>
}

type gameVars = {
    delta: number
    lastFPSCheck: number
    fpsList: Array<number>
    lastSave: number
    sessionTime: number
    sessionStart: number
    fps: number
    displayedFPS: string
}

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
    displayedFPS: '0.0'
});

export const tab: Ref<Tab> = ref({
    currentTab: 0,
    // fill this with values
    tabList: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]
});

const gameReviver = setInterval(gameAlive, 1000);

function initTemp(): Tmp {
    const emptyScaleList = [];
    for (let i = 0; i < 10; i++) {
        emptyScaleList.push({id: i, list: []});
    }
    const emptySoftList = [];
    for (let i = 0; i < 10; i++) {
        emptySoftList.push({id: i, list: []});
    }
    return {
        gameTimeSpeed: D(1),
        main: {
            pps: D(0),
            upgrades: initAllMainUpgrades(),
            prai: {
                canDo: false,
                pending: D(0),
                next: D(0),
                effect: D(1),
                nextEffect: D(1),
                gainExp: D(1/3),
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
                up4: D(1), 
                up5: D(1), 
                up6: D(0), 
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
            powGenExp: D(0.4),
            powGen: D(0),
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
        scaleSoftcapNames: { points: "Points", upg1: "Upgrade 1", upg2: "Upgrade 2", upg3: "Upgrade 3", upg4: "Upgrade 4", upg5: "Upgrade 5", upg6: "Upgrade 6", pr2: "PR2" },
        scaleList: emptyScaleList,
        softList: emptySoftList,
        achievementList: [],
    }
}

function gameAlive(): void {
    if (!tmp.value.gameIsRunning) {
        tmp.value.gameIsRunning = true;
        loadGame();
    }
}

window.onload = function() {
    loadGame();
};

function loadGame(): void {
    gameVars.value.lastFPSCheck = 0;
    if (localStorage.getItem(saveID) !== null && localStorage.getItem(saveID) !== "null") {
        try {
            game.value = JSON.parse(atob(localStorage.getItem(saveID)!)); 
            player.value = updatePlayerData(game.value.list[game.value.currentSave].data);
        } catch (e) {
            console.error(`loading the game.value went wrong!`)
            console.error(e)
            console.error(localStorage.getItem(saveID)!)
        }
    }

    // initTmp part 2
    fixAchievements();

    player.value.offlineTime += Math.max(0, Date.now() - player.value.lastUpdated);
    gameVars.value.sessionStart = Date.now()
    window.requestAnimationFrame(gameLoop);
}

export const updatePlayerData = (player: Player): Player => {
    player.version = player.version || -1;
    if (player.version < 0) {
        player.version = 0;
    }
    if (player.version === 0) {
        player.settings.scaleSoftColors = false
        // player.displayVersion = '1.0.0'
        player.version = 1;
    }
    if (player.version === 1) {

        // player.version = 2;
    }
    if (player.version === 2) {

        // player.version = 3;
    }
    if (player.version === 3) {

        // player.version = 4;
    }
    if (player.version === 4) {

        // player.version = 5;
    }
    if (player.version === 5) {

        // player.version = 6;
    }

    return player;
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

export const resetTotalBestArray = (array: Array<null | DecimalSource>, defaultt: Decimal, clear: number) => {
    if (clear > array.length) {
        console.warn(`[resetTotalBestArray]: Clear (${clear}) is larger than the array (${array.length})!`);
        console.warn(array);
    }
    if (array[clear] !== null) {
        array[clear] = defaultt;
    }
}

export const reset = (layer: number, override = false) => {
    if (layer <= -1) {
        return;
    }
    
    let resetSuccessful = false;
    switch (layer) {
        case 0:
            if (tmp.value.main.prai.canDo || override) {
                resetSuccessful = true;
                if (!override) {
                    player.value.gameProgress.main.prai.amount = Decimal.add(player.value.gameProgress.main.prai.amount, tmp.value.main.prai.pending);
                    updateAllTotal(player.value.gameProgress.main.prai.totals, tmp.value.main.prai.pending);
                    player.value.gameProgress.main.prai.totalEver = Decimal.add(player.value.gameProgress.main.prai.totalEver, tmp.value.main.prai.pending);
                    player.value.gameProgress.main.prai.times = Decimal.add(player.value.gameProgress.main.prai.times, 1);
                }

                setAchievement(0, 8, ACHIEVEMENT_DATA[0].list[8].cond);

                for (let i = 0; i < 2; i++) {
                    player.value.gameProgress.main.prai.timeInPRai = D(0);
                    player.value.gameProgress.main.points = D(0);

                    for (let i = 0; i < 3; i++) {
                        player.value.gameProgress.main.upgrades[i].bought = D(0);
                    }

                    updateStart(0, 0);
                    updateStart(-3, 0);
                    updateStart(-2, 0);
                    updateStart(-1, 0);
                }
            }
            break;
        case 1:
            if (tmp.value.main.pr2.canDo || override) {
                resetSuccessful = true;
                if (!override) {
                    player.value.gameProgress.main.pr2.amount = Decimal.add(player.value.gameProgress.main.pr2.amount, 1);
                }

                player.value.gameProgress.main.prai.amount = Decimal.min(10, player.value.gameProgress.main.pr2.amount);

                updateStart(1, 0);
            }
            break;
        case 2:
            if (tmp.value.kua.canDo || override) {
                resetSuccessful = true;
                if (!override) {
                    setAchievement(1, 4, ACHIEVEMENT_DATA[1].list[4].cond);
                    setAchievement(1, 6, ACHIEVEMENT_DATA[1].list[6].cond);
                    setAchievement(1, 8, ACHIEVEMENT_DATA[1].list[8].cond);
                    setAchievement(1, 9, ACHIEVEMENT_DATA[1].list[9].cond);
                    setAchievement(1, 10, ACHIEVEMENT_DATA[1].list[10].cond);
                    setAchievement(1, 11, ACHIEVEMENT_DATA[1].list[11].cond);
                    setAchievement(1, 12, ACHIEVEMENT_DATA[1].list[12].cond);
                    player.value.gameProgress.kua.amount = Decimal.add(player.value.gameProgress.kua.amount, tmp.value.kua.pending);
                    updateAllTotal(player.value.gameProgress.kua.totals, tmp.value.kua.pending);
                    player.value.gameProgress.kua.totalEver = Decimal.add(player.value.gameProgress.kua.totalEver, tmp.value.kua.pending);
                    player.value.gameProgress.kua.times = Decimal.add(player.value.gameProgress.kua.times, 1);
                }

                player.value.gameProgress.main.prai.times = D(0);
                player.value.gameProgress.main.prai.amount = D(0);
                player.value.gameProgress.kua.timeInKua = D(0);

                updateAllKua(0)
            }
            break;
        case 3:
            resetSuccessful = true;
            player.value.gameProgress.kua.amount = D(0);
            player.value.gameProgress.kua.times = D(0);
            player.value.gameProgress.kua.timeInKua = D(0);
            player.value.gameProgress.kua.kshards.amount = D(0);
            player.value.gameProgress.kua.kshards.upgrades = 0;
            player.value.gameProgress.kua.kpower.amount = D(0);
            player.value.gameProgress.kua.kpower.upgrades = 0;
            player.value.gameProgress.main.pr2.amount = D(0);
            for (let i = 0; i < 6; i++) {
                player.value.gameProgress.main.upgrades[i].auto = false;
            }
            player.value.gameProgress.main.prai.auto = false;

            for (let i = 0; i < 6; i++) {
                player.value.gameProgress.main.upgrades[i].bought = D(0);
                player.value.gameProgress.main.upgrades[i].boughtInReset[3] = D(0);
            }

            player.value.gameProgress.kua.enhancers.sources = [D(0), D(0), D(0)],
            player.value.gameProgress.kua.enhancers.enhancers = [D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
            player.value.gameProgress.kua.enhancers.enhanceXP = [D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
            player.value.gameProgress.kua.enhancers.enhancePow = [D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
            player.value.gameProgress.kua.enhancers.xpSpread = D(1),
            player.value.gameProgress.kua.enhancers.inExtraction = 0,
            player.value.gameProgress.kua.enhancers.extractionXP = [D(0), D(0), D(0)],
            player.value.gameProgress.kua.enhancers.upgrades = []
            updateAllKua(0);
            break;
        case 4:
            if (tmp.value.tax.canDo || override) {
                resetSuccessful = true;
                if (!override) {
                    player.value.gameProgress.tax.amount = Decimal.add(player.value.gameProgress.tax.amount, tmp.value.tax.pending);
                    player.value.gameProgress.tax.times = Decimal.add(player.value.gameProgress.tax.times, 1);
                }

                updateAllCol(0);
            }
            break;
        default:
            throw new Error(`uhh i don't think ${layer} is resettable`)
    }

    if (resetSuccessful) {
        for (let i = 0; i < player.value.gameProgress.main.upgrades.length; i++) {
            player.value.gameProgress.main.upgrades[i].boughtInReset[layer] = D(0);
        }
    
        resetTotalBestArray(player.value.gameProgress.main.totals, D(0), layer);
        resetTotalBestArray(player.value.gameProgress.main.best, D(0), layer);
        resetTotalBestArray(player.value.gameProgress.main.prai.totals, Decimal.min(10, player.value.gameProgress.main.pr2.amount), layer);
        resetTotalBestArray(player.value.gameProgress.main.prai.best, Decimal.min(10, player.value.gameProgress.main.pr2.amount), layer);
        resetTotalBestArray(player.value.gameProgress.main.pr2.best, D(0), layer)
        resetTotalBestArray(player.value.gameProgress.kua.kpower.best, D(0), layer)
        resetTotalBestArray(player.value.gameProgress.kua.kpower.totals, D(0), layer)
        resetTotalBestArray(player.value.gameProgress.kua.kshards.best, D(0), layer)
        resetTotalBestArray(player.value.gameProgress.kua.kshards.totals, D(0), layer)
        resetTotalBestArray(player.value.gameProgress.kua.best, D(0), layer)
        resetTotalBestArray(player.value.gameProgress.kua.totals, D(0), layer)
    
        reset(layer - 1, true);
    }
}

function calcPPS(): Decimal {
    let pps = D(1);
    pps = pps.mul(tmp.value.main.upgrades[0].effect);
    pps = pps.mul(ACHIEVEMENT_DATA[0].eff)
    pps = pps.mul(tmp.value.main.upgrades[3].effect);
    pps = pps.mul(tmp.value.main.prai.effActive ? tmp.value.main.prai.effect : 1);
    pps = pps.mul(tmp.value.main.pr2.effActive ? tmp.value.main.pr2.effect : 1);
    if (ifAchievement(0, 3)) {
        pps = pps.mul(1.2);
    }
    if (ifAchievement(1, 0)) {
        pps = pps.mul(2);
    }
    if (ifAchievement(1, 1)) {
        pps = pps.mul(getAchievementEffect(1, 1));
    }
    if (ifAchievement(1, 3)) {
        pps = pps.mul(getAchievementEffect(1, 3));
    }
    if (ifAchievement(1, 13)) {
        pps = pps.mul(getAchievementEffect(1, 13));
    }
    if (getKuaUpgrade("p", 3)) {
        pps = pps.pow(tmp.value.kua.effects.ptPower);
    } 
    if (getKuaUpgrade("s", 7)) {
        pps = pps.mul(tmp.value.kua.effects.pts);
    } 

    pps = pps.mul(getColResEffect(0));
    pps = pps.mul(tmp.value.tax.ptsEff);
    pps = pps.mul(tmp.value.kua.effects.kpowerPassive)
    if (player.value.gameProgress.col.inAChallenge) {
        pps = pps.pow(ACHIEVEMENT_DATA[2].eff.mul(Decimal.pow(0.25, Decimal.div(player.value.gameProgress.col.time, player.value.gameProgress.col.maxTime))).add(1));
    }

    return pps;
}

export const getEndgame = () => {
    return D(0);
}

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

        const gameDelta = Decimal.mul(gameVars.value.delta, tmp.value.gameTimeSpeed).mul(player.value.setTimeSpeed);
        player.value.gameTime = Decimal.add(player.value.gameTime, gameDelta);
        player.value.totalRealTime += gameVars.value.delta;

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
            scal: getSCSLAttribute('points', false)
        }
        data.oldPts = Decimal.max(player.value.gameProgress.main.points, data.scal[0].start);

        setSCSLEffectDisp('points', false, 0, `/${format(1, 2)}`);
        if (Decimal.add(player.value.gameProgress.main.points, generate).gte(data.scal[0].start)) {
            data.newPts = 
                scale(
                    scale(
                        data.oldPts.log10(), 0.2, true, data.scal[0].start.log10(), data.scal[0].power, data.scal[0].basePow
                    )
                    .pow10().add(generate).log10(), 0.2, false, data.scal[0].start.log10(), data.scal[0].power, data.scal[0].basePow
                )
                .pow10()

            generate = data.newPts.sub(data.oldPts).max(data.scal[0].start);
            tmp.value.main.pps = generate.div(gameDelta);
            setSCSLEffectDisp('points', false, 0, `/${format(Decimal.div(data.oldGen, generate), 2)}`);
        }

        player.value.gameProgress.main.points = Decimal.add(player.value.gameProgress.main.points, generate);

        updateAllTotal(player.value.gameProgress.main.totals, generate);
        player.value.gameProgress.main.totalEver = Decimal.add(player.value.gameProgress.main.totalEver, generate);
        updateAllBest(player.value.gameProgress.main.best, player.value.gameProgress.main.points);
        player.value.gameProgress.main.bestEver = Decimal.max(player.value.gameProgress.main.bestEver, player.value.gameProgress.main.points);

        player.value.gameProgress.unlocks.pr2 = player.value.gameProgress.unlocks.pr2 || Decimal.gte(player.value.gameProgress.main.prai.amount, 9.5);
        player.value.gameProgress.unlocks.kua = player.value.gameProgress.unlocks.kua || Decimal.gte(player.value.gameProgress.main.pr2.amount, 10);
        player.value.gameProgress.unlocks.kuaEnhancers = player.value.gameProgress.unlocks.kuaEnhancers || Decimal.gte(player.value.gameProgress.kua.amount, 0.0095);
        player.value.gameProgress.unlocks.col = player.value.gameProgress.unlocks.col || (player.value.gameProgress.kua.kpower.upgrades >= 2 && Decimal.gte(player.value.gameProgress.kua.amount, 100));
        player.value.gameProgress.unlocks.tax = player.value.gameProgress.unlocks.tax || Decimal.gte(player.value.gameProgress.main.points, Number.MAX_VALUE);

        for (let i = 0; i < ACHIEVEMENT_DATA.length; i++) {
            for (let j = 0; j < ACHIEVEMENT_DATA[i].list.length; j++) {
                if (ACHIEVEMENT_DATA[i].list[j].autoComplete === false) {
                    continue;
                }
                setAchievement(i, j, ACHIEVEMENT_DATA[i].list[j].cond);
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
        alert(`The game has crashed! Check the console to see the error(s) to report it to @TearonQ or @qnoraeT. \n\nYou can still export your save normally by going into Options -> Saving -> Save List -> Export Save or Export Save List to Clipboard. \nIf you see any NaNs, you might have a clue!`)
        console.error(`The game has crashed! Here is the error(s) to report it to @TearonQ or @qnoraeT. \n\nYou can still export your save normally by going into Options -> Saving -> Save List -> Export Save or Export Save List to Clipboard. \nIf you see any NaNs, you might have a clue!`);
        console.error(e);
        console.error(`(Game)   Save List Data:`)
        console.error(game.value)
        console.error(`(Player) Save File Data:`)
        console.error(player.value)
        console.error(`Temporary Variables:`)
        console.error(tmp.value)
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
}

export const updateAllTotal = (totalArray: Array<DecimalSource | null>, add: DecimalSource) => {
    for (let i = 0; i < totalArray.length; i++) {
        if (totalArray[i] !== null) {
            totalArray[i] = Decimal.add(totalArray[i]!, add);
        }
    }
}

export let shiftDown = false;
export let ctrlDown = false;

document.onkeydown = function (e) {
    shiftDown = e.shiftKey;
    ctrlDown = e.ctrlKey;
}

document.onkeyup = function (e) {
    shiftDown = e.shiftKey;
    ctrlDown = e.ctrlKey;
}

declare global {
    interface Window {
        player: typeof player;
        game: typeof game;
        tmp: typeof tmp;
        Decimal: typeof Decimal;
    }
}

window.player = player;
window.game = game;
window.tmp = tmp;
window.Decimal = Decimal;

createApp(App).mount('#app');