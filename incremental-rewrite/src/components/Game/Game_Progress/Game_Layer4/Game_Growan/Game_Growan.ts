import { D, smoothExp } from "@/calc"
import { format } from "@/format";
import { player, tmp } from "@/main";
import { resetStage } from "@/resets";
import { doAllScaling, getSCSLAttribute } from "@/softcapScaling";
import Decimal from "break_eternity.js";
import { computed, type ComputedRef } from "vue";

export const initGroEquations = () => {
    const arr = []
    for (let i = 0; i < 8; i++) {
        arr.push({ 
            bought: D(0), 
            boughtInReset: [D(0), D(0), D(0), D(0), D(0)],
            accumulated: D(0)
        })
    }
    return arr;
}

export type GrowanUpgType = {
    overall: Array<{
        id: string
        cost: Decimal
        desc: ComputedRef<string>
        eff?: ComputedRef<any>
    }>
    active: Array<{
        id: string
        cost: Decimal
        desc: ComputedRef<string>
        eff?: ComputedRef<any>
    }>
    idle: Array<{
        id: string
        cost: Decimal
        desc: ComputedRef<string>
        eff?: ComputedRef<any>
    }>
}

// also make sure to disable "restoring" all "kept" variables on *leaving* a colosseum challenge
export const GROWAN_MILESTONES = [
    {
        req: D(2),
        desc: 'One-Upgrades never get reset on Kuaraniai nor Colosseum resets, and PR2 persists between Colosseum resets.'
    },
    {
        req: D(3),
        desc: 'KBlessings are never reset on Colosseum resets, and KProofs aren\'t reset on Strange KP resets.'
    },
    {
        req: D(4),
        desc: 'KBlessings Upgrades no longer spend KBlessings, and permanently unlock Upgrades 1-9 in a Grōwan reset. KShard upgrades 15-17 change.'
    },
    {
        req: D(5),
        desc: 'Keep all autobuyers and generators unlocked by PR2 in a Grōwan reset.'
    },
    {
        req: D(6),
        desc: 'KProofs are never reset on Colosseum resets. Untimely Difference (SKP Upgrade 1) never resets, and the first 3 Effect and KP automators are kept.'
    },
    {
        req: D(8),
        desc: 'PRai and PR2 no longer reset your progress except for the time since resets.'
    },
    {
        req: D(12),
        desc: 'KBlessing Upgrades are automated.'
    },
    {
        req: D(16),
        desc: 'KProof automators from Effect #1-6, KProof #1-6, and SKP #1-3 are automatically bought.'
    },
    {
        req: D(20),
        desc: 'Colosseum researches are never reset on Grōwan resets.'
    },
    {
        req: D(25),
        desc: 'Colosseum challenge completions are never reset on Grōwan resets.'
    },
    {
        req: D(32),
        desc: 'KS Upgrades 1-17, KP Upgrades 1-17, and Kua Upgrades 1-5 are kept on Colosseum and Grōwan resets.'
    },
]

export const hasGrowanMilestone = (id: number) => {
    return Decimal.gte(player.value.gameProgress.layer4.gro.totalAmt, GROWAN_MILESTONES[id].req);
}

export type GrowanUpgTypes = 'overall' | 'active' | 'idle';

