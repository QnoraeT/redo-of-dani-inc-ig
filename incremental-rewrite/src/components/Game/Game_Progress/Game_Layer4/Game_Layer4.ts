import type { DecimalSource } from "break_eternity.js"
import { TAX_GAIN_CALC, TAX_UPGRADES } from "./Game_Taxation/Game_Taxation"
import { player, tmp, updateAllBest, updateAllTotal } from "@/main"
import Decimal from "break_eternity.js"
import { D } from "@/calc"
import { format } from "@/format"
import { setFactor } from "../../Game_Stats/Game_Stats"
import { GROWAN_DATA } from "./Game_Growan/Game_Growan"

export const updateAllLayer4 = (delta: DecimalSource) => {
    updateLayer4(1, delta)
    updateLayer4(0, delta)

    player.value.gameProgress.layer4.timeInL4R = Decimal.add(player.value.gameProgress.layer4.timeInL4R, delta);
}

export const updateLayer4 = (type: number, delta: DecimalSource) => {
    let generate, i;
    switch (type) {
        case 1:
            tmp.value.layer4.growan.active = false
            if (player.value.gameProgress.layer4.pickedFirst === 0 || player.value.gameProgress.layer4.pickedFirst === 1 || player.value.gameProgress.layer4.pickedFirst === 3) {
                tmp.value.layer4.growan.active = true
            }

            tmp.value.layer4.growan.req = D(1e24);
            tmp.value.layer4.growan.canDo = Decimal.gte(player.value.gameProgress.kua.best[4]!, tmp.value.layer4.growan.req);
            tmp.value.layer4.growan.pending = D(0);

            if (tmp.value.layer4.growan.canDo) {
                tmp.value.layer4.growan.pending = Decimal.log(player.value.gameProgress.kua.best[4]!, tmp.value.layer4.growan.req).sub(player.value.gameProgress.layer4.gro.totalAmt).max(0);
            }
            tmp.value.layer4.growan.nextAt = Decimal.pow(tmp.value.layer4.growan.req, player.value.gameProgress.layer4.gro.totalAmt);

            i = Decimal.max(player.value.gameProgress.layer4.gro.totalAmt, 0);
            tmp.value.layer4.growan.eff = {
                kuaGain: i.add(1).pow(2),
                groMult: i.add(1).pow(0.2).sub(1).pow10().mul(i),
            }

            i = Decimal.max(player.value.gameProgress.layer4.gro.gEAmount, 0);
            tmp.value.layer4.growan.solEff = {
                prai: i.add(1).log10().div(100).add(1).pow(0.4)
            }

            updateAllBest(player.value.gameProgress.layer4.gro.best, player.value.gameProgress.layer4.gro.amount);
            player.value.gameProgress.layer4.gro.bestEver = Decimal.max(player.value.gameProgress.layer4.gro.bestEver, player.value.gameProgress.layer4.gro.totalAmt);

            i = D(1);
            i = i.mul(GROWAN_DATA.equ.list[0].mult.value.mul(Decimal.add(player.value.gameProgress.layer4.gro.growanEqu[0].bought, player.value.gameProgress.layer4.gro.growanEqu[0].accumulated)));
            i = i.add(tmp.value.layer4.growan.eff.groMult);
            generate = i.mul(delta);

            player.value.gameProgress.layer4.gro.gEAmount = Decimal.add(player.value.gameProgress.layer4.gro.gEAmount, generate);

            updateAllTotal(player.value.gameProgress.layer4.gro.groAmountStats.totals, generate);
            player.value.gameProgress.layer4.gro.groAmountStats.totalEver = Decimal.add(player.value.gameProgress.layer4.gro.groAmountStats.totalEver, generate);
            updateAllBest(player.value.gameProgress.layer4.gro.groAmountStats.best, player.value.gameProgress.layer4.gro.gEAmount);
            player.value.gameProgress.layer4.gro.groAmountStats.bestEver = Decimal.max(player.value.gameProgress.layer4.gro.groAmountStats.bestEver, player.value.gameProgress.layer4.gro.gEAmount);

            for (i = 7; i >= 1; i--) {
                generate = D(1);
                generate = generate.mul(GROWAN_DATA.equ.list[i].mult.value.mul(Decimal.add(player.value.gameProgress.layer4.gro.growanEqu[i].bought, player.value.gameProgress.layer4.gro.growanEqu[i].accumulated)));
                generate = generate.mul(delta);
                player.value.gameProgress.layer4.gro.growanEqu[i - 1].accumulated = Decimal.add(player.value.gameProgress.layer4.gro.growanEqu[i - 1].accumulated, generate);
            }
            break;
        case 0:
            tmp.value.layer4.tax.active = false
            if (player.value.gameProgress.layer4.pickedFirst === 0 || player.value.gameProgress.layer4.pickedFirst === 2 || player.value.gameProgress.layer4.pickedFirst === 3) {
                tmp.value.layer4.tax.active = true
            }

            for (let i = 0; i < TAX_UPGRADES.length; i++) {
                if (player.value.gameProgress.layer4.tax.upgrades[i] === undefined) {
                    player.value.gameProgress.layer4.tax.upgrades[i] = D(0);
                }
            }

            tmp.value.layer4.tax.req = D("e1500");
            tmp.value.layer4.tax.canDo = Decimal.gte(player.value.gameProgress.main.totals[4]!, tmp.value.layer4.tax.req);
            tmp.value.layer4.tax.pending = D(0);
            if (tmp.value.layer4.tax.canDo) {
                let eff, txt;
                i = D(1);

                for (let j = 0; j < TAX_GAIN_CALC.length; j++) {
                    TAX_GAIN_CALC[j].active = TAX_GAIN_CALC[j].baseActive.value;

                    txt = '';
                    if (TAX_GAIN_CALC[j].active) {
                        eff = TAX_GAIN_CALC[j].effect.value;

                        if (TAX_GAIN_CALC[j].type === 'mult') {
                            i = i.mul(eff);
                            txt = `×${format(eff, 2)}`;
                        }
                        if (TAX_GAIN_CALC[j].type === 'pow') {
                            i = i.pow(eff);
                            txt = `^${format(eff, 3)}`;
                        }
                    }

                    if (TAX_GAIN_CALC[j].name.value === 'Base') {
                        txt = `${format(100)}^((log(${format(player.value.gameProgress.main.totals[4]!, 2)})/${format(tmp.value.layer4.tax.req.log10())})^${format(0.5, 2)} - 1)`;
                    }
                    setFactor(j, [6, 0], TAX_GAIN_CALC[j].name.value, txt, `${format(i, 1)}`, TAX_GAIN_CALC[j].active, TAX_GAIN_CALC[j].color);
                }

                tmp.value.layer4.tax.pending = i;
            }

            if (player.value.gameProgress.layer4.tax.auto) {
                generate = tmp.value.layer4.tax.pending.mul(delta);
                player.value.gameProgress.layer4.tax.amount = Decimal.add(player.value.gameProgress.layer4.tax.amount, generate);
                updateAllTotal(player.value.gameProgress.layer4.tax.totals, generate);
                player.value.gameProgress.layer4.tax.totalEver = Decimal.add(player.value.gameProgress.layer4.tax.totalEver, generate);
            }

            updateAllBest(player.value.gameProgress.layer4.tax.best, player.value.gameProgress.layer4.tax.amount);
            player.value.gameProgress.layer4.tax.bestEver = Decimal.max(player.value.gameProgress.layer4.tax.bestEver, player.value.gameProgress.layer4.tax.amount);

            // TODO: upon next layer, make this totals[5] instead of totalEver
            tmp.value.layer4.tax.ptsEff = Decimal.max(player.value.gameProgress.layer4.tax.totalEver, 0)
                .add(10)
                .log10()
                .pow(2)
                .pow10()
                .sub(9)
                .pow(2);
            break;
        default:
            throw new Error(`Taxation area of the game does not contain ${type}`);
    }
}