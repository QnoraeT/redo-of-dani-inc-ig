import { D } from "@/calc";
import { format, formatPerc } from "@/format";
import { player, tmp } from "@/main";
import Decimal from "break_eternity.js";
import { computed, type ComputedRef } from "vue";
import { hasGrowanMilestone } from "../../Game_Layer4/Game_Growan/Game_Growan";
import { MAIN_UPG_DATA } from "../../Game_Main/Game_MainUpgrades/Game_MainUpgrades";

export const buyKShardUpg = (id: number) => {
    if (id === player.value.gameProgress.kua.upgrades[0]) {
        if (Decimal.gte(player.value.gameProgress.kua.kshards, KUA_UPGRADES.KShards[id].cost)) {
            player.value.gameProgress.kua.upgrades[0]++;
            player.value.gameProgress.kua.kshards = Decimal.sub(player.value.gameProgress.kua.kshards, KUA_UPGRADES.KShards[id].cost);
        }
    }
};

export const buyKPowerUpg = (id: number) => {
    if (id === player.value.gameProgress.kua.upgrades[1]) {
        if (Decimal.gte(player.value.gameProgress.kua.kpower, KUA_UPGRADES.KPower[id].cost)) {
            player.value.gameProgress.kua.upgrades[1]++;
            player.value.gameProgress.kua.kpower = Decimal.sub(player.value.gameProgress.kua.kpower, KUA_UPGRADES.KPower[id].cost);
        }
    }
};

export const buyKMainUpg = (id: number) => {
    if (id === player.value.gameProgress.kua.upgrades[2]) {
        if (Decimal.gte(player.value.gameProgress.kua.amount, KUA_UPGRADES.Kua[id].cost)) {
            player.value.gameProgress.kua.upgrades[2]++;
            player.value.gameProgress.kua.amount = Decimal.sub(player.value.gameProgress.kua.amount, KUA_UPGRADES.Kua[id].cost);
        }
    }
};

