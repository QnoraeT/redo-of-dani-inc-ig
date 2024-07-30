import './assets/main.css'
import Decimal, { type DecimalSource } from 'break_eternity.js'
import { format, formatTime, formatPerc } from './format'
import { c } from './calc'
import { saveID, saveTheFrickingGame } from './save'
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

const TABS_LIST = [
    {
        name: "Generators",
        staticName: "gen" ,
        backgroundColor: "#999999",
        textColor: "#000000",
        outlineColor: "#00000000",
        highlightColor: "#FFFFFF",
        if: true
    },
    {
        name: "Options" ,
        staticName: "opt" ,
        backgroundColor: "#999999",
        textColor: "#000000",
        outlineColor: "#00000000",
        highlightColor: "#FFFFFF",
        if: true
    },
    {
        name: "Stats",
        staticName: "stat",
        backgroundColor: "#999999",
        textColor: "#000000",
        outlineColor: "#00000000",
        highlightColor: "#FFFFFF",
        if: true
    },
    {
        name: "Achievements",
        staticName: "ach",
        backgroundColor: "#999999",
        textColor: "#000000",
        outlineColor: "#00000000",
        highlightColor: "#FFFFFF",
        if: true
    },
    // {
    //     name: "Kuaraniai",
    //     staticName: "kua",
    //     backgroundColor: "#3100ff",
    //     textColor: "#ffffff",
    //     outlineColor: "#7958ff",
    //     highlightColor: "#ff81cb",
    //     get if() { return player.kua.unlocked }
    // },
    // {
    //     name: "Colosseum",
    //     staticName: "col",
    //     backgroundColor: "#af1a00",
    //     textColor: "#ffffff",
    //     outlineColor: "#ff3600",
    //     highlightColor: "#ff9b7f",
    //     get if() { return player.col.unlocked }
    // },
    // {
    //     name: "Taxation",
    //     staticName: "tax",
    //     backgroundColor: "#b07500",
    //     textColor: "#ffffff",
    //     outlineColor: "#d5c000",
    //     highlightColor: "#ffff7f",
    //     get if() { return Decimal.gte(player.totalPoints, c.inf) }
    // },
]

// const NEXT_UNLOCKS = {
//     pr2: {
//         get shown() { return Decimal.gte(player.generators.prai.best, c.d3); },
//         get done() { return Decimal.gte(player.generators.prai.best, c.d9_5); },
//         get dispPart1() { return `${format(player.generators.prai.best)} / ${format(c.d10)}`; },
//         dispPart2: `PRai to unlock the next layer.`,
//         color: "#ffffff",
//     },
//     kua: {
//         get shown() { return Decimal.gte(player.generators.pr2.best, c.d3); },
//         get done() { return player.kua.unlocked; },
//         get dispPart1() { return `${format(player.generators.pr2.best)} / ${format(c.d10)}`; },
//         dispPart2: `PR2 to unlock the next layer.`,
//         color: "#7958ff"
//     },
//     col: {
//         get shown() { return player.kua.kpower.upgrades >= 2; },
//         get done() { return player.col.unlocked; },
//         get dispPart1() { return `${format(player.kua.amount, 3)} / ${format(c.e2)}`; },
//         dispPart2: `Kuaraniai to unlock the next layer.`,
//         color: "#ff6000"
//     },
//     tax: {
//         get shown() { return Decimal.gte(player.points, c.e250); },
//         get done() { return player.tax.unlocked; },
//         get dispPart1() { return `${format(player.points)} / ${format(c.inf)}`; },
//         dispPart2: `Points to unlock the next layer.`,
//         color: "#f0d000"
//     },
// }

// function getEndgame(x = player.points) {
//     return Decimal.max(x, 0).add(1).log10().div(400).root(1.75).min(1).mul(100);
// }

