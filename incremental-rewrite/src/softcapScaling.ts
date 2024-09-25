import Decimal, { type DecimalSource } from "break_eternity.js";
import { tmp, player, gameVars } from "./main";
import { D, gRC, colorChange, scale } from "./calc";
import { format } from "./format";
import {
    getAchievementEffect,
    ifAchievement
} from "./components/Game/Game_Achievements/Game_Achievements";
import {
    getKuaUpgrade,
    KUA_UPGRADES
} from "./components/Game/Game_Progress/Game_Kuaraniai/Game_Kuaraniai";
import { MAIN_ONE_UPGS } from "./components/Game/Game_Progress/Game_Main/Game_Main";

export const SCALE_ATTR = [
    { pow: 2, type: 0, name: "Scaled", color: `#3080FF` },
    { pow: 3, type: 0, name: "Superscaled", color: `#dfb600` },
    { pow: 4, type: 1, name: "Hyper", color: `#FF0060` },
    { pow: 4, type: 0, name: "Atomic", color: `#20BF3A` },
    { pow: 5, type: 1, name: "Supercritical", color: `#8636FF` },
    { pow: 6, type: 2, name: "Meta", color: `#00C7F3` },
    { pow: 15, type: 0, name: "Exotic", color: `#FF8000` },
    { pow: 75, type: 0, name: "Instant", color: `#D0D0D0` },
    {
        pow: 100,
        type: 1,
        name: "WTF",
        get color() {
            return colorChange("#ffffff", Math.sin(gameVars.value.sessionTime) ** 2, 1);
        }
    },
    {
        pow: 60,
        type: 2,
        name: "Ultimate",
        get color() {
            return gRC(gameVars.value.sessionTime, 1, 1);
        }
    }
];

export const SOFT_ATTR = [
    { name: "Softcap", color: `#FF4040` },
    { name: "Super Softcap", color: `#efc600` },
    { name: "Hyper Softcap", color: `#6040FF` }
];

type ScSlData = {
    start: Decimal;
    basePow: Decimal;
    power: Decimal;
    newType?: number;
    displayedEffect: string;
};

export type ScSlItems =
    | "points"
    | "upg1"
    | "upg2"
    | "upg3"
    | "upg4"
    | "upg5"
    | "upg6"
    | "pr2"
    | "kuaupg4base"
    | "kuaupg5base"
    | "kuaupg6base";
const ScSlItemsList: Array<ScSlItems> = [
    "points",
    "upg1",
    "upg2",
    "upg3",
    "upg4",
    "upg5",
    "upg6",
    "pr2",
    "kuaupg4base",
    "kuaupg5base",
    "kuaupg6base"
];

type DataofScSlCategory = {
    id: number;
    scale: Array<ScSlData>;
    soft: Array<ScSlData>;
};

type ListOfScSl = {
    points: DataofScSlCategory;
    upg1: DataofScSlCategory;
    upg2: DataofScSlCategory;
    upg3: DataofScSlCategory;
    upg4: DataofScSlCategory;
    upg5: DataofScSlCategory;
    upg6: DataofScSlCategory;
    pr2: DataofScSlCategory;
    kuaupg4base: DataofScSlCategory;
    kuaupg5base: DataofScSlCategory;
    kuaupg6base: DataofScSlCategory;
};

export const makeDataofScSl = (id: number): DataofScSlCategory => {
    return {
        id: id,
        scale: [],
        soft: []
    };
};

export const LIST_OF_SCSL: ListOfScSl = {
    points: makeDataofScSl(0),
    upg1: makeDataofScSl(1),
    upg2: makeDataofScSl(2),
    upg3: makeDataofScSl(3),
    upg4: makeDataofScSl(4),
    upg5: makeDataofScSl(5),
    upg6: makeDataofScSl(6),
    pr2: makeDataofScSl(7),
    kuaupg4base: makeDataofScSl(8),
    kuaupg5base: makeDataofScSl(9),
    kuaupg6base: makeDataofScSl(10)
};

export const setSCSLEffectDisp = (
    type: ScSlItems,
    isScaling: boolean,
    index: number,
    toWhat: string
): void => {
    LIST_OF_SCSL[type][isScaling ? "scale" : "soft"][index].displayedEffect = toWhat;
};

export const updateAllSCSL = () => {
    for (let i = 0; i < ScSlItemsList.length; i++) {
        getSCSLAttribute(ScSlItemsList[i], false, true);
        getSCSLAttribute(ScSlItemsList[i], true, true);
    }
};

