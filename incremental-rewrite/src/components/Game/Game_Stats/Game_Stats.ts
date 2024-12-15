import { player, tmp } from "@/main";
import { MAIN_UPGS } from "../Game_Progress/Game_Main/Game_Main";
import { D } from "@/calc";
import Decimal from "break_eternity.js";
import { timesCompleted } from "../Game_Progress/Game_Colosseum/Game_Colosseum";

export type FactorColorID = "norm" | "ach" | "kua" | "kb" | "kp" | "fkp" | "col" | "tax" | "sc1" | "sc2"
export const factorColorIDList: Array<FactorColorID> = ["norm", "ach", "kua", "kb", "kp", "fkp", "col", "tax", "sc1", "sc2"]
export const factorColors = {
    norm: "#FFFFFF",
    ach: "#FFFF80",
    kua: "#B080FF",
    kb: "#00FF40",
    kp: "#00FFFF",
    fkp: "#80FF80",
    col: "#FFA080",
    tax: "#FFE040",
    sc1: "#FFA0A0",
    sc2: "#FFE0C0"
}

export type FactorsStat = {
    name: string,
    show: boolean,
    subTabs: null | Array<FactorsStat>,
    factors: null | Array<{
        name: string,
        color: FactorColorID,
        effect: string,
        show: boolean,
        now: string
    }>
};

// ! i could generalize this but currently i am the big stupid so i probably wont', might regret this later but oh well
export const setFactor = (
    id: number,
    where: Array<number>,
    name: string,
    effect: string,
    now: string,
    show: boolean,
    color = factorColorIDList[0],
) => {
    if (where[1] === undefined) {
        // ! I HAVE TO SPAM ! ON THIS SO THAT GITHUB CAN ACTUALLY BUILD THE SITE BUT VSCODE ISN'T GIVING ME ANY ISSUES ??? WTF?
        if (ALL_FACTORS[where[0]].factors! === null) {
            throw new Error(
                `You can't add effects to a subTab only stat! (Category: ${where[0]}, Subtabs: [${where[1]}, ${where[2]}, ${where[3]}])`
            );
        }
        if (ALL_FACTORS[where[0]].factors![id] === undefined) {
            ALL_FACTORS[where[0]].factors![id] = {
                name: name,
                show: show,
                color: color,
                effect: effect,
                now: now
            };
        } else {
            ALL_FACTORS[where[0]].factors![id].name = name;
            ALL_FACTORS[where[0]].factors![id].show = show;
            ALL_FACTORS[where[0]].factors![id].color = color;
            ALL_FACTORS[where[0]].factors![id].effect = effect;
            ALL_FACTORS[where[0]].factors![id].now = now;
        }
    } else {
        if (ALL_FACTORS[where[0]].subTabs! === null) {
            throw new Error(
                `You can't go to a subtab to a factors only stat! (Category: ${where[0]}, Subtabs: [${where[1]}, ${where[2]}, ${where[3]}])`
            );
        }
        if (where[2] === undefined) {
            if (ALL_FACTORS[where[0]].subTabs![where[1]].factors! === null) {
                throw new Error(
                    `You can't add effects to a subTab only stat! (Category: ${where[0]}, Subtabs: [${where[1]}, ${where[2]}, ${where[3]}])`
                );
            }
            if (ALL_FACTORS[where[0]].subTabs![where[1]].factors![id] === undefined) {
                ALL_FACTORS[where[0]].subTabs![where[1]].factors![id] = {
                    name: name,
                    show: show,
                    color: color,
                    effect: effect,
                    now: now
                };
            } else {
                ALL_FACTORS[where[0]].subTabs![where[1]].factors![id].name = name;
                ALL_FACTORS[where[0]].subTabs![where[1]].factors![id].show = show;
                ALL_FACTORS[where[0]].subTabs![where[1]].factors![id].color = color;
                ALL_FACTORS[where[0]].subTabs![where[1]].factors![id].effect = effect;
                ALL_FACTORS[where[0]].subTabs![where[1]].factors![id].now = now;
            }
        } else {
            // ! sorry! i don't know how to fix this issue on page load, but it works after the first tick (?)
            try {
                ALL_FACTORS[where[0]].subTabs![where[1]].subTabs!
            } catch(e) {
                // console.error(`random error, don't know how to fix it`)
                // console.log(`--- error start ---`)
                // console.log(e)
                // console.log('name:')
                // console.log(ALL_FACTORS[where[0]].name)
                // console.log('subTabs:')
                // console.log(ALL_FACTORS[where[0]].subTabs!)
                // console.log('where[1]')
                // console.log(where[1])
                // console.log('real')
                // console.log(ALL_FACTORS[where[0]].subTabs![where[1]])
                // console.log(`--- error end ---`)
                return;
            }
            if (ALL_FACTORS[where[0]].subTabs![where[1]].subTabs! === null) {
                throw new Error(
                    `You can't go to a subtab to a factors only stat! (Category: ${where[0]}, Subtabs: [${where[1]}, ${where[2]}, ${where[3]}])`
                );
            }

            if (where[3] === undefined) {
                if (ALL_FACTORS[where[0]].subTabs![where[1]].subTabs![where[2]].factors! === null) {
                    throw new Error(
                        `You can't add effects to a subTab only stat! (Category: ${where[0]}, Subtabs: [${where[1]}, ${where[2]}, ${where[3]}])`
                    );
                }
                if (
                    ALL_FACTORS[where[0]].subTabs![where[1]].subTabs![where[2]].factors![id] ===
                    undefined
                ) {
                    ALL_FACTORS[where[0]].subTabs![where[1]].subTabs![where[2]].factors![id] = {
                        name: name,
                        show: show,
                        color: color,
                        effect: effect,
                        now: now
                    };
                } else {
                    ALL_FACTORS[where[0]].subTabs![where[1]].subTabs![where[2]].factors![id].name = name;
                    ALL_FACTORS[where[0]].subTabs![where[1]].subTabs![where[2]].factors![id].show = show;
                    ALL_FACTORS[where[0]].subTabs![where[1]].subTabs![where[2]].factors![id].color = color;
                    ALL_FACTORS[where[0]].subTabs![where[1]].subTabs![where[2]].factors![id].effect = effect;
                    ALL_FACTORS[where[0]].subTabs![where[1]].subTabs![where[2]].factors![id].now = now;
                }
            } else {
                throw new Error(
                    `Unhandled exception! (Category: ${where[0]}, Subtabs: [${where[1]}, ${where[2]}, ${where[3]}])`
                );
            }
        }
    }
};

