import type { DecimalSource } from "break_eternity.js"
import { TAX_GAIN_CALC, TAX_UPGRADES } from "./Game_Taxation/Game_Taxation"
import { player, tmp } from "@/main"
import Decimal from "break_eternity.js"
import { D } from "@/calc"
import { format } from "@/format"
import { setFactor } from "../../Game_Stats/Game_Stats"
import { buyGroEquCancel, buyGroGal, GROWAN_DATA } from "./Game_Growan/Game_Growan"

export const updateAllLayer4 = (delta: DecimalSource) => {
    updateLayer4(1, delta)
    updateLayer4(0, delta)

    player.value.prog.layer4.timeInL4R = Decimal.add(player.value.prog.layer4.timeInL4R, delta);
}

export const updateLayer4 = (type: number, delta: DecimalSource) => {
    let generate, i;
    switch (type) {
        case 1:
            tmp.value.layer4.growan.active = false
            if (player.value.prog.layer4.pickedFirst === 0 || player.value.prog.layer4.pickedFirst === 1 || player.value.prog.layer4.pickedFirst === 3) {
                tmp.value.layer4.growan.active = true
            }

            tmp.value.layer4.growan.req = D(1e24);
            tmp.value.layer4.growan.pending = Decimal.max(player.value.prog.kua.bestInLayer4, tmp.value.layer4.growan.req).log(tmp.value.layer4.growan.req).sub(player.value.prog.layer4.gro.totalAmt).max(0);

            tmp.value.layer4.growan.nextAt = Decimal.pow(tmp.value.layer4.growan.req, player.value.prog.layer4.gro.totalAmt);
            tmp.value.layer4.growan.canDo = Decimal.gte(player.value.prog.kua.bestInLayer4, tmp.value.layer4.growan.nextAt);

            i = Decimal.max(player.value.prog.layer4.gro.totalAmt, 0);
            tmp.value.layer4.growan.eff = {
                kuaGain: i.add(1).pow(2),
                groMult: i.pow10().mul(i),
            }

            i = Decimal.max(player.value.prog.layer4.gro.bestGEA, 0);
            tmp.value.layer4.growan.solEff = {
                prai: i.add(1).log10().mul(0.002).add(1)
            }

            i = D(1);
            i = i.mul(GROWAN_DATA.equ.list[0].mult.value.mul(Decimal.add(player.value.prog.layer4.gro.growanEqu[0].bought, player.value.prog.layer4.gro.growanEqu[0].accumulated)));
            i = i.add(tmp.value.layer4.growan.eff.groMult);
            generate = i.mul(delta);

            player.value.prog.layer4.gro.gEAmount = Decimal.add(player.value.prog.layer4.gro.gEAmount, generate);
            player.value.prog.layer4.gro.bestGEA = Decimal.max(player.value.prog.layer4.gro.bestGEA, player.value.prog.layer4.gro.gEAmount);

            for (i = 7; i >= 1; i--) {
                generate = D(1);
                generate = generate.mul(GROWAN_DATA.equ.list[i].mult.value.mul(Decimal.add(player.value.prog.layer4.gro.growanEqu[i].bought, player.value.prog.layer4.gro.growanEqu[i].accumulated)));
                generate = generate.mul(delta);
                player.value.prog.layer4.gro.growanEqu[i - 1].accumulated = Decimal.add(player.value.prog.layer4.gro.growanEqu[i - 1].accumulated, generate);
            }

            // delete this, testing
            // const k = 1
            // k
            // buyGroEquCancel(true, false)
            // buyGroGal(true, false)
            break;
        case 0:
            tmp.value.layer4.tax.active = false
            if (player.value.prog.layer4.pickedFirst === 0 || player.value.prog.layer4.pickedFirst === 2 || player.value.prog.layer4.pickedFirst === 3) {
                tmp.value.layer4.tax.active = true
            }

            for (let i = 0; i < TAX_UPGRADES.length; i++) {
                if (player.value.prog.layer4.tax.upgrades[i] === undefined) {
                    player.value.prog.layer4.tax.upgrades[i] = D(0);
                }
            }

            tmp.value.layer4.tax.req = D("e1500");
            tmp.value.layer4.tax.canDo = Decimal.gte(player.value.prog.main.bestInLayer4, tmp.value.layer4.tax.req);
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
                        txt = `${format(100)}^((log(${format(player.value.prog.main.bestInLayer4, 2)})/${format(tmp.value.layer4.tax.req.log10())})^${format(0.5, 2)} - 1)`;
                    }
                    setFactor(j, [6, 0], TAX_GAIN_CALC[j].name.value, txt, `${format(i, 1)}`, TAX_GAIN_CALC[j].active, TAX_GAIN_CALC[j].color);
                }

                tmp.value.layer4.tax.pending = i;
            }

            if (player.value.prog.layer4.tax.auto) {
                generate = tmp.value.layer4.tax.pending.mul(delta);
                player.value.prog.layer4.tax.amount = Decimal.add(player.value.prog.layer4.tax.amount, generate);
            }

            tmp.value.layer4.tax.ptsEff = Decimal.max(player.value.prog.layer4.tax.amount, 0)
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