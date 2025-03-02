<script setup lang="ts">
import { tmp } from "@/main";
import { switchSubTab } from "@/components/MainTabs/MainTabs";
</script>
<template>
    <div class="flex-container" style="flex-direction: row; justify-content: center; font-size: 1.4vw; margin-bottom: 1vw;">
        <button :class="{ alert: tmp.kua.proofs.canBuyUpgs.kp }" @click="switchSubTab(0, 1)" class="kuaButton2 fontVerdana whiteText normalTabButton">KProof</button>
    </div>
    <!-- <div class="flex-container" style="flex-direction: column" v-if="tab.tabList[tab.currentTab][1] === -2">
        <Game_KuaProofAuto />
    </div>
    <div class="flex-container" style="flex-direction: row; justify-content: center" v-if="tab.tabList[tab.currentTab][1] === -1">
        <Game_KuaProofEffect />
    </div>
    <div class="flex-container" style="flex-direction: row; justify-content: center" v-if="tab.tabList[tab.currentTab][1] === 0">
        <Game_KuaProofNormal />
    </div>
    <div class="flex-container" style="flex-direction: row; justify-content: center" v-if="tab.tabList[tab.currentTab][1] === 1">
        <Game_KuaProofStrange />
    </div>
    <div class="flex-container" style="flex-direction: row; justify-content: center" v-if="tab.tabList[tab.currentTab][1] === 2">
        <Game_KuaProofFinicky />
    </div> -->
</template>
