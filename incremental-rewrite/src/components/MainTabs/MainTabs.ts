import { tab, player, tmp } from "@/main";

export const switchTab = (where: number) => {
    tab.value.currentTab = where;
};

export const switchSubTab = (where: number, index: number) => {
    tab.value.tabList[tab.value.currentTab][index] = where;
    for (let i = index + 1; i < tab.value.tabList[tab.value.currentTab].length; i++) {
        tab.value.tabList[tab.value.currentTab][i] = 0
    }
};

export type Tab = {
    currentTab: number;
    tabList: Array<Array<number>>;
};

export const TABS_LIST = [
    {
        name: "Generators",
        staticName: 0,
        backgroundColor: "#999999",
        textColor: "#000000",
        outlineColor: "#00000000",
        highlightColor: "#FFFFFF",
        if: true,
        get alert() {
            return tmp.value.main.canBuyUpg;
        },
        warning: false
    },
    {
        name: "Stored Time",
        staticName: -1,
        backgroundColor: "#004400",
        textColor: "#00FF00",
        outlineColor: "#008000",
        highlightColor: "#00FF00",
        if: true,
        get alert() {
            return player.value.gameProgress.dilatedTime.paused;
        },
        get warning() {
            return player.value.gameProgress.dilatedTime.speedEnabled && !player.value.gameProgress.dilatedTime.paused;
        }
    },
    {
        name: "Options",
        staticName: 1,
        backgroundColor: "#999999",
        textColor: "#000000",
        outlineColor: "#00000000",
        highlightColor: "#FFFFFF",
        if: true,
        alert: false,
        warning: false
    },
    {
        name: "Stats",
        staticName: 2,
        backgroundColor: "#999999",
        textColor: "#000000",
        outlineColor: "#00000000",
        highlightColor: "#FFFFFF",
        if: true,
        alert: false,
        warning: false
    },
    {
        name: "Achievements",
        staticName: 3,
        backgroundColor: "#999999",
        textColor: "#000000",
        outlineColor: "#00000000",
        highlightColor: "#FFFFFF",
        if: true,
        alert: false,
        warning: false
    },
    {
        name: "Kuaraniai",
        staticName: 4,
        backgroundColor: "#3100ff",
        textColor: "#ffffff",
        outlineColor: "#7958ff",
        highlightColor: "#ff81cb",
        get if() {
            return player.value.gameProgress.unlocks.kua;
        },
        get alert() {
            return tmp.value.kua.canBuyUpg;
        },
        warning: false
    },
    {
        name: "Colosseum",
        staticName: 5,
        backgroundColor: "#af1a00",
        textColor: "#ffffff",
        outlineColor: "#ff3600",
        highlightColor: "#ff9b7f",
        get if() {
            return player.value.gameProgress.unlocks.col;
        },
        alert: false,
        warning: false
    },
    // {
    //     name: "Taxation",
    //     staticName: 6,
    //     backgroundColor: "#b07500",
    //     textColor: "#ffffff",
    //     outlineColor: "#d5c000",
    //     highlightColor: "#ffff7f",
    //     get if() {
    //         return player.value.gameProgress.unlocks.tax;
    //     },
    //     alert: false,
    //     warning: false
    // }
];