// const STAGES = [
//     {
//         name: "Main Tab",
//         show: true,
//         get progress() { return Decimal.log(tmp.effectivePrai, c.e10).min(Decimal.max(player.points, c.d1).log(4.6e43)); },
//         get colors() { 
//             return {
//                 border: "#c4c4c4",
//                 name: "#505050",
//                 progress: "#707070",
//                 progressBarBase: "#464646",
//                 progressBarFill: "#cccccc"
//             } 
//         },
//         get list() {
//             const arr = [];
//             arr.push(`Total Points: ${format(player.totalPoints, 2)}\n`);
//             arr.push("<--- Upgrades --- >");
//             for (let i = 0; i < BASIC_UPGS.length; i++) {
//                 if (BASIC_UPGS[i].shown) {
//                     arr.push(`Best Upgrade ${i + 1}: ${format(player.generators.upgrades[i].best)}\n`);
//                 }
//             }
//             arr.push("<--- PRai --- >");
//             arr.push(`Total Points in PRai: ${format(player.totalPointsInPRai, 2)}\n`);
//             arr.push(`Total PRai: ${format(player.generators.prai.total, 2)}\n`);
//             if (Decimal.gte(player.generators.prai.best, c.d9_5)) {
//                 arr.push(`Total PRai in PR2: ${format(player.generators.prai.totalInPR2, 2)}\n`);
//                 arr.push(`Best PRai in PR2: ${format(player.generators.prai.bestInPR2, 2)}\n`);
//             }
//             if (Decimal.gte(player.generators.pr2.best, c.d10)) {
//                 arr.push(`Effective PRai in Kuaraniai: ${format(tmp.effectivePrai, 2)}\n`);
//             }
//             arr.push(`PRai resets: ${format(player.generators.prai.times)}\n`);
//             arr.push(`Time in PRai reset: ${formatTime(player.generators.prai.timeInPRai, 2)}\n`);
//             if (Decimal.gte(player.generators.prai.best, c.d9_5)) {
//                 arr.push("<--- PR2 --- >")
//                 arr.push(`PR2 resets: ${format(player.generators.pr2.amount)}\n`);
//                 arr.push(`Best PR2: ${format(player.generators.pr2.best)}\n`);
//             }
//             return arr;
//         }
//     },
//     {
//         name: "Kuaraniai",
//         get show() { return player.kua.unlocked; },
//         get progress() { return Decimal.add(player.kua.amount, tmp.kuaPending).max(c.em4).mul(c.e4).log(c.e6) },
//         get colors() { 
//             return {
//                 border: "#ab00df",
//                 name: "#220058",
//                 progress: "#3f0069",
//                 progressBarBase: "#360063",
//                 progressBarFill: "#9727ff"
//             } 
//         },
//         get list() {
//             const arr = [];
//             arr.push(`Effective PRai in Kuaraniai: ${format(tmp.effectivePrai, 2)}\n`);
//             arr.push(`Total Kuaraniai: ${format(player.kua.total, 4)}`);
//             arr.push(`Best Kuaraniai: ${format(player.kua.best, 4)}`);
//             arr.push(`Kuaraniai resets: ${format(player.kua.times)}`);
//             arr.push(`Time in Kua reset: ${formatTime(player.kua.timeInKua, 2)}`);
//             arr.push("<--- Kuaraniai Shards --- >");
//             arr.push(`Total KShards: ${format(player.kua.kshards.total, 3)}`);
//             arr.push(`Best KShards: ${format(player.kua.kshards.best, 3)}`);
//             arr.push(`KShard Upgrades: ${player.kua.kshards.upgrades}`);
//             arr.push("<--- Kuaraniai Power --- >");
//             arr.push(`Total KPower: ${format(player.kua.kpower.total, 3)}`);
//             arr.push(`Best KPower: ${format(player.kua.kpower.best, 3)}`);
//             arr.push(`KShard Upgrades: ${player.kua.kpower.upgrades}`);
//             return arr;
//         }
//     },
//     {
//         name: "Colosseum",
//         get show() { return player.col.unlocked; },
//         get progress() { return timesCompleted("nk") ? c.d1 : (inChallenge("nk") ? COL_CHALLENGES.nk.progress : c.d0); },
//         get colors() { 
//             return {
//                 border: "#ff4000",
//                 name: "#661f00",
//                 progress: "#882300",
//                 progressBarBase: "#742500",
//                 progressBarFill: "#ff5822"
//             } 
//         },
//         get list() {
//             const arr = [];
//             arr.push(`Total Colosseum Power: ${format(player.col.totalPower, 4)}`);
//             arr.push(`Best Colosseum Power: ${format(player.col.bestPower, 4)}`);
//             arr.push(`Total Challenge Completions: ${format(Decimal.add(timesCompleted("nk"), 0))}`);
//             return arr;
//         }
//     },
//     {
//         name: "Taxation",
//         get show() { return player.tax.unlocked; },
//         get progress() { return Decimal.add(tmp.taxPending, player.tax.taxed).div(20); },
//         get colors() { 
//             return {
//                 border: "#c7b500",
//                 name: "#5a4700",
//                 progress: "#705f00",
//                 progressBarBase: "#453c00",
//                 progressBarFill: "#ffd600"
//             } 
//         },
//         get list() {
//             const arr = [];
//             arr.push(`Total Taxed Coins: ${format(player.tax.totalTax, 3)}`);
//             arr.push(`Best Taxed Coins: ${format(player.tax.bestTax, 3)}`);
//             arr.push(`Taxation Resets: ${format(player.tax.times)}`);
//             return arr;
//         }
//     },
// ]

