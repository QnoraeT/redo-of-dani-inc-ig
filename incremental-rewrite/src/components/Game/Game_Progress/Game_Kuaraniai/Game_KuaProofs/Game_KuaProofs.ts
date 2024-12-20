import { D, scale, smoothExp } from "@/calc";
import { format } from "@/format";
import { player, tmp } from "@/main";
import Decimal, { type DecimalSource } from "break_eternity.js";

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

export type KuaProofUpgTypes = 'effect' | 'kp' | 'skp' | 'fkp'

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
                eff = eff.pow(x);
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
                let eff = D(0.2);
                eff = eff.add(tmp.value.kua.proofs.upgrades.effect[8].effect);
                eff = eff.mul(x);
                return eff;
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
                return `+^${format(this.effect(tmp.value.kua.proofs.upgrades.effect[7].trueLevel).sub(1), 3)} KS and KP gain from Kua and KS respectively.`;
            },
            cost(x) {
                return smoothExp(x, 1.05, false).div(9).add(1).pow_base(450000).pow10();
            },
            target(x) {
                if (Decimal.lt(x, 'e450000')) { return D(-1); }
                return smoothExp(Decimal.log10(x).log(450000).sub(1).mul(9), 1.05, true);
            },
            effect(x) {
                return Decimal.pow(1.05, x);
            }
        },
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.finicky.amount, 0);
            },
            title: `Infinite Staircase`,
            get perDesc() {
                return `+${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.effect[8].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.effect[8].trueLevel)), 2)} Hyper Heaven effect base.`;
            },
            get desc() {
                return `+${format(this.effect(tmp.value.kua.proofs.upgrades.effect[8].trueLevel), 2)} Hyper Heaven effect base.`;
            },
            cost(x) {
                return smoothExp(x, 1.06, false).div(8).add(1).pow_base(2.4e6).pow10();
            },
            target(x) {
                if (Decimal.lt(x, 'e2.4e6')) { return D(-1); }
                return smoothExp(Decimal.log10(x).log(2.4e6).sub(1).mul(8), 1.06, true);
            },
            effect(x) {
                return Decimal.mul(x, 0.04);
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
                return `Strange KP multiplies Trial and Error effect base by +${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.kp[4].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.kp[4].trueLevel)), 2)}×.`;
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
                return `Make Successive Trials +${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.kp[7].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.kp[7].trueLevel)), 2)}× stronger based off of your KP.`;
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
                return Decimal.pow(x, 1.5).pow_base(2).mul(5);
            },
            target(x) {
                if (Decimal.lt(x, 5)) { return D(-1); }
                return Decimal.div(x, 5).log2().root(1.5);
            },
            effect(x) {
                let eff = Decimal.add(player.value.gameProgress.kua.proofs.strange.times, 1).log10().sqrt().div(10).mul(x);
                eff = scale(eff, 1.3, true, 10, 1, 2);
                return eff;
            }
        },
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 5);
            },
            title: `Uncertain Characteristic`,
            get perDesc() {
                return `SKP adds +${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.skp[1].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.skp[1].trueLevel)), 2)} free levels to the first 3 KProof upgrades.`;
            },
            get desc() {
                return `+${format(this.effect(tmp.value.kua.proofs.upgrades.skp[1].trueLevel), 2)} free levels to the first 3 KProof upgrades.`;
            },
            cost(x) {
                return Decimal.pow(x, 2).pow_base(5).mul(25);
            },
            target(x) {
                if (Decimal.lt(x, 25)) { return D(-1); }
                return Decimal.div(x, 25).log(5).root(2);
            },
            effect(x) {
                return Decimal.add(player.value.gameProgress.kua.proofs.strange.amount, 1).log10().add(1).log10().mul(2).mul(x);
            }
        },
        {
            get show() {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 25);
            },
            title: `Unstable Conclusions`,
            get perDesc() {
                return `The first 3 KProof upgrades' costs are delayed by ${format(this.effect(Decimal.add(tmp.value.kua.proofs.upgrades.skp[2].trueLevel, 1)).sub(this.effect(tmp.value.kua.proofs.upgrades.skp[2].trueLevel)), 1)}.`;
            },
            get desc() {
                return `The first 3 KProof upgrades' costs are delayed by ${format(this.effect(tmp.value.kua.proofs.upgrades.skp[2].trueLevel), 1)}.`;
            },
            cost(x) {
                return Decimal.pow(x, 3).pow10().mul(1e3);
            },
            target(x) {
                if (Decimal.lt(x, 1e3)) { return D(-1); }
                return Decimal.div(x, 1e3).log10().root(3);
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
                return `You aren't able to unlock this right now...`;
                // return `Unlock FKP Allocation and the Cyan alloc.`;
            },
            get desc() {
                return tmp.value.kua.proofs.upgrades.fkp[0].trueLevel.gt(0) ? 'Unlocked' : 'Locked';
            },
            cost(x) {
                // placeholder condition
                return Decimal.add(x, Infinity);
                // return Decimal.gt(x, 0) ? D(Infinity) : D(1);
            },
            target(x) {
                // placeholder condition
                return Decimal.mul(x, 0).sub(1);
                // if (Decimal.lt(x, 1)) { return D(-1); }
                // return D(0);
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
                return Decimal.add(x, Infinity);
                // return Decimal.gt(x, 0) ? D(Infinity) : D(10);
            },
            target(x) {
                // placeholder condition
                return Decimal.mul(x, 0).sub(1);
                // if (Decimal.lt(x, 10)) { return D(-1); }
                // return D(0);
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
                return Decimal.add(x, Infinity);
                // return Decimal.gt(x, 0) ? D(Infinity) : D(100);
            },
            target(x) {
                // placeholder condition
                return Decimal.mul(x, 0).sub(1);
                // if (Decimal.lt(x, 100)) { return D(-1); }
                // return D(0);
            },
            effect(x) {
                return D(x);
            }
        },
    ]
}