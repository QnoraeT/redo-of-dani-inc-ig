import Decimal from 'break_eternity.js'
import { player, tmp } from '@/main'
import { COL_CHALLENGES, inChallenge, timesCompleted } from '../Game_Progress/Game_Colosseum/Game_Colosseum';
import { D } from '@/calc';

// TODO: remove list()
export const STAGES = [
    {
        id: 0,
        name: "Main Tab",
        show: true,
        get progress() { return Decimal.max(player.value.gameProgress.main.points, 1).log(4.6e43); },
        get colors() { 
            return {
                border: "#c4c4c4",
                name: "#505050",
                progress: "#707070",
                progressBarBase: "#464646",
                progressBarFill: "#cccccc"
            } 
        }
    },
    {
        id: 1,
        name: "Kuaraniai",
        get show() { return player.value.gameProgress.unlocks.kua; },
        get progress() { return Decimal.add(player.value.gameProgress.kua.amount, tmp.value.kua.pending).max(0.0001).mul(1e4).log(1e6) },
        get colors() { 
            return {
                border: "#ab00df",
                name: "#220058",
                progress: "#3f0069",
                progressBarBase: "#360063",
                progressBarFill: "#9727ff"
            } 
        }
    },
    {
        id: 2,
        name: "Colosseum",
        get show() { return player.value.gameProgress.unlocks.col; },
        get progress() { return timesCompleted("nk") ? D(1) : (inChallenge("nk") ? COL_CHALLENGES.nk.progress : D(0)); },
        get colors() { 
            return {
                border: "#ff4000",
                name: "#661f00",
                progress: "#882300",
                progressBarBase: "#742500",
                progressBarFill: "#ff5822"
            } 
        },
    },
    {
        id: 3,
        name: "Taxation",
        get show() { return player.value.gameProgress.unlocks.tax; },
        get progress() { return Decimal.add(tmp.value.tax.pending, player.value.gameProgress.tax.amount).div(20); },
        get colors() { 
            return {
                border: "#c7b500",
                name: "#5a4700",
                progress: "#705f00",
                progressBarBase: "#453c00",
                progressBarFill: "#ffd600"
            } 
        },
    },
]