function reset(layer: number, override: boolean) {
    switch(layer) {
        default:
            throw new Error(`uhh i don't think ${layer} is resettable`)
    }
}

export const resetPlayer = () => {
    player = {
        lastUpdated: Date.now(),
        offlineTime: 0,

        chapter: 0,
        achievements: [],

        pps: c.d1,
        points: c.d0,
        totalPoints: c.d0,
        totalPointsInPRai: c.d0,
        bestPointsInCol: c.d0,
        totalPointsInTax: c.d0,

        inChallenge: {}, 

        totalTime: 0, // timespeed doesn't affect this
        gameTime: c.d0, // timespeed will affect this (totalGameTime)
        timeSpeed: c.d1,
        setTimeSpeed: c.d1, // change this if you think the game is going too fast or slow, i won't judge you =P

        displayVersion: "1.0.0",
        version: 0,

        settings: {
            notation: 0,
            scalingNames: 0,
            autoSaveInterval: 30000,
        }
    }
}

function calcPointsPerSecond() {
    return c.d1
    // let i = c.d1;

    // return i;
}

const otherGameStuffIg = {
    FPS: 0,
    displayedFPS: "",
    sessionTime: 0,
    delta: 0,
    gameDelta: new Decimal(0),
    runGame: false
}

function switchTab(isTab: boolean, whatTab: number, index: number) {
    if (isTab) {
        currentTab = whatTab;
    } else {
        tab[currentTab][index] = whatTab;
    }
}

let currentTab = 0
const tab = [
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0],
    [0]
]

interface Game {
    currentSave: number
    list: Array<{name: string, mode: Array<number>, player: Player}>
}

interface Player {
    lastUpdated: number,
    offlineTime: number,

    chapter: number,
    achievements: Array<number>,

    pps: DecimalSource,
    points: DecimalSource,
    totalPoints: DecimalSource,
    totalPointsInPRai: DecimalSource,
    bestPointsInCol: DecimalSource,
    totalPointsInTax: DecimalSource,

    inChallenge: {}, 

    totalTime: number, // timespeed doesn't affect this
    gameTime: DecimalSource, // timespeed will affect this (totalGameTime)
    timeSpeed: DecimalSource,
    setTimeSpeed: DecimalSource, // change this if you think the game is going too fast or slow, i won't judge you =P

    displayVersion: string,
    version: number,
    settings: {
        notation: number,
        scalingNames: number,
        autoSaveInterval: number,
    }
}

interface Temp {
    runGame: boolean
    // how 2 generalize
    scaleSoftcapNames: { 
        points: string,
        upg1: string, 
        upg2: string, 
        upg3: string, 
        upg4: string, 
        upg5: string, 
        upg6: string, 
        praiGain: string, 
        praiEffect: string, 
        pr2: string
    };
    saveModesSelected: Array<boolean>
    saveModes: Array<boolean>
}

let fpsList: Array<number> = [];
export let game: Game
export let player: Player
export let tmp: Temp
let lastFPSCheck = 0;
let lastSave = 0;
let oldTimeStamp = 0;
setInterval(gameAlive, 1000);

function gameAlive() {
    if (!tmp.runGame) {
        tmp.runGame = true;
        loadGame();
    }
}

