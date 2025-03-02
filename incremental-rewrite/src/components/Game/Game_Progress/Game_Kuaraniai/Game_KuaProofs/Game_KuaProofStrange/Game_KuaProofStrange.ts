import { D } from "@/calc";
import { setFactor } from "@/components/Game/Game_Stats/Game_Stats";
import { format } from "@/format";
import { tmp } from "@/main";
import Decimal, { type DecimalSource } from "break_eternity.js";

export const getStrangeKPExp = (x: DecimalSource, updateFact: boolean) => {
    let exp = x;
    if (Decimal.lt(exp, 12)) { return D(0); }
    exp = Decimal.log(exp, 15).pow(0.5).sub(1.5).pow_base(15);
    if (updateFact) {
        setFactor(0, [4, 7], "Base", `${format(15)}^log${format(15)}(${format(x, 2)})^${format(0.5, 1)}-${format(1.5, 2)}`, `^${format(exp, 2)}`, true);
    }

    exp = exp.add(tmp.value.kua.proofs.fkpEff);
    if (updateFact) {
        setFactor(1, [4, 7], "Finicky KProof Effect", `+${format(tmp.value.kua.proofs.fkpEff, 2)}`, `^${format(exp, 2)}`, tmp.value.kua.proofs.fkpEff.gt(0), "fkp");
    }

    return exp;
}