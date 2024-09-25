import { D, expQuadCostGrowth } from "@/calc";
import { format } from "@/format";
import { player, tmp, updateAllBest, updateAllTotal } from "@/main";
import Decimal, { type DecimalSource } from "break_eternity.js";

export const getTaxUpgrade = (id: number) => {
    return player.value.gameProgress.tax.upgrades[id] ?? D(0);
};

export type TaxUpgrade = {
    type: number;
    implemented: boolean;
    cost: (x?: DecimalSource) => Decimal;
    target?: (x: DecimalSource) => Decimal;
    effect?: (x: DecimalSource) => Decimal;
    desc: string;
    show: boolean;
};

export const TAX_UPGRADES: Array<TaxUpgrade> = [
    {
        type: 0,
        implemented: false,
        cost() {
            return D(1);
        },
        get desc() {
            return `Increase PRai's gain exponent by +^${format(0.025, 3)}.`;
        },
        show: true
    },
    {
        type: 0,
        implemented: false,
        cost() {
            return D(2);
        },
        get desc() {
            return `Weaken Upgrade 1's softcap by ${format(5, 1)}% and delay it's hyper scaling by +${format(50, 0)}.`;
        },
        show: true
    },
    {
        type: 1,
        implemented: false,
        cost(level = getTaxUpgrade(2)) {
            const cost = expQuadCostGrowth(level, 1.01, 2, 5, 0, false);
            return cost;
        },
        target(amount = player.value.gameProgress.tax.amount) {
            const target = expQuadCostGrowth(amount, 1.01, 2, 5, 0, true);
            return target;
        },
        effect(level = getTaxUpgrade(2)) {
            const effect = Decimal.mul(level, 0.025);
            return effect;
        },
        get desc() {
            return `Increase PR2's reward exponent from ${format(1.1, 3)}^ to ${format(this.effect!(getTaxUpgrade(2)).add(1.1), 3)}^.`;
        },
        show: true
    },
    {
        type: 1,
        implemented: false,
        cost(level = getTaxUpgrade(3)) {
            const cost = expQuadCostGrowth(level, 1.01, 2, 5, 0, false);
            return cost;
        },
        target(amount = player.value.gameProgress.tax.amount) {
            const target = expQuadCostGrowth(amount, 1.01, 2, 5, 0, true);
            return target;
        },
        effect(level = getTaxUpgrade(3)) {
            const effect = Decimal.pow(1.25, level);
            return effect;
        },
        get desc() {
            return `Increase Kuaraniai, KShards, and KPower gain by x${format(this.effect!(getTaxUpgrade(3)), 2)}.`;
        },
        show: true
    },
    {
        type: 0,
        implemented: false,
        cost() {
            return D(2);
        },
        get desc() {
            return `Boost Upgrade 3's base by +${format(0.001, 4)} and decrease it's linear scaling from ${format(100, 1)} to ${format(10, 1)}.`;
        },
        show: true
    },
    {
        type: 0,
        implemented: false,
        cost() {
            return D(1);
        },
        get desc() {
            return `Unlock the next Colosseum challenge, and delay Upgrade 3's scaling by +${format(15)}.`;
        },
        show: true
    }
];

export const updateAllTax = (delta: DecimalSource) => {
    updateTax(0, delta);
};

export const updateTax = (type: number, delta: DecimalSource) => {
    let generate;
    switch (type) {
        case 0:
            for (let i = 0; i < TAX_UPGRADES.length; i++) {
                if (player.value.gameProgress.tax.upgrades[i] === undefined) {
                    player.value.gameProgress.tax.upgrades[i] = D(0);
                }
            }

            tmp.value.tax.req = D(Number.MAX_VALUE);
            tmp.value.tax.canDo = Decimal.gte(
                player.value.gameProgress.main.totals[4]!,
                Number.MAX_VALUE
            );
            tmp.value.tax.pending = tmp.value.tax.canDo
                ? Decimal.pow(
                      100,
                      Decimal.log(player.value.gameProgress.main.totals[4]!, "e500").sqrt().sub(1)
                  )
                : D(0);

            if (player.value.gameProgress.tax.auto) {
                generate = tmp.value.tax.pending.mul(delta);
                player.value.gameProgress.tax.amount = Decimal.add(
                    player.value.gameProgress.tax.amount,
                    generate
                );
                updateAllTotal(player.value.gameProgress.tax.totals, generate);
                player.value.gameProgress.tax.totalEver = Decimal.add(
                    player.value.gameProgress.tax.totalEver,
                    generate
                );
            }

            updateAllBest(player.value.gameProgress.tax.best, player.value.gameProgress.tax.amount);
            player.value.gameProgress.tax.bestEver = Decimal.max(
                player.value.gameProgress.tax.bestEver,
                player.value.gameProgress.tax.amount
            );

            player.value.gameProgress.tax.timeInTax = Decimal.add(
                player.value.gameProgress.tax.timeInTax,
                delta
            );

            // TODO: upon next layer, make this totals[5] instead of totalEver
            tmp.value.tax.ptsEff = Decimal.max(player.value.gameProgress.tax.totalEver, 0)
                .add(10)
                .log10()
                .pow(2)
                .pow10()
                .sub(9)
                .pow(2);
            break;
        default:
            throw new Error(`Taxation area of the game does not contain ${type}`);
    }
};