function loadGame() {
    lastFPSCheck = 0;
    if (localStorage.getItem(saveID) === null || localStorage.getItem(saveID) === "null") {
        resetPlayer();
        game = {
            currentSave: 0,
            list: [
                {
                    name: "Save #1",
                    mode: [],
                    player: player
                }
            ]
        };
        console.log("reset");
    } else {
        game = JSON.parse(atob(localStorage.getItem(saveID)!)); 
        player = game.list[game.currentSave].player;
        // updatePlayerData(player);
    }

    // init tmp
    tmp.scaleSoftcapNames = { points: "Points", upg1: "Upgrade 1", upg2: "Upgrade 2", upg3: "Upgrade 3", upg4: "Upgrade 4", upg5: "Upgrade 5", upg6: "Upgrade 6", praiGain: "PRai Gain", praiEffect: "PRai Effect", pr2: "PR2" };
    // fixAchievements();
    tmp.runGame = true;
    tmp.saveModesSelected = Array(6).fill(false);

    player.offlineTime += Math.max(0, Date.now() - player.lastUpdated);
    window.requestAnimationFrame(gameLoop);
    function gameLoop(timeStamp: number) {
        if (!tmp.runGame) {
            return;
        }

        try {
            let generate;
            otherGameStuffIg.delta = (timeStamp - oldTimeStamp) / 1000;
            if (otherGameStuffIg.delta > 0) {
                fpsList.push(otherGameStuffIg.delta);
                if (timeStamp > lastFPSCheck) {
                    lastFPSCheck = timeStamp + 500;
                    otherGameStuffIg.FPS = 0;
                    for (let i = 0; i < fpsList.length; ++i) {
                        otherGameStuffIg.FPS += fpsList[i];
                    }
                    otherGameStuffIg.displayedFPS = (fpsList.length / otherGameStuffIg.FPS).toFixed(1);
                    fpsList = [];
                }

                const gameDelta = Decimal.mul(otherGameStuffIg.delta, player.timeSpeed).mul(player.setTimeSpeed);
                player.gameTime = Decimal.add(player.gameTime, gameDelta);
                player.totalTime += otherGameStuffIg.delta;
                otherGameStuffIg.sessionTime += otherGameStuffIg.delta;


                player.lastUpdated = Date.now();

                // updateNerf();
                // updateAllTax(gameDelta);
                // updateAllCol(gameDelta);
                // updateAllKua(gameDelta);
                // updateAllStart(gameDelta);

                // updateSoftcap("points")
                player.pps = calcPointsPerSecond();
                generate = Decimal.mul(player.pps, gameDelta);

                // i hate that i have to do it here, skipping issues at ~e200,000 (1,000,000x timespeed)
                // tmp.softcap.points[0].red = `/${format(c.d1, 2)}`;
                // if (Decimal.add(player.points, generate).gte(tmp.softcap.points[0].start.pow10())) {
                //     let oldGen = generate;
                //     let oldPts = Decimal.max(player.points, tmp.softcap.points[0].start.pow10());
                //     let newPts = 
                //         scale(
                //             scale(
                //                 oldPts.log10(), 0.2, true, tmp.softcap.points[0].start, tmp.softcap.points[0].strength, c.d0_75
                //             )
                //             .pow10().add(generate).log10(), 0.2, false, tmp.softcap.points[0].start, tmp.softcap.points[0].strength, c.d0_75
                //         )
                //         .pow10()

                //     generate = newPts.sub(oldPts).max(tmp.softcap.points[0].start.pow10());
                //     player.pps = generate.div(gameDelta);
                //     tmp.softcap.points[0].red = `/${format(Decimal.div(oldGen, generate), 2)}`
                // }
                
                player.points = Decimal.add(player.points, generate);
                player.totalPointsInPRai = Decimal.add(player.totalPointsInPRai, generate);
                player.totalPoints = Decimal.add(player.totalPoints, generate);
                player.totalPointsInTax = Decimal.add(player.totalPointsInTax, generate);
                player.bestPointsInCol = Decimal.max(player.bestPointsInCol, player.points);

                // setAchievement(17, Decimal.gte(player.points, c.e24) && Decimal.eq(player.generators.upgrades[0].bought, c.d0) && Decimal.eq(player.generators.upgrades[1].bought, c.d0) && Decimal.eq(player.generators.upgrades[2].bought, c.d0) && Decimal.gte(player.generators.prai.timeInPRai, c.d1));
                // setAchievement(22, Decimal.gte(player.points, c.e80) && Decimal.eq(player.generators.upgrades[0].bought, c.d0) && Decimal.eq(player.generators.upgrades[1].bought, c.d0) && Decimal.eq(player.generators.upgrades[2].bought, c.d0) && Decimal.gte(player.generators.prai.timeInPRai, c.d1));
                // setAchievement(24, Decimal.gte(player.points, c.e33) && Decimal.eq(player.generators.upgrades[0].bought, c.d0) && Decimal.eq(player.generators.upgrades[1].bought, c.d0));
                // setAchievement(25, Decimal.gte(player.points, c.e260) && Decimal.gte(player.kua.timeInKua, c.d1) && Decimal.lt(player.kua.timeInKua, c.d5));

                // if (Decimal.gte(player.generators.pr2.best, c.d10)) {
                //     player.kua.unlocked = true;
                // }

                // if (player.kua.kpower.upgrades >= 2 && Decimal.gte(player.kua.amount, c.e2)) {
                //     player.col.unlocked = true;
                // }

                // if (Decimal.gte(player.points, c.inf)) {
                //     player.tax.unlocked = true;
                // }

                if (timeStamp > lastSave + player.settings.autoSaveInterval) {
                    console.log(saveTheFrickingGame());
                    lastSave = timeStamp;
                }

                // misc unimportant stuff
                // for (let i in tmp.scaling) {
                //     for (let j in tmp.scaling[i]) {
                //         if (Decimal.gte(tmp.scaling[i][j].res, tmp.scaling[i][j].start)) {
                //             tmp.scaleList[j].push(`${tmp.scaleSoftcapNames[i]} - ${format(tmp.scaling[i][j].strength.mul(c.e2), 3)}% starting at ${format(tmp.scaling[i][j].start, 3)}`);
                //         }
                //     }
                // }
                
                // for (let i in tmp.softcap) {
                //     for (let j in tmp.softcap[i]) {
                //         if (Decimal.gte(tmp.softcap[i][j].res, tmp.softcap[i][j].start)) {
                //             tmp.softList[j].push(`${tmp.scaleSoftcapNames[i]} - ${format(tmp.softcap[i][j].strength.mul(c.e2), 3)}% starting at ${format(tmp.softcap[i][j].start, 3)} (${tmp.softcap[i][j].red})`);
                //         }
                //     }
                // }

                // drawing();
            }
        } catch (e) {
            console.error(e);
            console.log("Game saving has been paused. It's likely that your save is broken or the programmer (TearonQ) is an idiot? Don't call them that, though.");
            return;
        }

        // // TODO: make this garbage better, hacky workaround for Vue trying to draw to the DOM before tmp gets loaded, didn't happen before when tab was an Array and not an Object for who knows what, this is stupid, but we'll (i'll) have to deal with it i guess 
        // if (!vueLoaded) {
        //     loadVue();
        //     vueLoaded = true;
        // }

        // do not change order at all
        oldTimeStamp = timeStamp;
        window.requestAnimationFrame(gameLoop);
    }

    // const draw = document.querySelector("#canvas")! as HTMLCanvasElement;
    // const pen = draw.getContext("2d");
    // const particles = [];
    // const stats = {
    //     norm: 0
    // }
    // const drawing = () => {
    //     draw.width = window.innerWidth;
    //     draw.height = window.innerHeight;

    //     stats.norm += otherGameStuffIg.delta;
    //     if (stats.norm >= 0.1) {
    //         if (stats.norm >= 10) {
    //             stats.norm = 0.1;
    //         }

    //         for (let atmps = 0; atmps < 10 && stats.norm >= 0.1; atmps++) {
    //             stats.norm -= 0.1;

    //             let obj = {
    //                 type: 0, 
    //                 dir: (Math.round(Math.random()) - 0.5) * 2,
    //                 y: Math.random() * 60,
    //                 maxLife: 2.0 + 1.5 * Math.random(),
    //                 size: 12 + 8 * Math.random(),
    //                 defGhost: 32 + 32 * Math.random()
    //             }

    //             obj.life = obj.maxLife;
    //             obj.x = obj.dir === 1 ? -100 : (draw.width + 100);
        
    //             particles.push(obj);
    //         }
    //     }

        // for (let i = 0; i < particles.length; i++) {
        //     switch (particles[i].type) {
        //         case 0:
        //             particles[i].life -= otherGameStuffIg.delta
        //             if (particles[i].life <= 0) {
        //                 particles.splice(i, 1);
        //                 i--;
        //                 break;
        //             }
        //             particles[i].x += otherGameStuffIg.delta * (particles[i].dir * (particles[i].life + 1)) * ((1 + 2 * Math.random()) / 3) * 100;
        //             particles[i].y += otherGameStuffIg.delta * (4 * (Math.random() - 0.5));
        //             particles[i].y = lerp(1 - (0.75 ** otherGameStuffIg.delta), particles[i].y, 30);

        //             pen.beginPath();
        //             let alpha = particles[i].defGhost * particles[i].life / particles[i].maxLife;
        //             pen.fillStyle = `hsla(0, 100%, 100%, ${alpha / 255})`;

        //             pen.arc(particles[i].x,
        //                 particles[i].y,
        //                 particles[i].size,
        //                 0,
        //                 2 * Math.PI);
        //             pen.fill();
        //             break;
        //         default:
        //             throw new Error(`Particle type ${particles[i].type} is not a valid type :c`);
        //     }
        // }
}
