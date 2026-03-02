import { D, linearAdd, smoothPoly, sumHarmonicSeries } from "@/calc";
import { format } from "@/format";
import type { DecimalSource } from "break_eternity.js";
import Decimal from "break_eternity.js";
import { timesCompleted } from "../Game_ColChallenges/Game_ColChalHandler";
import { player, tmp } from "@/main";
import { calcKuaGain } from "../../Game_Kuaraniai/Game_Kuaraniai";

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
            let txt = ``;
            txt += `Multiply point gain by ${format(this.effect(level), 2)}×.<br>`;
            txt += `Multiply point gain by ${format(this.effect(Decimal.add(level, 1)).div(this.effect(level)), 3)}× for this level.`;
            return txt;
        },
        effect(level: DecimalSource) {
            const effect = Decimal.sqrt(level).pow10();
            return effect;
        },
        scoreToLevel(score: DecimalSource) {
            if (Decimal.lt(score, 2)) {
                return D(0);
            }
            const level = linearAdd(score, 2, 2, true);
            return level;
        },
        levelToScore(level: DecimalSource) {
            const score = linearAdd(level, 2, 2, false);
            return score;
        }
    },
    {
        unlocked: true,
        name: "Firsterious",
        effectDesc(level: DecimalSource) {
            let txt = ``;
            txt += `Multiply PRai gain by ${format(this.effect(level), 2)}×.<br>`;
            txt += `Multiply PRai gain by ${format(this.effect(Decimal.add(level, 1)).div(this.effect(level)), 3)}× for this level.`;
            return txt;
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
            let txt = ``;
            const KUA_EXP_BEFORE = tmp.value.kua.exp;
            const KUA_EXP_BEFORE_TOTAL = KUA_EXP_BEFORE.sub(this.effect(level));
            const KUA_EXP_AFTER_TOTAL = KUA_EXP_BEFORE_TOTAL.add(this.effect(Decimal.add(level, 1)));
            txt += `
            Increase Kuaraniai gain exponent by +${format(this.effect(level), 3)}.<br>
            <span style="font-size: 0.6vw;">
                This roughly translates to a ×${format(calcKuaGain(tmp.value.kua.effectivePrai, tmp.value.kua.req, KUA_EXP_AFTER_TOTAL).div(calcKuaGain(tmp.value.kua.effectivePrai, tmp.value.kua.req, KUA_EXP_BEFORE_TOTAL)), 3)} to Kua. gain.
            </span><br>
            <br>
            The next level will increase Kuaraniai gain exponent by +${format(this.effect(Decimal.add(level, 1)).sub(this.effect(level)), 3)}.<br>
            <span style="font-size: 0.6vw;">
                This roughly translates to a ×${format(calcKuaGain(tmp.value.kua.effectivePrai, tmp.value.kua.req, KUA_EXP_AFTER_TOTAL).div(calcKuaGain(tmp.value.kua.effectivePrai, tmp.value.kua.req, KUA_EXP_BEFORE)), 3)} to Kua. gain.
            </span><br>
            <br>`;
            return txt;
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
            let txt = ``;
            txt += `Increase Research Speed by ${format(this.effect(level), 3)}×.<br>`;
            txt += `+${format(this.effect(Decimal.add(level, 1)).sub(this.effect(level)), 3)}× Research Speed for this level.`;
            return txt;
        },
        effect(level: DecimalSource) {
            const effect = Decimal.mul(level, 0.1).add(1);
            return effect;
        },
        scoreToLevel(score: DecimalSource) {
            if (Decimal.lt(score, 40)) {
                return D(0);
            }
            let level = linearAdd(score, 40, 40, true);
            level = smoothPoly(level.ln(), 2, 20, true)
            level = level.exp().sub(1);
            return level;
        },
        levelToScore(level: DecimalSource) {
            let score = Decimal.add(level, 1).ln();
            score = smoothPoly(score, 2, 20, false).exp();
            score = linearAdd(score, 40, 40, false);
            return score;
        }
    },
    {
        get unlocked() {
            return Decimal.gte(timesCompleted('im'), 1e33);
        },
        name: "Defiance",
        effectDesc(level: DecimalSource) {
            let txt = ``;
            txt += `Increase KBlessing Idle generation by ${format(this.effect(level), 3)}×.<br>`;
            txt += `+${format(this.effect(Decimal.add(level, 1)).sub(this.effect(level)), 3)}× KB per second for this level.`;
            return txt;
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
            let txt = ``;
            txt += `Increase KBlessing Active generation by ${format(this.effect(level), 3)}×.<br>`;
            txt += `+${format(this.effect(Decimal.add(level, 1)).sub(this.effect(level)), 3)}× KB per click for this level.`;
            return txt;
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