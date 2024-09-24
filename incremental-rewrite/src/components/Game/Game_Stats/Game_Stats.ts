import Decimal from 'break_eternity.js'
import { player, tmp } from '@/main'
import { COL_CHALLENGES, inChallenge, timesCompleted } from '../Game_Progress/Game_Colosseum/Game_Colosseum';
import { D } from '@/calc';
import { MAIN_UPGS } from '../Game_Progress/Game_Main/Game_Main';

export type FactorsStat = {
    name: string
    show: boolean
    subTabs: null | Array<FactorsStat>
    factors: null | Array<{
        name: string
        color: string
        effect: string
        now: string
    }>
}

// ! i could generalize this but currently i am the big stupid so i probably wont', might regret this later but oh well
export const setFactor = (category: number, name: string, effect: string, now: string, id: number, color = "#FFFFFF", subtab0?: number, subtab1?: number, subtab2?: number) => {
    if (subtab0 === undefined) {
        if (ALL_FACTORS[category].factors === null) {
            throw new Error(`You can't add effects to a subTab only stat! (Category: ${category}, Subtabs: [${subtab0}, ${subtab1}, ${subtab2}])`)
        }
        if (ALL_FACTORS[category].factors[id] === undefined) {
            ALL_FACTORS[category].factors[id] = {
                name: name,
                color: color,
                effect: effect,
                now: now
            }
        } else {
            ALL_FACTORS[category].factors[id].name = name
            ALL_FACTORS[category].factors[id].color = color
            ALL_FACTORS[category].factors[id].effect = effect
            ALL_FACTORS[category].factors[id].now = now
        }
    } else {
        if (ALL_FACTORS[category].subTabs === null) {
            throw new Error(`You can't go to a subtab to a factors only stat! (Category: ${category}, Subtabs: [${subtab0}, ${subtab1}, ${subtab2}])`)
        }
        if (subtab1 === undefined) {
            if (ALL_FACTORS[category].subTabs[subtab0].factors === null) {
                throw new Error(`You can't add effects to a subTab only stat! (Category: ${category}, Subtabs: [${subtab0}, ${subtab1}, ${subtab2}])`)
            }
            if (ALL_FACTORS[category].subTabs[subtab0].factors[id] === undefined) {
                ALL_FACTORS[category].subTabs[subtab0].factors[id] = {
                    name: name,
                    color: color,
                    effect: effect,
                    now: now
                }
            } else {
                ALL_FACTORS[category].subTabs[subtab0].factors[id].name = name
                ALL_FACTORS[category].subTabs[subtab0].factors[id].color = color
                ALL_FACTORS[category].subTabs[subtab0].factors[id].effect = effect
                ALL_FACTORS[category].subTabs[subtab0].factors[id].now = now
            }
        } else {
            // ! sorry! i don't know how to fix this issue on page load, but it works after the first tick (?)
            if (ALL_FACTORS[category].subTabs[subtab0].subTabs === null) {
                throw new Error(`You can't go to a subtab to a factors only stat! (Category: ${category}, Subtabs: [${subtab0}, ${subtab1}, ${subtab2}])`)
            }

            if (subtab2 === undefined) {
                if (ALL_FACTORS[category].subTabs[subtab0].subTabs[subtab1].factors === null) {
                    throw new Error(`You can't add effects to a subTab only stat! (Category: ${category}, Subtabs: [${subtab0}, ${subtab1}, ${subtab2}])`)
                }
                if (ALL_FACTORS[category].subTabs[subtab0].subTabs[subtab1].factors[id] === undefined) {
                    ALL_FACTORS[category].subTabs[subtab0].subTabs[subtab1].factors[id] = {
                        name: name,
                        color: color,
                        effect: effect,
                        now: now
                    }
                } else {
                    ALL_FACTORS[category].subTabs[subtab0].subTabs[subtab1].factors[id].name = name
                    ALL_FACTORS[category].subTabs[subtab0].subTabs[subtab1].factors[id].color = color
                    ALL_FACTORS[category].subTabs[subtab0].subTabs[subtab1].factors[id].effect = effect
                    ALL_FACTORS[category].subTabs[subtab0].subTabs[subtab1].factors[id].now = now
                }
            } else {
                throw new Error(`Unhandled exception! (Category: ${category}, Subtabs: [${subtab0}, ${subtab1}, ${subtab2}])`)
            }
        }
    }
}

// ! factors === null and subTabs === null should be mutually exclusive ! 
export const ALL_FACTORS: Array<FactorsStat> = [
    {
        name: "Points",
        show: true,
        subTabs: null,
        factors: [],
    },
    {
        name: "Main Upgrades",
        show: true,
        subTabs: [],
        factors: null,
    },
    {
        name: "PRai",
        show: true,
        subTabs: [
            {
                name: "PRai Gain",
                show: true,
                subTabs: null,
                factors: []
            },
            {
                name: "PRai Effect",
                show: true,
                subTabs: null,
                factors: []
            },
            {
                name: "PRai Exponent",
                show: true,
                subTabs: null,
                factors: []
            },
        ],
        factors: null,
    },
    {
        name: "PR2",
        get show() { return player.value.gameProgress.unlocks.pr2; },
        subTabs: [
            {
                name: "PR2 Cost",
                show: true,
                subTabs: null,
                factors: []
            },
            {
                name: "PR2 Cost Base",
                show: true,
                subTabs: null,
                factors: []
            },
            {
                name: "PR2 Effect",
                show: true,
                subTabs: null,
                factors: []
            },
            {
                name: "PR2 Effect Base",
                show: true,
                subTabs: null,
                factors: []
            },
        ],
        factors: null,
    },
    {
        name: "Kuaraniai",
        get show() { return player.value.gameProgress.unlocks.kua; },
        subTabs: [
            {
                name: "Kuaraniai Effect Power",
                show: true,
                subTabs: null,
                factors: []
            },
            {
                name: "Kuaraniai",
                show: true,
                subTabs: null,
                factors: []
            },
            {
                name: "KShard Gain",
                show: true,
                subTabs: null,
                factors: []
            },
            {
                name: "KPower Gain",
                show: true,
                subTabs: null,
                factors: []
            },
        ],
        factors: null,
    }
]

export const initStatsFactors = () => {
    ALL_FACTORS[1].subTabs = []
    for (let i = 0; i < player.value.gameProgress.main.upgrades.length; i++) {
        ALL_FACTORS[1].subTabs.push({
            name: `Upgrade ${i+1}`,
            get show() { return MAIN_UPGS[i].shown },
            subTabs: [
                {
                    name: `Upgrade ${i+1} Effect`,
                    show: true,
                    subTabs: null,
                    factors: []
                },
                {
                    name: `Upgrade ${i+1} Cost`,
                    show: true,
                    subTabs: null,
                    factors: []
                },
                {
                    name: `Upgrade ${i+1} Base`,
                    show: true,
                    subTabs: null,
                    factors: []
                },
            ],
            factors: null
        })
    }
}

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
        }
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
        }
    },
]