<script setup lang="ts">
import { format, formatTime } from "@/format";
import { player, tmp } from "@/main";
import { resetFromFKP } from "@/resets";
import Decimal from "break_eternity.js";
import { buyKProofUpg, KUA_PROOF_UPGS } from "../Game_KuaProofs";
import { getFinickyKPExp, getFinickyKPExpGain, getFinickySeconds } from "./Game_KuaProofFinicky";
</script>
<template>
    <div class="flex-container fontVerdana" style="background-color: #020; flex-direction: column; border: 0.24vw solid #0f0; padding: 0.6vw; height: 38vw; width: 40%;">
        <span style="color: #0f0; text-align: center; font-size: 1.2vw">
            You have 
            <span style="font-size: 1.4vw"><b>{{ format(player.gameProgress.kua.proofs.finicky.amount, 2) }}</b></span> 
            Finicky KProofs<sup>{{ format(tmp.kua.proofs.fkpExp, 2) }}</sup>, which adds <span style="font-size: 1.4vw"><b>{{ format(tmp.kua.proofs.fkpEff, 2) }}</b></span> to KP and SKP's exponents.
        </span>
        <span style="color: #0f0; text-align: center; font-size: 0.75vw">
            You have FKP reset
            <span style="font-size: 0.85vw"><b>{{ format(player.gameProgress.kua.proofs.finicky.times) }}</b></span> 
            times.
        </span>
        <button @click="resetFromFKP(true, true, true, 1)" class="whiteText fontVerdana" style="border: 0.18vw solid #0f0; background-color: #040; font-size: 0.8vw; margin-left: auto; margin-right: auto; margin-top: 1.2vw; padding-top: 0.75vw; padding-bottom: 0.75vw; padding-right: 1.5vw; padding-left: 1.5vw;"> 
            Add <span style="font-size: 1vw"><b>{{ format(getFinickyKPExp(Decimal.add(getFinickyKPExpGain(player.gameProgress.kua.proofs.strange.amount), player.gameProgress.kua.proofs.finicky.hiddenExp), false).sub(getFinickyKPExp(player.gameProgress.kua.proofs.finicky.hiddenExp, false)), 2) }}</b></span> to Finicky KProof's exponent and add <span style="font-size: 1vw"><b>{{ formatTime(getFinickySeconds(player.gameProgress.kua.proofs.strange.amount), 3) }}</b></span> of it.<br>
            <span v-if="Decimal.lte(player.gameProgress.kua.proofs.finicky.cooldown, 0) && Decimal.gte(player.gameProgress.kua.proofs.strange.amount, 1e7)">This will reset SKP and KProof progress, but will not reset Effects progress.<br></span>
            <span v-if="Decimal.lt(player.gameProgress.kua.proofs.strange.amount, 1e7)">You cannot FKP reset until you get {{ format(1e7) }} SKP!<br></span>
            <span v-if="Decimal.gt(player.gameProgress.kua.proofs.finicky.cooldown, 0)">You cannot FKP reset for {{ formatTime(player.gameProgress.kua.proofs.finicky.cooldown) }}!<br></span>
        </button>
        <div class="flex-container" style="margin-top: 0.4vw; flex-wrap: wrap; justify-content: center;">
            <div v-for="(item, index) in KUA_PROOF_UPGS.fkp" :key="index">
                <!-- set padding to 0vw because it auto-inserts padding -->
                <button @click="buyKProofUpg(index, 'fkp')" :class="{ nope: !tmp.kua.proofs.upgrades.fkp[index].canBuy, ok: tmp.kua.proofs.upgrades.fkp[index].canBuy}" :style="{ cursor: tmp.kua.proofs.upgrades.fkp[index].canBuy ? 'pointer' : 'not-allowed' }" v-if="item.show.value" style="width: 12vw; height: 8vw; margin-left: 0.15vw; margin-right: 0.15vw; margin-bottom: 0.3vw; font-size: 0.55vw; transition: 0.2s; background-color: #003000" class="fontVerdana whiteText">
                    <span style="margin-right: 0.5vw; color: #0f0; font-size: 0.65vw"><b>{{item.title}}</b></span><span class="whiteText">×{{ format(player.gameProgress.kua.proofs.upgrades.fkp[index]) }}</span><span v-if="Decimal.gt(tmp.kua.proofs.upgrades.fkp[index].freeExtra, 0)">+{{ format(tmp.kua.proofs.upgrades.fkp[index].freeExtra, 2) }}</span><br>
                    <span>{{item.perDesc}}</span>
                    <br><br>
                    <span>Currently: <b style="font-size: 0.65vw;">{{item.desc}}</b></span><br>
                    <span>Cost: <b style="font-size: 0.65vw;">{{format(KUA_PROOF_UPGS.fkp[index].cost.value)}}</b> Finicky KProofs.</span>
                </button>
            </div>
        </div>
    </div>
    <div v-if="tmp.kua.proofs.upgrades.fkp[0].trueLevel.gt(0)" class="flex-container fontVerdana" style="background-color: #020; flex-direction: column; border: 0.24vw solid #0f0; padding: 0.6vw; height: 40vw; width: 40%;">

    </div>
</template>
