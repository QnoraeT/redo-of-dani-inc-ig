import Decimal, { type DecimalSource } from "break_eternity.js";
import { NaNCheck, player, shiftDown, tmp, updateAllBest, updateAllTotal } from "@/main";
import { format, formatPerc } from "@/format";
import { D, scale, smoothExp, smoothPoly } from "@/calc";
import { ACHIEVEMENT_DATA } from "../../Game_Achievements/Game_Achievements";
import { challengeDepth, getColResEffect, inChallenge, timesCompleted } from "../Game_Colosseum/Game_Colosseum";
import { setFactor } from "../../Game_Stats/Game_Stats";
import { getSCSLAttribute, setSCSLEffectDisp } from "@/softcapScaling";
import { resetFromSKP } from "@/resets";

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

export const getFinickySeconds = (x: DecimalSource) => {
    let sec = x;
    if (Decimal.lt(sec, 1e10)) { return D(0); }
    sec = Decimal.log10(sec).sub(1).sqrt().div(3).sub(1).pow10();
    return sec;
}

export const getFinickyKPExpGain = (x: DecimalSource) => {
    let exp = x;
    if (Decimal.lt(exp, 1e10)) { return D(0); }
    exp = Decimal.log10(exp).sub(10);
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

export type TmpKProofUpgs = {
    canBuy: boolean,
    cost: Decimal,
    effect: Decimal,
    target: Decimal,
    freeExtra: Decimal,
    trueLevel: Decimal
}

export const initAllKProofUpgrades = (id: KuaProofUpgTypes) => {
    const arr = [];
    for (let i = KUA_PROOF_UPGS[id].length - 1; i >= 0; i--) {
        arr.push(
            {
                canBuy: false,
                cost: D(10),
                effect: D(0),
                target: D(-1),
                freeExtra: D(0),
                trueLevel: D(0)
            }
        );
    }
    return arr;
}

export const buyKProofUpg = (id: number, category: KuaProofUpgTypes) => {
    if (category === 'effect') {
        if (Decimal.gte(player.value.gameProgress.kua.proofs.amount, tmp.value.kua.proofs.upgrades.effect[id].cost)) {
            player.value.gameProgress.kua.proofs.amount = Decimal.sub(player.value.gameProgress.kua.proofs.amount, tmp.value.kua.proofs.upgrades.effect[id].cost);
            player.value.gameProgress.kua.proofs.upgrades.effect[id] = Decimal.add(player.value.gameProgress.kua.proofs.upgrades.effect[id], 1);
            tmp.value.kua.proofs.upgrades.effect[id].cost = KUA_PROOF_UPGS.effect[id].cost(player.value.gameProgress.kua.proofs.upgrades.effect[id]);
        }
    }
    if (category === 'kp') {
        if (Decimal.gte(player.value.gameProgress.kua.proofs.amount, tmp.value.kua.proofs.upgrades.kp[id].cost)) {
            player.value.gameProgress.kua.proofs.amount = Decimal.sub(player.value.gameProgress.kua.proofs.amount, tmp.value.kua.proofs.upgrades.kp[id].cost);
            player.value.gameProgress.kua.proofs.upgrades.kp[id] = Decimal.add(player.value.gameProgress.kua.proofs.upgrades.kp[id], 1);
            tmp.value.kua.proofs.upgrades.kp[id].cost = KUA_PROOF_UPGS.kp[id].cost(player.value.gameProgress.kua.proofs.upgrades.kp[id]);
        }
    }
    if (category === 'skp') {
        if (Decimal.gte(player.value.gameProgress.kua.proofs.strange.amount, tmp.value.kua.proofs.upgrades.skp[id].cost)) {
            player.value.gameProgress.kua.proofs.strange.amount = Decimal.sub(player.value.gameProgress.kua.proofs.strange.amount, tmp.value.kua.proofs.upgrades.skp[id].cost);
            player.value.gameProgress.kua.proofs.upgrades.skp[id] = Decimal.add(player.value.gameProgress.kua.proofs.upgrades.skp[id], 1);
            tmp.value.kua.proofs.upgrades.skp[id].cost = KUA_PROOF_UPGS.skp[id].cost(player.value.gameProgress.kua.proofs.upgrades.skp[id]);
        }
    }
}

export const KuaProofAutoTypeList: Array<KuaProofAutoTypes> = ['other', 'effect', 'kp', 'skp', 'fkp']
export type KuaProofUpgTypes = 'effect' | 'kp' | 'skp' | 'fkp'
export type KuaProofAutoTypes = 'other' | KuaProofUpgTypes

export type KuaProofAuto = {
    other: Array<{
        cost: Decimal,
        desc: string,
        show: boolean
    }>
    effect: Array<{
        cost: Decimal,
        desc: string,
        show: boolean
    }>
    kp: Array<{
        cost: Decimal,
        desc: string,
        show: boolean
    }>
    skp: Array<{
        cost: Decimal,
        desc: string,
        show: boolean
    }>
    fkp: Array<{
        cost: Decimal,
        desc: string,
        show: boolean
    }>
}

export const KUA_PROOF_AUTO: KuaProofAuto = {
    other: [
        {
            cost: D(1e3),
            desc: `Make SKP automatically generate by 1 second per second.`,
            show: true
        },
        {
            cost: D(1e12),
            desc: `SKP automatically generates 1 reset per second.`,
            show: true
        },
        {
            cost: D(1e20),
            desc: `SKP's exponent automatically increases.`,
            show: true
        },
        // {
        //     cost: D('e7000'),
        //     desc: `Make FKP automatically generate.`,
        //     get show() {
        //         return player.value.gameProgress.unlocks.kproofs.finicky;
        //     }
        // },
        // {
        //     cost: D('e12000'),
        //     desc: `FKP automatically generates 1 reset per second.`,
        //     get show() {
        //         return player.value.gameProgress.unlocks.kproofs.finicky;
        //     }
        // },
        // {
        //     cost: D('e25000'),
        //     desc: `FKP's exponent automatically increases.`,
        //     get show() {
        //         return player.value.gameProgress.unlocks.kproofs.finicky;
        //     }
        // },
    ],
    effect: [
        {
            cost: D(1e15),
            desc: `Autobuy Basic Discoveries.`,
            show: true
        },
        {
            cost: D(1e22),
            desc: `Autobuy Exotic Laboratory.`,
            show: true
        },
        {
            cost: D(1e30),
            desc: `Autobuy Holy Process.`,
            show: true
        },
        {
            cost: D(1e45),
            desc: `Autobuy Line Extruder.`,
            show: true
        },
        {
            cost: D(1e70),
            desc: `Autobuy Violent Violet.`,
            show: true
        },
        {
            cost: D(1e100),
            desc: `Autobuy Hyper Heaven.`,
            show: true
        },
        {
            cost: D('e890'),
            desc: `Autobuy Ultimate Bribery.`,
            get show() {
                return player.value.gameProgress.unlocks.kproofs.finicky;
            }
        },
        {
            cost: D('e2140'),
            desc: `Autobuy Constructive Interference.`,
            get show() {
                return player.value.gameProgress.unlocks.kproofs.finicky;
            }
        },
        {
            cost: D('e5460'),
            desc: `Autobuy Infinite Staircase.`,
            get show() {
                return player.value.gameProgress.unlocks.kproofs.finicky;
            }
        },
    ],
    kp: [
        {
            cost: D(500),
            desc: `Autobuy Simple Breakthrough.`,
            show: true
        },
        {
            cost: D(4000),
            desc: `Autobuy Trial and Error.`,
            show: true
        },
        {
            cost: D(2.5e4),
            desc: `Autobuy Crafted Experiments.`,
            show: true
        },
        {
            cost: D(1e6),
            desc: `Autobuy Complex Breakthrough.`,
            show: true
        },
        {
            cost: D(2e7),
            desc: `Autobuy Successive Trials.`,
            show: true
        },
        {
            cost: D(5e8),
            desc: `Autobuy Meta Experiments.`,
            show: true
        },
        {
            cost: D('e400'),
            desc: `Autobuy Million Dollar Breakthrough.`,
            get show() {
                return player.value.gameProgress.unlocks.kproofs.finicky;
            }
        },
        {
            cost: D('e900'),
            desc: `Autobuy Verification Trials.`,
            get show() {
                return player.value.gameProgress.unlocks.kproofs.finicky;
            }
        },
        {
            cost: D('e1600'),
            desc: `Autobuy Ultimate Experiments.`,
            get show() {
                return player.value.gameProgress.unlocks.kproofs.finicky;
            }
        },
    ],
    skp: [
        {
            cost: D(1e12),
            desc: `Autobuy Untimely Difference.`,
            show: true
        },
        {
            cost: D(1e16),
            desc: `Autobuy Uncertain Characteristic.`,
            show: true
        },
        {
            cost: D(1e22),
            desc: `Autobuy Unstable Conclusions.`,
            show: true
        },
    ],
    fkp: [

    ],
}

export const buyKProofAuto = (id: number, category: KuaProofAutoTypes) => {
    if (player.value.gameProgress.kua.proofs.automationBought[category][id]) {
        player.value.gameProgress.kua.proofs.automationEnabled[category][id] = !player.value.gameProgress.kua.proofs.automationEnabled[category][id];
        return;
    }
    if (Decimal.gte(player.value.gameProgress.kua.proofs.strange.amount, KUA_PROOF_AUTO[category][id].cost)) {
        player.value.gameProgress.kua.proofs.strange.amount = Decimal.sub(player.value.gameProgress.kua.proofs.strange.amount, KUA_PROOF_AUTO[category][id].cost);
        player.value.gameProgress.kua.proofs.automationBought[category][id] = true;
    }
}

export type KuaProofUpgAllType = {
    effect: Array<KuaProofUpgType>,
    kp: Array<KuaProofUpgType>,
    skp: Array<KuaProofUpgType>,
    fkp: Array<KuaProofUpgType>
}

export type KuaProofUpgType = {
    show: boolean,
    title: string,
    perDesc: string,
    desc: string,
    cost: (x: DecimalSource) => Decimal
    target: (x: DecimalSource) => Decimal
    effect: (x: DecimalSource) => Decimal
}

export const KUA_PROOF_UPGS: KuaProofUpgAllType = {
    effect: [
        {
            show: true,
            title: `Basic Discoveries`,
            get perDesc() {
                return `+${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.effect[0].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.effect[0].trueLevel)), 2)} free levels to Upgrades 1-3.`;
            },
            get desc() {
                return `+${format(this.effect(tmp.value.kua.proofs.upgrades.effect[0].trueLevel), 2)} free levels to Upgrades 1-3.`;
            },
            cost(x) {
                return Decimal.pow(x, 0.75).pow_base(2).mul(12).pow10();
            },
            target(x) {
                if (Decimal.lt(x, 1e12)) { return D(-1); }
                return Decimal.log10(x).div(12).log(2).root(0.75);
            },
            effect(x) {
                return Decimal.mul(x, 0.75);
            }
        },
        {
            show: true,
            title: `Exotic Laboratory`,
            get perDesc() {
                return `+${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.effect[1].trueLevel, 1)).div(this.effect(tmp.value.kua.proofs.upgrades.effect[1].trueLevel)).sub(1).mul(100), 1)}% effect power to KS and KP.`;
            },
            get desc() {
                return `+${format(this.effect(tmp.value.kua.proofs.upgrades.effect[1].trueLevel).sub(1).mul(100), 1)}% effect power to KS and KP.`;
            },
            cost(x) {
                return Decimal.pow(x, 0.825).pow_base(2).mul(24).pow10();
            },
            target(x) {
                if (Decimal.lt(x, 1e24)) { return D(-1); }
                return Decimal.log10(x).div(24).log(2).root(0.825);
            },
            effect(x) {
                return Decimal.pow(1.005, x);
            }
        },
        {
            show: true,
            title: `Holy Process`,
            get perDesc() {
                return `×${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.effect[2].trueLevel, 1)).div(this.effect(tmp.value.kua.proofs.upgrades.effect[2].trueLevel)))} KBlessing gain.`;
            },
            get desc() {
                return `×${format(this.effect(tmp.value.kua.proofs.upgrades.effect[2].trueLevel))} KBlessing gain.`;
            },
            cost(x) {
                return Decimal.pow(x, 0.9).pow_base(2).mul(40).pow10();
            },
            target(x) {
                if (Decimal.lt(x, 1e40)) { return D(-1); }
                return Decimal.log10(x).div(40).log2().root(0.9);
            },
            effect(x) {
                let eff = D(2);
                eff = eff.add(tmp.value.kua.proofs.upgrades.effect[5].effect);
                eff = Decimal.pow(eff, x);
                return eff;
            }
        },
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 0);
            },
            title: `Line Extruder`,
            get perDesc() {
                return `Each Upgrade 2 gives +${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.effect[3].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.effect[3].trueLevel)), 3)} free levels to Upgrade 1.`;
            },
            get desc() {
                return `Each Upgrade 2 gives +${format(this.effect(tmp.value.kua.proofs.upgrades.effect[3].trueLevel), 3)} free levels to Upgrade 1.`;
            },
            cost(x) {
                return Decimal.div(x, 20).add(1).pow_base(125).pow10();
            },
            target(x) {
                if (Decimal.lt(x, 1e125)) { return D(-1); }
                return Decimal.log10(x).log(125).sub(1).mul(20);
            },
            effect(x) {
                return Decimal.mul(x, 0.003);
            }
        },
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 0);
            },
            title: `Violent Violet`,
            get perDesc() {
                return `+${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.effect[4].trueLevel, 1)).div(this.effect(tmp.value.kua.proofs.upgrades.effect[4].trueLevel)).sub(1).mul(100), 1)}% to KS and KP's PRai and Point exponents.`;
            },
            get desc() {
                return `+${format(this.effect(tmp.value.kua.proofs.upgrades.effect[4].trueLevel).sub(1).mul(100), 1)}% to KS and KP's PRai and Point exponents.`;
            },
            cost(x) {
                return Decimal.div(x, 12).add(1).pow(1.1).pow_base(180).pow10();
            },
            target(x) {
                if (Decimal.lt(x, 1e180)) { return D(-1); }
                return Decimal.log10(x).log(180).root(1.1).sub(1).mul(12);
            },
            effect(x) {
                return Decimal.pow(1.015, x);
            }
        },
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 0);
            },
            title: `Hyper Heaven`,
            get perDesc() {
                return `+${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.effect[5].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.effect[5].trueLevel)), 2)} Holy Process effect base.`;
            },
            get desc() {
                return `+${format(this.effect(tmp.value.kua.proofs.upgrades.effect[5].trueLevel), 2)} Holy Process effect base.`;
            },
            cost(x) {
                return Decimal.div(x, 12).add(1).pow(1.2).pow_base(250).pow10();
            },
            target(x) {
                if (Decimal.lt(x, 1e250)) { return D(-1); }
                return Decimal.log10(x).log(250).root(1.2).sub(1).mul(12);
            },
            effect(x) {
                return Decimal.mul(x, 0.2);
            }
        },
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.finicky.amount, 0);
            },
            title: `Ultimate Bribery`,
            get perDesc() {
                return `KProofs delay point taxation by ×${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.effect[6].trueLevel, 1)).div(this.effect(tmp.value.kua.proofs.upgrades.effect[6].trueLevel)))}.`;
            },
            get desc() {
                return `KProofs delay point taxation by ×${format(this.effect(tmp.value.kua.proofs.upgrades.effect[6].trueLevel))}.`;
            },
            cost(x) {
                return smoothExp(x, 1.04, false).div(10).add(1).pow_base(75000).pow10();
            },
            target(x) {
                if (Decimal.lt(x, 'e75000')) { return D(-1); }
                return smoothExp(Decimal.log10(x).log(75000).sub(1).mul(10), 1.04, true);
            },
            effect(x) {
                return Decimal.max(player.value.gameProgress.kua.proofs.amount, 1e100).log10().sqrt().div(10).sub(1).mul(Decimal.sqrt(x)).pow_base(100);
            }
        },
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.finicky.amount, 0);
            },
            title: `Constructive Interference`,
            get perDesc() {
                return `+^${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.effect[7].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.effect[7].trueLevel)), 3)} KS and KP gain from Kua and KS respectively.`;
            },
            get desc() {
                return `+^${format(this.effect(tmp.value.kua.proofs.upgrades.effect[7].trueLevel), 3)} KS and KP gain from Kua and KS respectively.`;
            },
            cost(x) {
                return smoothExp(x, 1.05, false).div(9).add(1).pow_base(450000).pow10();
            },
            target(x) {
                if (Decimal.lt(x, 'e450000')) { return D(-1); }
                return smoothExp(Decimal.log10(x).log(450000).sub(1).mul(9), 1.05, true);
            },
            effect(x) {
                return Decimal.mul(0.02, x);
            }
        },
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.finicky.amount, 0);
            },
            title: `Infinite Staircase`,
            get perDesc() {
                return `+${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.effect[8].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.effect[8].trueLevel)), 2)} Holy Process effect base.`;
            },
            get desc() {
                return `+${format(this.effect(tmp.value.kua.proofs.upgrades.effect[8].trueLevel), 2)} Holy Process effect base.`;
            },
            cost(x) {
                return smoothExp(x, 1.06, false).div(8).add(1).pow_base(2.4e6).pow10();
            },
            target(x) {
                if (Decimal.lt(x, 'e2.4e6')) { return D(-1); }
                return smoothExp(Decimal.log10(x).log(2.4e6).sub(1).mul(8), 1.06, true);
            },
            effect(x) {
                return Decimal.mul(x, 0.2);
            }
        },
    ],
    kp: [
        {
            show: true,
            title: `Simple Breakthrough`,
            get perDesc() {
                return `+${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.kp[0].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.kp[0].trueLevel)), 2)} to KProof Exponent.`;
            },
            get desc() {
                return `+${format(this.effect(tmp.value.kua.proofs.upgrades.kp[0].trueLevel), 2)} to KProof Exponent.`;
            },
            cost(x) {
                return Decimal.add(x, 1).mul(x).div(2).pow10();
            },
            target(x) {
                if (Decimal.lt(x, 1)) { return D(-1); }
                return Decimal.log10(x).mul(8).add(1).sqrt().sub(1).div(2);
            },
            effect(x) {
                let eff = D(1);
                eff = eff.add(tmp.value.kua.proofs.upgrades.kp[3].effect);
                eff = eff.add(tmp.value.kua.proofs.upgrades.kp[6].effect);
                eff = eff.mul(x);
                return eff;
            }
        },
        {
            show: true,
            title: `Trial and Error`,
            get perDesc() {
                return `KProof amount adds +${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.kp[1].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.kp[1].trueLevel)), 2)} to KProof Exponent.`;
            },
            get desc() {
                return `+${format(this.effect(tmp.value.kua.proofs.upgrades.kp[1].trueLevel), 2)} to KProof Exponent.`;
            },
            cost(x) {
                return Decimal.pow(x, 2.5).pow_base(100).mul(1e5);
            },
            target(x) {
                if (Decimal.lt(x, 1e5)) { return D(-1); }
                return Decimal.div(x, 1e5).log(100).root(2.5);
            },
            effect(x) {
                let eff = x;
                eff = Decimal.max(player.value.gameProgress.kua.proofs.amount, 1).log10().add(1).log10().div(2).mul(x);
                eff = eff.mul(tmp.value.kua.proofs.upgrades.kp[4].effect);
                return eff;
            }
        },
        {
            show: true,
            title: `Crafted Experiments`,
            get perDesc() {
                return `+${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.kp[2].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.kp[2].trueLevel)).mul(100), 1)}% (additive) to KProof Exponent.`;
            },
            get desc() {
                return `+${format(this.effect(tmp.value.kua.proofs.upgrades.kp[2].trueLevel).sub(1).mul(100), 1)}% to KProof Exponent.`;
            },
            cost(x) {
                return Decimal.pow(x, 3).pow10().mul(1e9);
            },
            target(x) {
                if (Decimal.lt(x, 1e9)) { return D(-1); }
                return Decimal.div(x, 1e9).log10().root(3);
            },
            effect(x) {
                let eff = D(0.1);
                eff = eff.add(tmp.value.kua.proofs.upgrades.kp[5].effect);
                eff = eff.mul(x);
                return eff.add(1);
            }
        },
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 0);
            },
            title: `Complex Breakthrough`,
            get perDesc() {
                return `+${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.kp[3].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.kp[3].trueLevel)), 2)} to Simple Breakthrough effect base.`;
            },
            get desc() {
                return `+${format(this.effect(tmp.value.kua.proofs.upgrades.kp[3].trueLevel), 2)} to Simple Breakthrough effect base.`;
            },
            cost(x) {
                return Decimal.add(x, 1).log10().add(1).pow(2).sub(1).pow10().sub(1).pow10().mul(1e30);
            },
            target(x) {
                if (Decimal.lt(x, 1e30)) { return D(-1); }
                return Decimal.div(x, 1e30).log10().add(1).log10().add(1).root(2).sub(1).pow10().sub(1);
            },
            effect(x) {
                let eff = D(0.1);
                eff = eff.add(tmp.value.kua.proofs.upgrades.kp[6].effect);
                eff = eff.mul(x);
                return eff;
            }
        },
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 0);
            },
            title: `Successive Trials`,
            get perDesc() {
                return `Strange KP multiplies Trial and Error effect base by ${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.kp[4].trueLevel, 1)).div(this.effect(tmp.value.kua.proofs.upgrades.kp[4].trueLevel)), 2)}×.`;
            },
            get desc() {
                return `×${format(this.effect(tmp.value.kua.proofs.upgrades.kp[4].trueLevel), 2)} to Trial and Error effect base.`;
            },
            cost(x) {
                return Decimal.add(x, 1).log10().add(1).pow(2.5).sub(1).pow10().sub(1).pow10().mul(1e50);
            },
            target(x) {
                if (Decimal.lt(x, 1e50)) { return D(-1); }
                return Decimal.div(x, 1e50).log10().add(1).log10().add(1).root(2.5).sub(1).pow10().sub(1);
            },
            effect(x) {
                let eff = Decimal.max(player.value.gameProgress.kua.proofs.strange.amount, 1).log10().root(2).div(10).mul(x).add(1);
                eff = eff.mul(tmp.value.kua.proofs.upgrades.kp[7].effect);
                return eff;
            }
        },
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 0);
            },
            title: `Meta Experiments`,
            get perDesc() {
                return `+${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.kp[5].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.kp[5].trueLevel)).mul(100), 1)}% (additive) to Crafted Experiments effect base`;
            },
            get desc() {
                return `+${format(this.effect(tmp.value.kua.proofs.upgrades.kp[5].trueLevel).mul(100), 1)}% (additive) to Crafted Experiments effect base`;
            },
            cost(x) {
                return Decimal.add(x, 1).log10().add(1).pow(3).sub(1).pow10().sub(1).pow10().mul(1e80);
            },
            target(x) {
                if (Decimal.lt(x, 1e80)) { return D(-1); }
                return Decimal.div(x, 1e80).log10().add(1).log10().add(1).root(3).sub(1).pow10().sub(1);
            },
            effect(x) {
                return Decimal.mul(x, 0.015);
            }
        },
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.finicky.amount, 0);
            },
            title: `Million Dollar Breakthrough`,
            get perDesc() {
                return `+${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.kp[6].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.kp[6].trueLevel)), 2)} to Simple and Complex Breakthrough effect base.`;
            },
            get desc() {
                return `+${format(this.effect(tmp.value.kua.proofs.upgrades.kp[6].trueLevel), 2)} to Simple and Complex Breakthrough effect base.`;
            },
            cost(x) {
                return Decimal.add(x, 1).pow(0.2).pow_base(4000).pow10();
            },
            target(x) {
                if (Decimal.lt(x, "e4000")) { return D(-1); }
                return Decimal.log10(x).log(4000).root(0.2).sub(1);
            },
            effect(x) {
                return Decimal.mul(x, 0.02);
            }
        },
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.finicky.amount, 0);
            },
            title: `Verification Trials`,
            get perDesc() {
                return `Make Successive Trials ${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.kp[7].trueLevel, 1)).div(this.effect(tmp.value.kua.proofs.upgrades.kp[7].trueLevel)), 2)}× stronger based off of your KP.`;
            },
            get desc() {
                return `×${format(this.effect(tmp.value.kua.proofs.upgrades.kp[7].trueLevel), 2)} Successive Trial effect base.`;
            },
            cost(x) {
                return Decimal.add(x, 1).pow(0.225).pow_base(20000).pow10();
            },
            target(x) {
                if (Decimal.lt(x, "e20000")) { return D(-1); }
                return Decimal.log10(x).log(20000).root(0.225).sub(1);
            },
            effect(x) {
                return Decimal.max(player.value.gameProgress.kua.proofs.amount, 1e100).log10().log10().log2().root(4).pow(Decimal.add(x, 1).ln());
            }
        },
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.finicky.amount, 0);
            },
            title: `Ultimate Experiments`,
            get perDesc() {
                return `+${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.kp[8].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.kp[8].trueLevel)), 2)} free upgrades to KP Upgrades 4-6.`;
            },
            get desc() {
                return `+${format(this.effect(tmp.value.kua.proofs.upgrades.kp[8].trueLevel), 2)} free upgrades to KP Upgrades 4-6.`;
            },
            cost(x) {
                return Decimal.add(x, 1).pow(0.25).pow_base(80000).pow10();
            },
            target(x) {
                if (Decimal.lt(x, "e80000")) { return D(-1); }
                return Decimal.log10(x).log(80000).root(0.25).sub(1);
            },
            effect(x) {
                return Decimal.mul(x, 0.25);
            }
        },
    ],
    skp: [
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 0);
            },
            title: `Untimely Difference`,
            get perDesc() {
                return `Times you have SKP reset adds +${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.skp[0].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.skp[0].trueLevel)), 2)} free levels to the first 3 effect upgrades.`;
            },
            get desc() {
                return `+${format(this.effect(tmp.value.kua.proofs.upgrades.skp[0].trueLevel), 2)} free levels to the first 3 effect upgrades.`;
            },
            cost(x) {
                return Decimal.pow(x, 1.4).pow_base(2).mul(50);
            },
            target(x) {
                if (Decimal.lt(x, 50)) { return D(-1); }
                return Decimal.div(x, 50).log2().root(1.4);
            },
            effect(x) {
                return Decimal.add(player.value.gameProgress.kua.proofs.strange.times, 1).log10().sqrt().div(10).mul(x);
            }
        },
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 50);
            },
            title: `Uncertain Characteristic`,
            get perDesc() {
                return `SKP adds +${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.skp[1].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.skp[1].trueLevel)), 2)} free levels to the first 3 KProof upgrades.`;
            },
            get desc() {
                return `+${format(this.effect(tmp.value.kua.proofs.upgrades.skp[1].trueLevel), 2)} free levels to the first 3 KProof upgrades.`;
            },
            cost(x) {
                return Decimal.pow(x, 2).pow_base(5).mul(400);
            },
            target(x) {
                if (Decimal.lt(x, 400)) { return D(-1); }
                return Decimal.div(x, 400).log(5).root(2);
            },
            effect(x) {
                return Decimal.add(player.value.gameProgress.kua.proofs.strange.amount, 1).log10().add(1).log10().mul(x);
            }
        },
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 400);
            },
            title: `Unstable Conclusions`,
            get perDesc() {
                return `The first 3 KProof upgrades' costs are delayed by ${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.skp[2].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.skp[2].trueLevel)), 1)}.`;
            },
            get desc() {
                return `The first 3 KProof upgrades' costs are delayed by ${format(this.effect(tmp.value.kua.proofs.upgrades.skp[2].trueLevel), 1)}.`;
            },
            cost(x) {
                return Decimal.pow(x, 3).pow10().mul(1e6);
            },
            target(x) {
                if (Decimal.lt(x, 1e6)) { return D(-1); }
                return Decimal.div(x, 1e6).log10().root(3);
            },
            effect(x) {
                return Decimal.mul(x, 5);
            }
        },
    ],
    fkp: [
        {
            show: true,
            title: `Difficult Task`,
            get perDesc() {
                if (Decimal.gt(player.value.gameProgress.main.points, 1)) {
                    // placeholder condition
                    return `You need something else to continue...`;
                }
                return `Unlock FKP Allocation and the Cyan alloc.`;
            },
            get desc() {
                return tmp.value.kua.proofs.upgrades.fkp[0].trueLevel.gt(0) ? 'Unlocked' : 'Locked';
            },
            cost(x) {
                // placeholder condition
                return Decimal.gt(x, 0) || Decimal.gt(player.value.gameProgress.main.points, 1) ? D(Infinity) : D(1);
            },
            target(x) {
                // placeholder condition
                if (Decimal.lt(x, 1) || Decimal.gt(player.value.gameProgress.main.points, 1)) { return D(-1); }
                return D(0);
            },
            effect(x) {
                return D(x);
            }
        },
        {
            get show() {
                return tmp.value.kua.proofs.upgrades.fkp[0].trueLevel.gt(0);
            },
            title: `Upgrade Refactor`,
            get perDesc() {
                return `Every KP upgrade delays stale KP by ${format(2)}× and unlock the Yellow alloc.`;
            },
            get desc() {
                return `Stale KP is delayed by ×${format(this.effect(tmp.value.kua.proofs.upgrades.fkp[1].trueLevel), 1)}.`;
            },
            cost(x) {
                // placeholder condition
                return Decimal.gt(x, 0) || Decimal.gt(player.value.gameProgress.main.points, 1) ? D(Infinity) : D(10);
            },
            target(x) {
                // placeholder condition
                if (Decimal.lt(x, 10) || Decimal.gt(player.value.gameProgress.main.points, 1)) { return D(-1); }
                return D(0);
            },
            effect(x) {
                let eff = D(0);
                for (let i = 0; i < KUA_PROOF_UPGS.kp.length; i++) {
                    eff = Decimal.add(eff, tmp.value.kua.proofs.upgrades.kp[i].trueLevel);
                }
                eff = eff.mul(x);
                return Decimal.pow(2, eff);
            }
        },
        {
            get show() {
                return tmp.value.kua.proofs.upgrades.fkp[1].trueLevel.gt(0);
            },
            title: `Stupid Hinderances`,
            get perDesc() {
                return `Stale KProofs are weakened by ${format(5)}% and unlock the White alloc.`;
            },
            get desc() {
                return tmp.value.kua.proofs.upgrades.fkp[2].trueLevel.gt(0) ? 'Unlocked' : 'Locked';
            },
            cost(x) {
                // placeholder condition
                return Decimal.gt(x, 0) || Decimal.gt(player.value.gameProgress.main.points, 1) ? D(Infinity) : D(50);
            },
            target(x) {
                // placeholder condition
                if (Decimal.lt(x, 50) || Decimal.gt(player.value.gameProgress.main.points, 1)) { return D(-1); }
                return D(0);
            },
            effect(x) {
                return D(x);
            }
        },
    ]
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

