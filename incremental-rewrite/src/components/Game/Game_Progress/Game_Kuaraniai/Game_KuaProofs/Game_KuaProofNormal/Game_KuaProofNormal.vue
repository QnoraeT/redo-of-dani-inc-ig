<script setup lang="ts">
import { format } from "@/format";
import { player, tmp } from "@/main";
import Decimal from "break_eternity.js";
import { buyKProofUpg, KUA_PROOF_UPGS } from "../Game_KuaProofs";
</script>
<template>
    <div class="flex-container fontVerdana" style="background-color: #022; flex-direction: column; border: 0.24vw solid #0ff; padding: 0.6vw; height: 32vw; width: 40%;">
        <span style="color: #0ff; text-align: center; font-size: 1.2vw">
            You have 
            <span style="font-size: 1.4vw"><b>{{ format(player.gameProgress.kua.proofs.amount) }}</b></span> 
            Kuaraniai Proofs<sup>{{ format(tmp.kua.proofs.exp, 2) }}</sup>.
        </span>
        <span class="fontVerdana whiteText" style="font-size: 0.7vw; text-align: center">KProofs are being multiplied by {{ format(tmp.kua.proofs.expPerSec, 2) }}× every second.</span>
        <div class="flex-container" style="margin-top: 0.4vw; flex-wrap: wrap; justify-content: center;">
            <div v-for="(item, index) in KUA_PROOF_UPGS.kp" :key="index">
                <!-- set padding to 0vw because it auto-inserts padding -->
                <button @click="buyKProofUpg(index, 'kp')" :class="{ nope: !tmp.kua.proofs.upgrades.kp[index].canBuy, ok: tmp.kua.proofs.upgrades.kp[index].canBuy}" :style="{ cursor: tmp.kua.proofs.upgrades.kp[index].canBuy ? 'pointer' : 'not-allowed' }" v-if="item.show.value" style="width: 12vw; height: 8vw; margin-left: 0.15vw; margin-right: 0.15vw; margin-bottom: 0.3vw; font-size: 0.55vw; transition: 0.2s; background-color: #003030" class="fontVerdana whiteText">
                    <span style="margin-right: 0.5vw; color: #0ff; font-size: 0.65vw"><b>{{item.title}}</b></span><span class="whiteText">×{{ format(player.gameProgress.kua.proofs.upgrades.kp[index]) }}</span><span v-if="Decimal.gt(tmp.kua.proofs.upgrades.kp[index].freeExtra, 0)">+{{ format(tmp.kua.proofs.upgrades.kp[index].freeExtra, 2) }}</span><br>
                    <span>{{item.perDesc}}</span>
                    <br><br>
                    <span>Currently: <b style="font-size: 0.65vw;">{{item.desc}}</b></span><br>
                    <span>Cost: <b style="font-size: 0.65vw;">{{format(KUA_PROOF_UPGS.kp[index].cost.value)}}</b> KProofs.</span>
                </button>
            </div>
        </div>
    </div>
</template>
