import { D } from "@/calc";
import Decimal, { type DecimalSource } from "break_eternity.js";

export const getStrangeKPExp = (x: DecimalSource) => {
    let exp = x;
    if (Decimal.lt(exp, 12)) { return D(0); }
    exp = Decimal.log(exp, 15).pow(0.5).sub(1.5).pow_base(15);

    return exp;
}