export const KUA_BLESS_TIER = {
    rank: {
        show: true,
        req(x: DecimalSource) {
            let i = D(x);
            i = i.div(KUA_BLESS_UPGS[3].eff()[2]);
            return smoothExp(i, 1.004, false).pow_base(2).mul(10);
        },
        target(x: DecimalSource) {
            if (Decimal.lt(x, 10)) { return D(-1); }
            let i = smoothExp(Decimal.div(x, 10).log(2), 1.004, true);
            i = i.mul(KUA_BLESS_UPGS[3].eff()[2]);
            return i;
        },
        rounded(x: DecimalSource) {
            return this.target(x).floor().add(1);
        },
        base: {
            get kuaBlessGainIdle() {
                let i = D(1.15);
                i = i.add(KUA_BLESS_TIER.tetr.effects.kuaRankIdle);
                return i;
            },
            get kuaBlessGainActive() {
                let i = D(1.2);
                i = i.add(KUA_BLESS_TIER.tetr.effects.kuaRankActive);
                return i;
            }
        },
        effects: {
            get kuaBlessGainIdle() {
                let eff = KUA_BLESS_TIER.rank.rounded(player.value.gameProgress.kua.blessings.best[3]!).pow_base(KUA_BLESS_TIER.rank.base.kuaBlessGainIdle);
                if (!tmp.value.kua.active.blessings.ranks.rank) {
                    eff = D(1);
                }
                return eff;
            },
            get kuaBlessGainActive() {
                let eff = KUA_BLESS_TIER.rank.rounded(player.value.gameProgress.kua.blessings.best[3]!).pow_base(KUA_BLESS_TIER.rank.base.kuaBlessGainActive);
                if (!tmp.value.kua.active.blessings.ranks.rank) {
                    eff = D(1);
                }
                return eff;
            }
        },
        desc: {
            get kuaBlessGainIdle() {
                return `Increase KBlessing's idle generation by +${format(KUA_BLESS_TIER.rank.base.kuaBlessGainIdle.sub(1).mul(100))}%. Currently: +${format(KUA_BLESS_TIER.rank.effects.kuaBlessGainIdle.sub(1).mul(100))}%`;
            },
            get kuaBlessGainActive() {
                return `Increase KBlessing's active generation by +${format(KUA_BLESS_TIER.rank.base.kuaBlessGainActive.sub(1).mul(100))}%. Currently: +${format(KUA_BLESS_TIER.rank.effects.kuaBlessGainActive.sub(1).mul(100))}%`;
            }
        }
    },
    tier: {
        show: true,
        req(x: DecimalSource) {
            return smoothExp(x, 1.01, false).pow(1.2).mul(2).add(4);
        },
        target(x: DecimalSource) {
            if (Decimal.lt(x, 4)) { return D(-1); }
            return smoothExp(Decimal.sub(x, 4).div(2).root(1.2), 1.01, true);
        },
        rounded(x: DecimalSource) {
            return this.target(x).floor().add(1);
        },
        base: {
            get kuaBlessEff() {
                return D(0.25);
            },
        },
        effects: {
            get kuaBlessEff() {
                let eff = KUA_BLESS_TIER.tier.rounded(tmp.value.kua.blessings.rank).mul(KUA_BLESS_TIER.tier.base.kuaBlessEff).add(1);
                if (!tmp.value.kua.active.blessings.ranks.tier) {
                    eff = D(1);
                }
                return eff;
            },
        },
        desc: {
            get kuaBlessEff() {
                return `Increase KBlessing's effects by +${format(KUA_BLESS_TIER.tier.base.kuaBlessEff.mul(100))}% (additive). Currently: +${format(KUA_BLESS_TIER.tier.effects.kuaBlessEff.sub(1).mul(100))}%`;
            },
        }
    },
    tetr: {
        get show() {
            return Decimal.gte(tmp.value.kua.blessings.tier, 3);
        },
        req(x: DecimalSource) {
            return Decimal.add(x, 1).log10().add(1).pow(2).sub(1).pow10().sub(1).div(4).add(4);
        },
        target(x: DecimalSource) {
            if (Decimal.lt(x, 4)) { return D(-1); }
            return Decimal.sub(x, 4).mul(4).add(1).log10().add(1).root(2).sub(1).pow10().sub(1);
        },
        rounded(x: DecimalSource) {
            return this.target(x).floor().add(1);
        },
        base: {
            get kuaRankActive() {
                return D(0.05);
            },
            get kuaRankIdle() {
                return D(0.05);
            },
            get pr2Eff() {
                return KUA_BLESS_TIER.tetr.rounded(tmp.value.kua.blessings.tier).mul(0.004).add(1);
            },
        },
        effects: {
            get kuaRankActive() {
                let eff = KUA_BLESS_TIER.tetr.rounded(tmp.value.kua.blessings.tier).mul(KUA_BLESS_TIER.tetr.base.kuaRankActive);
                if (!tmp.value.kua.active.blessings.ranks.tetr) {
                    eff = D(0);
                }
                return eff;
            },
            get kuaRankIdle() {
                let eff = KUA_BLESS_TIER.tetr.rounded(tmp.value.kua.blessings.tier).mul(KUA_BLESS_TIER.tetr.base.kuaRankIdle);
                if (!tmp.value.kua.active.blessings.ranks.tetr) {
                    eff = D(0);
                }
                return eff;
            },
            get pr2Eff() {
                let eff = Decimal.pow(KUA_BLESS_TIER.tetr.base.pr2Eff, player.value.gameProgress.main.pr2.amount);
                if (!tmp.value.kua.active.blessings.ranks.tetr) {
                    eff = D(1);
                }
                return eff;
            },
        },
        desc: {
            get kuaRankActive() {
                return `Increase KB Rank's active base by +${format(KUA_BLESS_TIER.tetr.base.kuaRankActive.mul(100))}% (additive). Currently: +${format(KUA_BLESS_TIER.tetr.effects.kuaRankActive.mul(100))}%`;
            },
            get kuaRankIdle() {
                return `Increase KB Rank's idle base by +${format(KUA_BLESS_TIER.tetr.base.kuaRankIdle.mul(100))}% (additive). Currently: +${format(KUA_BLESS_TIER.tetr.effects.kuaRankIdle.mul(100))}%`;
            },
            get pr2Eff() {
                return `Increase KB gain by ${format(KUA_BLESS_TIER.tetr.base.pr2Eff, 3)}× for each PR2. Currently: ${format(KUA_BLESS_TIER.tetr.effects.pr2Eff, 2)}×`;
            },
        }
    },
}

