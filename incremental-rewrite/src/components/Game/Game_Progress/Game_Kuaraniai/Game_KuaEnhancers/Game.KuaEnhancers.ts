import { player, tmp } from "@/main";
import Decimal, { type DecimalSource } from "break_eternity.js";
import { format, formatPerc } from "@/format";
import { smoothExp, smoothPoly } from "@/calc";

export const KUA_ENHANCERS = {
    sources: [
        {
            get source() {
                return player.value.prog.main.points;
            },
            sourceName: "points",
            cost(level: DecimalSource) {
                const cost = Decimal.pow(1e60, smoothExp(Decimal.max(level, 0), 1.25, false)).mul(1e93);
                return cost;
            },
            target(amount: DecimalSource) {
                const levels = smoothExp(Decimal.max(amount, 1e93).div(1e93).log(1e60), 1.25, true);
                return levels;
            }
        },
        {
            get source() {
                return player.value.prog.main.prai.amount;
            },
            sourceName: "PRai",
            cost(level: DecimalSource) {
                const cost = Decimal.pow(1e24, smoothExp(Decimal.max(level, 0), 1.1, false)).mul(1e24);
                return cost;
            },
            target(amount: DecimalSource) {
                const levels = smoothExp(Decimal.max(amount, 1e24).div(1e24).log(1e24), 1.1, true);
                return levels;
            }
        },
        {
            get source() {
                return player.value.prog.kua.amount;
            },
            sourceName: "Kuaraniai",
            cost(level: DecimalSource) {
                const cost = smoothPoly(Decimal.max(level, 0), 2, 50, false).pow_base(100).mul(0.1);
                return cost;
            },
            target(amount: DecimalSource) {
                const levels = smoothPoly(Decimal.max(amount, 0.1).div(0.1).log(100), 2, 50, true);
                return levels;
            }
        }
    ],
    enhances: [
        {
            color: "#ffffff",
            get desc() {
                return `Increase UP1's base by +${format(this.effect(), 4)}`;
            },
            effect(xp = player.value.prog.kua.enhancers.enhanceXP[0], pow = tmp.value.kua.trueEnhPower[0]) {
                const effect = Decimal.max(xp, 0).mul(0.0025).add(1).ln().mul(0.1).add(1).pow(pow).sub(1);
                return effect;
            }
        },
        {
            color: "#ffffff",
            get desc() {
                return `Increase UP2's base by +${format(this.effect(), 4)}`;
            },
            effect(xp = player.value.prog.kua.enhancers.enhanceXP[1], pow = tmp.value.kua.trueEnhPower[1]) {
                const effect = Decimal.max(xp, 0).mul(0.00025).add(1).root(10).sub(1).mul(10).add(1).pow(pow).sub(1);
                return effect;
            }
        },
        {
            color: "#ffffff",
            get desc() {
                return `Increase UP3's base by +${format(this.effect(), 4)}`;
            },
            effect(xp = player.value.prog.kua.enhancers.enhanceXP[2], pow = tmp.value.kua.trueEnhPower[2]) {
                const effect = Decimal.max(xp, 0).mul(0.0025).add(1).ln().mul(0.001).add(1).pow(pow).sub(1);
                return effect;
            }
        },
        {
            color: "#8000ff",
            get desc() {
                return `Weaken UP4's cost growth (after scaling) by ${formatPerc(this.effect(), 3)}`;
            },
            effect(xp = player.value.prog.kua.enhancers.enhanceXP[3], pow = tmp.value.kua.trueEnhPower[3]) {
                const effect = Decimal.max(xp, 0).mul(0.01).add(1).ln().mul(0.1).mul(pow).add(1);
                return effect;
            }
        },
        {
            color: "#8000ff",
            get desc() {
                return `Weaken UP5's cost growth (after scaling) by ${formatPerc(this.effect(), 3)}`;
            },
            effect(xp = player.value.prog.kua.enhancers.enhanceXP[4], pow = tmp.value.kua.trueEnhPower[4]) {
                const effect = Decimal.max(xp, 0).mul(0.01).add(1).ln().mul(0.1).mul(pow).add(1);
                return effect;
            }
        },
        {
            color: "#8000ff",
            get desc() {
                return `Weaken UP6's cost growth (after scaling) by ${formatPerc(this.effect(), 3)}`;
            },
            effect(xp = player.value.prog.kua.enhancers.enhanceXP[5], pow = tmp.value.kua.trueEnhPower[5]) {
                const effect = Decimal.max(xp, 0).mul(0.01).add(1).ln().mul(0.1).mul(pow).add(1);
                return effect;
            }
        },
        {
            color: "#c0d0e0",
            get desc() {
                return `Weaken PR2's cost growth (after scaling) by ${formatPerc(this.effect(), 3)}`;
            },
            effect(xp = player.value.prog.kua.enhancers.enhanceXP[6], pow = tmp.value.kua.trueEnhPower[6]) {
                const effect = Decimal.max(xp, 0).mul(0.005).add(1).ln().mul(0.05).mul(pow).add(1);
                return effect;
            }
        }
    ]
};

export const buyKuaEnhSourceUPG = (i: number, max = false) => {
    if (Decimal.gte(KUA_ENHANCERS.sources[i].source, KUA_ENHANCERS.sources[i].cost(player.value.prog.kua.enhancers.sources[i]))) {
        player.value.prog.kua.enhancers.sources[i] = max 
            ? Decimal.max(player.value.prog.kua.enhancers.sources[i], KUA_ENHANCERS.sources[i].target(KUA_ENHANCERS.sources[i].source).floor().add(1))
            : Decimal.add(player.value.prog.kua.enhancers.sources[i], 1);
    }
};

export const kuaEnh = (id: number, amt: DecimalSource) => {
    const remain = Decimal.sub(tmp.value.kua.totalEnhSources, tmp.value.kua.enhSourcesUsed);
    player.value.prog.kua.enhancers.enhancers[id] = Decimal.min(
        Decimal.add(remain, player.value.prog.kua.enhancers.enhancers[id]),
        Decimal.max(0, Decimal.add(player.value.prog.kua.enhancers.enhancers[id], amt))
    );
};

export const kuaEnhReset = () => {
    for (let i = 0; i < player.value.prog.kua.enhancers.enhancers.length; i++) {
        player.value.prog.kua.enhancers.enhancers[i] = 0;
    }
};