export const initStatsFactors = () => {
    const arr = [];
    for (let i = 0; i < MAIN_UPGS.length; i++) {
        arr.push({
            name: `Upgrade ${i + 1}`,
            get show() {
                return MAIN_UPGS[i].shown;
            },
            subTabs: [
                {
                    name: `Upgrade ${i + 1} Effect`,
                    show: true,
                    subTabs: null,
                    factors: []
                },
                {
                    name: `Upgrade ${i + 1} Cost`,
                    show: true,
                    subTabs: null,
                    factors: []
                },
                {
                    name: `Upgrade ${i + 1} Base`,
                    show: true,
                    subTabs: null,
                    factors: []
                }
            ],
            factors: null
        });
    }
    ALL_FACTORS[1].subTabs = arr;
};

// ! factors === null and subTabs === null should be mutually exclusive !
export const ALL_FACTORS: Array<FactorsStat> = [
    {
        name: "Points",
        show: true,
        subTabs: null,
        factors: []
    },
    {
        name: "Main Upgrades",
        show: true,
        subTabs: [],
        factors: null
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
            }
        ],
        factors: null
    },
    {
        name: "PR2",
        get show() {
            return player.value.gameProgress.unlocks.pr2;
        },
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
            }
        ],
        factors: null
    },
    {
        name: "Kuaraniai",
        get show() {
            return player.value.gameProgress.unlocks.kua;
        },
        subTabs: [
            {
                name: "Kua Effect Power",
                show: true,
                subTabs: null,
                factors: []
            },
            {
                name: "Kuaraniai Gain",
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
            {
                name: "KBlessing Active",
                get show() {
                    return player.value.gameProgress.unlocks.kblessings;
                },
                subTabs: null,
                factors: []
            },
            {
                name: "KBlessing Idle",
                get show() {
                    return player.value.gameProgress.unlocks.kblessings;
                },
                subTabs: null,
                factors: []
            },
            {
                name: "KProof Exponent",
                get show() {
                    return player.value.gameProgress.unlocks.kproofs === undefined ? false : player.value.gameProgress.unlocks.kproofs.main;
                },
                subTabs: null,
                factors: []
            },
            {
                name: "SKProof Exponent",
                get show() {
                    return player.value.gameProgress.unlocks.kproofs === undefined ? false : player.value.gameProgress.unlocks.kproofs.strange;
                },
                subTabs: null,
                factors: []
            },
            {
                name: "FKProof Exponent",
                get show() {
                    return player.value.gameProgress.unlocks.kproofs === undefined ? false : player.value.gameProgress.unlocks.kproofs.finicky;
                },
                subTabs: null,
                factors: []
            },
        ],
        factors: null
    },
    {
        name: "Colosseum",
        get show() {
            return player.value.gameProgress.unlocks.col;
        },
        subTabs: [
            {
                name: "Col Power Gain",
                show: true,
                subTabs: null,
                factors: []
            },
            {
                name: "Research Speed",
                show: true,
                subTabs: null,
                factors: []
            },
        ],
        factors: null
    },
    {
        name: "Taxation",
        get show() {
            return player.value.gameProgress.unlocks.tax;
        },
        subTabs: [
            {
                name: "Coins Gain",
                show: true,
                subTabs: null,
                factors: []
            },
        ],
        factors: null
    },
];

