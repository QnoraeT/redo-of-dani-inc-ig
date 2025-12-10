import { D, expQuadCostGrowth } from "@/calc";
import { format } from "@/format";
import { player, tmp, type TrueFactor } from "@/main";
import Decimal from "break_eternity.js";
import { computed, type ComputedRef } from "vue";

export const getTaxUpgrade = (id: number) => {
    return player.value.prog.layer4.tax.upgrades[id] ?? D(0);
};

export type TaxUpgrade = {
    type: number;
    implemented: boolean;
    cost: ComputedRef<Decimal>;
    target?: ComputedRef<Decimal>;
    effect?: ComputedRef<Decimal>;
    desc: ComputedRef<string>;
    show: ComputedRef<boolean>;
};

export const TAX_UPGRADES: Array<TaxUpgrade> = [
    {
        type: 0,
        implemented: false,
        cost: computed(() => {
            return D(1);
        }),
        desc: computed(() => {
            return `Increase PRai's gain exponent by +^${format(0.025, 3)}.`;
        }),
        show: computed(() => {
            return true;
        })
    },
    {
        type: 0,
        implemented: false,
        cost: computed(() => {
            return D(2);
        }),
        desc: computed(() => {
            return `Weaken Upgrade 1's softcap by ${format(5, 1)}% and delay it's hyper scaling by +${format(50, 0)}.`;
        }),
        show: computed(() => {
            return true;
        })
    },
    {
        type: 1,
        implemented: false,
        cost: computed(() => {
            let cost = getTaxUpgrade(2);
            cost = expQuadCostGrowth(cost, 1.01, 2, 5, 0, false);
            return cost;
        }),
        target: computed(() => {
            let target = player.value.prog.layer4.tax.amount;
            target = expQuadCostGrowth(target, 1.01, 2, 5, 0, true);
            return target;
        }),
        effect: computed(() => {
            let effect = getTaxUpgrade(2);
            effect = Decimal.mul(effect, 0.025);
            return effect;
        }),
        desc: computed(() => {
            return `Increase PR2's reward exponent from ${format(1.1, 3)}^ to ${format(TAX_UPGRADES[2].effect!.value.add(1.1), 3)}^.`;
        }),
        show: computed(() => {
            return true;
        })
    },
    {
        type: 1,
        implemented: false,
        cost: computed(() => {
            let cost = getTaxUpgrade(3);
            cost = expQuadCostGrowth(cost, 1.01, 2, 5, 0, false);
            return cost;
        }),
        target: computed(() => {
            let target = player.value.prog.layer4.tax.amount;
            target = expQuadCostGrowth(target, 1.01, 2, 5, 0, true);
            return target;
        }),
        effect: computed(() => {
            let effect = getTaxUpgrade(3);
            effect = Decimal.pow(1.25, effect);
            return effect;
        }),
        desc: computed(() => {
            return `Increase Kuaraniai, KShards, and KPower gain by ×${format(TAX_UPGRADES[3].effect!.value, 2)}.`;
        }),
        show: computed(() => {
            return true;
        })
    },
    {
        type: 0,
        implemented: false,
        cost: computed(() => {
            return D(2);
        }),
        desc: computed(() => {
            return `Boost Upgrade 3's base by +${format(0.001, 4)} and decrease it's linear scaling from ${format(100, 1)} to ${format(10, 1)}.`;
        }),
        show: computed(() => {
            return true;
        })
    },
    {
        type: 0,
        implemented: false,
        cost: computed(() => {
            return D(1);
        }),
        desc: computed(() => {
            return `Unlock the next Colosseum challenge, and delay Upgrade 3's scaling by +${format(15)}.`;
        }),
        show: computed(() => {
            return true;
        })
    }
];

export const TAX_GAIN_CALC: Array<TrueFactor> = [
    {
        baseActive: computed(() => { return true; }),
        active: true,
        name: computed(() => { return 'Base'; }),
        effect: computed(() => {
            return Decimal.pow(100, Decimal.log(player.value.prog.main.bestInLayer4, tmp.value.layer4.tax.req).sqrt().sub(1));
        }),
        color: 'norm',
        type: 'mult'
    },
]