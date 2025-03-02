import Decimal, { type DecimalSource } from "break_eternity.js";
import { tmp, player, gameVars } from "./main";
import { D, gRC, colorChange, scale } from "./calc";
import { format } from "./format";
import {
    getAchievementEffect,
    ifAchievement
} from "./components/Game/Game_Achievements/Game_Achievements";
import { getKuaUpgrade, KUA_UPGRADES } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_KuaUpgrades/Game_KuaUpgrades";
import { getColChalRewEffects, inChallenge, timesCompleted } from "./components/Game/Game_Progress/Game_Colosseum/Game_ColChallenges/Game_ColChalHandler";
import { getOMUpgrade, MAIN_ONE_UPGS } from "./components/Game/Game_Progress/Game_Main/Game_OneUpgrades/Game_OneUpgrades";
import { KUA_BLESS_UPGS } from "./components/Game/Game_Progress/Game_Kuaraniai/Game_KuaBlessings/Game_KuaBlessings";
import { computed } from "vue";

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
    | "upg7"
    | "upg8"
    | "upg9"
    | "pr2"
    | "kuaupg4base"
    | "kuaupg5base"
    | "kuaupg6base"
    | "kba"
    | "kbi"
    | "kp"
    | "skp"
    | "ge"
    | "gtick"
    | "ec"
    ;
const ScSlItemsList: Array<ScSlItems> = [
    "points",
    "upg1",
    "upg2",
    "upg3",
    "upg4",
    "upg5",
    "upg6",
    "upg7",
    "upg8",
    "upg9",
    "pr2",
    "kuaupg4base",
    "kuaupg5base",
    "kuaupg6base",
    "kba",
    "kbi",
    "kp",
    "skp",
    "ge",
    "gtick",
    "ec"
];

type DataofScSlCategory = {
    id: number;
    scale: Array<ScSlData>;
    soft: Array<ScSlData>;
};