export const GROWAN_UPGS: GrowanUpgType = {
    overall: [
        {
            id: "o1",
            cost: D(1),
            eff: computed(() => {
                const i = Decimal.max(player.value.gameProgress.main.best[4]!, 1).pow(0.002);
                return i;
            }),
            desc: computed((): string => {
                return `Your highest points in a layer 4 reset boost your points, and KProof and SKP grows ${format(2)}× faster. Currently: ${format(GROWAN_UPGS.overall[0].eff!.value, 2)}×`;
            })
        },
        {
            id: "o2",
            cost: D(2),
            eff: computed(() => {
                const i = Decimal.max(player.value.gameProgress.layer4.gro.totalAmt, 1);
                const eff = {
                    pts: i.sub(1).mul(5).pow10(),
                    prai: i.sub(1).mul(2).pow10(),
                    kpe: i.pow(2).sub(1)
                }
                return eff;
            }),
            desc: computed((): string => {
                return `Your total amount of growan boosts points, PRai, and KProof exponent. Currently: ×${format(GROWAN_UPGS.overall[1].eff!.value.pts)}, ×${format(GROWAN_UPGS.overall[1].eff!.value.prai)}, +${format(GROWAN_UPGS.overall[1].eff!.value.kpe, 2)}.`;
            })
        },
        {
            id: "o3",
            cost: D(3),
            desc: computed((): string => {
                return `Upgrade 1's softcap is delayed by ${format(3.162e12)}×, and remove Upgrade 2's softcap.`;
            })
        },
        {
            id: "o4",
            cost: D(5),
            desc: computed((): string => {
                return `Upgrade 1's atomic scaling is reduced by ${format(20)}%, and the Point softcap is weakened by ${format(2.5, 1)}%.`;
            })
        },
        {
            id: "o5",
            cost: D(8),
            desc: computed((): string => {
                return `Unlock 8 more KShard and KPower upgrades, and increase Kuaraniai's gain exponent by +${format(0.025, 3)}.`;
            })
        },
        {
            id: "o6",
            cost: D(10),
            desc: computed((): string => {
                return `All Grōwan Equations' multiplier are increased by ${format(4)}×, and Grōwan Equations' effect is slightly increased.`;
            })
        },
    ],
    active: [
        {
            id: "a1",
            cost: D(2),
            eff: computed(() => {
                const i = D(60).div(Decimal.max(player.value.gameProgress.layer4.timeInL4R, 60)).mul(0.075).add(1.025);
                return i;
            }),
            desc: computed((): string => {
                return `Point gain is ^${format(GROWAN_UPGS.active[0].eff!.value, 3)}, decreasing in time in a layer 4 reset, and KBlessing's Active generation is increased by ${format(10)}×.`;
            })
        },
        {
            id: "a2",
            cost: D(3),
            desc: computed((): string => {
                return `Upgrades 4-6 scale ^${format(3)} faster and disables their autobuyers, but their effective amount is scaled to the ^${format(3.25, 2)}. This upgrade resets your Upgrades 4-6 amount.`;
            })
        },
        {
            id: "a3",
            cost: D(4),
            eff: computed(() => {
                const i = D(1).sub(D(30).div(Decimal.max(player.value.gameProgress.col.timeInCol, 30)).cbrt().mul(0.15));
                return i;
            }),
            desc: computed((): string => {
                return `Upgrade 2's cost is raised ^${format(GROWAN_UPGS.active[2].eff!.value, 3)}, slowly returning to normal over a Colosseum reset.`;
            })
        },
        {
            id: "a4",
            cost: D(6),
            desc: computed((): string => {
                return `In a colosseum challenge, Kuaraniai gain is increased by ${format(32)}× for the first Kuaraniai reset, decaying by ${format(2)}× each Kua reset until ${format(1)}×.`;
            })
        },
        {
            id: "a5",
            cost: D(8),
            desc: computed((): string => {
                return `PRai gain is boosted based off of the amount of time without the PRai autobuyer on and since the last PRai reset. PRai gain is slightly reduced with the PRai generator on. Currently: `;
            })
        },
        {
            id: "a6",
            cost: D(10),
            desc: computed((): string => {
                return `Outside of a colosseum challenge, PRai's autobuyer is disabled, but the PRai gain exponent is increased by +^${format(0.05, 3)}.`;
            })
        },
    ],
    idle: [
        {
            id: "i1",
            cost: D(2),
            eff: computed(() => {
                let i = Decimal.max(player.value.gameProgress.layer4.timeInL4R, 0);
                if (Decimal.lt(i, 600)) {
                    i = i.div(600).mul(0.025);
                } else if (Decimal.lt(i, 3600)) {
                    i = i.sub(600).div(3000).mul(0.015).add(0.025);
                } else {
                    i = i.log(60).sub(2).mul(0.02).add(0.04);
                }
                return i;
            }),
            desc: computed((): string => {
                return `PRai and KBlessing's idle generation is ${format(10)}× faster, and PRai's gain exponent slowly increases over time since a layer 4 reset. Currently: +^${format(GROWAN_UPGS.idle[0].eff!.value, 4)}`;
            })
        },
        {
            id: "i2",
            cost: D(3),
            eff: computed(() => {
                let i = Decimal.max(player.value.gameProgress.col.timeInCol, 0);
                if (i.gte(2400)) {
                    i = i.div(2400).ln().add(1).mul(0.2);
                } else {
                    i = i.div(12000);
                }
                return i;
            }),
            desc: computed((): string => {
                return `PR2's effect exponent is increased based off how long it's been since a Colosseum reset. Currently: +${format(GROWAN_UPGS.idle[1].eff!.value, 3)}^`;
            })
        },
        {
            id: "i3",
            cost: D(4),
            eff: computed(() => {
                let i = Decimal.max(player.value.gameProgress.kua.timeInKua, 0);
                i = i.div(60).add(1).ln().div(20).add(1);
                return i;
            }),
            desc: computed((): string => {
                return `Upgrade 1-3's costs are decreased over time in this Kuaraniai reset. Currently: ^${format(GROWAN_UPGS.idle[2].eff!.value.recip(), 3)}`;
            })
        },
        {
            id: "i4",
            cost: D(6),
            desc: computed((): string => {
                return `KBlessing's idle generation softcap is delayed by ${format(25)}×, but their active generation softcap is ${format(5)}× earlier.`;
            })
        },
        {
            id: "i5",
            cost: D(10),
            eff: computed(() => {
                let i = Decimal.max(player.value.gameProgress.layer4.timeInL4R, 0);
                i = i.div(60).add(1).ln().div(10).add(1);
                return i;
            }),
            desc: computed((): string => {
                return `Upgrades 4-6's effect base increase over time since a layer 4 reset. Currently: ×${format(GROWAN_UPGS.idle[4].eff!.value, 3)}`;
            })
        },
    ]
}

