import { D, linearAdd, scale, sumHarmonicSeries } from "@/calc";
import { format } from "@/format";
import type { DecimalSource } from "break_eternity.js";
import Decimal from "break_eternity.js";
import { timesCompleted } from "../Game_ColChallenges/Game_ColChalHandler";
import { player, tmp } from "@/main";

export const getColXPtoNext = (id: number) => {
    return Decimal.sub(player.value.prog.col.research.xpTotal[id], getColResLevel(id).floor());
}

export const getColResLevel = (id: number) => {
    return COL_RESEARCH[id].scoreToLevel(player.value.prog.col.research.xpTotal[id]);
};

export const getColResEffect = (id: number) => {
    return COL_RESEARCH[id].effect(getColResLevel(id).floor());
};

export const allocColResearch = (id: number) => {
    if (player.value.prog.col.research.enabled[id]) {
        tmp.value.col.researchesAllocated -= 1;
        player.value.prog.col.research.enabled[id] = false;
    } else {
        if (tmp.value.col.researchesAllocated < tmp.value.col.researchesAtOnce) {
            tmp.value.col.researchesAllocated += 1;
            player.value.prog.col.research.enabled[id] = true;
        }
    }
};

export const COL_RESEARCH = [
    {
        unlocked: true,
        name: "Dotgenous",
        effectDesc(level: DecimalSource) {
            return `Multiply point gain by ${format(this.effect(level), 2)}×.`;
        },
        effectDescLevel(level: DecimalSource) {
            return `Multiply point gain by ${format(this.effect(Decimal.add(level, 1)).div(this.effect(level)), 3)}× for this level.`;
        },
        effect(level: DecimalSource) {
            const effect = Decimal.sqrt(level).pow10();
            return effect;
        },
        scoreToLevel(score: DecimalSource) {
            if (Decimal.lt(score, 2)) {
                return D(0);
            }
            let level = linearAdd(score, 2, 2, true);
            if (Decimal.gte(level, 100000)) {
                level = scale(level, 2.1, true, D(100000), D(1), D(2));
            }
            return level;
        },
        levelToScore(level: DecimalSource) {
            // i love doing a little trolling, the game doesn't need this scaling, but i'm doing this just to spite ppl who beaten SU10 on v1.1.5.1 when endgame was SU6 >:3
            if (Decimal.gte(level, 100000)) {
                level = scale(level, 2.1, false, D(100000), D(1), D(2));
            }
            const score = linearAdd(level, 2, 2, false);
            return score;
        }
    },
    {
        unlocked: true,
        name: "Firsterious",
        effectDesc(level: DecimalSource) {
            return `Multiply PRai gain by ${format(this.effect(level), 2)}×.`;
        },
        effectDescLevel(level: DecimalSource) {
            return `Multiply PRai gain by ${format(this.effect(Decimal.add(level, 1)).div(this.effect(level)), 3)}× for this level.`;
        },
        effect(level: DecimalSource) {
            const effect = Decimal.cbrt(level).pow_base(4);
            return effect;
        },
        scoreToLevel(score: DecimalSource) {
            if (Decimal.lt(score, 10)) {
                return D(0);
            }
            const level = linearAdd(score, 10, 10, true);
            return level;
        },
        levelToScore(level: DecimalSource) {
            const score = linearAdd(level, 10, 10, false);
            return score;
        }
    },
    {
        unlocked: true,
        name: "Kyston",
        effectDesc(level: DecimalSource) {
            return `Increase Kuaraniai gain exponent by +${format(this.effect(level), 3)}.`;
        },
        effectDescLevel(level: DecimalSource) {
            return `+${format(this.effect(Decimal.add(level, 1)).sub(this.effect(level)), 4)} Kuaraniai gain exponent for this level.`;
        },
        effect(level: DecimalSource) {
            const effect = sumHarmonicSeries(level).div(100);
            return effect;
        },
        scoreToLevel(score: DecimalSource) {
            if (Decimal.lt(score, 100)) {
                return D(0);
            }
            const level = linearAdd(score, 100, 20, true);
            return level;
        },
        levelToScore(level: DecimalSource) {
            const score = linearAdd(level, 100, 20, false);
            return score;
        }
    },
    {
        get unlocked() {
            return Decimal.gte(timesCompleted('im'), 1e20);
        },
        name: "Coliescence",
        effectDesc(level: DecimalSource) {
            return `Increase Research Speed by ${format(this.effect(level), 3)}×.`;
        },
        effectDescLevel(level: DecimalSource) {
            return `+${format(this.effect(Decimal.add(level, 1)).sub(this.effect(level)), 3)}× Research Speed for this level.`;
        },
        effect(level: DecimalSource) {
            const exp = D(14.75)
            const effect = Decimal.div(level, exp).add(1).ln().add(1).mul(exp).sqrt().mul(exp.sqrt()).sub(exp).mul(2).pow_base(1.1);
            return effect;
        },
        scoreToLevel(score: DecimalSource) {
            if (Decimal.lt(score, 40)) {
                return D(0);
            }
            const level = linearAdd(score, 40, 40, true);
            return level;
        },
        levelToScore(level: DecimalSource) {
            const score = linearAdd(level, 40, 40, false);
            return score;
        }
    },
    {
        get unlocked() {
            return Decimal.gte(timesCompleted('im'), 1e33);
        },
        name: "Defiance",
        effectDesc(level: DecimalSource) {
            return `Increase KBlessing Idle generation by ${format(this.effect(level), 3)}×.`;
        },
        effectDescLevel(level: DecimalSource) {
            return `+${format(this.effect(Decimal.add(level, 1)).sub(this.effect(level)), 3)}× KB per second for this level.`;
        },
        effect(level: DecimalSource) {
            const effect = Decimal.mul(level, 0.05).add(1);
            return effect;
        },
        scoreToLevel(score: DecimalSource) {
            if (Decimal.lt(score, 100)) {
                return D(0);
            }
            const level = linearAdd(score, 100, 100, true);
            return level;
        },
        levelToScore(level: DecimalSource) {
            const score = linearAdd(level, 100, 100, false);
            return score;
        }
    },
    {
        get unlocked() {
            return Decimal.gte(timesCompleted('im'), 1e33);
        },
        name: "Compliance",
        effectDesc(level: DecimalSource) {
            return `Increase KBlessing Active generation by ${format(this.effect(level), 3)}×.`;
        },
        effectDescLevel(level: DecimalSource) {
            return `+${format(this.effect(Decimal.add(level, 1)).sub(this.effect(level)), 3)}× KB per click for this level.`;
        },
        effect(level: DecimalSource) {
            const effect = Decimal.mul(level, 0.05).add(1);
            return effect;
        },
        scoreToLevel(score: DecimalSource) {
            if (Decimal.lt(score, 100)) {
                return D(0);
            }
            const level = linearAdd(score, 100, 100, true);
            return level;
        },
        levelToScore(level: DecimalSource) {
            const score = linearAdd(level, 100, 100, false);
            return score;
        }
    },
];