export const getSCSLAttribute = (
    type: ScSlItems,
    isScaling: boolean,
    update = false
): Array<ScSlData> => {
    const data: Array<ScSlData> = [];
    if (LIST_OF_SCSL[type][isScaling ? "scale" : "soft"].length === 0 || update) {
        if (isScaling) {
            switch (type) {
                case "points":
                    // empty
                    break;
                case "upg1":
                    data.push({
                        start: D(20),
                        basePow: D(2),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(100),
                        basePow: D(3),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(250),
                        basePow: D(4),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(1000),
                        basePow: D(4),
                        power: D(1),
                        displayedEffect: ""
                    });

                    if (ifAchievement(0, 6)) {
                        data[0].power = data[0].power.div(getAchievementEffect(0, 6));
                    }

                    if (player.value.gameProgress.main.oneUpgrades[2]) {
                        data[0].start = data[0].start.add(MAIN_ONE_UPGS[2].effect!);
                    }

                    if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 7)) {
                        data[0].power = data[0].power.div(10 / 9);
                    }

                    data[0].power = data[0].power.div(tmp.value.kua.effects.upg1Scaling);

                    if (
                        Decimal.gte(player.value.gameProgress.main.pr2.amount, 25) &&
                        Decimal.gte(player.value.gameProgress.kua.amount, 10)
                    ) {
                        data[0].start = data[0].start.add(15);
                        data[1].start = data[1].start.add(15);
                    }

                    if (getKuaUpgrade("s", 4)) {
                        data[0].start = data[0].start.add(5);
                        data[0].power = data[0].power.mul(0.9);
                        data[1].start = data[1].start.add(2);
                        data[1].power = data[1].power.mul(0.95);
                    }

                    data[1].power = data[1].power.div(tmp.value.kua.effects.upg1SuperScaling);

                    if (getKuaUpgrade("p", 9)) {
                        data[2].power = data[2].power.div(KUA_UPGRADES.KPower[8].eff!);
                    }
                    break;
                case "upg2":
                    data.push({
                        start: D(15),
                        basePow: D(2),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(100),
                        basePow: D(3),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(500),
                        basePow: D(4),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(1000),
                        basePow: D(4),
                        power: D(1),
                        displayedEffect: ""
                    });

                    if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 15)) {
                        data[1].power = data[1].power.mul(0.875);
                    }

                    if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 25)) {
                        data[0].start = data[0].start.add(15);
                        data[1].start = data[1].start.add(15);
                    }

                    if (getKuaUpgrade("s", 3)) {
                        data[0].power = data[0].power.div(KUA_UPGRADES.KShards[2].eff!);
                    }

                    if (player.value.gameProgress.main.oneUpgrades[7]) {
                        data[0].start = data[0].start.add(MAIN_ONE_UPGS[7].effect!);
                    }

                    if (getKuaUpgrade("s", 6)) {
                        data[1].power = data[1].power.mul(0.8);
                    }

                    if (getKuaUpgrade("p", 9)) {
                        data[2].power = data[2].power.div(KUA_UPGRADES.KPower[8].eff!);
                    }
                    break;
                case "upg3":
                    data.push({
                        start: D(50),
                        basePow: D(2),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(200),
                        basePow: D(3),
                        power: D(1),
                        displayedEffect: ""
                    });
                    break;
                case "upg4":
                    data.push({
                        start: D(2000),
                        basePow: D(2),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(25000),
                        basePow: D(2),
                        power: D(1),
                        newType: 2,
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(1e6),
                        basePow: D(4),
                        power: D(1),
                        displayedEffect: ""
                    });
                    break;
                case "upg5":
                    data.push({
                        start: D(2000),
                        basePow: D(2),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(25000),
                        basePow: D(2),
                        power: D(1),
                        newType: 2,
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(1e6),
                        basePow: D(4),
                        power: D(1),
                        displayedEffect: ""
                    });
                    break;
                case "upg6":
                    data.push({
                        start: D(2000),
                        basePow: D(2),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(25000),
                        basePow: D(2),
                        power: D(1),
                        newType: 2,
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(1e6),
                        basePow: D(4),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(1e9),
                        basePow: D(3),
                        newType: 1.3,
                        power: D(1),
                        displayedEffect: ""
                    });
                    break;
                case "pr2":
                    // empty
                    break;
                case "kuaupg4base":
                    // empty
                    break;
                case "kuaupg5base":
                    // empty
                    break;
                case "kuaupg6base":
                    // empty
                    break;
                default:
                    throw new Error(`scaling item ${type} doesn't exist!`);
            }
        } else {
            switch (type) {
                case "points":
                    data.push({
                        start: D(Number.MAX_VALUE),
                        basePow: D(0.75),
                        power: D(1),
                        displayedEffect: ""
                    });
                    break;
                case "upg1":
                    data.push({
                        start: D(1e100),
                        basePow: D(0.75),
                        power: D(1),
                        displayedEffect: ""
                    });
                    break;
                case "upg2":
                    data.push({
                        start: D(10),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D("e2500"),
                        basePow: D(0.75),
                        power: D(1),
                        displayedEffect: ""
                    });

                    if (getKuaUpgrade("p", 4)) {
                        data[0].start = data[0].start.mul(KUA_UPGRADES.KPower[3].eff!);
                        data[0].power = data[0].power.mul(0.6);
                    }

                    if (getKuaUpgrade("s", 6)) {
                        data[0].power = data[0].power.mul(0.8);
                    }

                    if (ifAchievement(1, 7)) {
                        data[0].power = data[0].power.mul(0.95);
                    }

                    data[0].start = data[0].start.mul(tmp.value.kua.effects.upg2Softcap);
                    break;
                case "upg3":
                    data.push({
                        start: D(8.5),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });
                    break;
                case "upg4":
                    data.push({
                        start: D(1e100),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });
                    break;
                case "upg5":
                    data.push({
                        start: D("e1000"),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });
                    break;
                case "upg6":
                    data.push({
                        start: D(2),
                        basePow: D(0.25),
                        power: D(1),
                        displayedEffect: ""
                    });
                    break;
                case "pr2":
                    // empty
                    break;
                case "kuaupg4base":
                    data.push({
                        start: D(10),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });
                    break;
                case "kuaupg5base":
                    data.push({
                        start: D(100),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });
                    break;
                case "kuaupg6base":
                    data.push({
                        start: D(1),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });
                    break;
                default:
                    throw new Error(`softcap item ${type} doesn't exist!`);
            }
        }
        LIST_OF_SCSL[type][isScaling ? "scale" : "soft"] = data;
    }

    return LIST_OF_SCSL[type][isScaling ? "scale" : "soft"];
};

