<script setup lang="ts">
import Decimal from "break_eternity.js";
import { format, formatTime } from "@/format";
import { player, tmp } from "@/main";
import { resetFromSKP } from "@/resets";
import { getStrangeKPExp } from "./Game_KuaProofStrange";
import { buyKProofUpg, KUA_PROOF_UPGS } from "../Game_KuaProofs";
import { getSCSLAttribute } from "@/softcapScaling";
</script>
<template>
    <div class="flex-container fontVerdana" style="background-color: #220; flex-direction: column; border: 0.24vw solid #ff0; padding: 0.6vw; height: 38vw; width: 40%;">
        <span style="color: #ff0; text-align: center; font-size: 1.2vw">
            You have 
            <span style="font-size: 1.4vw"><b>{{ format(player.gameProgress.kua.proofs.strange.amount, 2) }}</b></span> 
            Strange KProofs<sup>{{ format(tmp.kua.proofs.skpExp, 2) }}</sup>, which adds <span style="font-size: 1.4vw"><b>{{ format(tmp.kua.proofs.skpEff, 2) }}</b></span> free levels to the first 3 KProof upgrades.
        </span>
        <span v-if="Decimal.gte(player.gameProgress.kua.proofs.strange.amount, getSCSLAttribute('skp', false)[0].start)" style="color: #ff0; text-align: center; font-size: 0.7vw">
            Your Strange KProofs are getting odd at <span style="font-size: 0.8vw"><b>{{ format(getSCSLAttribute("skp", false)[0].start) }}</b></span>, which is dividing your Strange KProof gain by <span style="font-size: 0.8vw"><b>{{ getSCSLAttribute("skp", false)[0].displayedEffect }}</b></span>!
        </span>
        <span v-if="Decimal.gte(player.gameProgress.kua.proofs.strange.amount, getSCSLAttribute('skp', false)[1].start)" style="color: #f80; text-align: center; font-size: 0.7vw">
            Your Strange KProofs are getting unstable at <span style="font-size: 0.8vw"><b>{{ format(getSCSLAttribute("skp", false)[1].start) }}</b></span>, which is rooting your Strange KProof gain by <span style="font-size: 0.8vw"><b>{{ getSCSLAttribute("skp", false)[1].displayedEffect }}</b></span>!
        </span>
        <span style="color: #ff0; text-align: center; font-size: 0.75vw">
            You have SKP reset
            <span style="font-size: 0.85vw"><b>{{ format(player.gameProgress.kua.proofs.strange.times) }}</b></span> 
            times.
        </span>
        <button @click="resetFromSKP(true, true, true, 1)" class="whiteText fontVerdana" style="border: 0.18vw solid #ff0; background-color: #440; font-size: 0.8vw; margin-left: auto; margin-right: auto; margin-top: 1.2vw; padding-top: 0.75vw; padding-bottom: 0.75vw; padding-right: 1.5vw; padding-left: 1.5vw;"> 
            Add <span style="font-size: 1vw"><b>{{ format(getStrangeKPExp(Decimal.log10(player.gameProgress.kua.proofs.amount).div(2).add(player.gameProgress.kua.proofs.strange.hiddenExp), false).sub(getStrangeKPExp(player.gameProgress.kua.proofs.strange.hiddenExp, false)), 2) }}</b></span> to Strange KProof's exponent and add 1 second of it.<br>
            <span v-if="Decimal.lte(player.gameProgress.kua.proofs.strange.cooldown, 0) && Decimal.gte(player.gameProgress.kua.proofs.amount, 1e24)">This will reset KProof progress, but will not reset Effects progress.<br></span>
            <span v-if="Decimal.lt(player.gameProgress.kua.proofs.amount, 1e24)">You cannot SKP reset until you get {{ format(1e24) }} KProofs!<br></span>
            <span v-if="Decimal.gt(player.gameProgress.kua.proofs.strange.cooldown, 0)">You cannot SKP reset for {{ formatTime(player.gameProgress.kua.proofs.strange.cooldown) }}!<br></span>
        </button>
        <div class="flex-container" style="margin-top: 0.4vw; flex-wrap: wrap; justify-content: center;">
            <div v-for="(item, index) in KUA_PROOF_UPGS.skp" :key="index">
                <!-- set padding to 0vw because it auto-inserts padding -->
                <button @click="buyKProofUpg(index, 'skp')" :class="{ nope: !tmp.kua.proofs.upgrades.skp[index].canBuy, ok: tmp.kua.proofs.upgrades.skp[index].canBuy}" :style="{ cursor: tmp.kua.proofs.upgrades.skp[index].canBuy ? 'pointer' : 'not-allowed' }" v-if="item.show" style="width: 12vw; height: 8vw; margin-left: 0.15vw; margin-right: 0.15vw; margin-bottom: 0.3vw; font-size: 0.55vw; transition: 0.2s; background-color: #303000" class="fontVerdana whiteText">
                    <span style="margin-right: 0.5vw; color: #ff0; font-size: 0.65vw"><b>{{item.title}}</b></span><span class="whiteText">×{{ format(player.gameProgress.kua.proofs.upgrades.skp[index]) }}</span><span v-if="Decimal.gt(tmp.kua.proofs.upgrades.skp[index].freeExtra, 0)">+{{ format(tmp.kua.proofs.upgrades.skp[index].freeExtra, 2) }}</span><br>
                    <span>{{item.perDesc}}</span>
                    <br><br>
                    <span>Currently: <b style="font-size: 0.65vw;">{{item.desc}}</b></span><br>
                    <span>Cost: <b style="font-size: 0.65vw;">{{format(tmp.kua.proofs.upgrades.skp[index].cost)}}</b> Strange KProofs.</span>
                </button>
            </div>
        </div>
    </div>
</template>
