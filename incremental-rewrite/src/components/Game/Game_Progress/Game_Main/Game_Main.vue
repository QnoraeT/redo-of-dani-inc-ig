<script setup lang="ts">
import Decimal from 'break_eternity.js'
import { tab } from '@/main'
import { tmp, player } from '@/main'
import { switchSubTab } from '@/components/MainTabs/MainTabs'
import Tab_Button from '@/components/MainTabs/DefaultTabButton.vue'
import Game_MainUpgrades from './Game_MainUpgrades/Game_MainUpgrades.vue'
import Game_OneUpgrades from './Game_OneUpgrades/Game_OneUpgrades.vue'
</script>
<template>
    <div id="generators" v-if="tab.currentTab === 0">
        <div v-if="Decimal.gte(player.gameProgress.main.pr2.bestEver, 6)" class="flex-container" style="flex-direction: row; justify-content: center; font-size: 1.0vw; margin-bottom: 0.3vw;">
            <Tab_Button @click="switchSubTab(0, 0)" :selected="tab.tabList[tab.currentTab][0] === 0" :name="'Main'" />
            <Tab_Button :class="{ alert: tmp.main.canBuyUpg }" @click="switchSubTab(1, 0)" :selected="tab.tabList[tab.currentTab][0] === 1" :name="'One-Upgrades'" />
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 0">
            <Game_MainUpgrades />
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 1">
            <Game_OneUpgrades />
        </div>
    </div>
</template>
