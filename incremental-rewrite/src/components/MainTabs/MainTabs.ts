import { tab, player, tmp } from "@/main";
import { computed } from "vue";

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
        if: computed(() => { return true }),
        alert: computed(() => {
            return tmp.value.main.canBuyUpg;
        }),
        warning: computed(() => { return false }),
    },
    {
        name: "Stored Time",
        staticName: -1,
        backgroundColor: "#004400",
        textColor: "#00FF00",
        outlineColor: "#008000",
        highlightColor: "#00FF00",
        if: computed(() => { return true }),
        alert: computed(() => {
            return player.value.gameProgress.dilatedTime.paused;
        }),
        warning: computed(() => {
            return player.value.gameProgress.dilatedTime.speedEnabled && !player.value.gameProgress.dilatedTime.paused;
        })
    },
    {
        name: "Options",
        staticName: 1,
        backgroundColor: "#999999",
        textColor: "#000000",
        outlineColor: "#00000000",
        highlightColor: "#FFFFFF",
        if: computed(() => { return true }),
        alert: computed(() => { return false }),
        warning: computed(() => { return false })
    },
    {
        name: "Stats",
        staticName: 2,
        backgroundColor: "#999999",
        textColor: "#000000",
        outlineColor: "#00000000",
        highlightColor: "#FFFFFF",
        if: computed(() => { return true }),
        alert: computed(() => { return false }),
        warning: computed(() => { return false })
    },
    {
        name: "Achievements",
        staticName: 3,
        backgroundColor: "#999999",
        textColor: "#000000",
        outlineColor: "#00000000",
        highlightColor: "#FFFFFF",
        if: computed(() => { return true }),
        alert: computed(() => { return false }),
        warning: computed(() => { return false })
    },
    {
        name: "Kuaraniai",
        staticName: 4,
        backgroundColor: "#3100ff",
        textColor: "#ffffff",
        outlineColor: "#7958ff",
        highlightColor: "#ff81cb",
        if: computed(() => {
            return player.value.gameProgress.unlocks.kua;
        }),
        alert: computed(() => {
            return tmp.value.kua.canBuyUpg;
        }),
        warning: computed(() => { return false })
    },
    {
        name: "Colosseum",
        staticName: 5,
        backgroundColor: "#af1a00",
        textColor: "#ffffff",
        outlineColor: "#ff3600",
        highlightColor: "#ff9b7f",
        if: computed(() => {
            return player.value.gameProgress.unlocks.col;
        }),
        alert: computed(() => { return false }),
        warning: computed(() => { return false })
    },
    // {
    //     name: "Taxation",
    //     staticName: 6,
    //     backgroundColor: "#b07500",
    //     textColor: "#ffffff",
    //     outlineColor: "#d5c000",
    //     highlightColor: "#ffff7f",
    //     if: computed(() => {
    //         return player.value.gameProgress.unlocks.tax;
    //     }),
    //     alert: computed(() => { return false }),
    //     warning: computed(() => { return false })
    // }
];