export const STAGES = [
    {
        id: 0,
        name: "Main Tab",
        show: true,
        get progress() {
            let prog = D(0);
            prog = prog.add(Decimal.div(player.value.gameProgress.main.pr2.bestEver, 10))
            prog = prog.add(Decimal.max(player.value.gameProgress.main.prai.bestEver, 1).log10().div(10))
            return prog.div(2);
        },
        get colors() {
            return {
                border: "#c4c4c4",
                name: "#505050",
                progress: "#707070",
                progressBarBase: "#464646",
                progressBarFill: "#cccccc"
            };
        }
    },
    {
        id: 1,
        name: "Kuaraniai",
        get show() {
            return player.value.gameProgress.unlocks.kua;
        },
        get progress() {
            let prog = D(0);
            prog = prog.add(Decimal.add(player.value.gameProgress.kua.amount, tmp.value.kua.pending).max(0.0001).mul(1e4).log(1e30));
            prog = prog.add(Decimal.max(player.value.gameProgress.kua.blessings.bestEver, 1).log10().div(12));
            prog = prog.add(Decimal.max(player.value.gameProgress.kua.proofs.amount, 10).log10().log10().div(4));
            return prog.div(3);
        },
        get colors() {
            return {
                border: "#ab00df",
                name: "#220058",
                progress: "#3f0069",
                progressBarBase: "#360063",
                progressBarFill: "#9727ff"
            };
        }
    },
    {
        id: 2,
        name: "Colosseum",
        get show() {
            return player.value.gameProgress.unlocks.col;
        },
        get progress() {
            let prog = D(0);
            prog = prog.add(timesCompleted('nk'));
            prog = prog.add(Decimal.div(timesCompleted('su'), 6));
            prog = prog.add(timesCompleted('df'));
            prog = prog.add(Decimal.max(timesCompleted('im'), 1).log10().div(45));
            prog = prog.add(Decimal.div(timesCompleted('dc'), 2))
            return prog.div(5);
        },
        get colors() {
            return {
                border: "#ff4000",
                name: "#661f00",
                progress: "#882300",
                progressBarBase: "#742500",
                progressBarFill: "#ff5822"
            };
        }
    },
    // {
    //     id: 3,
    //     name: "Taxation",
    //     get show() {
    //         return player.value.gameProgress.unlocks.tax;
    //     },
    //     get progress() {
    //         return D(0);
    //         // return Decimal.add(tmp.value.tax.pending, player.value.gameProgress.tax.amount).div(20);
    //     },
    //     get colors() {
    //         return {
    //             border: "#c7b500",
    //             name: "#5a4700",
    //             progress: "#705f00",
    //             progressBarBase: "#453c00",
    //             progressBarFill: "#ffd600"
    //         };
    //     }
    // }
];
