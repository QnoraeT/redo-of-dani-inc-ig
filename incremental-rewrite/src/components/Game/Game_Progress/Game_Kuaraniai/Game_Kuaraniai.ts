import Decimal, { type DecimalSource } from "break_eternity.js";
import { NaNCheck, player, tmp } from "@/main";
import { format } from "@/format";
import { D } from "@/calc";
import { ACHIEVEMENT_DATA } from "../../Game_Achievements/Game_Achievements";
import { pushFactor, resetFactor, setFactor } from "../../Game_Stats/Game_Stats";
import { KUA_BLESS_TIER, KUA_BLESS_UPGS } from "./Game_KuaBlessings/Game_KuaBlessings";
import { getColResEffect } from "../Game_Colosseum/Game_ColResearches/Game_ColResearches";
import { getKuaUpgrade, KUA_UPGRADES } from "./Game_KuaUpgrades/Game_KuaUpgrades";

export const updateAllKua = (delta: DecimalSource) => {
    tmp.value.kua.canBuyUpg = false;
    updateKua(-1, delta);
    updateKua(3, delta);
    updateKua(2, delta);
    updateKua(1, delta);
    updateKua(0, delta);
};

export const updateKua = (type: number, delta: DecimalSource) => {
    let i, j, k, generate, data;
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
            tmp.value.kua.active.kpower.effects = true;
            tmp.value.kua.active.kpower.gain = true;
            tmp.value.kua.active.kshards.effects = true;
            tmp.value.kua.active.kshards.gain = true;
            tmp.value.kua.active.upgrades = [true, true, true];
            tmp.value.kua.active.effects = true;
            tmp.value.kua.active.gain = true;

            // if (inChallenge("nk")) {
            //     tmp.value.kua.active.blessings.gain = false;
            //     tmp.value.kua.active.blessings.effects = false;
            //     tmp.value.kua.active.blessings.ranks.rank = false;
            //     tmp.value.kua.active.blessings.ranks.tier = false;
            //     tmp.value.kua.active.blessings.ranks.tetr = false;
            //     for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
            //         tmp.value.kua.active.blessings.upgrades[i] = false;
            //     }
            //     tmp.value.kua.active.proofs.gain = false;
            //     tmp.value.kua.active.kpower.effects = false;
            //     tmp.value.kua.active.kpower.gain = false;
            //     tmp.value.kua.active.kshards.effects = false;
            //     tmp.value.kua.active.kshards.gain = false;
            //     tmp.value.kua.active.upgrades = [false, false, false];
            //     tmp.value.kua.active.effects = false;
            //     tmp.value.kua.active.gain = false;
            // }
            break;
        case 3:
            break;
        case 2:
            player.value.gameProgress.kua.blessings.clickCooldown = Decimal.sub(player.value.gameProgress.kua.blessings.clickCooldown, delta);

            tmp.value.kua.blessings.rank = KUA_BLESS_TIER.rank.rounded.value;
            tmp.value.kua.blessings.tier = KUA_BLESS_TIER.tier.rounded.value;
            tmp.value.kua.blessings.tetr = KUA_BLESS_TIER.tetr.rounded.value;

            resetFactor([4, 4]);
            resetFactor([4, 5]);

            tmp.value.kua.blessings.perClick = D(1);
            tmp.value.kua.blessings.perSec = D(2);
            setFactor(0, [4, 4], "Base", `${format(0.1, 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, true);
            setFactor(0, [4, 5], "Base", `${format(1, 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, true);

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(KUA_BLESS_TIER.rank.effects.kuaBlessGainActive.value);
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(KUA_BLESS_TIER.rank.effects.kuaBlessGainIdle.value);
            setFactor(1, [4, 4], "KBlessing Rank", `×${format(KUA_BLESS_TIER.rank.effects.kuaBlessGainActive.value, 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, true, "kb");
            setFactor(1, [4, 5], "KBlessing Rank", `×${format(KUA_BLESS_TIER.rank.effects.kuaBlessGainIdle.value, 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, true, "kb");

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(KUA_BLESS_UPGS[1].eff.value[1]);
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(KUA_BLESS_UPGS[1].eff.value[1]);
            setFactor(2, [4, 4], "KBlessing Upgrade 1", `×${format(KUA_BLESS_UPGS[1].eff.value[1], 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[1], 6), "kb");
            setFactor(2, [4, 5], "KBlessing Upgrade 1", `×${format(KUA_BLESS_UPGS[1].eff.value[1], 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[1], 6), "kb");

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(KUA_BLESS_TIER.tetr.effects.pr2Eff.value);
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(KUA_BLESS_TIER.tetr.effects.pr2Eff.value);
            setFactor(3, [4, 4], "KBlessing Tetr", `×${format(KUA_BLESS_TIER.tetr.effects.pr2Eff.value, 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, Decimal.gte(tmp.value.kua.blessings.tetr, 1), "kb");
            setFactor(3, [4, 5], "KBlessing Tetr", `×${format(KUA_BLESS_TIER.tetr.effects.pr2Eff.value, 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, Decimal.gte(tmp.value.kua.blessings.tetr, 1), "kb");

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(tmp.value.kua.effects.bless);
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(tmp.value.kua.effects.bless);
            setFactor(4, [4, 4], "Kuaraniai Upgrade 2", `×${format(tmp.value.kua.effects.bless, 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, player.value.gameProgress.kua.upgrades[2] >= 2, "kua");
            setFactor(4, [4, 5], "Kuaraniai Upgrade 2", `×${format(tmp.value.kua.effects.bless, 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, player.value.gameProgress.kua.upgrades[2] >= 2, "kua");

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(getColResEffect(5));
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(getColResEffect(4));
            // setFactor(6, [4, 4], "Compliance", `×${format(getColResEffect(5), 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, Decimal.gte(timesCompleted('im'), 1e33), "col");
            // setFactor(6, [4, 5], "Defiance", `×${format(getColResEffect(4), 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, Decimal.gte(timesCompleted('im'), 1e33), "col");

            tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(ACHIEVEMENT_DATA[3].effect.value);
            tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(ACHIEVEMENT_DATA[3].effect.value);
            setFactor(7, [4, 4], "Achievement Tier 4", `×${format(ACHIEVEMENT_DATA[3].effect.value, 2)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, Decimal.gte(ACHIEVEMENT_DATA[3].effect.value, 1), "ach");
            setFactor(7, [4, 5], "Achievement Tier 4", `×${format(ACHIEVEMENT_DATA[3].effect.value, 2)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, Decimal.gte(ACHIEVEMENT_DATA[3].effect.value, 1), "ach");

            if (player.value.gameProgress.layer4.gro.upgrades.idle.includes(0)) {
                tmp.value.kua.blessings.perSec = tmp.value.kua.blessings.perSec.mul(10);
                pushFactor([4, 5], "Grōwan Idle Upg. 1", `×${format(10)}`, `${format(tmp.value.kua.blessings.perSec, 2)}`, "growan");
            }

            if (player.value.gameProgress.layer4.gro.upgrades.active.includes(0)) {
                tmp.value.kua.blessings.perClick = tmp.value.kua.blessings.perClick.mul(10);
                pushFactor([4, 5], "Grōwan Active Upg. 1", `×${format(10)}`, `${format(tmp.value.kua.blessings.perClick, 2)}`, "growan");
            }

            NaNCheck(tmp.value.kua.blessings.perClick, 'KB per click is NaN!');
            NaNCheck(tmp.value.kua.blessings.perSec, 'KB per second is NaN!');

            if (!tmp.value.kua.active.blessings.gain) {
                tmp.value.kua.blessings.perSec = D(0);
                tmp.value.kua.blessings.perClick = D(0);
            }

            tmp.value.kua.blessings.canBuyUpg = false;
            for (let i = 0; i < KUA_BLESS_UPGS.length; i++) {
                tmp.value.kua.blessings.upgrades[i].canBuy = Decimal.gte(player.value.gameProgress.kua.blessings.amount, KUA_BLESS_UPGS[i].cost.value);
                tmp.value.kua.blessings.canBuyUpg = tmp.value.kua.blessings.canBuyUpg || Decimal.gte(player.value.gameProgress.kua.blessings.amount, KUA_BLESS_UPGS[i].cost.value);
                tmp.value.kua.canBuyUpg = tmp.value.kua.canBuyUpg || tmp.value.kua.blessings.upgrades[i].canBuy;
            }

            if (player.value.gameProgress.unlocks.kb) {
                generate = tmp.value.kua.blessings.perSec.mul(delta);
                player.value.gameProgress.kua.blessings.amount = Decimal.add(player.value.gameProgress.kua.blessings.amount, generate);
            }

            i = Decimal.max(player.value.gameProgress.kua.blessings.totalKBInCol, 0);
            i = Decimal.mul(i, KUA_BLESS_TIER.tier.effects.kuaBlessEff.value)
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
            break;
        case 0:
            tmp.value.kua.effectiveKS = Decimal.max(player.value.gameProgress.kua.totalKSInCol, 0);
            tmp.value.kua.effectiveKP = Decimal.max(player.value.gameProgress.kua.totalKPInCol, 0);

            tmp.value.kua.effectiveKS = tmp.value.kua.effectiveKS.mul(KUA_BLESS_UPGS[0].eff.value[1]);
            tmp.value.kua.effectiveKP = tmp.value.kua.effectiveKP.mul(KUA_BLESS_UPGS[0].eff.value[1]);
            
            if (getKuaUpgrade('p', 17)) {
                tmp.value.kua.effectiveKS = tmp.value.kua.effectiveKS.pow(KUA_UPGRADES.KPower[16].eff!.value);
                tmp.value.kua.effectiveKP = tmp.value.kua.effectiveKP.pow(KUA_UPGRADES.KPower[16].eff2!.value);
            }

            NaNCheck(tmp.value.kua.effectiveKS, 'Effective KShards are NaN!');
            NaNCheck(tmp.value.kua.effectiveKP, 'Effective KPower is NaN!');

            player.value.gameProgress.kua.timeInKua = Decimal.add(player.value.gameProgress.kua.timeInKua, delta);

            tmp.value.kua.req = D(1e10);
            tmp.value.kua.exp = D(3);

            tmp.value.kua.exp = tmp.value.kua.exp.add(getColResEffect(2));
            tmp.value.kua.exp = tmp.value.kua.exp.add(KUA_BLESS_UPGS[2].eff.value[1]);

            tmp.value.kua.effectivePrai = Decimal.add(player.value.gameProgress.prai.amount, tmp.value.main.prai.pending);
            tmp.value.kua.canDo = tmp.value.kua.effectivePrai.gte(tmp.value.kua.req) && tmp.value.kua.active.gain;
            tmp.value.kua.pending = D(0);
            if (tmp.value.kua.canDo) {
                tmp.value.kua.pending = tmp.value.kua.effectivePrai.log(tmp.value.kua.req);
                // this is to catch an edge-case, where the value above gets fucked because of floating point errors if this is way lower than the kua exponent, so i have to make an approximation here
                if (tmp.value.kua.exp.div(tmp.value.kua.pending).gte(1e9)) {
                    // yes i'm not joking this reduces down to a dilate 1.5 of PRai when kua exp is high enough
                    tmp.value.kua.pending = tmp.value.kua.pending.pow(1.5).sub(5).pow10();
                } else {
                    tmp.value.kua.pending = tmp.value.kua.pending.ln().mul(1.5).div(tmp.value.kua.exp).add(1).pow(tmp.value.kua.exp).sub(5).pow10();
                }
            } 

            setFactor(0, [4, 1], "Base", `~10^(ln(log(${format(tmp.value.kua.effectivePrai)})))^${format(tmp.value.kua.exp, 2)}-${format(5)}) (approx.)`, `${format(tmp.value.kua.pending, 4)}`, true);
            
            if (getKuaUpgrade("s", 1)) {
                tmp.value.kua.pending = tmp.value.kua.pending.mul(1.5);
            }
            setFactor(1, [4, 1], "KShard Upgrade 1", `×${format(1.5, 2)}`, `${format(tmp.value.kua.pending, 4)}`, getKuaUpgrade("s", 1), "kua");

            if (getKuaUpgrade("s", 12)) {
                tmp.value.kua.pending = tmp.value.kua.pending.mul(KUA_UPGRADES.KShards[11].eff!.value);
            }
            setFactor(2, [4, 1], "KShard Upgrade 12", `×${format(KUA_UPGRADES.KShards[11].eff!.value, 2)}`, `${format(tmp.value.kua.pending, 4)}`, getKuaUpgrade("s", 12), "kua");

            if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 1)) {
                tmp.value.kua.pending = tmp.value.kua.pending.mul(KUA_BLESS_UPGS[2].eff.value[0]);
            }
            setFactor(4, [4, 1], `KBlessing Upgrade 3`, `×${format(KUA_BLESS_UPGS[2].eff.value[0], 2)}`, `${format(tmp.value.kua.pending, 1)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 1), "kb");

            if (Decimal.gt(player.value.gameProgress.layer4.gro.totalAmt, 0)) {
                tmp.value.kua.pending = tmp.value.kua.pending.mul(tmp.value.layer4.growan.eff.kuaGain);
            }
            setFactor(5, [4, 1], `Grōwan Effect`, `×${format(tmp.value.layer4.growan.eff.kuaGain, 2)}`, `${format(tmp.value.kua.pending, 1)}`, Decimal.gt(player.value.gameProgress.layer4.gro.totalAmt, 0), "growan");

            data = {
                oldGain: tmp.value.kua.pending,
                oldKua: D(0),
                newKua: D(0),
            };
            data.oldKua = Decimal.max(player.value.gameProgress.kua.amount, 1e-4);

            if (player.value.gameProgress.kua.auto) {
                generate = tmp.value.kua.pending.mul(delta).mul(0.01);
                player.value.gameProgress.kua.amount = Decimal.add(player.value.gameProgress.kua.amount, generate);
            }

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

            if (player.value.gameProgress.unlocks.kb) {
                k = k.mul(tmp.value.kua.blessings.kuaEff.log(Decimal.pow(player.value.gameProgress.kua.amount, k)).add(1))
            }
            setFactor(1, [4, 0], "KBlessings", `×${format(tmp.value.kua.blessings.kuaEff, 2)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, player.value.gameProgress.unlocks.kb, "kb");

            k = k.mul(ACHIEVEMENT_DATA[1].effect.value);
            setFactor(2, [4, 0], "Achievement Tier 2", `^${format(ACHIEVEMENT_DATA[1].effect.value, 3)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, true, "ach");

            if (getKuaUpgrade("s", 11)) {
                k = k.mul(KUA_UPGRADES.KShards[10].eff!.value);
            }
            setFactor(3, [4, 0], "KShard Upgrade 11", `^${format(KUA_UPGRADES.KShards[10].eff!.value, 3)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, getKuaUpgrade("s", 11), "kua");

            if (getKuaUpgrade("p", 15)) {
                k = k.mul(1.05);
            }
            setFactor(4, [4, 0], "KPower Upgrade 15", `^${format(1.05, 3)}`, `(${format(Decimal.pow(player.value.gameProgress.kua.amount, k), 4)} eff.) ${format(k.mul(100), 2)}%`, getKuaUpgrade("p", 15), "kua");
            
            k = Decimal.pow(player.value.gameProgress.kua.amount, k);

            if (tmp.value.kua.active.effects) {
                // * theres probably a better way to do this
                // no requirements for this, no need to lump them in the ones with conditionals
                tmp.value.kua.effects.upg1Scaling = Decimal.max(player.value.gameProgress.points, 0).add(1).log10().pow(0.6).div(200).mul(Decimal.max(k, 0).mul(1e4).add(1).pow(2 / 3).sub(1)).add(1).log10().add(1);
                if (getKuaUpgrade("p", 3)) {
                    tmp.value.kua.effects.upg1Scaling = Decimal.max(player.value.gameProgress.points, 0).add(1).pow(0.022).mul(Decimal.max(k, 0).mul(10).add(1).pow(0.75).sub(1)).add(1).log10().add(1).max(tmp.value.kua.effects.upg1Scaling);
                }

                let exp = D(1);

                if (getKuaUpgrade("k", 2)) { exp = exp.add(0.25); }
                if (getKuaUpgrade("k", 3)) { exp = exp.add(0.25); }
                if (getKuaUpgrade("k", 4)) { exp = exp.add(0.25); }

                // dilate 2
                // pow ^exp
                // trilate 0.9
                tmp.value.kua.effects.kshardPassive = Decimal.max(tmp.value.kua.effectiveKS, 0.01).mul(1e3).log10().pow(2).sub(1).pow10().pow(0.05).pow(exp).log10().add(1).log10().add(1).pow(0.9).sub(1).pow10().sub(1).pow10();
                tmp.value.kua.effects.kpowerPassive = Decimal.max(tmp.value.kua.effectiveKP, 0.01).mul(1e3).log10().pow(2).sub(1).pow10().pow(0.05).pow(exp).log10().add(1).log10().add(1).pow(0.9).sub(1).pow10().sub(1).pow10();

                tmp.value.kua.effects.upg4 = Decimal.gt(k, 0)
                    ? Decimal.log10(k).add(4).div(13).mul(7).add(1).cbrt().sub(4).pow10().add(1)
                    : D(1);

                tmp.value.kua.effects.upg5 = Decimal.gt(player.value.gameProgress.kua.kshards, 0)
                    ? Decimal.pow(20, Decimal.log10(player.value.gameProgress.kua.kshards).add(2).div(13)).div(1e3).add(1)
                    : D(1);

                tmp.value.kua.effects.upg6 = Decimal.gt(player.value.gameProgress.kua.kpower, 1)
                    ? Decimal.log10(player.value.gameProgress.kua.kpower)
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
                                Decimal.max(player.value.gameProgress.prai.timeInPRai, 0)
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
                setFactor(2, [4, 2], "KPower Upgrade 1", `×${format(2.5, 2)}`, `${format(i, 3)}`, getKuaUpgrade("p", 1), "kua");

                if (getKuaUpgrade("s", 13)) {
                    i = i.mul(KUA_UPGRADES.KShards[12].eff!.value);
                }
                setFactor(3, [4, 2], "KShard Upgrade 13", `×${format(KUA_UPGRADES.KShards[12].eff!.value, 2)}`, `${format(i, 3)}`, getKuaUpgrade("s", 13), "kua");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 1)) {
                    i = i.mul(KUA_BLESS_UPGS[2].eff.value[2]);
                }
                setFactor(5, [4, 2], `KBlessing Upgrade 3`, `×${format(KUA_BLESS_UPGS[2].eff.value[2], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 12), "kb");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 1)) {
                    i = i.mul(KUA_BLESS_UPGS[3].eff.value[0]);
                }
                setFactor(6, [4, 2], `KBlessing Upgrade 4`, `×${format(KUA_BLESS_UPGS[3].eff.value[0], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 1), "kb");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 6)) {
                    i = i.mul(Decimal.max(player.value.gameProgress.kua.kpower, 1).log10().add(1).pow(KUA_BLESS_UPGS[3].eff.value[1]));
                }
                setFactor(7, [4, 2], `KBlessing Upgrade 4`, `×log10(${format(player.value.gameProgress.kua.kpower, 2)})^${format(KUA_BLESS_UPGS[3].eff.value[1], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 6), "kb");
            }
            tmp.value.kua.shardGen = i;

            i = D(0);
            if (tmp.value.kua.active.kpower.gain) {
                i = D(player.value.gameProgress.kua.kshards);
                setFactor(0, [4, 3], "Base", `${format(player.value.gameProgress.kua.kshards, 4)}`, `${format(i, 3)}`, true);

                if (getKuaUpgrade("s", 10)) {
                    i = i.mul(tmp.value.kua.effects.kpower);
                }
                setFactor(2, [4, 3], "KShard Upgrade 10", `×${format(tmp.value.kua.effects.kpower, 2)}`, `${format(i, 3)}`, getKuaUpgrade("s", 10), "kua");

                if (getKuaUpgrade("s", 14)) {
                    i = i.mul(KUA_UPGRADES.KShards[13].eff!.value);
                }
                setFactor(3, [4, 3], "KShard Upgrade 14", `×${format(KUA_UPGRADES.KShards[13].eff!.value, 2)}`, `${format(i, 3)}`, getKuaUpgrade("s", 14), "kua");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 1)) {
                    i = i.mul(KUA_BLESS_UPGS[2].eff.value[2]);
                }
                setFactor(5, [4, 3], `KBlessing Upgrade 3`, `×${format(KUA_BLESS_UPGS[2].eff.value[2], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[2], 12), "kb");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 1)) {
                    i = i.mul(KUA_BLESS_UPGS[3].eff.value[0]);
                }
                setFactor(6, [4, 3], `KBlessing Upgrade 4`, `×${format(KUA_BLESS_UPGS[3].eff.value[0], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 1), "kb");

                if (Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 6)) {
                    i = i.mul(Decimal.max(player.value.gameProgress.kua.kshards, 1).log10().add(1).pow(KUA_BLESS_UPGS[3].eff.value[1]));
                }
                setFactor(7, [4, 3], `KBlessing Upgrade 4`, `×log10(${format(player.value.gameProgress.kua.kshards, 2)})^${format(KUA_BLESS_UPGS[3].eff.value[1], 2)}`, `${format(i, 3)}`, Decimal.gte(player.value.gameProgress.kua.blessings.upgrades[3], 6), "kb");

                data = {
                    oldGain: i,
                    oldKua: D(0),
                    newKua: D(0),
                };
                data.oldKua = Decimal.max(player.value.gameProgress.kua.amount, 1e-4);
            }
            tmp.value.kua.powGen = i;

            tmp.value.kua.upgCanBuyUpg = false;
            for (let i = player.value.gameProgress.kua.upgrades[0]; i < KUA_UPGRADES.KShards.length; i++) {
                j = Decimal.gte(player.value.gameProgress.kua.kshards, KUA_UPGRADES.KShards[i].cost);
                tmp.value.kua.upgCanBuyUpg = tmp.value.kua.upgCanBuyUpg || j;
                tmp.value.kua.canBuyUpg = tmp.value.kua.canBuyUpg || j;
            }
            for (let i = player.value.gameProgress.kua.upgrades[1]; i < KUA_UPGRADES.KPower.length; i++) {
                j = Decimal.gte(player.value.gameProgress.kua.kpower, KUA_UPGRADES.KPower[i].cost);
                tmp.value.kua.upgCanBuyUpg = tmp.value.kua.upgCanBuyUpg || j;
                tmp.value.kua.canBuyUpg = tmp.value.kua.canBuyUpg || j;
            }
            for (let i = player.value.gameProgress.kua.upgrades[2]; i < KUA_UPGRADES.Kua.length; i++) {
                j = Decimal.gte(player.value.gameProgress.kua.amount, KUA_UPGRADES.Kua[i].cost);
                tmp.value.kua.upgCanBuyUpg = tmp.value.kua.upgCanBuyUpg || j;
                tmp.value.kua.canBuyUpg = tmp.value.kua.canBuyUpg || j;
            }

            generate = tmp.value.kua.shardGen.mul(delta);
            player.value.gameProgress.kua.kshards = Decimal.add(player.value.gameProgress.kua.kshards, generate);

            generate = tmp.value.kua.powGen.mul(delta);
            player.value.gameProgress.kua.kpower = Decimal.add(player.value.gameProgress.kua.kpower, generate);
            break;
        default:
            throw new Error(`Kuaraniai area of the game does not contain ${type}`);
    }
};