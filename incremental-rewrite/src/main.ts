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

export const NEXT_UNLOCKS = [
    {
        get shown() { return Decimal.gte(player.value.gameProgress.main.prai.best.ever, 3); },
        get done() { return Decimal.gte(player.value.gameProgress.main.prai.best.ever, 9.5); },
        get dispPart1() { return `${format(player.value.gameProgress.main.prai.best.ever)} / ${format(10)}`; },
        dispPart2: `PRai to unlock the next layer.`,
        color: "#ffffff",
    },
    {
        get shown() { return Decimal.gte(player.value.gameProgress.main.pr2.best.ever, 3); },
        get done() { return player.value.gameProgress.unlocks.kua; },
        get dispPart1() { return `${format(player.value.gameProgress.main.pr2.best.ever)} / ${format(10)}`; },
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
    // {
    //     get shown() { return Decimal.gte(player.value.points, c.e250); },
    //     get done() { return player.value.gameProgress.unlocks.tax; },
    //     get dispPart1() { return `${format(player.value.points)} / ${format(c.inf)}`; },
    //     dispPart2: `Points to unlock the next layer.`,
    //     color: "#f0d000"
    // },
]

export type LayerNames = 'prai' | 'pr2' | 'kua' | 'col' | 'tax'

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
    }

    gameProgress: {
        achievements: Array<Array<number>>
        inChallenge: Array<Challenge>
        unlocks: {
            pr2: boolean
            kua: boolean
            kuaEnhancers: boolean
            col: boolean
            tax: boolean
        }
        main: {
            points: DecimalSource
            totals: {
                prai: DecimalSource
                pr2: DecimalSource
                kua: DecimalSource
                col: DecimalSource
                tax: DecimalSource
                ever: DecimalSource
            }
            best: {
                prai: DecimalSource
                pr2: DecimalSource
                kua: DecimalSource
                col: DecimalSource
                tax: DecimalSource
                ever: DecimalSource
            }
            upgrades: Array<
                {
                    bought: DecimalSource
                    best: DecimalSource
                    auto: boolean
                }
            >
            prai: {
                totals: {
                    pr2: DecimalSource
                    kua: DecimalSource
                    col: DecimalSource
                    tax: DecimalSource
                    ever: DecimalSource
                }
                best: {
                    pr2: DecimalSource
                    kua: DecimalSource
                    col: DecimalSource
                    tax: DecimalSource
                    ever: DecimalSource
                }
                amount: DecimalSource
                timeInPRai: DecimalSource
                auto: boolean
                times: DecimalSource
            }
            pr2: {
                best: {
                    kua: DecimalSource
                    col: DecimalSource
                    tax: DecimalSource
                    ever: DecimalSource
                }
                amount: DecimalSource
                timeInPR2: DecimalSource
                auto: boolean
            }
        }
        kua: {
            auto: boolean
            amount: DecimalSource
            totals: {
                col: DecimalSource
                tax: DecimalSource
                ever: DecimalSource
            }
            best: {
                col: DecimalSource
                tax: DecimalSource
                ever: DecimalSource
            }
            timeInKua: DecimalSource
            times: DecimalSource
            kshards: {
                amount: DecimalSource
                totals: {
                    col: DecimalSource
                    tax: DecimalSource
                    ever: DecimalSource
                }
                best: {
                    col: DecimalSource
                    tax: DecimalSource
                    ever: DecimalSource
                }
                upgrades: number
            }
            kpower: {
                amount: DecimalSource
                totals: {
                    col: DecimalSource
                    tax: DecimalSource
                    ever: DecimalSource
                }
                best: {
                    col: DecimalSource
                    tax: DecimalSource
                    ever: DecimalSource
                }
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
            auto: false
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
            notation: 0
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
            inChallenge: [],
            main: {
                points: D(0),
                totals: {
                    prai: D(0),
                    pr2: D(0),
                    kua: D(0),
                    col: D(0),
                    tax: D(0),
                    ever: D(0)
                },
                best: {
                    prai: D(0),
                    pr2: D(0),
                    kua: D(0),
                    col: D(0),
                    tax: D(0),
                    ever: D(0)
                },
                upgrades: mainUpgrades,
                prai: {
                    totals: {
                        pr2: D(0),
                        kua: D(0),
                        col: D(0),
                        tax: D(0),
                        ever: D(0)
                    },
                    best: {
                        pr2: D(0),
                        kua: D(0),
                        col: D(0),
                        tax: D(0),
                        ever: D(0)
                    },
                    points: D(0),
                    amount: D(0),
                    timeInPRai: D(0),
                    auto: false,
                    times: D(0)
                },
                pr2: {
                    best: {
                        kua: D(0),
                        col: D(0),
                        tax: D(0),
                        ever: D(0)
                    },
                    points: D(0),
                    prai: D(0),
                    amount: D(0),
                    timeInPR2: D(0),
                    auto: false
                }
            },
            kua: {
                auto: false,
                amount: D(0),
                totals: {
                    col: D(0),
                    tax: D(0),
                    ever: D(0)
                },
                best: {
                    col: D(0),
                    tax: D(0),
                    ever: D(0)
                },
                timeInKua: D(0),
                times: D(0),
                kshards: {
                    amount: D(0),
                    totals: {
                        col: D(0),
                        tax: D(0),
                        ever: D(0)
                    },
                    best: {
                        col: D(0),
                        tax: D(0),
                        ever: D(0)
                    },
                    upgrades: 0
                },
                kpower: {
                    amount: D(0),
                    totals: {
                        col: D(0),
                        tax: D(0),
                        ever: D(0)
                    },
                    best: {
                        col: D(0),
                        tax: D(0),
                        ever: D(0)
                    },
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

type Challenge = {
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
        kuaShardGeneration: Decimal
        kuaPowerGeneration: Decimal
        kuaEffects: { 
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
        kuaReq: Decimal,
        kuaMul: Decimal,
        kuaExp: Decimal,
        effectivePrai: Decimal,
        kuaCanDo: boolean,
        kuaPending: Decimal,
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

setInterval(gameAlive, 1000);

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
            kuaShardGeneration: D(0),
            kuaPowerGeneration: D(0),
            kuaEffects: { 
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
            kuaReq: D(1e10),
            kuaMul: D(0.0001),
            kuaExp: D(3),
            effectivePrai: D(0),
            kuaCanDo: false,
            kuaPending: D(0),
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

        // player.displayVersion = '1.0.0'
        player.version = 0;
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

export const reset = (layer: string, override = false) => {
    switch (layer) {
        case "prai":
            if (tmp.value.main.prai.canDo || override) {
                if (!override) {
                    // setAchievement(8, tmp.value.main.prai.pending.gte(c.e3));
                    player.value.gameProgress.main.prai.amount = Decimal.add(player.value.gameProgress.main.prai.amount, tmp.value.main.prai.pending);
                    for (const i in player.value.gameProgress.main.prai.totals) {
                        player.value.gameProgress.main.prai.totals[i as 'pr2' | 'kua' | 'col' | 'tax' | 'ever'] = Decimal.add(player.value.gameProgress.main.prai.totals[i as 'pr2' | 'kua' | 'col' | 'tax' | 'ever'], tmp.value.main.prai.pending);
                    }
                    player.value.gameProgress.main.prai.times = Decimal.add(player.value.gameProgress.main.prai.times, 1);
                }

                setAchievement(0, 8, ACHIEVEMENT_DATA[0].list[8].cond);

                for (let i = 0; i < 2; i++) {
                    player.value.gameProgress.main.prai.timeInPRai = D(0);
                    player.value.gameProgress.main.upgrades[0].bought = D(0);
                    player.value.gameProgress.main.upgrades[1].bought = D(0);
                    player.value.gameProgress.main.upgrades[2].bought = D(0);
                    updateStart(0, 0);
                    updateStart(-3, 0);
                    updateStart(-2, 0);
                    updateStart(-1, 0);
                    player.value.gameProgress.main.points = D(0);
                    player.value.gameProgress.main.totals.prai = D(0);
                    player.value.gameProgress.main.best.prai = D(0);
                }
            }
            break;
        case "pr2":
            if (tmp.value.main.pr2.canDo || override) {
                if (!override) {
                    player.value.gameProgress.main.pr2.amount = Decimal.add(player.value.gameProgress.main.pr2.amount, 1);
                }

                player.value.gameProgress.main.totals.pr2 = D(0);
                player.value.gameProgress.main.best.pr2 = D(0);
                player.value.gameProgress.main.prai.amount = Decimal.min(10, player.value.gameProgress.main.pr2.amount);
                player.value.gameProgress.main.prai.totals.pr2 = Decimal.min(10, player.value.gameProgress.main.pr2.amount);
                player.value.gameProgress.main.prai.best.pr2 = Decimal.min(10, player.value.gameProgress.main.pr2.amount);
                updateStart(1, 0);
                reset("prai", true);
            }
            break;
            case "kua":
            if (tmp.value.kua.kuaCanDo || override) {
                if (!override) {
                    setAchievement(1, 8, ACHIEVEMENT_DATA[1].list[8].cond);
                    player.value.gameProgress.kua.amount = Decimal.add(player.value.gameProgress.kua.amount, tmp.value.kua.kuaPending);
                    for (const i in player.value.gameProgress.kua.totals) {
                        player.value.gameProgress.kua.totals[i as 'col' | 'tax' | 'ever'] = Decimal.add(player.value.gameProgress.kua.totals[i as 'col' | 'tax' | 'ever'], tmp.value.kua.kuaPending);
                    }
                    player.value.gameProgress.kua.times = Decimal.add(player.value.gameProgress.kua.times, 1);
                }

                player.value.gameProgress.main.totals.kua = D(0);
                player.value.gameProgress.main.best.kua = D(0);
                player.value.gameProgress.main.prai.best.kua = D(0);
                player.value.gameProgress.main.prai.totals.kua = D(0);
                player.value.gameProgress.main.prai.times = D(0);
                player.value.gameProgress.main.prai.amount = D(0);
                player.value.gameProgress.kua.timeInKua = D(0);
                updateAllKua("kua")
                reset("pr2", true);
            }
            break;
        default:
            throw new Error(`uhh i don't think ${layer} is resettable`)
    }
}

function calcPPS(): Decimal {
    let pps = D(1);
    pps = pps.mul(tmp.value.main.upgrades[0].effect);
    pps = pps.mul(ACHIEVEMENT_DATA[0].eff)
    pps = pps.mul(tmp.value.main.upgrades[3].effect);
    pps = pps.mul(tmp.value.main.prai.effActive ? tmp.value.main.prai.effect : 1);
    pps = pps.mul(tmp.value.main.pr2.effActive ? tmp.value.main.pr2.effect : 1);
    if (ifAchievement(0, 4)) {
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
        pps = pps.pow(tmp.value.kua.kuaEffects.ptPower);
    } 
    if (getKuaUpgrade("s", 7)) {
        pps = pps.mul(tmp.value.kua.kuaEffects.pts);
    } 

    // pps = pps.mul(getColResEffect(0));
    // pps = pps.mul(tmp.value.taxPtsEff);
    pps = pps.mul(tmp.value.kua.kuaEffects.kpowerPassive)
    return pps;
}

export const getEndgame = (x = player.value.gameProgress.main.points) => {
    return Decimal.max(x, 0).add(1).log10().div(400).root(1.75).min(1).mul(100);
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
        for (const i in player.value.gameProgress.main.totals) {
            player.value.gameProgress.main.totals[i as LayerNames] = Decimal.add(player.value.gameProgress.main.totals[i as LayerNames], generate);
        }
        for (const i in player.value.gameProgress.main.best) {
            player.value.gameProgress.main.best[i as LayerNames] = Decimal.max(player.value.gameProgress.main.best[i as LayerNames], player.value.gameProgress.main.points);
        }

        player.value.gameProgress.unlocks.pr2 = player.value.gameProgress.unlocks.pr2 || Decimal.gte(player.value.gameProgress.main.prai.amount, 9.5);
        player.value.gameProgress.unlocks.kua = player.value.gameProgress.unlocks.kua || Decimal.gte(player.value.gameProgress.main.pr2.amount, 10);
        player.value.gameProgress.unlocks.kuaEnhancers = player.value.gameProgress.unlocks.kuaEnhancers || Decimal.gte(player.value.gameProgress.kua.amount, 0.0095);
        player.value.gameProgress.unlocks.col = player.value.gameProgress.unlocks.col || (player.value.gameProgress.kua.kpower.upgrades >= 2 && Decimal.gte(player.value.gameProgress.kua.amount, 1e2));

        for (let i = 0; i < ACHIEVEMENT_DATA.length; i++) {
            for (let j = 0; j < ACHIEVEMENT_DATA[i].list.length; j++) {
                if (ACHIEVEMENT_DATA[i].list[j].autoComplete === false) {
                    continue;
                }
                setAchievement(i, j, ACHIEVEMENT_DATA[i].list[j].cond);
            }
        }

        compileScalSoftList();

        if (gameVars.value.sessionTime > gameVars.value.lastSave + game.value.autoSaveInterval) {
            saveTheFrickingGame();
            gameVars.value.lastSave = gameVars.value.sessionTime;
        }

        // drawing();
    } catch (e) {
        console.error(`Game:`)
        console.error(game.value)
        console.error(`Player:`)
        console.error(player.value)
        console.error(`Temp:`)
        console.error(tmp.value)
        console.error(`Rip error`);
        console.error(e);
        return;
    }

    window.requestAnimationFrame(gameLoop);
}

export let shiftDown = false
export let ctrlDown = false

document.onkeydown = function (e) {
    shiftDown = e.shiftKey
    ctrlDown = e.ctrlKey
}

document.onkeyup = function (e) {
    shiftDown = e.shiftKey
    ctrlDown = e.ctrlKey
}

createApp(App).mount('#app')