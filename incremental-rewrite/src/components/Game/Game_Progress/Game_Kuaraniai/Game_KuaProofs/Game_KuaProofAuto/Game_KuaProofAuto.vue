<script setup lang="ts">
import { format } from "@/format";
import { player, tab, tmp } from "@/main";
import Decimal from "break_eternity.js";
import { buyKProofAuto, KUA_PROOF_AUTO, KuaProofAutoTypeList } from "./Game_KuaProofAuto";
import { switchSubTab } from "@/components/MainTabs/MainTabs";
</script>
<template>
    <div class="flex-container" style="flex-direction: row; justify-content: center; font-size: 1.4vw; margin-bottom: 1vw;">
        <button @click="switchSubTab(0, 2)" class="kuaButton2 font0 whiteText normalTabButton">Other</button>
        <button @click="switchSubTab(1, 2)" class="kuaButton2 font0 whiteText normalTabButton">Effects</button>
        <button @click="switchSubTab(2, 2)" class="kuaButton2 font0 whiteText normalTabButton">KProof</button>
        <button @click="switchSubTab(3, 2)" class="kuaButton2 font0 whiteText normalTabButton">Strange KP</button>
        <button v-if="player.prog.unlocks.kproofs.finicky" @click="switchSubTab(4, 2)" class="kuaButton2 font0 whiteText normalTabButton">Finicky KP</button>
    </div>
    <div class="flex-vertical font0" style="background-color: #222; margin-left: auto; margin-right: auto; border: 0.24vw solid #fff; padding: 0.6vw; height: 32vw; width: 40vw;">
        <span style="color: #ff0; text-align: center; font-size: 1.2vw">
            You have 
            <span style="font-size: 1.4vw"><b>{{ format(player.prog.kua.proofs.strange.amount, 2) }}</b></span> 
            Strange KProofs<sup>{{ format(tmp.kua.proofs.skpExp, 2) }}</sup>.
        </span>
        <div class="flex-horizontal" style="margin-top: 0.4vw; flex-wrap: wrap;">
            <div v-for="(item, index) in KUA_PROOF_AUTO[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]]" :key="index">
                <!-- set padding to 0vw because it auto-inserts padding -->
                <button @click="buyKProofAuto(index, KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]])" :class="{ 
                    nope: !(
                        Decimal.gte(player.prog.kua.proofs.strange.amount, item.cost) || 
                        player.prog.kua.proofs.automationBought[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index]
                        ) || (
                            player.prog.kua.proofs.automationBought[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index] && 
                            !player.prog.kua.proofs.automationEnabled[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index]
                        ), 
                    ok: 
                        Decimal.gte(player.prog.kua.proofs.strange.amount, item.cost) && 
                        !player.prog.kua.proofs.automationBought[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index], 
                    done: 
                        player.prog.kua.proofs.automationBought[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index] && player.prog.kua.proofs.automationEnabled[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index] }" 
                    :style="{ 
                        cursor: player.prog.kua.proofs.automationBought[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index] ? 'pointer' : 'not-allowed',
                        backgroundColor: player.prog.kua.proofs.automationBought[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index] 
                            ? player.prog.kua.proofs.automationEnabled[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index] 
                                ? '#444' 
                                : '#333'
                            : '#222'
                    }" 
                    style="width: 12vw; height: 8vw; margin-left: 0.15vw; margin-right: 0.15vw; margin-bottom: 0.3vw; font-size: 0.7vw; transition: 0.2s;" class="font0 whiteText">
                    <span class="vertical-align: top;">{{KUA_PROOF_AUTO[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index].desc}}</span>
                    <br><br>
                    <span v-if="!player.prog.kua.proofs.automationBought[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index]" class="vertical-align: bottom;">Cost: <b><span style="font-size: 0.8vw; color: #fff">{{format(item.cost)}}</span></b> Strange KP.</span>
                    <span v-if="player.prog.kua.proofs.automationBought[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index]" class="vertical-align: bottom;">Currently: <b><span style="font-size: 0.8vw; color: #fff">{{ player.prog.kua.proofs.automationEnabled[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index] ? 'Enabled' : 'Disabled' }}</span></b><br></span>
                    <span v-if="player.prog.kua.proofs.automationBought[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index]" class="vertical-align: bottom;"><b><span style="font-size: 0.8vw; color: #fff">Bought!</span></b></span>
                </button>
            </div>
        </div>
    </div>
</template>
