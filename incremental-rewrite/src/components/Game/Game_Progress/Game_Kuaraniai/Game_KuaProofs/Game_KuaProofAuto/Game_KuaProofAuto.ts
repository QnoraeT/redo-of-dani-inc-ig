import { D } from "@/calc"
import { player } from "@/main"
import Decimal from "break_eternity.js"
import type { KuaProofUpgTypes } from "../Game_KuaProofs"

export const KuaProofAutoTypeList: Array<KuaProofAutoTypes> = ['other', 'effect', 'kp', 'skp', 'fkp']
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
            cost: D('e3700'),
            desc: `Autobuy Ultimate Bribery.`,
            get show() {
                return player.value.gameProgress.unlocks.kproofs.finicky;
            }
        },
        {
            cost: D('e9500'),
            desc: `Autobuy Constructive Interference.`,
            get show() {
                return player.value.gameProgress.unlocks.kproofs.finicky;
            }
        },
        {
            cost: D('e23000'),
            desc: `Autobuy Infinite Staircase.`,
            get show() {
                return player.value.gameProgress.unlocks.kproofs.finicky;
            }
        },
    ],
    kp: [
        {
            cost: D(5),
            desc: `Autobuy Simple Breakthrough.`,
            show: true
        },
        {
            cost: D(40),
            desc: `Autobuy Trial and Error.`,
            show: true
        },
        {
            cost: D(200),
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
            cost: D('e2000'),
            desc: `Autobuy Verification Trials.`,
            get show() {
                return player.value.gameProgress.unlocks.kproofs.finicky;
            }
        },
        {
            cost: D('e7500'),
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