export type KuaBlessUpg = {
    show: boolean,
    cost: (x?: DecimalSource) => Decimal,
    target: (x: DecimalSource) => Decimal,
    desc: (x?: DecimalSource) => string,
    effDesc: (x?: DecimalSource) => string,
    eff: (x?: DecimalSource) => Array<Decimal>
}

export const KUA_BLESS_UPGS: Array<KuaBlessUpg> = [
    {
        show: true,
        cost(x = player.value.gameProgress.kua.blessings.upgrades[0]) {
            let cost = smoothExp(smoothPoly(x, 2, 35, false), 1.02, false).pow_base(2.5).mul(10);
            if (cost.lt("ee6")) {
                cost = cost.sub(cost.mod(cost.log10().sub(1).floor().pow10()));
            }
            return cost;
        },
        target(x) {
            if (Decimal.lt(x, 10)) { return D(-1); }
            let target = D(x);
            if (target.lt("ee6")) {
                target = target.sub(target.mod(target.log10().sub(1).floor().pow10()));
            }
            return smoothPoly(smoothExp(Decimal.div(target, 10).log(2.5), 1.02, true), 2, 35, true);
        },
        desc(x = player.value.gameProgress.kua.blessings.upgrades[0]) {
            let txt = `KBs boost Upgrade 2's effect.`;
            if (Decimal.gte(x, 6)) {
                txt += ` KShards and KPower effects act like they're higher based off of your KBs.`;
            }
            if (Decimal.gte(x, 12)) {
                txt += ` Upgrade 1-6's superscaling start is delayed based off of your KBs.`;
            }
            return txt;
        },
        effDesc(x = player.value.gameProgress.kua.blessings.upgrades[0]) {
            let txt = `^${format(this.eff(x)[0], 3)}`;
            if (Decimal.gte(x, 6)) {
                txt += `, ×${format(this.eff(x)[1], 1)}`;
            }
            if (Decimal.gte(x, 12)) {
                txt += `, +${format(this.eff(x)[2], 2)}`;
            }
            return txt;
        },
        eff(x = player.value.gameProgress.kua.blessings.upgrades[0]) {
            if (!tmp.value.kua.active.blessings.upgrades[0]) {
                x = D(0);
            }
            const arr = [
                Decimal.add(player.value.gameProgress.kua.blessings.amount, 1).ln().div(100).mul(Decimal.sqrt(x)).add(1).root(1.5),
                Decimal.gte(x, 6) 
                    ? Decimal.add(player.value.gameProgress.kua.blessings.amount, 1).pow(Decimal.sub(x, 4).sqrt().sub(1).div(2))
                    : D(1),
                Decimal.gte(x, 12) 
                    ? Decimal.add(player.value.gameProgress.kua.blessings.amount, 1).ln().add(1).pow(Decimal.sub(x, 11).sqrt().div(2)).sub(1).div(Decimal.sub(player.value.gameProgress.kua.blessings.upgrades[0], 11).sqrt().div(2)).div(10).add(1).ln().mul(10)
                    : D(0),
            ];
            if (arr[0].gte(50)) {
                arr[0] = scale(arr[0], 0.2, false, 50, 1, 0.5);
            }
            return arr;
        }
    },
    {
        get show() {
            return Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[0], 1);
        },
        cost(x = player.value.gameProgress.kua.blessings.upgrades[1]) {
            let cost = smoothExp(smoothPoly(x, 3, 50, false), 1.03, false).pow_base(3).mul(100);
            if (cost.lt("ee6")) {
                cost = cost.sub(cost.mod(cost.log10().sub(1).floor().pow10()));
            }
            return cost;
        },
        target(x) {
            if (Decimal.lt(x, 100)) { return D(-1); }
            let target = D(x);
            if (target.lt("ee6")) {
                target = target.sub(target.mod(target.log10().sub(1).floor().pow10()));
            }
            return smoothPoly(smoothExp(Decimal.div(target, 100).log(3), 1.03, true), 3, 50, true);
        },
        desc(x = player.value.gameProgress.kua.blessings.upgrades[1]) {
            let txt = `KBs delay Upgrade 1's hyper scaling.`;
            if (Decimal.gte(x, 6)) {
                txt += ` KB gain is increased based off of how many KB upgrades you've bought.`;
            }
            if (Decimal.gte(x, 12)) {
                txt += ` Raise point gain.`;
            }
            return txt;
        },
        effDesc(x = player.value.gameProgress.kua.blessings.upgrades[1]) {
            let txt = `+${format(this.eff(x)[0], 3)}`;
            if (Decimal.gte(x, 6)) {
                txt += `, ×${format(this.eff(x)[1], 1)}`;
            }
            if (Decimal.gte(x, 12)) {
                txt += `, ^${format(this.eff(x)[2], 2)}`;
            }
            return txt;
        },
        eff(x = player.value.gameProgress.kua.blessings.upgrades[1]) {
            if (!tmp.value.kua.active.blessings.upgrades[1]) {
                x = D(0);
            }
            let totalKB = D(0);
            for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
                totalKB = Decimal.add(totalKB, player.value.gameProgress.kua.blessings.upgrades[i]);
            }
            return [
                Decimal.add(player.value.gameProgress.kua.blessings.amount, 1).ln().mul(Decimal.sqrt(x)),
                Decimal.gte(x, 6) 
                    ? Decimal.pow(Decimal.sub(x, 5).mul(0.01).add(1), totalKB)
                    : D(1),
                Decimal.gte(x, 12) 
                    ? Decimal.sub(x, 11).pow_base(1.01)
                    : D(1),
            ]
        }
    },
    {
        get show() {
            return Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[1], 1);
        },
        cost(x = player.value.gameProgress.kua.blessings.upgrades[2]) {
            let cost = smoothExp(smoothPoly(x, 4, 75, false), 1.04, false).pow_base(4).mul(250);
            if (cost.lt("ee6")) {
                cost = cost.sub(cost.mod(cost.log10().sub(1).floor().pow10()));
            }
            return cost;
        },
        target(x) {
            if (Decimal.lt(x, 250)) { return D(-1); }
            let target = D(x);
            if (target.lt("ee6")) {
                target = target.sub(target.mod(target.log10().sub(1).floor().pow10()));
            }
            return smoothPoly(smoothExp(Decimal.div(target, 250).log(4), 1.04, true), 4, 75, true);
        },
        desc(x = player.value.gameProgress.kua.blessings.upgrades[2]) {
            let txt = `Kuaraniai gain is boosted.`;
            if (Decimal.gte(x, 6)) {
                txt += ` Kuaraniai's gain exponent is boosted.`;
            }
            if (Decimal.gte(x, 12)) {
                txt += ` Boost KShard and KPower gain.`;
            }
            return txt;
        },
        effDesc(x = player.value.gameProgress.kua.blessings.upgrades[2]) {
            let txt = `×${format(this.eff(x)[0])}`;
            if (Decimal.gte(x, 6)) {
                txt += `, +${format(this.eff(x)[1], 3)}`;
            }
            if (Decimal.gte(x, 12)) {
                txt += `, ×${format(this.eff(x)[2])}`;
            }
            return txt;
        },
        eff(x = player.value.gameProgress.kua.blessings.upgrades[2]) {
            if (!tmp.value.kua.active.blessings.upgrades[2]) {
                x = D(0);
            }
            return [
                Decimal.pow(2, x),
                Decimal.gte(x, 6) 
                    ? Decimal.sub(x, 5).mul(0.01)
                    : D(0),
                Decimal.gte(x, 12) 
                    ? Decimal.sub(x, 10).factorial()
                    : D(1),
            ]
        }
    },
    {
        get show() {
            return Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 1);
        },
        cost(x = player.value.gameProgress.kua.blessings.upgrades[3]) {
            let cost = smoothExp(smoothPoly(x, 5, 100, false), 1.05, false).pow_base(5).mul(1000);
            if (cost.lt("ee6")) {
                cost = cost.sub(cost.mod(cost.log10().sub(1).floor().pow10()));
            }
            return cost;
        },
        target(x) {
            if (Decimal.lt(x, 1000)) { return D(-1); }
            let target = D(x);
            if (target.lt("ee6")) {
                target = target.sub(target.mod(target.log10().sub(1).floor().pow10()));
            }
            return smoothPoly(smoothExp(Decimal.div(target, 1000).log10(), 1.05, true), 5, 100, true);
        },
        desc(x = player.value.gameProgress.kua.blessings.upgrades[3]) {
            let txt = `KBlessings boost KShard and KPower gain.`;
            if (Decimal.gte(x, 6)) {
                txt += ` KShards and KPower gain boost each other.`;
            }
            if (Decimal.gte(x, 12)) {
                txt += ` Slow down the KB Rank requirement.`;
            }
            return txt;
        },
        effDesc(x = player.value.gameProgress.kua.blessings.upgrades[3]) {
            let txt = `×${format(this.eff(x)[0], 2)}`;
            if (Decimal.gte(x, 6)) {
                txt += `, ×log10(x)^${format(this.eff(x)[1], 2)}`;
            }
            if (Decimal.gte(x, 12)) {
                txt += `, ${formatPerc(this.eff(x)[2], 2)}`;
            }
            return txt;
        },
        eff(x = player.value.gameProgress.kua.blessings.upgrades[3]) {
            if (!tmp.value.kua.active.blessings.upgrades[3]) {
                x = D(0);
            }
            return [
                Decimal.max(player.value.gameProgress.kua.blessings.amount, 1).log10().sqrt().add(1).pow(Decimal.pow(x, 0.75)),
                Decimal.gte(x, 6) 
                    ? Decimal.sub(x, 5).sqrt().mul(0.25)
                    : D(0),
                Decimal.gte(x, 12) 
                    ? Decimal.sub(x, 11).div(50).add(1)
                    : D(1),
            ]
        }
    }
]