type ListOfScSl = {
    points: DataofScSlCategory,
    upg1: DataofScSlCategory,
    upg2: DataofScSlCategory,
    upg3: DataofScSlCategory,
    upg4: DataofScSlCategory,
    upg5: DataofScSlCategory,
    upg6: DataofScSlCategory,
    upg7: DataofScSlCategory,
    upg8: DataofScSlCategory,
    upg9: DataofScSlCategory,
    pr2: DataofScSlCategory,
    kuaupg4base: DataofScSlCategory,
    kuaupg5base: DataofScSlCategory,
    kuaupg6base: DataofScSlCategory,
    kba: DataofScSlCategory,
    kbi: DataofScSlCategory,
    kp: DataofScSlCategory,
    skp: DataofScSlCategory,
    ge: DataofScSlCategory,
    gtick: DataofScSlCategory,
    ec: DataofScSlCategory
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
    upg7: makeDataofScSl(7),
    upg8: makeDataofScSl(8),
    upg9: makeDataofScSl(9),
    pr2: makeDataofScSl(7),
    kuaupg4base: makeDataofScSl(8),
    kuaupg5base: makeDataofScSl(9),
    kuaupg6base: makeDataofScSl(10),
    kba: makeDataofScSl(11),
    kbi: makeDataofScSl(12),
    kp: makeDataofScSl(13),
    skp: makeDataofScSl(14),
    ge: makeDataofScSl(15),
    gtick: makeDataofScSl(16),
    ec: makeDataofScSl(17)
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

                    if (Decimal.gte(player.value.gameProgress.main.oneUpgrades[2], 1)) {
                        data[0].start = data[0].start.add(MAIN_ONE_UPGS[2].effect.value);
                    }

                    if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 7)) {
                        data[0].power = data[0].power.div(10 / 9);
                    }

                    data[0].power = data[0].power.div(tmp.value.kua.effects.upg1Scaling);

                    if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 25) && Decimal.gte(player.value.gameProgress.kua.amount, 10)) {
                        data[0].start = data[0].start.add(15);
                        data[1].start = data[1].start.add(15);
                    }

                    if (getKuaUpgrade("s", 4)) {
                        data[0].start = data[0].start.add(5);
                        data[0].power = data[0].power.mul(0.95);
                        data[1].start = data[1].start.add(2);
                        data[1].power = data[1].power.mul(0.98);
                    }

                    data[1].power = data[1].power.div(tmp.value.kua.effects.upg1SuperScaling);

                    if (getKuaUpgrade("p", 9)) {
                        data[2].power = data[2].power.div(KUA_UPGRADES.KPower[8].eff!.value);
                    }

                    data[2].power = data[2].power.mul(getColChalRewEffects("su")[1])

                    if (Decimal.gte(getOMUpgrade(14), 1)) {
                        data[2].power = data[2].power.div(MAIN_ONE_UPGS[14].effect.value);
                    }

                    if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[1], 1)) {
                        data[2].start = data[2].start.add(KUA_BLESS_UPGS[1].eff.value[0]);
                    }

                    data[1].start = data[1].start.add(KUA_BLESS_UPGS[0].eff.value[2]);

                    if (player.value.gameProgress.layer4.gro.upgrades.overall.includes(2)) {
                        data[3].power = data[3].power.mul(0.8);
                    }

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
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
                        data[0].power = data[0].power.div(KUA_UPGRADES.KShards[2].eff!.value);
                    }

                    if (Decimal.gte(player.value.gameProgress.main.oneUpgrades[7], 1)) {
                        data[0].start = data[0].start.add(MAIN_ONE_UPGS[7].effect.value);
                    }

                    if (getKuaUpgrade("s", 6)) {
                        data[1].power = data[1].power.mul(0.8);
                    }

                    if (getKuaUpgrade("p", 9)) {
                        data[2].power = data[2].power.div(KUA_UPGRADES.KPower[8].eff!.value);
                    }

                    data[1].start = data[1].start.add(KUA_BLESS_UPGS[0].eff.value[2]);

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
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
                    data.push({
                        start: D(1250),
                        basePow: D(4),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(10000),
                        basePow: D(4),
                        power: D(1),
                        displayedEffect: ""
                    });

                    if (Decimal.gte(getOMUpgrade(12), 1)) {
                        data[0].start = data[0].start.add(MAIN_ONE_UPGS[12].effect.value);
                    }
                    data[1].start = data[1].start.add(KUA_BLESS_UPGS[0].eff.value[2]);

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
                    }
                    break;
                case "upg4":
                    data.push({
                        start: D(2000),
                        basePow: D(2),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(5000),
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
                        start: D(1e20),
                        basePow: D(4),
                        power: D(1),
                        displayedEffect: ""
                    });

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
                    }
                    break;
                case "upg5":
                    data.push({
                        start: D(2000),
                        basePow: D(2),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(5000),
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
                        start: D(1e20),
                        basePow: D(4),
                        power: D(1),
                        displayedEffect: ""
                    });

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
                    }
                    break;
                case "upg6":
                    data.push({
                        start: D(2000),
                        basePow: D(2),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(5000),
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

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
                    }
                    break;
                case "upg7":
                    data.push({
                        start: D(1000),
                        basePow: D(2),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(1e6),
                        basePow: D(3),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(1e25),
                        basePow: D(4),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(1e100),
                        basePow: D(4),
                        power: D(1),
                        displayedEffect: ""
                    });

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
                    }
                    break;
                case "upg8":
                    data.push({
                        start: D(1250),
                        basePow: D(2),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(1e7),
                        basePow: D(3),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(1e20),
                        basePow: D(4),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(1e80),
                        basePow: D(4),
                        power: D(1),
                        displayedEffect: ""
                    });

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
                    }
                    break;
                case "upg9":
                    data.push({
                        start: D(500),
                        basePow: D(2),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(3e6),
                        basePow: D(3),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(1e40),
                        basePow: D(4),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(1e120),
                        basePow: D(4),
                        power: D(1),
                        displayedEffect: ""
                    });

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
                    }
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
                case "kba":
                    // empty
                    break;
                case "kbi":
                    // empty
                    break;
                case "kp":
                    // empty
                    break;
                case "skp":
                    // empty
                    break;
                case "ge":
                    data.push({
                        start: D(100),
                        basePow: D(2),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(1e5),
                        basePow: D(2),
                        power: D(1),
                        newType: 2,
                        displayedEffect: ""
                    });
                    break;
                case "gtick":
                    data.push({
                        start: D(300),
                        basePow: D(2),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(1e5),
                        basePow: D(2),
                        power: D(1),
                        newType: 2,
                        displayedEffect: ""
                    });
                    break;
                case "ec":
                    data.push({
                        start: D(100),
                        basePow: D(2),
                        power: D(1),
                        displayedEffect: ""
                    });
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

                    if (Decimal.gte(timesCompleted("su"), 8)) {
                        data[0].start = data[0].start.mul(getColChalRewEffects("su")[3]);
                    }

                    data[0].start = data[0].start.mul(tmp.value.kua.proofs.upgrades.effect[6].effect.max(1));

                    if (player.value.gameProgress.layer4.gro.upgrades.overall.includes(2)) {
                        data[0].power = data[0].power.mul(0.975);
                    }
                    break;
                case "upg1":
                    data.push({
                        start: D(1e100),
                        basePow: D(0.75),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D(Number.MAX_VALUE),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });

                    if (Decimal.gte(timesCompleted("su"), 1)) {
                        data[0].power = data[0].power.div(tmp.value.col.effects.upg1a2sc);
                    }

                    if (player.value.gameProgress.layer4.gro.upgrades.overall.includes(2)) {
                        data[0].start = data[0].start.mul(3.162e12);
                    }

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
                    }
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
                        data[0].start = data[0].start.mul(KUA_UPGRADES.KPower[3].eff!.value);
                        data[0].power = data[0].power.mul(0.6);
                    }

                    if (getKuaUpgrade("s", 6)) {
                        data[0].power = data[0].power.mul(0.8);
                    }

                    if (ifAchievement(1, 7)) {
                        data[0].power = data[0].power.mul(0.95);
                    }

                    data[0].start = data[0].start.mul(tmp.value.kua.effects.upg2Softcap);

                    if (Decimal.gte(timesCompleted("su"), 1)) {
                        data[0].power = data[0].power.div(tmp.value.col.effects.upg1a2sc);
                    }

                    if (player.value.gameProgress.layer4.gro.upgrades.overall.includes(2)) {
                        data[0].start = D(Infinity);
                    }

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
                    }
                    break;
                case "upg3":
                    data.push({
                        start: D(8.5),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
                    }
                    break;
                case "upg4":
                    data.push({
                        start: D(1e100),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
                    }
                    break;
                case "upg5":
                    data.push({
                        start: D("e1000"),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
                    }
                    break;
                case "upg6":
                    data.push({
                        start: D(2),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
                    }
                    break;
                case "upg7":
                    // empty
                    break;
                case "upg8":
                    // empty
                    break;
                case "upg9":
                    // empty
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

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
                    }
                    break;
                case "kuaupg5base":
                    data.push({
                        start: D(100),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
                    }
                    break;
                case "kuaupg6base":
                    data.push({
                        start: D(1),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });

                    if (inChallenge('dc')) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].start = D(Infinity);
                        }
                    }
                    break;
                case "kba":
                    data.push({
                        start: D(4000),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });
                    break;
                case "kbi":
                    data.push({
                        start: D(10000),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });
                    break;
                case "kp":
                    data.push({
                        start: D(Number.MAX_VALUE),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D("ee4"),
                        basePow: D(0.5),
                        power: D(1),
                        displayedEffect: ""
                    });
                    break;
                case "skp":
                    data.push({
                        start: D(1e100),
                        basePow: D(0.75),
                        power: D(1),
                        displayedEffect: ""
                    });
                    data.push({
                        start: D("ee3"),
                        basePow: D(0.75),
                        power: D(1),
                        displayedEffect: ""
                    });
                    break;
                case "ge":
                    // empty
                    break;
                case "gtick":
                    // empty
                    break;
                case "ec":
                    // empty
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
        tmp.value.scaleList[i] = [];
    }
    for (let i = 0; i < tmp.value.softList.length; i++) {
        tmp.value.softList[i] = [];
    }

    for (let i = 0; i < ScSlItemsList.length; i++) {
        const item = LIST_OF_SCSL[ScSlItemsList[i]];
        for (let j = 0; j < item.scale.length; j++) {
            if (Decimal.gte(SCAL_VALUES[ScSlItemsList[i]].value, item.scale[j].start)) {
                tmp.value.scaleList[j].push(`${tmp.value.scaleSoftcapNames[ScSlItemsList[i]]} - ${format(item.scale[j].power.mul(100), 3)}% starting at ${format(item.scale[j].start, 3)}`);
            }
        }
        for (let j = 0; j < item.soft.length; j++) {
            if (Decimal.gte(SOFT_VALUES[ScSlItemsList[i]].value, item.soft[j].start)) {
                tmp.value.softList[j].push(`${tmp.value.scaleSoftcapNames[ScSlItemsList[i]]} - ${format(item.soft[j].power.mul(100), 3)}% starting at ${format(item.soft[j].start, 3)} (${item.soft[j].displayedEffect})`);
            }
        }
    }
};