export const doAllScaling = (x: DecimalSource, scalList: Array<ScSlData>, inv: boolean) => {
    let result = D(x);
    let sta, pow, sType, base, index;
    for (let i = 0; i < scalList.length; i++) {
        index = inv ? i : scalList.length - i - 1;
        sta = scalList[index].start;
        pow = scalList[index].power;
        sType = SCALE_ATTR[index].type;
        base = scalList[index].basePow;

        result = scale(result, sType, inv, sta, pow, base);
    }
    return result;
};

export const compileScalSoftList = () => {
    for (let i = 0; i < tmp.value.scaleList.length; i++) {
        tmp.value.scaleList[i].list = [];
    }
    for (let i = 0; i < tmp.value.softList.length; i++) {
        tmp.value.softList[i].list = [];
    }

    for (let i = 0; i < ScSlItemsList.length; i++) {
        const item = LIST_OF_SCSL[ScSlItemsList[i]];
        for (let j = 0; j < item.scale.length; j++) {
            if (Decimal.gte(SCAL_VALUES[ScSlItemsList[i]], item.scale[j].start)) {
                tmp.value.scaleList[j].list.push({
                    id: j,
                    txt: `${tmp.value.scaleSoftcapNames[ScSlItemsList[i]]} - ${format(item.scale[j].power.mul(100), 3)}% starting at ${format(item.scale[j].start, 3)}`
                });
            }
        }
        for (let j = 0; j < item.soft.length; j++) {
            if (Decimal.gte(SOFT_VALUES[ScSlItemsList[i]], item.soft[j].start)) {
                tmp.value.softList[j].list.push({
                    id: j,
                    txt: `${tmp.value.scaleSoftcapNames[ScSlItemsList[i]]} - ${format(item.soft[j].power.mul(100), 3)}% starting at ${format(item.soft[j].start, 3)} (${item.soft[j].displayedEffect})`
                });
            }
        }
    }
};

const SOFT_VALUES = {
    get points() {
        return player.value.gameProgress.main.points;
    },
    get upg1() {
        return tmp.value.main.upgrades[0].effect;
    },
    get upg2() {
        return tmp.value.main.upgrades[1].effect;
    },
    get upg3() {
        return tmp.value.main.upgrades[2].effect;
    },
    get upg4() {
        return tmp.value.main.upgrades[3].effect;
    },
    get upg5() {
        return tmp.value.main.upgrades[4].effect;
    },
    get upg6() {
        return tmp.value.main.upgrades[5].effect;
    },
    get prai() {
        return tmp.value.main.prai.effect;
    },
    get pr2() {
        return tmp.value.main.pr2.effect;
    },
    get kuaupg4base() {
        return tmp.value.kua.effects.up4;
    },
    get kuaupg5base() {
        return tmp.value.kua.effects.up5;
    },
    get kuaupg6base() {
        return tmp.value.kua.effects.up6;
    }
};

const SCAL_VALUES = {
    get points() {
        return D(0);
    },
    get upg1() {
        return player.value.gameProgress.main.upgrades[0].bought;
    },
    get upg2() {
        return player.value.gameProgress.main.upgrades[1].bought;
    },
    get upg3() {
        return player.value.gameProgress.main.upgrades[2].bought;
    },
    get upg4() {
        return player.value.gameProgress.main.upgrades[3].bought;
    },
    get upg5() {
        return player.value.gameProgress.main.upgrades[4].bought;
    },
    get upg6() {
        return player.value.gameProgress.main.upgrades[5].bought;
    },
    get pr2() {
        return player.value.gameProgress.main.pr2.amount;
    },
    get kuaupg4base() {
        return D(0);
    },
    get kuaupg5base() {
        return D(0);
    },
    get kuaupg6base() {
        return D(0);
    }
};
