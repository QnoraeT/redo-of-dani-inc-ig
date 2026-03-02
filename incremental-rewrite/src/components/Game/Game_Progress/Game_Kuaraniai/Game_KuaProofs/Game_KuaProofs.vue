<script setup lang="ts">
import Decimal from "break_eternity.js";
import { tab } from "@/main";
import { tmp, player } from "@/main";
import { switchSubTab } from "@/components/MainTabs/MainTabs";
import Game_KuaProofAuto from "./Game_KuaProofAuto/Game_KuaProofAuto.vue";
import Game_KuaProofEffect from "./Game_KuaProofEffect/Game_KuaProofEffect.vue";
import Game_KuaProofNormal from "./Game_KuaProofNormal/Game_KuaProofNormal.vue";
import Game_KuaProofStrange from "./Game_KuaProofStrange/Game_KuaProofStrange.vue";
import Game_KuaProofFinicky from "./Game_KuaProofFinicky/Game_KuaProofFinicky.vue";
</script>
<template>
    <div class="flex-horizontal" style="font-size: 1.4vw; margin-bottom: 1vw;">
        <button :class="{ alert: tmp.kua.proofs.canBuyUpgs.auto }" v-if="Decimal.gte(player.prog.kua.proofs.strange.amount, 2) || player.prog.unlocks.kproofs.finicky" @click="switchSubTab(-2, 1)" class="kuaButton2 font0 whiteText normalTabButton">Automation</button>
        <button :class="{ alert: tmp.kua.proofs.canBuyUpgs.effect }" @click="switchSubTab(-1, 1)" class="kuaButton2 font0 whiteText normalTabButton">Effects</button>
        <button :class="{ alert: tmp.kua.proofs.canBuyUpgs.kp }" @click="switchSubTab(0, 1)" class="kuaButton2 font0 whiteText normalTabButton">KProof</button>
        <button :class="{ alert: tmp.kua.proofs.canBuyUpgs.skp }" v-if="player.prog.unlocks.kproofs.strange" @click="switchSubTab(1, 1)" class="kuaButton2 font0 whiteText normalTabButton">Strange KP</button>
        <button :class="{ alert: tmp.kua.proofs.canBuyUpgs.fkp }" v-if="player.prog.unlocks.kproofs.finicky" @click="switchSubTab(2, 1)" class="kuaButton2 font0 whiteText normalTabButton">Finicky KP</button>
    </div>
    <div class="flex-vertical" v-if="tab.tabList[tab.currentTab][1] === -2">
        <Game_KuaProofAuto />
    </div>
    <div class="flex-horizontal" v-if="tab.tabList[tab.currentTab][1] === -1">
        <Game_KuaProofEffect />
    </div>
    <div class="flex-horizontal" v-if="tab.tabList[tab.currentTab][1] === 0">
        <Game_KuaProofNormal />
    </div>
    <div class="flex-horizontal" v-if="tab.tabList[tab.currentTab][1] === 1">
        <Game_KuaProofStrange />
    </div>
    <div class="flex-horizontal" v-if="tab.tabList[tab.currentTab][1] === 2">
        <Game_KuaProofFinicky />
    </div>
</template>