export const initAllKBlessingUpgrades = () => {
    const arr = [];
    for (let i = KUA_BLESS_UPGS.length - 1; i >= 0; i--) {
        arr.push(
            {
                canBuy: false
            }
        );
    }
    return arr;
}

export const gainKPOnClick = () => {
    player.value.gameProgress.kua.blessings.amount = Decimal.add(player.value.gameProgress.kua.blessings.amount, tmp.value.kua.blessings.perClick);
    if (player.value.gameProgress.col.inAChallenge) {
        player.value.gameProgress.col.time = Decimal.sub(player.value.gameProgress.col.time, 0.05);
    }
}

export const buyKPUpg = (id: number) => {
    if (Decimal.gte(player.value.gameProgress.kua.blessings.amount, KUA_BLESS_UPGS[id].cost(player.value.gameProgress.kua.blessings.upgrades[id]))) {
        player.value.gameProgress.kua.blessings.amount = Decimal.sub(player.value.gameProgress.kua.blessings.amount, KUA_BLESS_UPGS[id].cost(player.value.gameProgress.kua.blessings.upgrades[id]));
        player.value.gameProgress.kua.blessings.upgrades[id] = Decimal.add(player.value.gameProgress.kua.blessings.upgrades[id], 1);
    }
}

export const getKuaUpgrade = (sp: "s" | "p" | "k", id: number): boolean => {
    if (sp === "s") {
        return (
            player.value.gameProgress.kua.kshards.upgrades >= id &&
            tmp.value.kua.active.kshards.upgrades
        );
    }
    if (sp === "p") {
        return (
            player.value.gameProgress.kua.kpower.upgrades >= id &&
            tmp.value.kua.active.kpower.upgrades
        );
    }
    if (sp === "k") {
        return (
            player.value.gameProgress.kua.upgrades >= id &&
            tmp.value.kua.active.upgrades
        );
    }
    throw new Error(`${sp} is not a valid kua upgrade type!`);
};

export type Kua_Upgrade_List = {
    KShards: Array<Kua_Upgrade>;
    KPower: Array<Kua_Upgrade>;
    Kua: Array<Kua_Upgrade>;
};

export type Kua_Upgrade = {
    desc: string;
    cost: DecimalSource;
    show: boolean;
    eff?: Decimal;
    eff2?: Decimal;
    implemented?: boolean;
};

export const KUA_UPGRADES: Kua_Upgrade_List = {
    KShards: [
        {
            // 1
            get desc() {
                return `Gain ${format(0.01, 2)}% of your pending PRai per second, and Kuaraniai Gain is multiplied by ${format(1.5, 2)}×`;
            },
            get cost() {
                return D(0.1);
            },
            show: true
        },
        {
            // 2
            get desc() {
                return `KShards boost PRai's effect. Currently: ${format(this.eff!, 2)}×`;
            },
            get eff() {
                let i = D(1);
                if (tmp.value.kua.active.kshards.effects) {
                    i = Decimal.max(tmp.value.kua.effectiveKS, 0);
                    i = i.add(i.mul(4)).add(i.pow(2).mul(4)).add(1).log10().pow(0.85).pow10();
                    if (getKuaUpgrade("s", 10)) {
                        i = i.pow(tmp.value.kua.effects.kshardPrai);
                    }
                }
                return i;
            },
            get cost() {
                return D(1);
            },
            show: true
        },
        {
            // 3
            get desc() {
                return `UP1's effect reduces UP2's scaling strength. Currently: ${formatPerc(this.eff!)}`;
            },
            get eff() {
                let i = D(1);
                i = Decimal.max(tmp.value.main.upgrades[0].effect, 1e10)
                    .log10()
                    .div(10)
                    .sqrt()
                    .sub(1)
                    .div(5)
                    .add(1);
                return i;
            },
            get cost() {
                return D(2);
            },
            show: true
        },
        {
            // 4
            get desc() {
                return `UP1's scaling starts ${format(5)} later and is ${format(5, 3)}% weaker, and superscaling starts ${format(2)} later and is ${format(2, 3)}% weaker.`;
            },
            get cost() {
                return 10;
            },
            show: true
        },
        {
            // 5
            get desc() {
                return `PR2's effect exponent increases twice as fast, UP2's base is increased from ${format(4 / 3, 3)} to ${format(1.5, 3)}.`;
            },
            get cost() {
                return 400;
            },
            show: true
        },
        {
            // 6
            get desc() {
                return `UP2's superscaling and softcap are ${format(20, 3)}% weaker.`;
            },
            get cost() {
                return 2500;
            },
            show: true
        },
        {
            // 7
            get desc() {
                return `Upgrade 1's linear cost scaling is multiplied by ×${format(0.95, 2)}, and Point gain is boosted by Kuaraniai, which increases over time in PRai.`;
            },
            get cost() {
                return 1e7;
            },
            show: true
        },
        {
            // 8
            get desc() {
                return `KPower's UPG2 effect has a better formula, and KShards increase PRai gain. Currently: ${format(this.eff!, 2)}×`;
            },
            get eff() {
                let i = D(1);
                if (tmp.value.kua.active.kshards.effects) {
                    i = Decimal.max(tmp.value.kua.effectiveKS, 1);
                    i = i.pow(0.05).log10().pow(1.5).pow10();
                }
                return i;
            },
            get cost() {
                return 1e8;
            },
            show: true
        },
        {
            // 9
            get desc() {
                return `KShards delay Upgrade 2's cost growth (after scaling). Currently: +${format(this.eff!, 2)} purchases`;
            },
            get eff() {
                let i = Decimal.max(tmp.value.kua.effectiveKS, 10);
                i = i.log10().add(1).pow(4).div(16).ln().div(2).add(1).pow(2);
                return i;
            },
            get cost() {
                return 2e10;
            },
            show: true
        },
        {
            // 10
            get desc() {
                return `Kuaraniai buffs KShard's PRai effect boost and increases KPower gain.`;
            },
            get cost() {
                return 1e13;
            },
            show: true
        },
        {
            // 11
            get desc() {
                return `PR2 above or equal to ${format(45)} boosts Kuaraniai effects. Currently: ^${format(this.eff!, 4)}`;
            },
            get eff() {
                let i = Decimal.max(player.value.gameProgress.main.pr2.amount, 45).sub(45);
                i = i.mul(0.01).add(1).sqrt().sub(1).mul(2).add(1);
                return i;
            },
            get cost() {
                return 1e15;
            },
            show: true
        },
        {
            // 12
            get desc() {
                return `Upgrade 4 boosts Kuaraniai gain at a vastly reduced rate. Currently: ${format(this.eff!, 3)}×`;
            },
            get eff() {
                let i = Decimal.max(tmp.value.main.upgrades[3].effect, 1);
                i = i.log10().pow(0.2).add(1);
                return i;
            },
            get cost() {
                return 1e17;
            },
            show: true
        },
        {
            // 13
            get desc() {
                return `Upgrade 5 boosts KShard gain at a vastly reduced rate. Currently: ${format(this.eff!, 3)}×`;
            },
            get eff() {
                let i = Decimal.max(tmp.value.main.upgrades[4].effect, 1);
                i = i.log10().pow(0.2).add(1);
                return i;
            },
            get cost() {
                return 1e19;
            },
            show: true
        },
        {
            // 14
            get desc() {
                return `Upgrade 6 boosts KPower gain at a vastly increased rate, and Upgrade 3 also affects Upgrade 2 at a reduced rate. Currently: ${format(this.eff!, 3)}×, +${format(this.eff2!, 3)}`;
            },
            get eff() {
                let i = Decimal.add(tmp.value.main.upgrades[5].effect, 1);
                i = i.pow(4);
                return i;
            },
            get eff2() {
                let i = Decimal.max(tmp.value.main.upgrades[2].effect, 1);
                i = i.div(3);
                return i;
            },
            get cost() {
                return 1e22;
            },
            show: true
        },
        {
            // 15
            get desc() {
                return `Unlock Upgrade 7 which raises point gain.`;
            },
            get cost() {
                return 1e25;
            },
            show: true
        },
        {
            // 16
            get desc() {
                return `Unlock Upgrade 8 which raises Upgrade 1's cost.`;
            },
            get cost() {
                return 1e30;
            },
            show: true
        },
        {
            // 17
            get desc() {
                return `Unlock Upgrade 9 which multiplies Upgrade 1's base.`;
            },
            get cost() {
                return 1e35;
            },
            show: true
        },
    ],
    KPower: [
        {
            // 1
            get desc() {
                return `Multiply KShard gain by ${format(2.5, 1)}x, and KPower buffs Upgrade 2's base. Currently: +${format(this.eff!, 4)}`;
            },
            get eff() {
                let i = D(0);
                if (tmp.value.kua.active.kpower.effects) {
                    i = Decimal.max(tmp.value.kua.effectiveKP, 0)
                        .add(1)
                        .log10()
                        .add(1)
                        .log10()
                        .add(1)
                        .pow(2)
                        .sub(1)
                        .div(20);
                    if (getKuaUpgrade("s", 8)) {
                        i = Decimal.max(tmp.value.kua.effectiveKP, 0)
                            .add(1)
                            .log10()
                            .div(30)
                            .max(i);
                    }
                }
                return i;
            },
            get cost() {
                return 1;
            },
            show: true
        },
        {
            // 2
            get desc() {
                return `Be able to unlock a new feature at ${format(1e2)} Kuaraniai, and KPower increases UP3's effectiveness. Currently: +${format(this.eff!.sub(1).mul(100), 3)}%`;
            },
            get eff() {
                let i = D(1);
                if (tmp.value.kua.active.kpower.effects) {
                    i = Decimal.max(tmp.value.kua.effectiveKP, 0)
                        .add(1)
                        .log10()
                        .add(1)
                        .root(4)
                        .sub(1)
                        .div(20)
                        .add(1);
                }
                return i;
            },
            get cost() {
                return 1e2;
            },
            show: true
        },
        {
            // 3
            get desc() {
                return `Kuaraniai's effect on UP1's scaling uses a better formula, and add another effect.`;
            },
            get cost() {
                return 1e3;
            },
            show: true
        },
        {
            // 4
            get desc() {
                return `UP2's softcap is ${format(40, 3)}% weaker and starts later based off of your KPower. Currently: ${format(this.eff!, 2)}x`;
            },
            get eff() {
                let i = D(1);
                if (tmp.value.kua.active.kpower.effects) {
                    i = Decimal.max(tmp.value.kua.effectiveKP, 0)
                        .add(1)
                        .log10()
                        .pow(1.05)
                        .pow10()
                        .pow(0.75);
                }
                return i;
            },
            get cost() {
                return 8500;
            },
            show: true
        },
        {
            // 5
            get desc() {
                return `PRai's effect is more powerful based off of your KPower. Currently: ^${format(this.eff!, 4)}`;
            },
            get eff() {
                let res = D(1);
                if (tmp.value.kua.active.kpower.effects) {
                    res = Decimal.max(tmp.value.kua.effectiveKP, 1)
                        .log10()
                        .add(1)
                        .log2()
                        .div(50)
                        .add(1); // 1 = ^1, 10 = ^1.02, 1,000 = ^1.04, 1e7 = ^1.06, 1e15 = ^1.08, 1e31 = ^1.1
                }
                return res;
            },
            get cost() {
                return 5e4;
            },
            show: true
        },
        {
            // 6
            get desc() {
                return `Kuaraniai also delays Upgrade 2's softcap, and its effect of Upgrade 1's scaling also apply to superscaling at a reduced rate.`;
            },
            get cost() {
                return 1e6;
            },
            show: true
        },
        {
            // 7
            get desc() {
                return `Upgrade 2's effect is cubed, but its other effects are not boosted.`;
            },
            get cost() {
                return 1e8;
            },
            show: true
        },
        {
            // 8
            get desc() {
                return `Upgrade 1 is dilated by ^${format(1.01, 2)}, PR2's effect uses a better formula, and unlock KBlessings at ${format(1e6)} Kuaraniai.`;
            },
            get cost() {
                return 1e11;
            },
            show: true
        },
        {
            // 9
            get desc() {
                return `PR2 slightly weakens UP1 and UP2's hyper scaling. Currently: ${formatPerc(this.eff!)}`;
            },
            get eff() {
                if (Decimal.lt(player.value.gameProgress.main.pr2.amount, 25)) {
                    return D(1);
                }
                let eff = Decimal.sub(player.value.gameProgress.main.pr2.amount, 25);
                eff = eff.div(eff.add(20)).mul(0.25).add(1);
                return eff;
            },
            get cost() {
                return 1e15;
            },
            show: true
        },
        {
            // 10
            get desc() {
                return `UP1 and UP2's cost scaling is reduced based off of your points. Currently: ${formatPerc(this.eff!)}`;
            },
            get eff() {
                let eff = Decimal.max(player.value.gameProgress.main.points, 1e10);
                eff = eff.log10().log10().ln().div(50).add(1).sqrt();
                return eff;
            },
            get cost() {
                return 1e18;
            },
            show: true
        },
        {
            // 11
            get desc() {
                return `Upgrades 4, 5, and 6's cost scaling is ${format(10)}% slower.`;
            },
            get cost() {
                return 1e21;
            },
            show: true
        },
        {
            // 12
            get desc() {
                return `One-Upgrade #4 is improved.`;
            },
            get cost() {
                return 1e24;
            },
            show: true
        },
        {
            // 13
            get desc() {
                return `Upgrade 2's linear cost scaling is reduced by ×${format(0.92, 2)}.`;
            },
            get cost() {
                return 1e28;
            },
            show: true
        },
        {
            // 14
            get desc() {
                return `One-Upgrade #6 is ${format(10)}% stronger.`;
            },
            get cost() {
                return 1e33;
            },
            show: true
        },
        {
            // 15
            get desc() {
                return `Kuaraniai’s effects are ${format(5)}% stronger.`;
            },
            get cost() {
                return 1e40;
            },
            show: true
        },
        {
            // 16
            get desc() {
                return `Upgrade 1's effectiveness is increased based off of how much KPower you have. Currently: +${format(this.eff!.sub(1).mul(100), 3)}%`;
            },
            get eff() {
                let eff = Decimal.max(tmp.value.kua.effectiveKP, 1e45);
                eff = eff.log10().log(45).sub(1).div(5).add(1);
                return eff;
            },
            get cost() {
                return 1e45;
            },
            show: true
        },
        {
            // 17
            get desc() {
                return `All KShards and KPower's effects are stronger based off of their respective resource. Currently: KS: ${format(this.eff!.sub(1).mul(100), 3)}%, KP: ${format(this.eff2!.sub(1).mul(100), 3)}%`;
            },
            get eff() {
                let eff = Decimal.max(tmp.value.kua.effectiveKS, 1);
                eff = eff.log10().sqrt().div(250).add(1).ln().add(1);
                return eff;
            },
            get eff2() {
                let eff = Decimal.max(tmp.value.kua.effectiveKP, 1);
                eff = eff.log10().cbrt().div(250).add(1).ln().add(1);
                return eff;
            },
            get cost() {
                return 1e50;
            },
            show: true
        }
    ],
    Kua: [
        {
            // 1
            get desc() {
                return `Improve the PRai generatior by ${format(100)}×.`;
            },
            get cost() {
                return D(1e7);
            },
            show: true
        },
        {
            // 2
            get desc() {
                return `KBlessing gain is multiplied by your Kuaraniai amount.`;
            },
            get cost() {
                return D(1e8);
            },
            show: true
        },
        {
            // 3
            get desc() {
                return `Increase the KShard and KPower effect to PRai and Points, and unlock KProofs.`;
            },
            get cost() {
                return D(1e9);
            },
            show: true
        },
        {
            // 4
            get desc() {
                return `Decrease the PR2 scaling down to ${format(8)} and increase the KShard and KPower effect to PRai and Points.`;
            },
            get cost() {
                return D(1e11);
            },
            show: true
        },
        {
            // 5
            get desc() {
                return `Multiply Upgrade 6's base by ${format(1.5, 2)}×, decrease the PR2 scaling down to ${format(7)}, and increase the KShard and KPower effect to PRai and Points.`;
            },
            get cost() {
                return D(1e13);
            },
            show: true
        },
    ]
};