const SOFT_VALUES = {
    points: computed(() => {
        return player.value.gameProgress.main.points;
    }),
    upg1: computed(() => {
        return tmp.value.main.upgrades[0].effect;
    }),
    upg2: computed(() => {
        return tmp.value.main.upgrades[1].effect;
    }),
    upg3: computed(() => {
        return tmp.value.main.upgrades[2].effect;
    }),
    upg4: computed(() => {
        return tmp.value.main.upgrades[3].effect;
    }),
    upg5: computed(() => {
        return tmp.value.main.upgrades[4].effect;
    }),
    upg6: computed(() => {
        return tmp.value.main.upgrades[5].effect;
    }),
    upg7: computed(() => {
        return tmp.value.main.upgrades[6].effect;
    }),
    upg8: computed(() => {
        return tmp.value.main.upgrades[7].effect;
    }),
    upg9: computed(() => {
        return tmp.value.main.upgrades[8].effect;
    }),
    prai: computed(() => {
        return tmp.value.main.prai.effect;
    }),
    pr2: computed(() => {
        return tmp.value.main.pr2.effect;
    }),
    kuaupg4base: computed(() => {
        return tmp.value.kua.effects.upg4;
    }),
    kuaupg5base: computed(() => {
        return tmp.value.kua.effects.upg5;
    }),
    kuaupg6base: computed(() => {
        return tmp.value.kua.effects.upg6;
    }),
    kba: computed(() => {
        return tmp.value.kua.blessings.perClick;
    }),
    kbi: computed(() => {
        return tmp.value.kua.blessings.perSec;
    }),
    kp: computed(() => {
        return player.value.gameProgress.kua.proofs.amount;
    }),
    skp: computed(() => {
        return player.value.gameProgress.kua.proofs.strange.amount;
    }),
    ge: computed(() => {
        return D(0);
    }),
    gtick: computed(() => {
        return D(0);
    }),
    ec: computed(() => {
        return D(0);
    })
};

