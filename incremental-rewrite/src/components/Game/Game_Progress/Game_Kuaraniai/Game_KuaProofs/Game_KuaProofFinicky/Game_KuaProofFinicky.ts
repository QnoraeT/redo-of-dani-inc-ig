import { D } from "@/calc";
import { setFactor } from "@/components/Game/Game_Stats/Game_Stats";
import { format } from "@/format";
import type { DecimalSource } from "break_eternity.js";
import Decimal from "break_eternity.js";

export const getFinickySeconds = (x: DecimalSource) => {
    let sec = x;
    if (Decimal.lt(sec, 1e7)) { return D(0); }
    sec = Decimal.log10(sec).add(2).sqrt().div(3).sub(1).pow10();
    return sec;
}

export const getFinickyKPExpGain = (x: DecimalSource) => {
    let exp = x;
    if (Decimal.lt(exp, 1e7)) { return D(0); }
    exp = Decimal.log10(exp).sub(6);
    return exp;
}

export const getFinickyKPExp = (x: DecimalSource, updateFact: boolean) => {
    let exp = x;
    if (Decimal.lt(exp, 1)) { return D(0); }
    exp = Decimal.ln(exp).div(10).add(1);
    if (updateFact) {
        setFactor(0, [4, 8], "Base", `${format(1)}+ln(${format(x, 2)})/${format(10)}`, `^${format(exp, 2)}`, true);
    }

    return exp;
}

export const FKP_SECTOR_DATA = {
    cyan: {
        allocEff(x: DecimalSource) {
            return Decimal.add(x, 1).pow(1.5).log10().add(1).pow(0.9).sub(1).pow10().sub(1).div(1.5);
        },
        convertToVal(x: Decimal) {
            return Decimal.add(x, 1).log10().add(1).pow(0.9).sub(1).pow10().sub(1);
        },
        convertToReal(x: Decimal) {
            return Decimal.add(x, 1).log10().add(1).root(0.9).sub(1).pow10().sub(1);
        },
        effect(x: DecimalSource) {
            return Decimal.max(x, 0).div(10).add(1).ln().div(10).add(1);
        }
    }
}