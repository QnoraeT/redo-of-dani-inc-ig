import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import Decimal, { type DecimalSource } from 'break_eternity.js'
import { D } from './calc'
import { format } from './format'
import { saveID, SAVE_MODES, saveTheFrickingGame } from './saving'

interface Game {
    currentSave: number
    list: Array<{
        name: string
        modes: Array<number>
        data: Player
    }>
}

interface Player {
    lastUpdated: number
    offlineTime: number
    totalRealTime: number
    gameTime: DecimalSource
    setTimeSpeed: DecimalSource
    version: number
    settings: {
        autoSaveInterval: number
    }

    gameProgress: {
        achievements: Array<number>
        inChallenge: Array<Challenge>
        main: {
            points: DecimalSource
            upgrades: Array<
                {
                    bought: DecimalSource
                    best: DecimalSource
                }
            >
        }
    }
}

export const initGameBeforeSave = (): Game => {
    const data: Player = initPlayer()

    return {
        currentSave: 0,
        list: [
            {
                name: "Save #1",
                modes: [],
                data: data
            }
        ]
    };
}

export const initPlayer = (set = false): Player => {
    const data = {
        lastUpdated: Date.now(),
        offlineTime: 0,
        totalRealTime: 0,
        gameTime: D(0),
        setTimeSpeed: D(1),
        version: 0,
        settings: {
            autoSaveInterval: 5000
        },
    
        gameProgress: {
            achievements: [],
            inChallenge: [],
            main: {
                points: D(0),
                upgrades: []
            }
        }
    }
    if (set) { player = data; }
    return data;
}

export const setPlayerFromSave = (save: string, id: number) => {
    const procSave = JSON.parse(atob(save));
    game.list[id] = procSave;
    if (game.currentSave === id) {
        player = procSave.data;
    }
    updatePlayerData(player);
}

export const setGameFromSave = (save: string) => {
    const procSave = JSON.parse(atob(save));
    game = procSave;
    player = game.list[game.currentSave].data;
    updatePlayerData(player);
}

interface Challenge {
    name: string
    goalDesc: string
    entered: boolean
    trapped: boolean
    overall: boolean
    depths: DecimalSource
}

interface Tmp {
    gameTimeSpeed: Decimal
    main: {
        pps: Decimal
    }
    gameIsRunning: boolean
    saveModes: Array<boolean>
}

interface GameVars {
    lastFPSCheck: number
    fpsList: Array<number>
    lastSave: number
    sessionTime: number
    fps: number
    displayedFPS: string
}

export const tmp: Tmp = initTemp()
const tab = {
    currentTab: 0,
    tabList: []
}
export let game: Game = initGameBeforeSave()
export let player: Player = game.list[game.currentSave].data

const gameVars: GameVars = {
    lastFPSCheck: 0,
    fpsList: [],
    lastSave: 0,
    sessionTime: 0,
    fps: 0,
    displayedFPS: '0.0'
}

setInterval(gameAlive, 1000);

function initTemp(): Tmp {
    return {
        gameTimeSpeed: D(1),
        main: {
            pps: D(0),
        },
        gameIsRunning: true,
        saveModes: Array(SAVE_MODES.length).fill(false)
    }
}

function gameAlive() {
    if (!tmp.gameIsRunning) {
        tmp.gameIsRunning = true;
        loadGame();
    }
}

window.onload = function() {
    loadGame();
};

function loadGame() {
    gameVars.lastFPSCheck = 0;
    if (localStorage.getItem(saveID) !== null && localStorage.getItem(saveID) !== "null") {
        try {
            game = JSON.parse(atob(localStorage.getItem(saveID)!)); 
            player = updatePlayerData(game.list[game.currentSave].data);
        } catch (e) {
            console.error(`loading the game went wrong!`)
            console.error(e)
            console.error(localStorage.getItem(saveID)!)
        }
    }

    player.offlineTime += Math.max(0, Date.now() - player.lastUpdated);
    window.requestAnimationFrame(gameLoop);
}

export const updatePlayerData = (player: Player) => {
    player.version = player.version||-1;
    if (player.version < 0) {
        player.version = 0;
    }
    if (player.version === 0) {
        // player.displayVersion = '1.0.0'
        player.version = 1;
    }
    if (player.version === 1) {

        // player.version = 2;
    }
    if (player.version === 2) {

        // player.version = 3;
    }
    return player;
}

function calcPPS() {
    const pps = D(1);
    return pps;
}

function gameLoop() {
    if (!tmp.gameIsRunning) {
        return;
    }

    try {
        const delta = (Date.now() - player.lastUpdated) / 1000;
        let generate: Decimal = D(0)
        if (delta > 0) {
            gameVars.fpsList.push(delta);
            if (gameVars.sessionTime > gameVars.lastFPSCheck) {
                gameVars.lastFPSCheck = gameVars.sessionTime + 500;
                gameVars.fps = 0;
                for (let i = 0; i < gameVars.fpsList.length; ++i) {
                    gameVars.fps += gameVars.fpsList[i];
                }
                gameVars.displayedFPS = (gameVars.fpsList.length / gameVars.fps).toFixed(1);
                gameVars.fpsList = [];
            }
        }

        const gameDelta = Decimal.mul(delta, tmp.gameTimeSpeed).mul(player.setTimeSpeed);
        player.gameTime = Decimal.add(player.gameTime, gameDelta);
        player.totalRealTime += delta;
        gameVars.sessionTime += delta;


        tmp.main.pps = calcPPS()
        generate = Decimal.mul(tmp.main.pps, gameDelta);
        player.gameProgress.main.points = Decimal.add(player.gameProgress.main.points, generate);

        if (gameVars.sessionTime > gameVars.lastSave + player.settings.autoSaveInterval) {
            console.log(saveTheFrickingGame());
            gameVars.lastSave = gameVars.sessionTime;
        }
    } catch (e) {
        console.error(`Rip error`)
        console.error(e)
        return;
    }

    player.lastUpdated = Date.now();
    window.requestAnimationFrame(gameLoop);
}

createApp(App).mount('#app')