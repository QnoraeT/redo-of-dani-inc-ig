import { tab, player } from '@/main'

export const switchTab = (where: number) => {
    tab.value.currentTab = where;
    console.log(player)
}

export const switchSubTab = (where: number, index: number) => {
    tab.value.tabList[tab.value.currentTab][index] = where;
}

export type Tab = {
    currentTab: number
    tabList: Array<Array<number>>
}

export const TABS_LIST = [
    {
        name: "Generators",
        staticName: 0,
        backgroundColor: "#999999",
        textColor: "#000000",
        outlineColor: "#00000000",
        highlightColor: "#FFFFFF",
        if: true
    },
    {
        name: "Options",
        staticName: 1,
        backgroundColor: "#999999",
        textColor: "#000000",
        outlineColor: "#00000000",
        highlightColor: "#FFFFFF",
        if: true
    },
    {
        name: "Stats",
        staticName: 2,
        backgroundColor: "#999999",
        textColor: "#000000",
        outlineColor: "#00000000",
        highlightColor: "#FFFFFF",
        if: true
    },
    {
        name: "Achievements",
        staticName: 3,
        backgroundColor: "#999999",
        textColor: "#000000",
        outlineColor: "#00000000",
        highlightColor: "#FFFFFF",
        if: true
    },
    {
        name: "Kuaraniai",
        staticName: 4,
        backgroundColor: "#3100ff",
        textColor: "#ffffff",
        outlineColor: "#7958ff",
        highlightColor: "#ff81cb",
        get if() { return player.value.gameProgress.unlocks.kua }
    },
    {
        name: "Colosseum",
        staticName: 5,
        backgroundColor: "#af1a00",
        textColor: "#ffffff",
        outlineColor: "#ff3600",
        highlightColor: "#ff9b7f",
        get if() { return player.value.gameProgress.unlocks.col }
    },
    {
        name: "Taxation",
        staticName: 6,
        backgroundColor: "#b07500",
        textColor: "#ffffff",
        outlineColor: "#d5c000",
        highlightColor: "#ffff7f",
        get if() { return player.value.gameProgress.unlocks.tax }
    },
]