export const KUA_ENHANCERS = {
    sources: [
        {
            get source() {
                return player.value.gameProgress.main.points;
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
                return player.value.gameProgress.main.prai.amount;
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
                return player.value.gameProgress.kua.amount;
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
            effect(xp = player.value.gameProgress.kua.enhancers.enhanceXP[0], pow = tmp.value.kua.trueEnhPower[0]) {
                const effect = Decimal.max(xp, 0).mul(0.0025).add(1).ln().mul(0.1).add(1).pow(pow).sub(1);
                return effect;
            }
        },
        {
            color: "#ffffff",
            get desc() {
                return `Increase UP2's base by +${format(this.effect(), 4)}`;
            },
            effect(xp = player.value.gameProgress.kua.enhancers.enhanceXP[1], pow = tmp.value.kua.trueEnhPower[1]) {
                const effect = Decimal.max(xp, 0).mul(0.00025).add(1).root(10).sub(1).mul(10).add(1).pow(pow).sub(1);
                return effect;
            }
        },
        {
            color: "#ffffff",
            get desc() {
                return `Increase UP3's base by +${format(this.effect(), 4)}`;
            },
            effect(xp = player.value.gameProgress.kua.enhancers.enhanceXP[2], pow = tmp.value.kua.trueEnhPower[2]) {
                const effect = Decimal.max(xp, 0).mul(0.0025).add(1).ln().mul(0.001).add(1).pow(pow).sub(1);
                return effect;
            }
        },
        {
            color: "#8000ff",
            get desc() {
                return `Weaken UP4's cost growth (after scaling) by ${formatPerc(this.effect(), 3)}`;
            },
            effect(xp = player.value.gameProgress.kua.enhancers.enhanceXP[3], pow = tmp.value.kua.trueEnhPower[3]) {
                const effect = Decimal.max(xp, 0).mul(0.01).add(1).ln().mul(0.1).mul(pow).add(1);
                return effect;
            }
        },
        {
            color: "#8000ff",
            get desc() {
                return `Weaken UP5's cost growth (after scaling) by ${formatPerc(this.effect(), 3)}`;
            },
            effect(xp = player.value.gameProgress.kua.enhancers.enhanceXP[4], pow = tmp.value.kua.trueEnhPower[4]) {
                const effect = Decimal.max(xp, 0).mul(0.01).add(1).ln().mul(0.1).mul(pow).add(1);
                return effect;
            }
        },
        {
            color: "#8000ff",
            get desc() {
                return `Weaken UP6's cost growth (after scaling) by ${formatPerc(this.effect(), 3)}`;
            },
            effect(xp = player.value.gameProgress.kua.enhancers.enhanceXP[5], pow = tmp.value.kua.trueEnhPower[5]) {
                const effect = Decimal.max(xp, 0).mul(0.01).add(1).ln().mul(0.1).mul(pow).add(1);
                return effect;
            }
        },
        {
            color: "#c0d0e0",
            get desc() {
                return `Weaken PR2's cost growth (after scaling) by ${formatPerc(this.effect(), 3)}`;
            },
            effect(xp = player.value.gameProgress.kua.enhancers.enhanceXP[6], pow = tmp.value.kua.trueEnhPower[6]) {
                const effect = Decimal.max(xp, 0).mul(0.005).add(1).ln().mul(0.05).mul(pow).add(1);
                return effect;
            }
        }
    ]
};

export const updateAllKua = (delta: DecimalSource) => {
    tmp.value.kua.canBuyUpg = false;
    updateKua(-1, delta);
    updateKua(3, delta);
    updateKua(2, delta);
    updateKua(1, delta);
    updateKua(0, delta);
};

export const updateKua = (type: number, delta: DecimalSource) => {
    let i, j, k, generate, decayExp, data, calc, scal;
    switch (type) {
        case -1:
            tmp.value.kua.active.blessings.gain = true;
            tmp.value.kua.active.blessings.effects = true;
            tmp.value.kua.active.blessings.ranks.rank = true;
            tmp.value.kua.active.blessings.ranks.tier = true;
            tmp.value.kua.active.blessings.ranks.tetr = true;
            for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
                tmp.value.kua.active.blessings.upgrades[i] = true;
            }
            tmp.value.kua.active.proofs.gain = true;
            for (const i in KUA_PROOF_UPGS) {
                for (let j = 0; j < KUA_PROOF_UPGS[i as KuaProofUpgTypes].length; j++) {
                    tmp.value.kua.active.proofs.upgrades[i as KuaProofUpgTypes][j] = true;
                }
            }
            tmp.value.kua.active.kpower.upgrades = true;
            tmp.value.kua.active.kpower.effects = true;
            tmp.value.kua.active.kpower.gain = true;
            tmp.value.kua.active.kshards.upgrades = true;
            tmp.value.kua.active.kshards.effects = true;
            tmp.value.kua.active.kshards.gain = true;
            tmp.value.kua.active.upgrades = true;
            tmp.value.kua.active.effects = true;
            tmp.value.kua.active.gain = true;

            if (inChallenge("nk")) {
                tmp.value.kua.active.blessings.gain = false;
                tmp.value.kua.active.blessings.effects = false;
                tmp.value.kua.active.blessings.ranks.rank = false;
                tmp.value.kua.active.blessings.ranks.tier = false;
                tmp.value.kua.active.blessings.ranks.tetr = false;
                for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
                    tmp.value.kua.active.blessings.upgrades[i] = false;
                }
                tmp.value.kua.active.proofs.gain = false;
                for (const i in KUA_PROOF_UPGS) {
                    for (let j = 0; j < KUA_PROOF_UPGS[i as KuaProofUpgTypes].length; j++) {
                        tmp.value.kua.active.proofs.upgrades[i as KuaProofUpgTypes][j] = false;
                    }
                }
                tmp.value.kua.active.kpower.upgrades = false;
                tmp.value.kua.active.kpower.effects = false;
                tmp.value.kua.active.kpower.gain = false;
                tmp.value.kua.active.kshards.upgrades = false;
                tmp.value.kua.active.kshards.effects = false;
                tmp.value.kua.active.kshards.gain = false;
                tmp.value.kua.active.upgrades = false;
                tmp.value.kua.active.effects = false;
                tmp.value.kua.active.gain = false;
            }
            break;
        case 3:
            player.value.gameProgress.kua.proofs.strange.cooldown = Decimal.sub(player.value.gameProgress.kua.proofs.strange.cooldown, delta);
            player.value.gameProgress.kua.proofs.finicky.cooldown = Decimal.sub(player.value.gameProgress.kua.proofs.finicky.cooldown, delta);

            tmp.value.kua.proofs.skpEff = D(0);
            tmp.value.kua.proofs.skpEff = Decimal.add(player.value.gameProgress.kua.proofs.strange.amount, 1).log2().add(1).ln().div(2).add(1).pow(2).sub(1).mul(2);

            tmp.value.kua.proofs.fkpEff = D(0);
            tmp.value.kua.proofs.fkpEff = Decimal.add(player.value.gameProgress.kua.proofs.finicky.amount, 1).log10().sqrt()

            tmp.value.kua.proofs.canBuyUpg = false;
            tmp.value.kua.proofs.canBuyUpgs.effect = false;
            tmp.value.kua.proofs.canBuyUpgs.kp = false;
            tmp.value.kua.proofs.canBuyUpgs.skp = false;
            tmp.value.kua.proofs.canBuyUpgs.fkp = false;
            for (let i = 0; i < Object.keys(KUA_PROOF_UPGS).length; i++) {
                for (let j = 0; j < KUA_PROOF_UPGS[Object.keys(KUA_PROOF_UPGS)[i] as KuaProofUpgTypes].length; j++) {
                    k = Object.keys(KUA_PROOF_UPGS)[i] as KuaProofUpgTypes;
                    switch (k) {
                        case 'effect':
                        case 'kp':
                            data = player.value.gameProgress.kua.proofs.amount;
                            break;
                        case 'skp':
                            data = player.value.gameProgress.kua.proofs.strange.amount;
                            break;
                        case 'fkp':
                            data = player.value.gameProgress.kua.proofs.finicky.amount;
                            break;
                        default:
                            throw new Error(`${k} is not a valid type!! (failed in updateKua KProof section)`)
                    }

                    scal = KUA_PROOF_UPGS[k][j].target(data);
                    if (k === 'kp' && (j >= 0 && j <= 2)) {
                        scal = scal.add(tmp.value.kua.proofs.upgrades.skp[2].effect);
                    }
                    tmp.value.kua.proofs.upgrades[k][j].target = scal;
                    NaNCheck(tmp.value.kua.proofs.upgrades[k][j].target, `KProof ${k} Upgrade #${j+1} was able to buy NaN levels by autobuying!`);

                    tmp.value.kua.proofs.upgrades[k][j].canBuy = Decimal.gte(data, tmp.value.kua.proofs.upgrades[k][j].cost) && KUA_PROOF_UPGS[k][j].show;

                    data = player.value.gameProgress.kua.proofs.automationBought[k][j] && player.value.gameProgress.kua.proofs.automationEnabled[k][j];
                    tmp.value.kua.proofs.canBuyUpg = tmp.value.kua.proofs.canBuyUpg || (tmp.value.kua.proofs.upgrades[k][j].canBuy && !data);
                    tmp.value.kua.proofs.canBuyUpgs[k] = tmp.value.kua.proofs.canBuyUpgs[k] || (tmp.value.kua.proofs.upgrades[k][j].canBuy && !data);
                    tmp.value.kua.canBuyUpg = tmp.value.kua.canBuyUpg || (tmp.value.kua.proofs.upgrades[k][j].canBuy && !data);

                    if (data) {
                        player.value.gameProgress.kua.proofs.upgrades[k][j] = tmp.value.kua.proofs.upgrades[k][j].target.floor().add(1).max(player.value.gameProgress.kua.proofs.upgrades[k][j]);
                    }
                    
                    data = D(0);
                    if (k === 'effect') {
                        if (j >= 0 && j <= 2) {
                            data = data.add(tmp.value.kua.proofs.upgrades.skp[0].effect);
                        }
                    }
                    if (k === 'kp') {
                        if (j >= 0 && j <= 2) {
                            data = data.add(tmp.value.kua.proofs.skpEff);
                            data = data.add(tmp.value.kua.proofs.upgrades.skp[1].effect);
                        }
                        if (j >= 3 && j <= 5) {
                            data = data.add(tmp.value.kua.proofs.upgrades.kp[8].effect);
                        }
                    }
                    tmp.value.kua.proofs.upgrades[k][j].freeExtra = data;
                    NaNCheck(tmp.value.kua.proofs.upgrades[k][j].freeExtra, `KProof ${k} Upgrade #${j+1} had NaN free levels!`);
                    tmp.value.kua.proofs.upgrades[k][j].trueLevel = Decimal.add(player.value.gameProgress.kua.proofs.upgrades[k][j], tmp.value.kua.proofs.upgrades[k][j].freeExtra);
                    if (!tmp.value.kua.active.proofs.upgrades[k][j]) {
                        tmp.value.kua.proofs.upgrades[k][j].trueLevel = D(0);
                    }

                    scal = D(player.value.gameProgress.kua.proofs.upgrades[k][j]);
                    if (k === 'kp' && (j >= 0 && j <= 2)) {
                        scal = scal.sub(tmp.value.kua.proofs.upgrades.skp[2].effect);
                    }
                    tmp.value.kua.proofs.upgrades[k][j].cost = KUA_PROOF_UPGS[k][j].cost(scal);

                    tmp.value.kua.proofs.upgrades[k][j].effect = KUA_PROOF_UPGS[k][j].effect(tmp.value.kua.proofs.upgrades[k][j].trueLevel);

                    NaNCheck(tmp.value.kua.proofs.upgrades[k][j].effect, `KProof ${k} Upgrade #${j+1} had a NaN effect!`);
                }
            }

            tmp.value.kua.proofs.canBuyUpgs.auto = false;
            for (let i = 0; i < KUA_PROOF_AUTO.other.length; i++) {
                tmp.value.kua.proofs.canBuyUpgs.auto = tmp.value.kua.proofs.canBuyUpgs.auto || (KUA_PROOF_AUTO.other[i] && player.value.gameProgress.kua.proofs.automationBought.other[i]);
            }
            for (let i = 0; i < KUA_PROOF_AUTO.effect.length; i++) {
                tmp.value.kua.proofs.canBuyUpgs.auto = tmp.value.kua.proofs.canBuyUpgs.auto || (KUA_PROOF_AUTO.effect[i] && player.value.gameProgress.kua.proofs.automationBought.effect[i]);
            }
            for (let i = 0; i < KUA_PROOF_AUTO.kp.length; i++) {
                tmp.value.kua.proofs.canBuyUpgs.auto = tmp.value.kua.proofs.canBuyUpgs.auto || (KUA_PROOF_AUTO.kp[i] && player.value.gameProgress.kua.proofs.automationBought.kp[i]);
            }
            for (let i = 0; i < KUA_PROOF_AUTO.skp.length; i++) {
                tmp.value.kua.proofs.canBuyUpgs.auto = tmp.value.kua.proofs.canBuyUpgs.auto || (KUA_PROOF_AUTO.skp[i] && player.value.gameProgress.kua.proofs.automationBought.skp[i]);
            }
            for (let i = 0; i < KUA_PROOF_AUTO.fkp.length; i++) {
                tmp.value.kua.proofs.canBuyUpgs.auto = tmp.value.kua.proofs.canBuyUpgs.auto || (KUA_PROOF_AUTO.fkp[i] && player.value.gameProgress.kua.proofs.automationBought.fkp[i]);
            }

            if (player.value.gameProgress.kua.proofs.automationBought.other[0] && player.value.gameProgress.kua.proofs.automationEnabled.other[0]) {
                resetFromSKP(false, player.value.gameProgress.kua.proofs.automationBought.other[1] && player.value.gameProgress.kua.proofs.automationEnabled.other[1], player.value.gameProgress.kua.proofs.automationBought.other[2] && player.value.gameProgress.kua.proofs.automationEnabled.other[2], delta);
            }

            tmp.value.kua.proofs.exp = D(1);
            setFactor(0, [4, 6], "Base", `${format(1, 2)}`, `^${format(tmp.value.kua.proofs.exp, 2)}`, true);
            tmp.value.kua.proofs.exp = tmp.value.kua.proofs.exp.add(tmp.value.kua.proofs.upgrades.kp[0].effect);
            setFactor(1, [4, 6], "Simple Breakthrough", `+${format(tmp.value.kua.proofs.upgrades.kp[0].effect, 2)}`, `^${format(tmp.value.kua.proofs.exp, 2)}`, tmp.value.kua.proofs.upgrades.kp[0].effect.gt(0), "kp");
            tmp.value.kua.proofs.exp = tmp.value.kua.proofs.exp.add(tmp.value.kua.proofs.upgrades.kp[1].effect);
            setFactor(2, [4, 6], "Trial and Error", `+${format(tmp.value.kua.proofs.upgrades.kp[1].effect, 2)}`, `^${format(tmp.value.kua.proofs.exp, 2)}`, tmp.value.kua.proofs.upgrades.kp[1].effect.gt(0), "kp");
            tmp.value.kua.proofs.exp = tmp.value.kua.proofs.exp.add(tmp.value.kua.proofs.fkpEff);
            setFactor(3, [4, 6], "Finicky KProof Effect", `+${format(tmp.value.kua.proofs.fkpEff, 2)}`, `^${format(tmp.value.kua.proofs.exp, 2)}`, tmp.value.kua.proofs.fkpEff.gt(0), "fkp");
            tmp.value.kua.proofs.exp = tmp.value.kua.proofs.exp.mul(tmp.value.kua.proofs.upgrades.kp[2].effect);
            setFactor(4, [4, 6], "Crafted Experiments", `×${format(tmp.value.kua.proofs.upgrades.kp[2].effect, 2)}`, `^${format(tmp.value.kua.proofs.exp, 2)}`, tmp.value.kua.proofs.upgrades.kp[2].effect.gt(1), "kp");

            tmp.value.kua.proofs.skpExp = getStrangeKPExp(player.value.gameProgress.kua.proofs.strange.hiddenExp, true);
            tmp.value.kua.proofs.fkpExp = getFinickyKPExp(player.value.gameProgress.kua.proofs.finicky.hiddenExp, true);

            if (player.value.gameProgress.unlocks.kproofs.main && tmp.value.kua.active.proofs.gain) {
                data = Decimal.add(player.value.gameProgress.kua.proofs.amount, 1).root(tmp.value.kua.proofs.exp).add(delta).pow(tmp.value.kua.proofs.exp).sub(1);
                calc = Decimal.add(player.value.gameProgress.kua.proofs.amount, 1).root(tmp.value.kua.proofs.exp).add(1).pow(tmp.value.kua.proofs.exp).sub(1);

                const softcaps = {
                    prevEff: calc,
                    scal: getSCSLAttribute('kp', false)
                }

                if (data.gte(softcaps.scal[1].start)) {
                    data = scale(data, 2, true, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
                    calc = scale(calc, 2, true, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
                    player.value.gameProgress.kua.proofs.amount = scale(player.value.gameProgress.kua.proofs.amount, 2, true, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
                    setSCSLEffectDisp('kp', false, 1, `${format(calc.log(softcaps.prevEff), 3)}√`);
                }

                if (data.gte(softcaps.scal[0].start)) {
                    data = scale(data, 0, true, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
                    calc = scale(calc, 0, true, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
                    player.value.gameProgress.kua.proofs.amount = scale(player.value.gameProgress.kua.proofs.amount, 0, true, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
                    setSCSLEffectDisp('kp', false, 0, `/${format(calc.div(softcaps.prevEff), 3)}`);
                }

                player.value.gameProgress.kua.proofs.amount = Decimal.add(player.value.gameProgress.kua.proofs.amount, 1).root(tmp.value.kua.proofs.exp).add(delta).pow(tmp.value.kua.proofs.exp).sub(1);

                if (data.gte(softcaps.scal[0].start)) {
                    data = scale(data, 0, false, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
                    player.value.gameProgress.kua.proofs.amount = scale(player.value.gameProgress.kua.proofs.amount, 0, false, softcaps.scal[0].start, softcaps.scal[0].power, softcaps.scal[0].basePow);
                }

                if (data.gte(softcaps.scal[1].start)) {
                    data = scale(data, 2, false, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
                    player.value.gameProgress.kua.proofs.amount = scale(player.value.gameProgress.kua.proofs.amount, 2, false, softcaps.scal[1].start, softcaps.scal[1].power, softcaps.scal[1].basePow);
                }
            }
            break;
        case 2:
            tmp.value.kua.blessings.rank = KUA_BLESS_TIER.rank.rounded(player.value.gameProgress.kua.blessings.best[3]!);
            tmp.value.kua.blessings.tier = KUA_BLESS_TIER.tier.rounded(tmp.value.kua.blessings.rank);
            tmp.value.kua.blessings.tetr = KUA_BLESS_TIER.tetr.rounded(tmp.value.kua.blessings.tier);

            tmp.value.kua.blessings.perClick = D(0.1);
            tmp.value.kua.blessings.perSec = D(1);
            setFactor(0, [4, 4], "Base", `${format(0.1, 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, true);
            setFactor(0, [4, 5], "Base", `${format(1, 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, true);

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(KUA_BLESS_TIER.rank.effects.kuaBlessGainActive);
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(KUA_BLESS_TIER.rank.effects.kuaBlessGainIdle);
            setFactor(1, [4, 4], "KBlessing Rank", `×${format(KUA_BLESS_TIER.rank.effects.kuaBlessGainActive, 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, true, "kb");
            setFactor(1, [4, 5], "KBlessing Rank", `×${format(KUA_BLESS_TIER.rank.effects.kuaBlessGainIdle, 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, true, "kb");

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(KUA_BLESS_UPGS[1].eff()[1]);
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(KUA_BLESS_UPGS[1].eff()[1]);
            setFactor(2, [4, 4], "KBlessing Upgrade 1", `×${format(KUA_BLESS_UPGS[1].eff()[1], 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[1], 6), "kb");
            setFactor(2, [4, 5], "KBlessing Upgrade 1", `×${format(KUA_BLESS_UPGS[1].eff()[1], 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[1], 6), "kb");

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(KUA_BLESS_TIER.tetr.effects.pr2Eff);
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(KUA_BLESS_TIER.tetr.effects.pr2Eff);
            setFactor(3, [4, 4], "KBlessing Tetr", `×${format(KUA_BLESS_TIER.tetr.effects.pr2Eff, 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, Decimal.gte(tmp.value.kua.blessings.tetr, 1), "kb");
            setFactor(3, [4, 5], "KBlessing Tetr", `×${format(KUA_BLESS_TIER.tetr.effects.pr2Eff, 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, Decimal.gte(tmp.value.kua.blessings.tetr, 1), "kb");

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(tmp.value.kua.effects.bless);
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(tmp.value.kua.effects.bless);
            setFactor(4, [4, 4], "Kuaraniai Upgrade 1", `×${format(tmp.value.kua.effects.bless, 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, player.value.gameProgress.kua.upgrades >= 2, "kua");
            setFactor(4, [4, 5], "Kuaraniai Upgrade 1", `×${format(tmp.value.kua.effects.bless, 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, player.value.gameProgress.kua.upgrades >= 2, "kua");

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(tmp.value.kua.proofs.upgrades.effect[2].effect);
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(tmp.value.kua.proofs.upgrades.effect[2].effect);
            setFactor(5, [4, 4], "Holy Process", `×${format(tmp.value.kua.proofs.upgrades.effect[2].effect, 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, Decimal.gt(tmp.value.kua.proofs.upgrades.effect[2].effect, 1), "kp");
            setFactor(5, [4, 5], "Holy Process", `×${format(tmp.value.kua.proofs.upgrades.effect[2].effect, 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, Decimal.gt(tmp.value.kua.proofs.upgrades.effect[2].effect, 1), "kp");

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(getColResEffect(5));
            setFactor(6, [4, 4], "Compliance", `×${format(getColResEffect(5), 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, Decimal.gte(timesCompleted('im'), 1e33), "col");
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(getColResEffect(4));
            setFactor(6, [4, 5], "Defiance", `×${format(getColResEffect(4), 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, Decimal.gte(timesCompleted('im'), 1e33), "col");

            data = {
                prevEff: tmp.value.kua.blessings.perClick,
                scal: getSCSLAttribute('kba', false)
            }

            tmp.value.kua.blessings.perClick = scale(tmp.value.kua.blessings.perClick, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('kba', false, 0, `${format(data.prevEff.log(tmp.value.kua.blessings.perClick), 3)}√`);
            setFactor(7, [4, 4], "Softcap", `softcap(${format(data.prevEff)})`, `${format(tmp.value.kua.blessings.perClick, 2)}`, Decimal.gt(tmp.value.kua.blessings.perClick, data.scal[0].start), "sc1");

            data = {
                prevEff: tmp.value.kua.blessings.perSec,
                scal: getSCSLAttribute('kbi', false)
            }

            tmp.value.kua.blessings.perSec = scale(tmp.value.kua.blessings.perSec, 2.1, false, data.scal[0].start, data.scal[0].power, data.scal[0].basePow);
            setSCSLEffectDisp('kbi', false, 0, `${format(data.prevEff.log(tmp.value.kua.blessings.perSec), 3)}√`);
            setFactor(7, [4, 5], "Softcap", `softcap(${format(data.prevEff)})`, `${format(tmp.value.kua.blessings.perSec, 2)}`, Decimal.gt(tmp.value.kua.blessings.perSec, data.scal[0].start), "sc1");

            NaNCheck(tmp.value.kua.blessings.perClick);
            NaNCheck(tmp.value.kua.blessings.perSec);

            if (!tmp.value.kua.active.blessings.gain) {
                tmp.value.kua.blessings.perSec = D(0);
                tmp.value.kua.blessings.perClick = D(0);
            }

            tmp.value.kua.blessings.canBuyUpg = false;
            for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
                tmp.value.kua.blessings.upgrades[i].canBuy = Decimal.gte(player.value.gameProgress.kua.blessings.amount, KUA_BLESS_UPGS[i].cost(Decimal.add(player.value.gameProgress.kua.blessings.upgrades[i], shiftDown ? 1 : 0)));
                tmp.value.kua.blessings.canBuyUpg = tmp.value.kua.blessings.canBuyUpg || Decimal.gte(player.value.gameProgress.kua.blessings.amount, KUA_BLESS_UPGS[i].cost());
                tmp.value.kua.canBuyUpg = tmp.value.kua.canBuyUpg || tmp.value.kua.blessings.upgrades[i].canBuy;
            }

            if (player.value.gameProgress.unlocks.kblessings) {
                generate = tmp.value.kua.blessings.perSec.mul(delta);
                player.value.gameProgress.kua.blessings.amount = Decimal.add(player.value.gameProgress.kua.blessings.amount, generate);
                updateAllTotal(player.value.gameProgress.kua.blessings.totals, generate);
                player.value.gameProgress.kua.blessings.totalEver = Decimal.add(player.value.gameProgress.kua.blessings.totalEver, generate);
                updateAllBest(player.value.gameProgress.kua.blessings.best,player.value.gameProgress.kua.blessings.amount);
                player.value.gameProgress.kua.blessings.bestEver = Decimal.max(player.value.gameProgress.kua.blessings.bestEver, player.value.gameProgress.kua.blessings.amount);
            }

            i = player.value.gameProgress.kua.blessings.amount;
            i = Decimal.mul(i, KUA_BLESS_TIER.tier.effects.kuaBlessEff)
            if (!tmp.value.kua.active.blessings.effects) {
                i = D(0);
            }
            tmp.value.kua.blessings.upg1Base = Decimal.gte(i, 1)
                ? Decimal.log10(i).add(1).mul(0.01)
                : Decimal.mul(i, 0.01)
            tmp.value.kua.blessings.upg2Base = Decimal.gte(i, 1)
                ? Decimal.log10(i).add(1).mul(0.02)
                : Decimal.mul(i, 0.02)
            tmp.value.kua.blessings.kuaEff = Decimal.add(i, 1).log10().mul(0.75).add(1).pow(0.9).sub(1).pow10();
            break;
        case 1:
            tmp.value.kua.sourcesCanBuy = [false, false, false];
            tmp.value.kua.totalEnhSources = D(0);
            tmp.value.kua.enhSourcesUsed = D(0);
            tmp.value.kua.enhShowSlow = false;

            decayExp = D(10);
            tmp.value.kua.enhSlowdown = decayExp.div(10).mul(1e2);
            for (let i = 0; i < KUA_ENHANCERS.sources.length; i++) {
                tmp.value.kua.sourcesCanBuy[i] = Decimal.gte(
                    KUA_ENHANCERS.sources[i].source,
                    KUA_ENHANCERS.sources[i].cost(player.value.gameProgress.kua.enhancers.sources[i])
                );
            }

            j = D(0);
            for (let i = 0; i < KUA_ENHANCERS.enhances.length; i++) {
                j = j.add(Decimal.div(player.value.gameProgress.kua.enhancers.enhancePow[i], 100));
            }

            for (let i = 0; i < KUA_ENHANCERS.enhances.length; i++) {
                tmp.value.kua.trueEnhPower[i] = Decimal.div(player.value.gameProgress.kua.enhancers.enhancePow[i], Decimal.max(j, player.value.gameProgress.kua.enhancers.xpSpread)).div(100);
                tmp.value.kua.totalEnhSources = Decimal.add(tmp.value.kua.totalEnhSources, player.value.gameProgress.kua.enhancers.sources[i]);
                tmp.value.kua.enhSourcesUsed = Decimal.add(tmp.value.kua.enhSourcesUsed, player.value.gameProgress.kua.enhancers.enhancers[i]);

                tmp.value.kua.baseSourceXPGen[i] = Decimal.pow(player.value.gameProgress.kua.enhancers.enhancers[i], 1.5);

                generate = tmp.value.kua.baseSourceXPGen[i].mul(delta);

                const lastXP = player.value.gameProgress.kua.enhancers.enhanceXP[i];
                player.value.gameProgress.kua.enhancers.enhanceXP[i] = Decimal.add(player.value.gameProgress.kua.enhancers.enhanceXP[i], 1).root(decayExp).sub(1).mul(decayExp).exp().sub(1).add(generate).add(1).ln().div(decayExp).add(1).pow(decayExp).sub(1);
                tmp.value.kua.kuaTrueSourceXPGen[i] = Decimal.sub(player.value.gameProgress.kua.enhancers.enhanceXP[i], lastXP).div(delta);

                tmp.value.kua.enhShowSlow = tmp.value.kua.enhShowSlow || Decimal.gte(player.value.gameProgress.kua.enhancers.enhanceXP[i], 10);
            }
            break;
        case 0:
            tmp.value.kua.effectiveKS = D(player.value.gameProgress.kua.kshards.totals[3]!);
            tmp.value.kua.effectiveKP = D(player.value.gameProgress.kua.kpower.totals[3]!);

            tmp.value.kua.effectiveKS = tmp.value.kua.effectiveKS.mul(KUA_BLESS_UPGS[0].eff()[1]);
            tmp.value.kua.effectiveKP = tmp.value.kua.effectiveKP.mul(KUA_BLESS_UPGS[0].eff()[1]);
            
            if (getKuaUpgrade('p', 17)) {
                tmp.value.kua.effectiveKS = tmp.value.kua.effectiveKS.pow(KUA_UPGRADES.KPower[16].eff!);
                tmp.value.kua.effectiveKP = tmp.value.kua.effectiveKP.pow(KUA_UPGRADES.KPower[16].eff2!);
            }

            tmp.value.kua.effectiveKS = tmp.value.kua.effectiveKS.pow(tmp.value.kua.proofs.upgrades.effect[1].effect);
            tmp.value.kua.effectiveKP = tmp.value.kua.effectiveKP.pow(tmp.value.kua.proofs.upgrades.effect[1].effect);

            NaNCheck(tmp.value.kua.effectiveKS);
            NaNCheck(tmp.value.kua.effectiveKP);

            player.value.gameProgress.kua.timeInKua = Decimal.add(player.value.gameProgress.kua.timeInKua, delta);

            tmp.value.kua.req = D(1e10);
            tmp.value.kua.exp = D(3);

            tmp.value.kua.exp = tmp.value.kua.exp.add(getColResEffect(2));
            tmp.value.kua.exp = tmp.value.kua.exp.add(KUA_BLESS_UPGS[2].eff()[1]);

            tmp.value.kua.effectivePrai = Decimal.add(player.value.gameProgress.main.prai.totals[2]!, tmp.value.main.prai.pending);
            tmp.value.kua.canDo = tmp.value.kua.effectivePrai.gte(tmp.value.kua.req) && tmp.value.kua.active.gain;
            tmp.value.kua.pending = tmp.value.kua.canDo
                ? tmp.value.kua.effectivePrai
                        .log(tmp.value.kua.req)
                        .ln()
                        .mul(1.5)
                        .div(tmp.value.kua.exp)
                        .add(1)
                        .pow(tmp.value.kua.exp)
                        .sub(5)
                        .pow10()
                : D(0);
            setFactor(0, [4, 1], "Base", `~10^(ln(log(${format(tmp.value.kua.effectivePrai)})))^${format(tmp.value.kua.exp, 2)}-${format(5)}) (approx.)`, `${format(tmp.value.kua.pending, 4)}`, true);
            
            if (getKuaUpgrade("s", 1)) {
                tmp.value.kua.pending = tmp.value.kua.pending.mul(1.5);
            }
            setFactor(1, [4, 1], "KShard Upgrade 1", `×${format(1.5, 2)}`, `${format(tmp.value.kua.pending, 4)}`, getKuaUpgrade("s", 1), "kua");

            if (getKuaUpgrade("s", 12)) {
                tmp.value.kua.pending = tmp.value.kua.pending.mul(KUA_UPGRADES.KShards[11].eff!);
            }
            setFactor(2, [4, 1], "KShard Upgrade 12", `×${format(KUA_UPGRADES.KShards[11].eff!, 2)}`, `${format(tmp.value.kua.pending, 4)}`, getKuaUpgrade("s", 12), "kua");

            if (Decimal.gte(timesCompleted("df"), 1)) {
                tmp.value.kua.pending = tmp.value.kua.pending.mul(2);
            }
            setFactor(3, [4, 1], `Decaying Feeling Completion ×${format(timesCompleted('df'))}`, `×${format(2, 2)}`, `${format(tmp.value.kua.pending, 1)}`, Decimal.gte(timesCompleted("df"), 1), "col");

            if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 1)) {
                tmp.value.kua.pending = tmp.value.kua.pending.mul(KUA_BLESS_UPGS[2].eff()[0]);
            }
            setFactor(4, [4, 1], `KBlessing Upgrade 3`, `×${format(KUA_BLESS_UPGS[2].eff()[0], 2)}`, `${format(tmp.value.kua.pending, 1)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 1), "kb");

            data = {
                oldGain: tmp.value.kua.pending,
                oldKua: D(0),
                newKua: D(0),
            };
            data.oldKua = Decimal.max(player.value.gameProgress.kua.amount, 1e-4);

            if (inChallenge("df")) {
                data.newKua = scale(scale(data.oldKua, 0.2, true, 1e-4, 1, Decimal.pow(0.75, challengeDepth("df"))).add(tmp.value.kua.pending), 0.2, false, 1e-4, 1, Decimal.pow(0.75, challengeDepth("df")));

                tmp.value.kua.pending = data.newKua.sub(data.oldKua);
            }
            setFactor(5, [4, 1], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, tmp.value.kua.pending), 2)}`, `${format(tmp.value.kua.pending, 4)}`, inChallenge("df"), "col");

            if (player.value.gameProgress.kua.auto) {
                generate = tmp.value.kua.pending.mul(delta).mul(0.01);
                player.value.gameProgress.kua.amount = Decimal.add(player.value.gameProgress.kua.amount, generate);
                updateAllTotal(player.value.gameProgress.kua.totals, generate);
                player.value.gameProgress.kua.totalEver = Decimal.add(player.value.gameProgress.kua.totalEver, generate);
            }

            updateAllBest(player.value.gameProgress.kua.best, player.value.gameProgress.kua.amount);
            player.value.gameProgress.kua.bestEver = Decimal.max(player.value.gameProgress.kua.bestEver, player.value.gameProgress.kua.amount);

            tmp.value.kua.effects = {
                kshardPassive: D(1),
                kpowerPassive: D(1),
                upg4: D(1),
                upg5: D(1),
                upg6: D(0),
                upg1Scaling: D(1),
                upg1SuperScaling: D(1),
                ptPower: D(1),
                upg2Softcap: D(1),
                kshardPrai: D(1),
                kpower: D(1),
                pts: D(1),
                bless: D(1)
            };

            k = D(1);
            setFactor(0, [4, 0], "Base", `${format(player.value.gameProgress.kua.amount, 4)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, true);

            if (player.value.gameProgress.unlocks.kblessings) {
                k = k.mul(tmp.value.kua.blessings.kuaEff.log(Decimal.pow(player.value.gameProgress.kua.amount, k)).add(1))
            }
            setFactor(1, [4, 0], "KBlessings", `×${format(tmp.value.kua.blessings.kuaEff, 2)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, player.value.gameProgress.unlocks.kblessings, "kb");

            k = k.mul(ACHIEVEMENT_DATA[1].eff);
            setFactor(2, [4, 0], "Achievement Tier 2", `^${format(ACHIEVEMENT_DATA[1].eff, 3)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, true, "ach");

            if (getKuaUpgrade("s", 11)) {
                k = k.mul(KUA_UPGRADES.KShards[10].eff!);
            }
            setFactor(3, [4, 0], "KShard Upgrade 11", `^${format(KUA_UPGRADES.KShards[10].eff!, 3)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, getKuaUpgrade("s", 11), "kua");

            if (getKuaUpgrade("p", 15)) {
                k = k.mul(1.05);
            }
            setFactor(4, [4, 0], "KPower Upgrade 15", `^${format(1.05, 3)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, getKuaUpgrade("p", 15), "kua");
            
            k = Decimal.pow(player.value.gameProgress.kua.amount, k);

            if (tmp.value.kua.active.effects) {
                // * theres probably a better way to do this
                // no requirements for this, no need to lump them in the ones with conditionals
                tmp.value.kua.effects.upg1Scaling = Decimal.max(player.value.gameProgress.main.points, 0).add(1).log10().pow(0.6).div(200).mul(Decimal.max(k, 0).mul(1e4).add(1).pow(2 / 3).sub(1)).add(1).log10().add(1);
                if (getKuaUpgrade("p", 3)) {
                    tmp.value.kua.effects.upg1Scaling = Decimal.max(player.value.gameProgress.main.points, 0).add(1).pow(0.022).mul(Decimal.max(k, 0).mul(10).add(1).pow(0.75).sub(1)).add(1).log10().add(1).max(tmp.value.kua.effects.upg1Scaling);
                }

                let exp = D(1);

                if (getKuaUpgrade("k", 2)) { exp = exp.add(0.25); }
                if (getKuaUpgrade("k", 3)) { exp = exp.add(0.25); }
                if (getKuaUpgrade("k", 4)) { exp = exp.add(0.25); }

                exp = exp.mul(tmp.value.kua.proofs.upgrades.effect[4].effect)

                tmp.value.kua.effects.kshardPassive = Decimal.max(tmp.value.kua.effectiveKS, 0.01).mul(1e3).log10().pow(2).sub(1).pow10().pow(0.05).pow(exp).log10().add(1).log10().add(1).pow(0.9).sub(1).pow10().sub(1).pow10();
                tmp.value.kua.effects.kpowerPassive = Decimal.max(tmp.value.kua.effectiveKP, 0.01).mul(1e3).log10().pow(2).sub(1).pow10().pow(0.05).pow(exp).log10().add(1).log10().add(1).pow(0.9).sub(1).pow10().sub(1).pow10();

                tmp.value.kua.effects.upg4 = Decimal.gt(k, 0)
                    ? Decimal.log10(k).add(4).div(13).mul(7).add(1).cbrt().sub(4).pow10().add(1)
                    : D(1);

                tmp.value.kua.effects.upg5 = Decimal.gt(player.value.gameProgress.kua.kshards.amount, 0)
                    ? Decimal.pow(20, Decimal.log10(player.value.gameProgress.kua.kshards.amount).add(2).div(13)).div(1e3).add(1)
                    : D(1);

                tmp.value.kua.effects.upg6 = Decimal.gt(player.value.gameProgress.kua.kpower.amount, 1)
                    ? Decimal.log10(player.value.gameProgress.kua.kpower.amount)
                            .div(13)
                            .mul(7)
                            .add(1)
                            .cbrt()
                            .sub(6)
                            .pow10()
                    : D(0);

                tmp.value.kua.effects.upg1SuperScaling = getKuaUpgrade("p", 6)
                    ? tmp.value.kua.effects.upg1Scaling.sqrt().sub(1).div(16).add(1)
                    : D(1);

                tmp.value.kua.effects.ptPower = getKuaUpgrade("p", 3)
                    ? Decimal.max(k, 0).add(1).log2().add(1).sqrt().sub(1).mul(0.01).add(1) // 1 = ^1, 2 = ^1.01, 16 = ^1.02, 256 = ^1.03, 65,536 = ^1.04 ...
                    : D(1);

                tmp.value.kua.effects.upg2Softcap = getKuaUpgrade("s", 6)
                    ? Decimal.max(k, 1e2).div(1e2).pow(7)
                    : D(1);

                tmp.value.kua.effects.kshardPrai = getKuaUpgrade("s", 10)
                    ? Decimal.max(k, 10).log10().log10().div(4).add(1).pow(2.5)
                    : D(1);

                tmp.value.kua.effects.kpower = getKuaUpgrade("s", 10)
                    ? Decimal.max(k, 10).log10().sub(1).div(8).pow10()
                    : D(1);

                tmp.value.kua.effects.pts = getKuaUpgrade("s", 7)
                    ? Decimal.max(k, 1)
                            .mul(1e3)
                            .cbrt()
                            .log10()
                            .pow(1.1)
                            .mul(
                                Decimal.max(player.value.gameProgress.main.prai.timeInPRai, 0)
                                    .add(1)
                                    .ln()
                                    .mul(2)
                                    .add(1)
                                    .sqrt()
                            )
                            .pow10()
                    : D(1);

                tmp.value.kua.effects.bless = getKuaUpgrade("k", 2)
                    ? Decimal.max(k, 1e8).log10().cbrt().div(2).sub(1).pow10()
                    : D(1);
            }

            i = D(0);
            if (tmp.value.kua.active.kshards.gain) {
                i = D(player.value.gameProgress.kua.amount);
                setFactor(0, [4, 2], "Base", `${format(player.value.gameProgress.kua.amount, 4)}`, `${format(i, 3)}`, true);
                if (getKuaUpgrade("p", 1)) {
                    i = i.mul(2.5);
                }
                setFactor(1, [4, 2], "KPower Upgrade 1", `×${format(2.5, 2)}`, `${format(i, 3)}`, getKuaUpgrade("p", 1), "kua");

                if (getKuaUpgrade("s", 13)) {
                    i = i.mul(KUA_UPGRADES.KShards[12].eff!);
                }
                setFactor(2, [4, 2], "KShard Upgrade 13", `×${format(KUA_UPGRADES.KShards[12].eff!, 2)}`, `${format(i, 3)}`, getKuaUpgrade("s", 13), "kua");

                if (Decimal.gte(timesCompleted("df"), 1)) {
                    i = i.mul(2);
                }
                setFactor(3, [4, 2], `Decaying Feeling Completion ×${format(timesCompleted('df'))}`, `×${format(2, 2)}`, `${format(i, 3)}`, Decimal.gte(timesCompleted("df"), 1), "col");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 1)) {
                    i = i.mul(KUA_BLESS_UPGS[2].eff()[2]);
                }
                setFactor(4, [4, 2], `KBlessing Upgrade 3`, `×${format(KUA_BLESS_UPGS[2].eff()[2], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 12), "kb");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 1)) {
                    i = i.mul(KUA_BLESS_UPGS[3].eff()[0]);
                }
                setFactor(5, [4, 2], `KBlessing Upgrade 4`, `×${format(KUA_BLESS_UPGS[3].eff()[0], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 1), "kb");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 6)) {
                    i = i.mul(Decimal.max(player.value.gameProgress.kua.kpower.amount, 1).log10().pow(KUA_BLESS_UPGS[3].eff()[1]));
                }
                setFactor(6, [4, 2], `KBlessing Upgrade 4`, `×log10(${format(player.value.gameProgress.kua.kpower.amount, 2)})^${format(KUA_BLESS_UPGS[3].eff()[1], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 6), "kb");

                data = {
                    oldGain: i,
                    oldKua: D(0),
                    newKua: D(0),
                };
                data.oldKua = Decimal.max(player.value.gameProgress.kua.amount, 1e-4);
    
                if (inChallenge("df")) {
                    data.newKua = scale(scale(data.oldKua, 0.2, true, 1e-4, 1, Decimal.pow(0.5, challengeDepth("df"))).add(i), 0.2, false, 1e-4, 1, Decimal.pow(0.5, challengeDepth("df")));
    
                    i = data.newKua.sub(data.oldKua);
                }
                setFactor(6, [4, 2], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, i), 2)}`, `${format(i, 4)}`, inChallenge("df"), "col");
            }
            tmp.value.kua.shardGen = i;

            i = D(0);
            if (tmp.value.kua.active.kpower.gain) {
                i = D(player.value.gameProgress.kua.kshards.amount);
                setFactor(0, [4, 3], "Base", `${format(player.value.gameProgress.kua.kshards.amount, 4)}`, `${format(i, 3)}`, true);
                if (getKuaUpgrade("s", 10)) {
                    i = i.mul(tmp.value.kua.effects.kpower);
                }
                setFactor(1, [4, 3], "KShard Upgrade 10", `×${format(tmp.value.kua.effects.kpower, 2)}`, `${format(i, 3)}`, getKuaUpgrade("s", 10), "kua");

                if (getKuaUpgrade("s", 14)) {
                    i = i.mul(KUA_UPGRADES.KShards[13].eff!);
                }
                setFactor(2, [4, 3], "KShard Upgrade 14", `×${format(KUA_UPGRADES.KShards[13].eff!, 2)}`, `${format(i, 3)}`, getKuaUpgrade("s", 14), "kua");

                if (Decimal.gte(timesCompleted("df"), 1)) {
                    i = i.mul(2);
                }
                setFactor(3, [4, 3], `Decaying Feeling Completion ×${format(timesCompleted('df'))}`, `×${format(2, 2)}`, `${format(i, 3)}`, Decimal.gte(timesCompleted("df"), 1), "col");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 1)) {
                    i = i.mul(KUA_BLESS_UPGS[2].eff()[2]);
                }
                setFactor(4, [4, 3], `KBlessing Upgrade 3`, `×${format(KUA_BLESS_UPGS[2].eff()[2], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 12), "kb");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 1)) {
                    i = i.mul(KUA_BLESS_UPGS[3].eff()[0]);
                }
                setFactor(5, [4, 3], `KBlessing Upgrade 4`, `×${format(KUA_BLESS_UPGS[3].eff()[0], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 1), "kb");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 6)) {
                    i = i.mul(Decimal.max(player.value.gameProgress.kua.kshards.amount, 1).log10().pow(KUA_BLESS_UPGS[3].eff()[1]));
                }
                setFactor(6, [4, 3], `KBlessing Upgrade 4`, `×log10(${format(player.value.gameProgress.kua.kshards.amount, 2)})^${format(KUA_BLESS_UPGS[3].eff()[1], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 6), "kb");

                data = {
                    oldGain: i,
                    oldKua: D(0),
                    newKua: D(0),
                };
                data.oldKua = Decimal.max(player.value.gameProgress.kua.amount, 1e-4);

                if (inChallenge("df")) {
                    data.newKua = scale(scale(data.oldKua, 0.2, true, 1e-4, 1, Decimal.pow(0.5, challengeDepth("df"))).add(i), 0.2, false, 1e-4, 1, Decimal.pow(0.5, challengeDepth("df")));
    
                    i = data.newKua.sub(data.oldKua);
                }
                setFactor(6, [4, 3], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, i), 2)}`, `${format(i, 4)}`, inChallenge("df"), "col");
            }
            tmp.value.kua.powGen = i;

            tmp.value.kua.upgCanBuyUpg = false;
            for (let i = player.value.gameProgress.kua.kshards.upgrades; i < KUA_UPGRADES.KShards.length; i++) {
                j = Decimal.gte(player.value.gameProgress.kua.kshards.amount, KUA_UPGRADES.KShards[i].cost);
                tmp.value.kua.upgCanBuyUpg = tmp.value.kua.upgCanBuyUpg || j;
                tmp.value.kua.canBuyUpg = tmp.value.kua.canBuyUpg || j;
            }
            for (let i = player.value.gameProgress.kua.kpower.upgrades; i < KUA_UPGRADES.KPower.length; i++) {
                j = Decimal.gte(player.value.gameProgress.kua.kpower.amount, KUA_UPGRADES.KPower[i].cost);
                tmp.value.kua.upgCanBuyUpg = tmp.value.kua.upgCanBuyUpg || j;
                tmp.value.kua.canBuyUpg = tmp.value.kua.canBuyUpg || j;
            }
            for (let i = player.value.gameProgress.kua.upgrades; i < KUA_UPGRADES.Kua.length; i++) {
                j = Decimal.gte(player.value.gameProgress.kua.amount, KUA_UPGRADES.Kua[i].cost);
                tmp.value.kua.upgCanBuyUpg = tmp.value.kua.upgCanBuyUpg || j;
                tmp.value.kua.canBuyUpg = tmp.value.kua.canBuyUpg || j;
            }

            generate = tmp.value.kua.shardGen.mul(delta);
            player.value.gameProgress.kua.kshards.amount = Decimal.add(player.value.gameProgress.kua.kshards.amount, generate);
            updateAllTotal(player.value.gameProgress.kua.kshards.totals, generate);
            player.value.gameProgress.kua.kshards.totalEver = Decimal.add(player.value.gameProgress.kua.kshards.totalEver, generate);
            updateAllBest(player.value.gameProgress.kua.kshards.best,player.value.gameProgress.kua.kshards.amount);
            player.value.gameProgress.kua.kshards.bestEver = Decimal.max(player.value.gameProgress.kua.kshards.bestEver, player.value.gameProgress.kua.kshards.amount);

            generate = tmp.value.kua.powGen.mul(delta);
            player.value.gameProgress.kua.kpower.amount = Decimal.add(player.value.gameProgress.kua.kpower.amount, generate);
            updateAllTotal(player.value.gameProgress.kua.kpower.totals, generate);
            player.value.gameProgress.kua.kpower.totalEver = Decimal.add(player.value.gameProgress.kua.kpower.totalEver, generate);
            updateAllBest(player.value.gameProgress.kua.kpower.best,player.value.gameProgress.kua.kpower.amount);
            player.value.gameProgress.kua.kpower.bestEver = Decimal.max(player.value.gameProgress.kua.kpower.bestEver, player.value.gameProgress.kua.kpower.amount);
            break;
        default:
            throw new Error(`Kuaraniai area of the game does not contain ${type}`);
    }
};

export const buyKShardUpg = (id: number) => {
    if (id === player.value.gameProgress.kua.kshards.upgrades) {
        if (Decimal.gte(player.value.gameProgress.kua.kshards.amount, KUA_UPGRADES.KShards[id].cost)) {
            player.value.gameProgress.kua.kshards.upgrades++;
            player.value.gameProgress.kua.kshards.amount = Decimal.sub(player.value.gameProgress.kua.kshards.amount, KUA_UPGRADES.KShards[id].cost);
        }
    }
};

export const buyKPowerUpg = (id: number) => {
    if (id === player.value.gameProgress.kua.kpower.upgrades) {
        if (Decimal.gte(player.value.gameProgress.kua.kpower.amount, KUA_UPGRADES.KPower[id].cost)) {
            player.value.gameProgress.kua.kpower.upgrades++;
            player.value.gameProgress.kua.kpower.amount = Decimal.sub(player.value.gameProgress.kua.kpower.amount, KUA_UPGRADES.KPower[id].cost);
        }
    }
};

export const buyKMainUpg = (id: number) => {
    if (id === player.value.gameProgress.kua.upgrades) {
        if (Decimal.gte(player.value.gameProgress.kua.amount, KUA_UPGRADES.Kua[id].cost)) {
            player.value.gameProgress.kua.upgrades++;
            player.value.gameProgress.kua.amount = Decimal.sub(player.value.gameProgress.kua.amount, KUA_UPGRADES.Kua[id].cost);
        }
    }
};

export const buyKuaEnhSourceUPG = (i: number, max = false) => {
    if (Decimal.gte(KUA_ENHANCERS.sources[i].source, KUA_ENHANCERS.sources[i].cost(player.value.gameProgress.kua.enhancers.sources[i]))) {
        player.value.gameProgress.kua.enhancers.sources[i] = max 
            ? Decimal.max(player.value.gameProgress.kua.enhancers.sources[i], KUA_ENHANCERS.sources[i].target(KUA_ENHANCERS.sources[i].source).floor().add(1))
            : Decimal.add(player.value.gameProgress.kua.enhancers.sources[i], 1);
    }
};

export const kuaEnh = (id: number, amt: DecimalSource) => {
    const remain = Decimal.sub(tmp.value.kua.totalEnhSources, tmp.value.kua.enhSourcesUsed);
    player.value.gameProgress.kua.enhancers.enhancers[id] = Decimal.min(
        Decimal.add(remain, player.value.gameProgress.kua.enhancers.enhancers[id]),
        Decimal.max(0, Decimal.add(player.value.gameProgress.kua.enhancers.enhancers[id], amt))
    );
};

export const kuaEnhReset = () => {
    for (let i = 0; i < player.value.gameProgress.kua.enhancers.enhancers.length; i++) {
        player.value.gameProgress.kua.enhancers.enhancers[i] = 0;
    }
};