const SCAL_VALUES = {
    points: computed(() => {
        return D(0);
    }),
    upg1: computed(() => {
        return player.value.gameProgress.main.upgrades[0].bought;
    }),
    upg2: computed(() => {
        return player.value.gameProgress.main.upgrades[1].bought;
    }),
    upg3: computed(() => {
        return player.value.gameProgress.main.upgrades[2].bought;
    }),
    upg4: computed(() => {
        return player.value.gameProgress.main.upgrades[3].bought;
    }),
    upg5: computed(() => {
        return player.value.gameProgress.main.upgrades[4].bought;
    }),
    upg6: computed(() => {
        return player.value.gameProgress.main.upgrades[5].bought;
    }),
    upg7: computed(() => {
        return player.value.gameProgress.main.upgrades[6].bought;
    }),
    upg8: computed(() => {
        return player.value.gameProgress.main.upgrades[7].bought;
    }),
    upg9: computed(() => {
        return player.value.gameProgress.main.upgrades[8].bought;
    }),
    pr2: computed(() => {
        return player.value.gameProgress.main.pr2.amount;
    }),
    kuaupg4base: computed(() => {
        return D(0);
    }),
    kuaupg5base: computed(() => {
        return D(0);
    }),
    kuaupg6base: computed(() => {
        return D(0);
    }),
    kba: computed(() => {
        return D(0);
    }),
    kbi: computed(() => {
        return D(0);
    }),
    kp: computed(() => {
        return D(0);
    }),
    skp: computed(() => {
        return D(0);
    }),
    ge: computed(() => {
        let max = D(0);
        for (let i = 0; i < player.value.gameProgress.layer4.gro.growanEqu.length; i++) {
            max = Decimal.max(max, player.value.gameProgress.layer4.gro.growanEqu[i].bought);
        }
        return max;
    }),
    gtick: computed(() => {
        return player.value.gameProgress.layer4.gro.tick;
    }),
    ec: computed(() => {
        return player.value.gameProgress.layer4.gro.equCancel;
    })
};
