<script setup lang="ts">
import { tab } from "@/main";
import { tmp, player } from "@/main";
import { switchSubTab } from "@/components/MainTabs/MainTabs";
import Game_KuaBoughtUpgs from "./Game_KuaBoughtUpgs/Game_KuaBoughtUpgs.vue";
import Game_KuaUpgrades from "./Game_KuaUpgrades/Game_KuaUpgrades.vue";
import Game_KuaBlessings from "./Game_KuaBlessings/Game_KuaBlessings.vue";
import Game_KuaProofs from "./Game_KuaProofs/Game_KuaProofs.vue";
</script>
<template>
    <div id="kuaraniai" v-if="tab.currentTab === 4">
        <div class="flex-container" style=" flex-direction: row; justify-content: center; font-size: 1.4vw; margin-bottom: 1vw;">
            <button @click="switchSubTab(-1, 0)" style="width: 10vw" class="kuaButton2 fontVerdana whiteText normalTabButton">Bought Upgrades</button>
            <button :class="{ alert: tmp.kua.upgCanBuyUpg }" @click="switchSubTab(0, 0)" class="kuaButton2 fontVerdana whiteText normalTabButton">Main</button>
            <button :class="{ alert: tmp.kua.blessings.canBuyUpg }" v-if="player.gameProgress.unlocks.kb" @click="switchSubTab(1, 0)" class="kuaButton2 fontVerdana whiteText normalTabButton">Blessings</button>
            <button :class="{ alert: tmp.kua.proofs.canBuyUpg }" v-if="player.gameProgress.unlocks.kp" @click="switchSubTab(2, 0)" class="kuaButton2 fontVerdana whiteText normalTabButton">Proof</button>
            <!-- disable this for now, seems unbalanced -->
            <!-- <button @click="switchSubTab(1, 0)" v-if="player.gameProgress.unlocks.kuaEnhancers" class="kuaButton2 fontVerdana whiteText normalTabButton">Enhancers</button> -->
        </div>
        <div class="flex-container" style="margin-left: auto; margin-right: auto; flex-direction: column; justify-content: center;" v-if="tab.tabList[tab.currentTab][0] === -1">
            <Game_KuaBoughtUpgs />
        </div>
        <div class="flex-container" style=" margin-left: auto; margin-right: auto; flex-direction: column; justify-content: center;" v-if="tab.tabList[tab.currentTab][0] === 0">
            <Game_KuaUpgrades />
        </div>
        <div class="flex-container" style="flex-direction: column" v-if="tab.tabList[tab.currentTab][0] === 1">
            <Game_KuaBlessings />
        </div>
        <div class="flex-container" style="flex-direction: column" v-if="tab.tabList[tab.currentTab][0] === 2">
            <Game_KuaProofs />
        </div>
    </div>
</template>
<style scoped>
.enhAllocButton {
    margin-top: -0.3vw;
    margin-left: -0.3vw;
    width: 6vw;
    height: 6.35vw;
    text-align: center;
    font-size: 1vw;
}
.kuaBlessingActiveButton {
    margin-top: 0.4vw; 
    margin-left: auto; 
    margin-right: auto; 
    text-align: center; 
    font-size: 0.65vw; 
    border: 0.18vw solid #0f4; 
    background-color: #041; 
    width: 12vw; 
    height: 2vw;
    transition: 0.2s;
}
.kuaBlessingActiveButton:hover {
    background-color: #082;
    cursor: pointer;
}
</style>