export const getKuaUpgrade = (sp: "s" | "p" | "k", id: number): boolean => {
    if (sp === "s") {
        return (
            player.value.gameProgress.kua.upgrades[0] >= id &&
            tmp.value.kua.active.upgrades[0]
        );
    }
    if (sp === "p") {
        return (
            player.value.gameProgress.kua.upgrades[1] >= id &&
            tmp.value.kua.active.upgrades[1]
        );
    }
    if (sp === "k") {
        return (
            player.value.gameProgress.kua.upgrades[2] >= id &&
            tmp.value.kua.active.upgrades[2]
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
    desc: ComputedRef<string>;
    cost: Decimal;
    show: boolean;
    eff?: ComputedRef<Decimal>;
    eff2?: ComputedRef<Decimal>;
    implemented?: boolean;
};

export const KUA_UPGRADES: Kua_Upgrade_List = {
    KShards: [
        {
            // 1
            desc: computed(() => {
                return `Gain ${format(0.01, 2)}% of your pending PRai per second, and Kuaraniai Gain is multiplied by ${format(1.5, 2)}×`;
            }),
            cost: D(0.1),
            show: true
        },
        {
            // 2
            desc: computed(() => {
                return `KShards boost PRai's effect. Currently: ${format(KUA_UPGRADES.KShards[1].eff!.value, 2)}×`;
            }),
            eff: computed(() => {
                let i = D(1);
                if (tmp.value.kua.active.kshards.effects) {
                    i = Decimal.max(tmp.value.kua.effectiveKS, 0);
                    i = i.add(i.mul(4)).add(i.pow(2).mul(4)).add(1).log10().pow(0.85).pow10();
                    if (getKuaUpgrade("s", 10)) {
                        i = i.pow(tmp.value.kua.effects.kshardPrai);
                    }
                }
                return i;
            }),
            cost: D(1),
            show: true
        },
        {
            // 3
            desc: computed(() => {
                return `UP1's effect reduces UP2's scaling strength. Currently: ${formatPerc(KUA_UPGRADES.KShards[2].eff!.value)}`;
            }),
            eff: computed(() => {
                let i = D(1);
                i = Decimal.max(MAIN_UPG_DATA[0].effect(), 1e10)
                    .log10()
                    .div(10)
                    .sqrt()
                    .sub(1)
                    .div(5)
                    .add(1);
                return i;
            }),
            cost: D(2),
            show: true
        },
        {
            // 4
            desc: computed(() => {
                return `UP1's scaling starts ${format(5)} later and is ${format(5, 3)}% weaker, and superscaling starts ${format(2)} later and is ${format(2, 3)}% weaker.`;
            }),
            cost: D(10),
            show: true
        },
        {
            // 5
            desc: computed(() => {
                return `PR2's effect exponent increases twice as fast, UP2's base is increased from ${format(4 / 3, 3)} to ${format(1.5, 3)}.`;
            }),
            cost: D(400),
            show: true
        },
        {
            // 6
            desc: computed(() => {
                return `UP2's superscaling and softcap are ${format(20, 3)}% weaker.`;
            }),
            cost: D(2500),
            show: true
        },
        {
            // 7
            desc: computed(() => {
                return `Upgrade 1's linear cost scaling is multiplied by ×${format(0.95, 2)}, and Point gain is boosted by Kuaraniai, which increases over time in PRai.`;
            }),
            cost: D(1e7),
            show: true
        },
        {
            // 8
            desc: computed(() => {
                return `KPower's UPG2 effect has a better formula, and KShards increase PRai gain. Currently: ${format(KUA_UPGRADES.KShards[7].eff!.value, 2)}×`;
            }),
            eff: computed(() => {
                let i = D(1);
                if (tmp.value.kua.active.kshards.effects) {
                    i = Decimal.max(tmp.value.kua.effectiveKS, 1);
                    i = i.pow(0.05).log10().pow(1.5).pow10();
                }
                return i;
            }),
            cost: D(1e8),
            show: true
        },
        {
            // 9
            desc: computed(() => {
                return `KShards delay Upgrade 2's cost growth. Currently: +${format(KUA_UPGRADES.KShards[8].eff!.value, 2)} purchases`;
            }),
            eff: computed(() => {
                let i = Decimal.max(tmp.value.kua.effectiveKS, 10);
                i = i.log10().add(1).pow(4).div(16).ln().div(2).add(1).pow(2);
                return i;
            }),
            cost: D(2e10),
            show: true
        },
        {
            // 10
            desc: computed(() => {
                return `Kuaraniai buffs KShard's PRai effect boost and increases KPower gain.`;
            }),
            cost: D(1e13),
            show: true
        },
        {
            // 11
            desc: computed(() => {
                return `PR2 above or equal to ${format(45)} boosts Kuaraniai effects. Currently: ^${format(KUA_UPGRADES.KShards[10].eff!.value, 4)}`;
            }),
            eff: computed(() => {
                let i = Decimal.max(player.value.gameProgress.pr2.amount, 45).sub(45);
                i = i.mul(0.01).add(1).sqrt().sub(1).mul(2).add(1);
                return i;
            }),
            cost: D(1e15),
            show: true
        },
        {
            // 12
            desc: computed(() => {
                return `Upgrade 4 boosts Kuaraniai gain at a vastly reduced rate. Currently: ${format(KUA_UPGRADES.KShards[11].eff!.value, 3)}×`;
            }),
            eff: computed(() => {
                let i = Decimal.max(MAIN_UPG_DATA[3].effect(), 1);
                i = i.log10().pow(0.2).add(1);
                return i;
            }),
            cost: D(1e17),
            show: true
        },
        {
            // 13
            desc: computed(() => {
                return `Upgrade 5 boosts KShard gain at a vastly reduced rate. Currently: ${format(KUA_UPGRADES.KShards[12].eff!.value, 3)}×`;
            }),
            eff: computed(() => {
                let i = Decimal.max(MAIN_UPG_DATA[4].effect(), 1);
                i = i.log10().pow(0.2).add(1);
                return i;
            }),
            cost: D(1e19),
            show: true
        },
        {
            // 14
            desc: computed(() => {
                return `Upgrade 6 boosts KPower gain at a vastly increased rate, and Upgrade 3 also affects Upgrade 2 at a reduced rate. Currently: ${format(KUA_UPGRADES.KShards[13].eff!.value, 3)}×, +${format(KUA_UPGRADES.KShards[13].eff2!.value!, 3)}`;
            }),
            eff: computed(() => {
                let i = Decimal.add(MAIN_UPG_DATA[5].effect(), 1);
                i = i.pow(4);
                return i;
            }),
            eff2: computed(() => {
                let i = Decimal.max(MAIN_UPG_DATA[2].effect(), 1);
                i = i.div(3);
                return i;
            }),
            cost: D(1e22),
            show: true
        },
        {
            // 15
            desc: computed(() => {
                if (hasGrowanMilestone(3)) {
                    return `Upgrade 1 is ${format(10, 1)}% more effective.`;
                }
                return `Unlock Upgrade 7 which raises Upgrade 1's effect.`;
            }),
            cost: D(1e25),
            show: true
        },
        {
            // 16
            desc: computed(() => {
                if (hasGrowanMilestone(3)) {
                    return `Upgrade 2 is ${format(10, 1)}% more effective.`;
                }
                return `Unlock Upgrade 8 which raises Upgrade 1's cost.`;
            }),
            cost: D(1e30),
            show: true
        },
        {
            // 17
            desc: computed(() => {
                if (hasGrowanMilestone(3)) {
                    return `Upgrade 3 is ${format(10, 1)}% more effective.`;
                }
                return `Unlock Upgrade 9 which multiplies Upgrade 1's base.`;
            }),
            cost: D(1e35),
            show: true
        },
    ],
    KPower: [
        {
            // 1
            desc: computed(() => {
                return `Multiply KShard gain by ${format(2.5, 1)}x, and KPower buffs Upgrade 2's base. Currently: +${format(KUA_UPGRADES.KPower[0].eff!.value, 4)}`;
            }),
            eff: computed(() => {
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
            }),
            cost: D(1),
            show: true
        },
        {
            // 2
            desc: computed(() => {
                return player.value.gameProgress.unlocks.col
                    ? `KPower increases UP3's effectiveness. Currently: +${format(KUA_UPGRADES.KPower[1].eff!.value.sub(1).mul(100), 3)}%`
                    : `Be able to unlock a new feature at ${format(1e2)} Kuaraniai, and KPower increases UP3's effectiveness. Currently: +${format(KUA_UPGRADES.KPower[1].eff!.value.sub(1).mul(100), 3)}%`;
            }),
            eff: computed(() => {
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
            }),
            cost: D(1e2),
            show: true
        },
        {
            // 3
            desc: computed(() => {
                return `Kuaraniai's effect on UP1's scaling uses a better formula, and add another effect.`;
            }),
            cost: D(1e3),
            show: true
        },
        {
            // 4
            desc: computed(() => {
                return `UP2's softcap is ${format(40, 3)}% weaker and starts later based off of your KPower. Currently: ${format(KUA_UPGRADES.KPower[3].eff!.value, 2)}x`;
            }),
            eff: computed(() => {
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
            }),
            cost: D(8500),
            show: true
        },
        {
            // 5
            desc: computed(() => {
                return `PRai's effect is more powerful based off of your KPower. Currently: ^${format(KUA_UPGRADES.KPower[4].eff!.value, 4)}`;
            }),
            eff: computed(() => {
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
            }),
            cost: D(5e4),
            show: true
        },
        {
            // 6
            desc: computed(() => {
                return `Kuaraniai also delays Upgrade 2's softcap, and its effect of Upgrade 1's scaling also apply to superscaling at a reduced rate.`;
            }),
            cost: D(1e6),
            show: true
        },
        {
            // 7
            desc: computed(() => {
                return `Upgrade 2's effect is cubed, but its other effects are not boosted.`;
            }),
            cost: D(1e8),
            show: true
        },
        {
            // 8
            desc: computed(() => {
                return `Upgrade 1 is dilated by ^${format(1.01, 2)}, PR2's effect uses a better formula, and unlock KBlessings at ${format(1e6)} Kuaraniai.`;
            }),
            cost: D(1e11),
            show: true
        },
        {
            // 9
            desc: computed(() => {
                return `PR2 slightly weakens UP1 and UP2's hyper scaling. Currently: ${formatPerc(KUA_UPGRADES.KPower[8].eff!.value)}`;
            }),
            eff: computed(() => {
                if (Decimal.lt(player.value.gameProgress.pr2.amount, 25)) {
                    return D(1);
                }
                let eff = Decimal.sub(player.value.gameProgress.pr2.amount, 25);
                eff = eff.div(eff.add(20)).mul(0.25).add(1);
                return eff;
            }),
            cost: D(1e15),
            show: true
        },
        {
            // 10
            desc: computed(() => {
                return `UP1 and UP2's cost scaling is reduced based off of your points. Currently: ${formatPerc(KUA_UPGRADES.KPower[9].eff!.value)}`;
            }),
            eff: computed(() => {
                let eff = Decimal.max(player.value.gameProgress.points, 1e10);
                eff = eff.log10().log10().ln().div(50).add(1).sqrt();
                return eff;
            }),
            cost: D(1e18),
            show: true
        },
        {
            // 11
            desc: computed(() => {
                return `Upgrades 4, 5, and 6's cost scaling is ${format(10)}% slower.`;
            }),
            cost: D(1e21),
            show: true
        },
        {
            // 12
            desc: computed(() => {
                return `One-Upgrade #4 is improved.`;
            }),
            cost: D(1e24),
            show: true
        },
        {
            // 13
            desc: computed(() => {
                return `Upgrade 2's linear cost scaling is reduced by ×${format(0.92, 2)}.`;
            }),
            cost: D(1e28),
            show: true
        },
        {
            // 14
            desc: computed(() => {
                return `One-Upgrade #6 is ${format(10)}% stronger.`;
            }),
            cost: D(1e33),
            show: true
        },
        {
            // 15
            desc: computed(() => {
                return `Kuaraniai’s effects are ${format(5)}% stronger.`;
            }),
            cost: D(1e40),
            show: true
        },
        {
            // 16
            desc: computed(() => {
                return `Upgrade 1's effectiveness is increased based off of how much KPower you have. Currently: +${format(KUA_UPGRADES.KPower[15].eff!.value.sub(1).mul(100), 3)}%`;
            }),
            eff: computed(() => {
                let eff = Decimal.max(tmp.value.kua.effectiveKP, 1e45);
                eff = eff.log10().log(45).sub(1).div(5).add(1);
                return eff;
            }),
            cost: D(1e45),
            show: true
        },
        {
            // 17
            desc: computed(() => {
                return `All KShards and KPower's effects are stronger based off of their respective resource. Currently: KS: ${format(KUA_UPGRADES.KPower[16].eff!.value.sub(1).mul(100), 3)}%, KP: ${format(KUA_UPGRADES.KPower[16].eff2!.value.sub(1).mul(100), 3)}%`;
            }),
            eff: computed(() => {
                let eff = Decimal.max(tmp.value.kua.effectiveKS, 1);
                eff = eff.log10().sqrt().div(250).add(1).ln().add(1);
                return eff;
            }),
            eff2: computed(() => {
                let eff = Decimal.max(tmp.value.kua.effectiveKP, 1);
                eff = eff.log10().cbrt().div(250).add(1).ln().add(1);
                return eff;
            }),
            cost: D(1e50),
            show: true
        }
    ],
    Kua: [
        {
            // 1
            desc: computed(() => {
                return `Improve the PRai generatior by ${format(100)}×.`;
            }),
            cost: D(1e7),
            show: true
        },
        {
            // 2
            desc: computed(() => {
                return `KBlessing gain is multiplied by your Kuaraniai amount.`;
            }),
            cost: D(1e8),
            show: true
        },
        {
            // 3
            desc: computed(() => {
                return player.value.gameProgress.unlocks.kp
                    ? `Increase the KShard and KPower effect to PRai and Points.`
                    : `Increase the KShard and KPower effect to PRai and Points, and unlock KProofs.`;
            }),
            cost: D(1e9),
            show: true
        },
        {
            // 4
            desc: computed(() => {
                return `Decrease the PR2 scaling down to ${format(8)} and increase the KShard and KPower effect to PRai and Points.`;
            }),
            cost: D(1e11),
            show: true
        },
        {
            // 5
            desc: computed(() => {
                return `Multiply Upgrade 6's base by ${format(1.5, 2)}×, decrease the PR2 scaling down to ${format(7)}, and increase the KShard and KPower effect to PRai and Points.`;
            }),
            cost: D(1e13),
            show: true
        },
    ]
};