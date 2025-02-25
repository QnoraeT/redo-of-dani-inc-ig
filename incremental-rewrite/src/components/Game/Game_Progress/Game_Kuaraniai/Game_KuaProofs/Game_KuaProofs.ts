import { D, smoothExp } from "@/calc";
import { format } from "@/format";
import { player, tmp } from "@/main";
import Decimal from "break_eternity.js";
import { computed, type ComputedRef } from "vue";

export type TmpKProofUpgs = {
    canBuy: boolean,
    effect: Decimal,
    freeExtra: Decimal,
    trueLevel: Decimal
}

export const initAllKProofUpgrades = (id: KuaProofUpgTypes) => {
    const arr = [];
    for (let i = KUA_PROOF_UPGS[id].length - 1; i >= 0; i--) {
        arr.push(
            {
                canBuy: false,
                effect: D(0),
                freeExtra: D(0),
                trueLevel: D(0)
            }
        );
    }
    return arr;
}

export const buyKProofUpg = (id: number, category: KuaProofUpgTypes) => {
    if (category === 'effect') {
        if (Decimal.gte(player.value.gameProgress.kua.proofs.amount, KUA_PROOF_UPGS.effect[id].cost.value)) {
            player.value.gameProgress.kua.proofs.amount = Decimal.sub(player.value.gameProgress.kua.proofs.amount, KUA_PROOF_UPGS.effect[id].cost.value);
            player.value.gameProgress.kua.proofs.upgrades.effect[id] = Decimal.add(player.value.gameProgress.kua.proofs.upgrades.effect[id], 1);
        }
    }
    if (category === 'kp') {
        if (Decimal.gte(player.value.gameProgress.kua.proofs.amount, KUA_PROOF_UPGS.kp[id].cost.value)) {
            player.value.gameProgress.kua.proofs.amount = Decimal.sub(player.value.gameProgress.kua.proofs.amount, KUA_PROOF_UPGS.kp[id].cost.value);
            player.value.gameProgress.kua.proofs.upgrades.kp[id] = Decimal.add(player.value.gameProgress.kua.proofs.upgrades.kp[id], 1);
        }
    }
    if (category === 'skp') {
        if (Decimal.gte(player.value.gameProgress.kua.proofs.strange.amount, KUA_PROOF_UPGS.skp[id].cost.value)) {
            player.value.gameProgress.kua.proofs.strange.amount = Decimal.sub(player.value.gameProgress.kua.proofs.strange.amount, KUA_PROOF_UPGS.skp[id].cost.value);
            player.value.gameProgress.kua.proofs.upgrades.skp[id] = Decimal.add(player.value.gameProgress.kua.proofs.upgrades.skp[id], 1);
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
    show: ComputedRef<boolean>,
    title: string,
    perDesc: ComputedRef<string>,
    desc: ComputedRef<string>,
    cost: ComputedRef<Decimal>
    target: ComputedRef<Decimal>
    effect: ComputedRef<Decimal>
    effPer: ComputedRef<Decimal>
}

export const KUA_PROOF_UPGS: KuaProofUpgAllType = {
    effect: [
        {
            show: computed(() => { return true; }),
            title: `Basic Discoveries`,
            perDesc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.effect[0].effPer.value, 2)} free levels to Upgrades 1-3.`;
            }),
            desc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.effect[0].effect.value, 2)} free levels to Upgrades 1-3.`;
            }),
            cost: computed(() => {
                return Decimal.pow(player.value.gameProgress.kua.proofs.upgrades.effect[0], 0.75).pow_base(2).mul(12).pow10();
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, 1e12)) { return D(-1); }
                return Decimal.log10(player.value.gameProgress.kua.proofs.amount).div(12).log(2).root(0.75);
            }),
            effPer: computed(() => {
                return D(0.75)
            }),
            effect: computed(() => {
                return Decimal.mul(tmp.value.kua.proofs.upgrades.effect[0].trueLevel, KUA_PROOF_UPGS.effect[0].effPer.value);
            })
        },
        {
            show: computed(() => { return true; }),
            title: `Exotic Laboratory`,
            perDesc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.effect[1].effPer.value.sub(1).mul(100), 1)}% effect power to KS and KP.`;
            }),
            desc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.effect[1].effect.value.sub(1).mul(100), 1)}% effect power to KS and KP.`;
            }),
            cost: computed(() => {
                return Decimal.pow(player.value.gameProgress.kua.proofs.upgrades.effect[1], 0.825).pow_base(2).mul(24).pow10();
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, 1e24)) { return D(-1); }
                return Decimal.log10(player.value.gameProgress.kua.proofs.amount).div(24).log(2).root(0.825);
            }),
            effPer: computed(() => {
                return D(0.005)
            }),
            effect: computed(() => {
                return Decimal.mul(KUA_PROOF_UPGS.effect[1].effPer.value, tmp.value.kua.proofs.upgrades.effect[1].trueLevel).add(1)
            })
        },
        {
            show: computed(() => { return true; }),
            title: `Holy Process`,
            perDesc: computed(() => {
                return `×${format(KUA_PROOF_UPGS.effect[2].effPer.value)} KBlessing gain.`;
            }),
            desc: computed(() => {
                return `×${format(KUA_PROOF_UPGS.effect[2].effect.value)} KBlessing gain.`;
            }),
            cost: computed(() => {
                return Decimal.pow(player.value.gameProgress.kua.proofs.upgrades.effect[2], 0.9).pow_base(2).mul(40).pow10();
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, 1e40)) { return D(-1); }
                return Decimal.log10(player.value.gameProgress.kua.proofs.amount).div(40).log2().root(0.9);
            }),
            effPer: computed(() => {
                let eff = D(2);
                eff = eff.add(tmp.value.kua.proofs.upgrades.effect[5].effect);
                return eff;
            }),
            effect: computed(() => {
                let eff = KUA_PROOF_UPGS.effect[2].effPer.value;
                eff = eff.pow(tmp.value.kua.proofs.upgrades.effect[2].trueLevel);
                return eff;
            })
        },
        {
            show: computed(() => {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 0);
            }),
            title: `Line Extruder`,
            perDesc: computed(() => {
                return `Each Upgrade 2 gives +${format(KUA_PROOF_UPGS.effect[3].effPer.value, 3)} free levels to Upgrade 1.`;
            }),
            desc: computed(() => {
                return `Each Upgrade 2 gives +${format(KUA_PROOF_UPGS.effect[3].effect.value, 3)} free levels to Upgrade 1.`;
            }),
            cost: computed(() => {
                return Decimal.div(player.value.gameProgress.kua.proofs.upgrades.effect[3], 20).add(1).pow_base(125).pow10();
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, 1e125)) { return D(-1); }
                return Decimal.log10(player.value.gameProgress.kua.proofs.amount).log(125).sub(1).mul(20);
            }),
            effPer: computed(() => {
                return D(0.003);
            }),
            effect: computed(() => {
                return Decimal.mul(tmp.value.kua.proofs.upgrades.effect[3].trueLevel, KUA_PROOF_UPGS.effect[3].effPer.value);
            })
        },
        {
            show: computed(() => {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 0);
            }),
            title: `Violent Violet`,
            perDesc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.effect[4].effPer.value.sub(1).mul(100), 1)}% to KS and KP's PRai and Point exponents.`;
            }),
            desc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.effect[4].effect.value.sub(1).mul(100), 1)}% to KS and KP's PRai and Point exponents.`;
            }),
            cost: computed(() => {
                return Decimal.div(player.value.gameProgress.kua.proofs.upgrades.effect[4], 12).add(1).pow(1.1).pow_base(180).pow10();
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, 1e180)) { return D(-1); }
                return Decimal.log10(player.value.gameProgress.kua.proofs.amount).log(180).root(1.1).sub(1).mul(12);
            }),
            effPer: computed(() => {
                return D(1.015)
            }),
            effect: computed(() => {
                return Decimal.pow(KUA_PROOF_UPGS.effect[4].effPer.value, tmp.value.kua.proofs.upgrades.effect[4].trueLevel);
            })
        },
        {
            show: computed(() => {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 0);
            }),
            title: `Hyper Heaven`,
            perDesc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.effect[5].effPer.value, 2)} Holy Process effect base.`;
            }),
            desc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.effect[5].effect.value, 2)} Holy Process effect base.`;
            }),
            cost: computed(() => {
                return Decimal.div(player.value.gameProgress.kua.proofs.upgrades.effect[5], 12).add(1).pow(1.2).pow_base(250).pow10();
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, 1e250)) { return D(-1); }
                return Decimal.log10(player.value.gameProgress.kua.proofs.amount).log(250).root(1.2).sub(1).mul(12);
            }),
            effPer: computed(() => {
                let eff = D(0.2);
                eff = eff.add(tmp.value.kua.proofs.upgrades.effect[8].effect);
                return eff
            }),
            effect: computed(() => {
                let eff = KUA_PROOF_UPGS.effect[5].effPer.value;
                eff = eff.mul(tmp.value.kua.proofs.upgrades.effect[5].trueLevel);
                return eff;
            })
        },
        {
            show: computed(() => {
                return Decimal.gt(player.value.gameProgress.kua.proofs.finicky.amount, 0);
            }),
            title: `Ultimate Bribery`,
            perDesc: computed(() => {
                return `KProofs delay point taxation by ×${format(KUA_PROOF_UPGS.effect[6].effPer.value)} per square-rooted level.`;
            }),
            desc: computed(() => {
                return `KProofs delay point taxation by ×${format(KUA_PROOF_UPGS.effect[6].effect.value)}.`;
            }),
            cost: computed(() => {
                return smoothExp(player.value.gameProgress.kua.proofs.upgrades.effect[6], 1.04, false).div(10).add(1).pow_base(75000).pow10();
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, 'e75000')) { return D(-1); }
                return smoothExp(Decimal.log10(player.value.gameProgress.kua.proofs.amount).log(75000).sub(1).mul(10), 1.04, true);
            }),
            effPer: computed(() => {
                return Decimal.max(player.value.gameProgress.kua.proofs.amount, 1e100).log10().sqrt().div(10).sub(1);
            }),
            effect: computed(() => {
                return KUA_PROOF_UPGS.effect[6].effPer.value.mul(Decimal.sqrt(tmp.value.kua.proofs.upgrades.effect[6].trueLevel)).pow_base(100);
            })
        },
        {
            show: computed(() => {
                return Decimal.gt(player.value.gameProgress.kua.proofs.finicky.amount, 0);
            }),
            title: `Constructive Interference`,
            perDesc: computed(() => {
                return `+^${format(KUA_PROOF_UPGS.effect[7].effPer.value, 3)} KS and KP gain from Kua and KS respectively.`;
            }),
            desc: computed(() => {
                return `+^${format(KUA_PROOF_UPGS.effect[7].effect.value.sub(1), 3)} KS and KP gain from Kua and KS respectively.`;
            }),
            cost: computed(() => {
                return smoothExp(player.value.gameProgress.kua.proofs.upgrades.effect[7], 1.05, false).div(9).add(1).pow_base(450000).pow10();
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, 'e450000')) { return D(-1); }
                return smoothExp(Decimal.log10(player.value.gameProgress.kua.proofs.amount).log(450000).sub(1).mul(9), 1.05, true);
            }),
            effPer: computed(() => {
                return D(1.05);
            }),
            effect: computed(() => {
                return Decimal.pow(KUA_PROOF_UPGS.effect[7].effPer.value, tmp.value.kua.proofs.upgrades.effect[7].trueLevel);
            })
        },
        {
            show: computed(() => {
                return Decimal.gt(player.value.gameProgress.kua.proofs.finicky.amount, 0);
            }),
            title: `Infinite Staircase`,
            perDesc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.effect[8].effPer.value, 2)} Hyper Heaven effect base.`;
            }),
            desc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.effect[8].effect.value, 2)} Hyper Heaven effect base.`;
            }),
            cost: computed(() => {
                return smoothExp(player.value.gameProgress.kua.proofs.upgrades.effect[8], 1.06, false).div(8).add(1).pow_base(2.4e6).pow10();
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, 'e2.4e6')) { return D(-1); }
                return smoothExp(Decimal.log10(player.value.gameProgress.kua.proofs.amount).log(2.4e6).sub(1).mul(8), 1.06, true);
            }),
            effPer: computed(() => {
                return D(0.04);
            }),
            effect: computed(() => {
                return Decimal.mul(tmp.value.kua.proofs.upgrades.effect[8].trueLevel, KUA_PROOF_UPGS.effect[8].effPer.value);
            })
        },
    ],
    kp: [
        {
            show: computed(() => { return true; }),
            title: `Simple Breakthrough`,
            perDesc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.kp[0].effPer.value, 2)} to KProof Exponent.`;
            }),
            desc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.kp[0].effect.value, 2)} to KProof Exponent.`;
            }),
            cost: computed(() => {
                return Decimal.add(smoothExp(player.value.gameProgress.kua.proofs.upgrades.kp[0], 1.001, false), 1).mul(smoothExp(player.value.gameProgress.kua.proofs.upgrades.kp[0], 1.001, false)).div(2).pow10();
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, 1)) { return D(-1); }
                return smoothExp(Decimal.log10(player.value.gameProgress.kua.proofs.amount).mul(8).add(1).sqrt().sub(1).div(2), 1.001, true);
            }),
            effPer: computed(() => {
                let eff = D(1);
                eff = eff.add(tmp.value.kua.proofs.upgrades.kp[3].effect);
                eff = eff.add(tmp.value.kua.proofs.upgrades.kp[6].effect);
                return eff;
            }),
            effect: computed(() => {
                let eff = KUA_PROOF_UPGS.kp[0].effPer.value;
                eff = eff.mul(tmp.value.kua.proofs.upgrades.kp[0].trueLevel);
                return eff;
            })
        },
        {
            show: computed(() => { return true; }),
            title: `Trial and Error`,
            perDesc: computed(() => {
                return `KProof amount adds +${format(KUA_PROOF_UPGS.kp[1].effPer.value, 2)} to KProof Exponent.`;
            }),
            desc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.kp[1].effect.value, 2)} to KProof Exponent.`;
            }),
            cost: computed(() => {
                return Decimal.pow(smoothExp(player.value.gameProgress.kua.proofs.upgrades.kp[1], 1.002, false), 2.5).pow_base(100).mul(1e5);
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, 1e5)) { return D(-1); }
                return smoothExp(Decimal.div(player.value.gameProgress.kua.proofs.amount, 1e5).log(100).root(2.5), 1.002, true);
            }),
            effPer: computed(() => {
                let eff = Decimal.max(player.value.gameProgress.kua.proofs.amount, 1).log10().add(1).log10().div(2);
                eff = eff.mul(tmp.value.kua.proofs.upgrades.kp[4].effect);
                return eff;
            }),
            effect: computed(() => {
                let eff = KUA_PROOF_UPGS.kp[1].effPer.value;
                eff = eff.mul(tmp.value.kua.proofs.upgrades.kp[1].trueLevel);
                return eff;
            })
        },
        {
            show: computed(() => { return true; }),
            title: `Crafted Experiments`,
            perDesc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.kp[2].effPer.value.mul(100), 1)}% (additive) to KProof Exponent.`;
            }),
            desc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.kp[2].effect.value.sub(1).mul(100), 1)}% to KProof Exponent.`;
            }),
            cost: computed(() => {
                return Decimal.pow(smoothExp(player.value.gameProgress.kua.proofs.upgrades.kp[2], 1.003, false), 3).pow10().mul(1e9);
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, 1e9)) { return D(-1); }
                return smoothExp(Decimal.div(player.value.gameProgress.kua.proofs.amount, 1e9).log10().root(3), 1.003, true);
            }),
            effPer: computed(() => {
                let eff = D(0.1);
                eff = eff.add(tmp.value.kua.proofs.upgrades.kp[5].effect);
                return eff;
            }),
            effect: computed(() => {
                let eff = KUA_PROOF_UPGS.kp[2].effPer.value;
                eff = eff.mul(tmp.value.kua.proofs.upgrades.kp[2].trueLevel);
                return eff.add(1);
            })
        },
        {
            show: computed(() => {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 0);
            }),
            title: `Complex Breakthrough`,
            perDesc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.kp[3].effPer.value, 2)} to Simple Breakthrough effect base.`;
            }),
            desc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.kp[3].effect.value, 2)} to Simple Breakthrough effect base.`;
            }),
            cost: computed(() => {
                return Decimal.add(player.value.gameProgress.kua.proofs.upgrades.kp[3], 1).log10().add(1).pow(2).sub(1).pow10().sub(1).pow10().mul(1e30);
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, 1e30)) { return D(-1); }
                return Decimal.div(player.value.gameProgress.kua.proofs.amount, 1e30).log10().add(1).log10().add(1).root(2).sub(1).pow10().sub(1);
            }),
            effPer: computed(() => {
                let eff = D(0.1);
                eff = eff.add(tmp.value.kua.proofs.upgrades.kp[6].effect);
                return eff;
            }),
            effect: computed(() => {
                let eff = KUA_PROOF_UPGS.kp[3].effPer.value;
                eff = eff.mul(tmp.value.kua.proofs.upgrades.kp[3].trueLevel);
                return eff;
            })
        },
        {
            show: computed(() => {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 0);
            }),
            title: `Successive Trials`,
            perDesc: computed(() => {
                return `Strange KP multiplies Trial and Error effect base by +${format(KUA_PROOF_UPGS.kp[4].effPer.value, 2)}×.`;
            }),
            desc: computed(() => {
                return `×${format(KUA_PROOF_UPGS.kp[4].effect.value, 2)} to Trial and Error effect base.`;
            }),
            cost: computed(() => {
                return Decimal.add(player.value.gameProgress.kua.proofs.upgrades.kp[4], 1).log10().add(1).pow(2.5).sub(1).pow10().sub(1).pow10().mul(1e50);
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, 1e50)) { return D(-1); }
                return Decimal.div(player.value.gameProgress.kua.proofs.amount, 1e50).log10().add(1).log10().add(1).root(2.5).sub(1).pow10().sub(1);
            }),
            effPer: computed(() => {
                let eff = Decimal.max(player.value.gameProgress.kua.proofs.strange.amount, 1).log10().root(2).div(10);
                eff = tmp.value.kua.proofs.upgrades.kp[7].effect;
                return eff;
            }),
            effect: computed(() => {
                const eff = KUA_PROOF_UPGS.kp[4].effPer.value.mul(tmp.value.kua.proofs.upgrades.kp[4].trueLevel).add(1);
                return eff;
            })
        },
        {
            show: computed(() => {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 0);
            }),
            title: `Meta Experiments`,
            perDesc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.kp[5].effPer.value.mul(100), 1)}% (additive) to Crafted Experiments effect base`;
            }),
            desc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.kp[5].effect.value.mul(100), 1)}% (additive) to Crafted Experiments effect base`;
            }),
            cost: computed(() => {
                return Decimal.add(player.value.gameProgress.kua.proofs.upgrades.kp[5], 1).log10().add(1).pow(3).sub(1).pow10().sub(1).pow10().mul(1e80);
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, 1e80)) { return D(-1); }
                return Decimal.div(player.value.gameProgress.kua.proofs.amount, 1e80).log10().add(1).log10().add(1).root(3).sub(1).pow10().sub(1);
            }),
            effPer: computed(() => {
                return D(0.015);
            }),
            effect: computed(() => {
                return Decimal.mul(tmp.value.kua.proofs.upgrades.kp[5].trueLevel, KUA_PROOF_UPGS.kp[5].effPer.value);
            })
        },
        {
            show: computed(() => {
                return Decimal.gt(player.value.gameProgress.kua.proofs.finicky.amount, 0);
            }),
            title: `Million Dollar Breakthrough`,
            perDesc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.kp[6].effPer.value, 2)} to Simple and Complex Breakthrough effect base.`;
            }),
            desc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.kp[6].effect.value, 2)} to Simple and Complex Breakthrough effect base.`;
            }),
            cost: computed(() => {
                return Decimal.add(player.value.gameProgress.kua.proofs.upgrades.kp[6], 1).pow(0.2).pow_base(4000).pow10();
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, "e4000")) { return D(-1); }
                return Decimal.log10(player.value.gameProgress.kua.proofs.amount).log(4000).root(0.2).sub(1);
            }),
            effPer: computed(() => {
                return D(0.02);
            }),
            effect: computed(() => {
                return Decimal.mul(tmp.value.kua.proofs.upgrades.kp[6].trueLevel, KUA_PROOF_UPGS.kp[6].effPer.value);
            })
        },
        {
            show: computed(() => {
                return Decimal.gt(player.value.gameProgress.kua.proofs.finicky.amount, 0);
            }),
            title: `Verification Trials`,
            perDesc: computed(() => {
                return `Make Successive Trials +${format(KUA_PROOF_UPGS.kp[7].effPer.value, 2)}× stronger based off of your KP.`;
            }),
            desc: computed(() => {
                return `×${format(KUA_PROOF_UPGS.kp[7].effect.value, 2)} Successive Trial effect base.`;
            }),
            cost: computed(() => {
                return Decimal.add(player.value.gameProgress.kua.proofs.upgrades.kp[7], 1).pow(0.225).pow_base(20000).pow10();
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, "e20000")) { return D(-1); }
                return Decimal.log10(player.value.gameProgress.kua.proofs.amount).log(20000).root(0.225).sub(1);
            }),
            effPer: computed(() => {
                return Decimal.max(player.value.gameProgress.kua.proofs.amount, 1e100).log10().log10().log2().root(4).sub(1).div(4).add(1);
            }),
            effect: computed(() => {
                return Decimal.pow(KUA_PROOF_UPGS.kp[7].effPer.value, tmp.value.kua.proofs.upgrades.kp[7].trueLevel);
            })
        },
        {
            show: computed(() => {
                return Decimal.gt(player.value.gameProgress.kua.proofs.finicky.amount, 0);
            }),
            title: `Ultimate Experiments`,
            perDesc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.kp[8].effPer.value, 2)} free upgrades to KP Upgrades 4-6.`;
            }),
            desc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.kp[8].effect.value, 2)} free upgrades to KP Upgrades 4-6.`;
            }),
            cost: computed(() => {
                return Decimal.add(player.value.gameProgress.kua.proofs.upgrades.kp[8], 1).pow(0.25).pow_base(80000).pow10();
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.amount, "e80000")) { return D(-1); }
                return Decimal.log10(player.value.gameProgress.kua.proofs.amount).log(80000).root(0.25).sub(1);
            }),
            effPer: computed(() => {
                return D(0.25);
            }),
            effect: computed(() => {
                return Decimal.mul(tmp.value.kua.proofs.upgrades.kp[8].trueLevel, KUA_PROOF_UPGS.kp[8].effPer.value);
            })
        },
    ],
    skp: [
        {
            show: computed(() => {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 0);
            }),
            title: `Untimely Difference`,
            perDesc: computed(() => {
                return `Times you have SKP reset adds +${format(KUA_PROOF_UPGS.skp[0].effPer.value, 2)} free levels to the first 3 effect upgrades.`;
            }),
            desc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.skp[0].effect.value, 2)} free levels to the first 3 effect upgrades.`;
            }),
            cost: computed(() => {
                return Decimal.pow(smoothExp(player.value.gameProgress.kua.proofs.upgrades.skp[0], 1.05, false), 1.5).pow_base(2).mul(5);
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.strange.amount, 5)) { return D(-1); }
                return smoothExp(Decimal.div(player.value.gameProgress.kua.proofs.strange.amount, 5).log2().root(1.5), 1.05, true);
            }),
            effPer: computed(() => {
                return Decimal.add(player.value.gameProgress.kua.proofs.strange.times, 1).log10().sqrt().div(10);
            }),
            effect: computed(() => {
                const eff = KUA_PROOF_UPGS.skp[0].effPer.value.mul(tmp.value.kua.proofs.upgrades.skp[0].trueLevel);
                return eff;
            })
        },
        {
            show: computed(() => {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 5);
            }),
            title: `Uncertain Characteristic`,
            perDesc: computed(() => {
                return `SKP adds +${format(KUA_PROOF_UPGS.skp[1].effPer.value, 2)} free levels to the first 3 KProof upgrades.`;
            }),
            desc: computed(() => {
                return `+${format(KUA_PROOF_UPGS.skp[1].effect.value, 2)} free levels to the first 3 KProof upgrades.`;
            }),
            cost: computed(() => {
                return Decimal.pow(player.value.gameProgress.kua.proofs.upgrades.skp[1], 2).pow_base(5).mul(25);
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.strange.amount, 25)) { return D(-1); }
                return Decimal.div(player.value.gameProgress.kua.proofs.strange.amount, 25).log(5).root(2);
            }),
            effPer: computed(() => {
                return Decimal.add(player.value.gameProgress.kua.proofs.strange.amount, 1).log10().add(1).log10().mul(2);
            }),
            effect: computed(() => {
                return KUA_PROOF_UPGS.skp[1].effPer.value.mul(tmp.value.kua.proofs.upgrades.skp[1].trueLevel);
            })
        },
        {
            show: computed(() => {
                return Decimal.gt(player.value.gameProgress.kua.proofs.strange.amount, 25);
            }),
            title: `Unstable Conclusions`,
            perDesc: computed(() => {
                return `The first 3 KProof upgrades' costs are delayed by ${format(KUA_PROOF_UPGS.skp[2].effPer.value, 1)}.`;
            }),
            desc: computed(() => {
                return `The first 3 KProof upgrades' costs are delayed by ${format(KUA_PROOF_UPGS.skp[2].effect.value, 1)}.`;
            }),
            cost: computed(() => {
                return Decimal.pow(player.value.gameProgress.kua.proofs.upgrades.skp[2], 3).pow10().mul(1e3);
            }),
            target: computed(() => {
                if (Decimal.lt(player.value.gameProgress.kua.proofs.strange.amount, 1e3)) { return D(-1); }
                return Decimal.div(player.value.gameProgress.kua.proofs.strange.amount, 1e3).log10().root(3);
            }),
            effPer: computed(() => {
                return D(5);
            }),
            effect: computed(() => {
                return Decimal.mul(tmp.value.kua.proofs.upgrades.skp[2].trueLevel, KUA_PROOF_UPGS.skp[2].effPer.value);
            })
        },
    ],
    fkp: [
        {
            show: computed(() => { return true; }),
            title: `Difficult Task`,
            perDesc: computed(() => {
                return `You aren't able to unlock this right now...`;
                // return `Unlock FKP Allocation and the Cyan alloc.`;
            }),
            desc: computed(() => {
                return tmp.value.kua.proofs.upgrades.fkp[0].trueLevel.gt(0) ? 'Unlocked' : 'Locked';
            }),
            cost: computed(() => {
                // placeholder condition
                return Decimal.add(player.value.gameProgress.kua.proofs.upgrades.fkp[0], Infinity);
                // return Decimal.gt(x, 0) ? D(Infinity) : D(1);
            }),
            target: computed(() => {
                // placeholder condition
                return Decimal.mul(player.value.gameProgress.kua.proofs.finicky.amount, 0).sub(1);
                // if (Decimal.lt(player.value.gameProgress.kua.proofs.finicky.amount, 1)) { return D(-1); }
                // return D(0);
            }),
            effPer: computed(() => {
                return D(1);
            }),
            effect: computed(() => {
                return D(1);
            })
        },
        {
            show: computed(() => {
                return tmp.value.kua.proofs.upgrades.fkp[0].trueLevel.gt(0);
            }),
            title: `Upgrade Refactor`,
            perDesc: computed(() => {
                return `Every KP upgrade delays stale KP by ${format(2)}× and unlock the Yellow alloc.`;
            }),
            desc: computed(() => {
                return `Stale KP is delayed by ×${format(KUA_PROOF_UPGS.fkp[1].effect.value, 1)}.`;
            }),
            cost: computed(() => {
                // placeholder condition
                return Decimal.add(player.value.gameProgress.kua.proofs.upgrades.fkp[1], Infinity);
                // return Decimal.gt(x, 0) ? D(Infinity) : D(10);
            }),
            target: computed(() => {
                // placeholder condition
                return Decimal.mul(player.value.gameProgress.kua.proofs.finicky.amount, 0).sub(1);
                // if (Decimal.lt(player.value.gameProgress.kua.proofs.finicky.amount, 10)) { return D(-1); }
                // return D(0);
            }),
            effPer: computed(() => {
                return D(1);
            }),
            effect: computed(() => {
                let eff = D(0);
                for (let i = 0; i < KUA_PROOF_UPGS.kp.length; i++) {
                    eff = Decimal.add(eff, player.value.gameProgress.kua.proofs.upgrades.kp[i]);
                }
                eff = eff.mul(tmp.value.kua.proofs.upgrades.fkp[1].trueLevel);
                return Decimal.pow(2, eff);
            })
        },
        {
            show: computed(() => {
                return tmp.value.kua.proofs.upgrades.fkp[1].trueLevel.gt(0);
            }),
            title: `Stupid Hinderances`,
            perDesc: computed(() => {
                return `Stale KProofs are weakened by ${format(5)}% and unlock the White alloc.`;
            }),
            desc: computed(() => {
                return tmp.value.kua.proofs.upgrades.fkp[2].trueLevel.gt(0) ? 'Unlocked' : 'Locked';
            }),
            cost: computed(() => {
                // placeholder condition
                return Decimal.add(player.value.gameProgress.kua.proofs.upgrades.fkp[2], Infinity);
                // return Decimal.gt(x, 0) ? D(Infinity) : D(100);
            }),
            target: computed(() => {
                // placeholder condition
                return Decimal.mul(player.value.gameProgress.kua.proofs.finicky.amount, 0).sub(1);
                // if (Decimal.lt(player.value.gameProgress.kua.proofs.finicky.amount, 100)) { return D(-1); }
                // return D(0);
            }),
            effPer: computed(() => {
                return D(1);
            }),
            effect: computed(() => {
                return D(1);
            })
        },
    ]
}