import Decimal from 'break_eternity.js'
import { player, tmp } from '@/main'

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
        get progress() { return Decimal.add(player.value.gameProgress.kua.amount, tmp.value.kua.kuaPending).max(0.0001).mul(1e4).log(1e6) },
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
    // {
    //     id: 2,
    //     name: "Colosseum",
    //     get show() { return player.value.col.unlocked; },
    //     get progress() { return timesCompleted("nk") ? 1 : (inChallenge("nk") ? COL_CHALLENGES.nk.progress : 0); },
    //     get colors() { 
    //         return {
    //             border: "#ff4000",
    //             name: "#661f00",
    //             progress: "#882300",
    //             progressBarBase: "#742500",
    //             progressBarFill: "#ff5822"
    //         } 
    //     },
    //     get list() {
    //         let arr = [];
    //         arr.push(`Total Colosseum Power: ${format(player.value.col.totalPower, 4)}`);
    //         arr.push(`Best Colosseum Power: ${format(player.value.col.bestPower, 4)}`);
    //         arr.push(`Total Challenge Completions: ${format(Decimal.add(timesCompleted("nk"), 0))}`);
    //         return arr;
    //     }
    // },
    // {
    //     id: 3,
    //     name: "Taxation",
    //     get show() { return player.value.tax.unlocked; },
    //     get progress() { return Decimal.add(tmp.value.taxPending, player.value.tax.taxed).div(20); },
    //     get colors() { 
    //         return {
    //             border: "#c7b500",
    //             name: "#5a4700",
    //             progress: "#705f00",
    //             progressBarBase: "#453c00",
    //             progressBarFill: "#ffd600"
    //         } 
    //     },
    //     get list() {
    //         let arr = [];
    //         arr.push(`Total Taxed Coins: ${format(player.value.tax.totalTax, 3)}`);
    //         arr.push(`Best Taxed Coins: ${format(player.value.tax.bestTax, 3)}`);
    //         arr.push(`Taxation Resets: ${format(player.value.tax.times)}`);
    //         return arr;
    //     }
    // },
]