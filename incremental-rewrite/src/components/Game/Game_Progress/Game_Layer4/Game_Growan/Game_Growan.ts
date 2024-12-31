import { D, smoothExp } from "@/calc"
import { format } from "@/format";
import { player, tmp } from "@/main";
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
        cost: Decimal
        desc: ComputedRef<string>
        eff?: ComputedRef<any>
    }>
    active: Array<{
        cost: Decimal
        desc: ComputedRef<string>
        eff?: ComputedRef<any>
    }>
    idle: Array<{
        cost: Decimal
        desc: ComputedRef<string>
        eff?: ComputedRef<any>
    }>
}

// Idle costs increase with every active upgrade bought and vice versa. Overall upgrades do not get affected
export const GROWAN_UPGS: GrowanUpgType = {
    overall: [
        {
            cost: D(2),
            desc: computed((): string => {
                return `Point gain is increased by ${format(100)}×, PRai by ${format(10)}×, and Kuaraniai by ${format(2)}×`;
            })
        },
        {
            cost: D(2),
            desc: computed((): string => {
                return `Upgrade 1's softcap is delayed by ${format(3.162e12)}×, and remove Upgrade 2's softcap.`;
            })
        },
        {
            cost: D(3),
            desc: computed((): string => {
                return `Upgrade 1's atomic scaling is reduced by ${format(4)}%, and the Point softcap is weakened by ${format(1)}%.`;
            })
        },
        {
            cost: D(6),
            desc: computed((): string => {
                return `Unlock 8 more KShard and KPower upgrades, and increase Kuaraniai's gain exponent by +${format(0.025, 3)}.`;
            })
        },
        {
            cost: D(24),
            desc: computed((): string => {
                return `All Grōwan Equations' multiplier are increased by ${format(4)}×, and Grōwan Equations' effect is slightly increased.`;
            })
        },
    ],
    active: [
        {
            cost: D(2),
            eff: computed(() => {
                const i = D(60).div(Decimal.max(player.value.gameProgress.layer4.timeInL4R, 60)).mul(0.075).add(1.025)
                return i;
            }),
            desc: computed((): string => {
                return `Point gain is ^${format(GROWAN_UPGS.active[0].eff!.value, 3)}, decreasing in time in a layer 4 reset, and KBlessing's Active generation is increased by ${format(10)}×.`;
            })
        },
        {
            cost: D(3),
            desc: computed((): string => {
                return `One-Upgrade #4 is ${format(1e5)}× cheaper, and it's effect is improved but decreasing over a Kuaraniai reset.`;
            })
        },
        {
            cost: D(8),
            eff: computed(() => {
                const i = D(1).sub(D(30).div(Decimal.max(player.value.gameProgress.col.timeInCol, 30)).mul(0.15));
                return i;
            }),
            desc: computed((): string => {
                return `Upgrade 2's cost is raised ^${format(GROWAN_UPGS.active[2].eff!.value, 3)}, slowly returning to normal over a Colosseum reset.`;
            })
        },
        {
            cost: D(27),
            desc: computed((): string => {
                return `In a colosseum challenge, Kuaraniai gain is increased by ${format(32)}× for the first Kuaraniai reset, decaying by ${format(2)}× each Kua reset until ${format(1)}×.`;
            })
        },
    ],
    idle: [
        {
            cost: D(2),
            desc: computed((): string => {
                return `PRai and Kuaraniai's idle generation is ${format(10)}× faster, and PRai's gain exponent slowly increases over time since a layer 4 reset. Currently: `;
            })
        },
        {
            cost: D(2),
            desc: computed((): string => {
                return `PR2's effect exponent is increased based off how long it's been since a Colosseum reset. Currently: `;
            })
        },
        {
            cost: D(5),
            desc: computed((): string => {
                return `Upgrade 1-3's costs are decreased over time in this Kuaraniai reset. Currently: `;
            })
        },
        {
            cost: D(8),
            desc: computed((): string => {
                return `KBlessing's idle generation softcap is delayed by ${format(25)}×, but their active generation softcap is ${format(5)}× earlier.`;
            })
        },
        {
            cost: D(15),
            desc: computed((): string => {
                return `Upgrades 4-6's effect base increase over time since buying this upgrade. Currently: `;
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
        this.baseCost = [D(10), D(100), D(1e4), D(1e6), D(1e19), D(1e34), D(1e55), D(1e89)][this.index]
        this.costReduction = [D(10), D(100), D(1e4), D(1e6), D(1e10), D(1e22), D(1e35), D(1e65)][this.index]
        this.costGrowth = [D(1e3), D(1e4), D(1e5), D(1e6), D(1e8), D(1e10), D(1e12), D(1e15)][this.index]
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
        i = i.sub(Decimal.sub(player.value.gameProgress.layer4.gro.equCancel, this.index - 1).max(0));
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
        i = i.add(Decimal.sub(player.value.gameProgress.layer4.gro.equCancel, this.index - 1).max(0));
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
            i = i.mul(1000);
            return i;
        }),
        target: computed(() => {
            let i = player.value.gameProgress.layer4.gro.gEAmount;
            i = Decimal.div(i, 1000);
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
            i = i.mul(2.5);
            i = i.add(4);
            return i;
        }),
        target: computed(() => {
            let i = player.value.gameProgress.layer4.gro.growanEqu[7].bought;
            if (Decimal.lt(i, 4)) {
                for (let j = 7; j >= 4; j--) {
                    if (Decimal.gte(player.value.gameProgress.layer4.gro.growanEqu[j].bought, 2)) {
                        return Decimal.sub(j, 4);
                    }
                }
            }
            i = Decimal.sub(i, 4);
            i = i.div(2.5);
            i = doAllScaling(i, getSCSLAttribute('ec', true), true);
            i = i.add(4);
            return i;
        }),
        eff: computed(() => {
            const i = player.value.gameProgress.layer4.gro.equCancel;
            return i;
        })
    },
    gal: {
        cost: computed(() => {
            let i = player.value.gameProgress.layer4.gro.gal;
            i = smoothExp(Decimal.pow(i, 0.5), 1.05, false).pow(2).mul(5.5).add(7);
            return i;
        }),
        target: computed(() => {
            let i = player.value.gameProgress.layer4.gro.growanEqu[7].bought;
            if (Decimal.lt(i, 7)) {
                return D(-1);
            }
            i = Decimal.sub(i, 7);
            i = i.div(5.5);
            i = smoothExp(i.root(2), 1.05, true).root(0.5);
            return i;
        }),
        eff: computed(() => {
            let i = player.value.gameProgress.layer4.gro.gal;
            i = Decimal.div(i, 8).add(1);
            return i;
        })
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

export const buyGroEquCancel = (max = false) => {
    const which = Decimal.add(player.value.gameProgress.layer4.gro.equCancel, 3).min(7).toNumber();
    if (Decimal.gte(player.value.gameProgress.layer4.gro.growanEqu[which].bought, GROWAN_DATA.equCancel.cost.value)) {
        if (max) {
            player.value.gameProgress.layer4.gro.equCancel = Decimal.max(player.value.gameProgress.layer4.gro.equCancel, GROWAN_DATA.equCancel.target.value.floor());
        } else {
            player.value.gameProgress.layer4.gro.equCancel = Decimal.add(player.value.gameProgress.layer4.gro.equCancel, 1);
        }
        for (let i = 0; i < 8; i++) {
            player.value.gameProgress.layer4.gro.growanEqu[i].bought = D(0);
            player.value.gameProgress.layer4.gro.growanEqu[i].accumulated = D(0);
        }
        player.value.gameProgress.layer4.gro.tick = D(0);
        player.value.gameProgress.layer4.gro.gEAmount = D(0);
    }
}