export class GrowanEquations {
    index: number
    baseCost: Decimal
    costReduction: Decimal
    costGrowth: Decimal

    constructor(index: number) {
        this.index = index;
        this.baseCost = [D(10), D(100), D(1e4), D(1e6), D(1e19), D(1e34), D(1e55), D(1e89)][this.index];
        this.costReduction = [D(10), D(100), D(1e4), D(1e6), D(1e10), D(1e22), D(1e35), D(1e65)][this.index];
        this.costGrowth = [D(1e3), D(1e4), D(1e5), D(1e6), D(1e8), D(1e10), D(1e12), D(1e15)][this.index];
    }

    mult: ComputedRef<Decimal> = computed(() => {
        let mult = D(1);
        mult = mult.mul(tmp.value.layer4.growan.eff.groMult);
        mult = mult.mul(Decimal.pow(GROWAN_DATA.equ.multPerBought.value, player.value.gameProgress.layer4.gro.growanEqu[this.index].bought));
        mult = mult.mul(GROWAN_DATA.tick.eff.value);
        return mult;
    })

    cost: ComputedRef<Decimal> = computed(() => {
        let i = D(player.value.gameProgress.layer4.gro.growanEqu[this.index].bought);
        i = i.sub(Decimal.sub(player.value.gameProgress.layer4.gro.equCancel, this.index).max(0));
        i = doAllScaling(i, getSCSLAttribute('ge', true), false);
        i = this.costGrowth.pow(i);
        i = i.mul(this.baseCost)
        if (this.index >= 4) {
            i = i.div(this.costReduction.pow(Decimal.sub(player.value.gameProgress.layer4.gro.equCancel, this.index - 4).max(0).min(1)));
        }

        return i;
    })

    target: ComputedRef<Decimal> = computed(() => {
        let i = D(player.value.gameProgress.layer4.gro.gEAmount);
        if (this.index >= 4) {
            i = i.mul(this.costReduction.pow(Decimal.sub(player.value.gameProgress.layer4.gro.equCancel, this.index - 4).max(0).min(1)));
        }
        i = i.div(this.baseCost);
        i = i.log(this.costGrowth);
        i = doAllScaling(i, getSCSLAttribute('ge', true), true);
        i = i.add(Decimal.sub(player.value.gameProgress.layer4.gro.equCancel, this.index).max(0));
        return i;
    })
}

export const GROWAN_DATA = {
    equ: {
        multPerBought: computed(() => {
            const i = D(2);
            return i;
        }),
        list: [
            new GrowanEquations(0),
            new GrowanEquations(1),
            new GrowanEquations(2),
            new GrowanEquations(3),
            new GrowanEquations(4),
            new GrowanEquations(5),
            new GrowanEquations(6),
            new GrowanEquations(7)
        ]
    },
    tick: {
        cost: computed(() => {
            let i = player.value.gameProgress.layer4.gro.tick;
            i = doAllScaling(i, getSCSLAttribute('gtick', true), false);
            i = i.pow10();
            i = i.mul(1e8);
            return i;
        }),
        target: computed(() => {
            let i = player.value.gameProgress.layer4.gro.gEAmount;
            i = Decimal.div(i, 1e8);
            i = i.log10();
            i = doAllScaling(i, getSCSLAttribute('gtick', true), true);
            return i;
        }),
        effPer: computed(() => {
            let i = D(1.11);
            i = i.pow(GROWAN_DATA.gal.eff.value);
            return i;
        }),
        eff: computed(() => {
            let i = player.value.gameProgress.layer4.gro.tick
            i = Decimal.pow(GROWAN_DATA.tick.effPer.value, i);
            return i;
        })
    },
    equCancel: {
        cost: computed(() => {
            let i = player.value.gameProgress.layer4.gro.equCancel;
            if (Decimal.lt(i, 4)) {
                return D(2);
            }
            i = Decimal.sub(i, 4);
            i = doAllScaling(i, getSCSLAttribute('ec', true), false);
            i = i.mul(3);
            i = i.add(4);
            return i;
        }),
        target: computed(() => {
            let i = player.value.gameProgress.layer4.gro.growanEqu[7].bought;
            if (Decimal.lt(i, 4)) {
                for (let j = 7; j >= 3; j--) {
                    if (Decimal.gte(player.value.gameProgress.layer4.gro.growanEqu[j].bought, 2)) {
                        return Decimal.sub(j, 2);
                    }
                }
                return D(0);
            }
            i = Decimal.sub(i, 4);
            i = i.div(3);
            i = doAllScaling(i, getSCSLAttribute('ec', true), true);
            i = i.add(5);
            return i;
        }),
        effPer: computed(() => {
            return D(1);
        }),
        eff: computed(() => {
            let i = D(player.value.gameProgress.layer4.gro.equCancel);
            i = i.mul(GROWAN_DATA.equCancel.effPer.value)
            return i;
        })
    },
    gal: {
        cost: computed(() => {
            let i = player.value.gameProgress.layer4.gro.gal;
            i = smoothExp(Decimal.pow(i, 0.5), 1.05, false).pow(2).mul(6.5).add(7);
            return i;
        }),
        target: computed(() => {
            let i = player.value.gameProgress.layer4.gro.growanEqu[7].bought;
            if (Decimal.lt(i, 7)) {
                return D(-1);
            }
            i = Decimal.sub(i, 7);
            i = i.div(6.5);
            i = smoothExp(i.root(2), 1.05, true).root(0.5);
            return i;
        }),
        effPer: computed(() => {
            return D(0.125);
        }),
        eff: computed(() => {
            let i = player.value.gameProgress.layer4.gro.gal;
            i = Decimal.mul(i, GROWAN_DATA.gal.effPer.value);
            i = i.add(1);
            return i;
        })
    },
    upgCostModif: {
        overall: computed(() => {
            const mul = D(0);
            // mul = mul.add(Decimal.mul(2, player.value.gameProgress.layer4.gro.upgrades.active.length));
            // mul = mul.add(Decimal.mul(2, player.value.gameProgress.layer4.gro.upgrades.idle.length));
            return mul;
        }),
        active: computed(() => {
            const mul = D(0);
            // mul = mul.add(player.value.gameProgress.layer4.gro.upgrades.idle.length);
            return mul;
        }),
        idle: computed(() => {
            const mul = D(0);
            // mul = mul.add(player.value.gameProgress.layer4.gro.upgrades.active.length);
            return mul;
        }),
    }
}

export const buyGroEqu = (index: number, max = false) => {
    if (Decimal.gte(player.value.gameProgress.layer4.gro.gEAmount, GROWAN_DATA.equ.list[index].cost.value)) {
        if (max) {
            player.value.gameProgress.layer4.gro.growanEqu[index].bought = Decimal.max(player.value.gameProgress.layer4.gro.growanEqu[index].bought, GROWAN_DATA.equ.list[index].target.value.floor());
            player.value.gameProgress.layer4.gro.gEAmount = Decimal.sub(player.value.gameProgress.layer4.gro.gEAmount, GROWAN_DATA.equ.list[index].cost.value);
            player.value.gameProgress.layer4.gro.growanEqu[index].bought = Decimal.add(player.value.gameProgress.layer4.gro.growanEqu[index].bought, 1);
        } else {
            player.value.gameProgress.layer4.gro.gEAmount = Decimal.sub(player.value.gameProgress.layer4.gro.gEAmount, GROWAN_DATA.equ.list[index].cost.value);
            player.value.gameProgress.layer4.gro.growanEqu[index].bought = Decimal.add(player.value.gameProgress.layer4.gro.growanEqu[index].bought, 1);
        }
    }
}

export const buyMaxAllGroEqu = () => {
    buyGroTick(true);
    for (let i = 7; i >= 0; i--) {
        buyGroEqu(i, true);
    }
}

export const buyGroTick = (max = false) => {
    if (Decimal.gte(player.value.gameProgress.layer4.gro.gEAmount, GROWAN_DATA.tick.cost.value)) {
        if (max) {
            player.value.gameProgress.layer4.gro.tick = Decimal.max(player.value.gameProgress.layer4.gro.tick, GROWAN_DATA.tick.target.value.floor());
            player.value.gameProgress.layer4.gro.gEAmount = Decimal.sub(player.value.gameProgress.layer4.gro.gEAmount, GROWAN_DATA.tick.cost.value);
            player.value.gameProgress.layer4.gro.tick = Decimal.add(player.value.gameProgress.layer4.gro.tick, 1);
        } else {
            player.value.gameProgress.layer4.gro.gEAmount = Decimal.sub(player.value.gameProgress.layer4.gro.gEAmount, GROWAN_DATA.tick.cost.value);
            player.value.gameProgress.layer4.gro.tick = Decimal.add(player.value.gameProgress.layer4.gro.tick, 1);
        }
    }
}

export const buyGroEquCancel = (max = false, reset = true) => {
    const which = Decimal.add(player.value.gameProgress.layer4.gro.equCancel, 3).min(7).toNumber();
    if (Decimal.gte(player.value.gameProgress.layer4.gro.growanEqu[which].bought, GROWAN_DATA.equCancel.cost.value)) {
        if (max) {
            player.value.gameProgress.layer4.gro.equCancel = Decimal.max(player.value.gameProgress.layer4.gro.equCancel, GROWAN_DATA.equCancel.target.value.floor());
        } else {
            player.value.gameProgress.layer4.gro.equCancel = Decimal.add(player.value.gameProgress.layer4.gro.equCancel, 1);
        }
        if (reset) {
            for (let i = 0; i < 8; i++) {
                player.value.gameProgress.layer4.gro.growanEqu[i].bought = D(0);
                player.value.gameProgress.layer4.gro.growanEqu[i].accumulated = D(0);
            }
            player.value.gameProgress.layer4.gro.tick = D(0);
            player.value.gameProgress.layer4.gro.gEAmount = D(0);
        }
    }
}

export const buyGroGal = (max = false, reset = true) => {
    if (Decimal.gte(player.value.gameProgress.layer4.gro.growanEqu[7].bought, GROWAN_DATA.gal.cost.value)) {
        if (max) {
            player.value.gameProgress.layer4.gro.gal = Decimal.max(player.value.gameProgress.layer4.gro.gal, GROWAN_DATA.gal.target.value.floor());
        } else {
            player.value.gameProgress.layer4.gro.gal = Decimal.add(player.value.gameProgress.layer4.gro.gal, 1);
        }
        if (reset) {
            player.value.gameProgress.layer4.gro.equCancel = D(0);
            for (let i = 0; i < 8; i++) {
                player.value.gameProgress.layer4.gro.growanEqu[i].bought = D(0);
                player.value.gameProgress.layer4.gro.growanEqu[i].accumulated = D(0);
            }
            player.value.gameProgress.layer4.gro.tick = D(0);
            player.value.gameProgress.layer4.gro.gEAmount = D(0);
        }
    }
}

export const buyGroUpg = (type: GrowanUpgTypes, id: number) => {
    // // TODO: uncomment the restrictions!
    // let k = 1
    // k
    if (player.value.gameProgress.layer4.gro.upgrades[type].includes(id)) {
        return;
    }

    const cost = GROWAN_UPGS[type][id].cost.add(GROWAN_DATA.upgCostModif[type].value);
    if (Decimal.lt(player.value.gameProgress.layer4.gro.amount, cost)) {
        return;
    }

    player.value.gameProgress.layer4.gro.amount = Decimal.sub(player.value.gameProgress.layer4.gro.amount, cost);
    player.value.gameProgress.layer4.gro.upgrades[type].push(id);
}

export const respecAllGroUpgs = () => {
    if (!confirm(`Are you sure you want to respec your grōwan upgrades? This will do a grōwan reset${tmp.value.layer4.growan.canDo ? '' : ' and you will not gain any grōwan'}!`)) {
        return;
    }

    player.value.gameProgress.layer4.gro.amount = player.value.gameProgress.layer4.gro.totalAmt;
    player.value.gameProgress.layer4.gro.upgrades.active = [];
    player.value.gameProgress.layer4.gro.upgrades.idle = [];
    player.value.gameProgress.layer4.gro.upgrades.overall = [];
    tmp.value.layer4.growan.canDo = true;
    resetStage("growan");
}