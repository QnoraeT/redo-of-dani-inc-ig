<script setup lang="ts">
import Decimal from 'break_eternity.js'
import { tab } from '@/main'
import { tmp, player } from '@/main'
import { switchSubTab } from '@/components/MainTabs/MainTabs'
import Tab_Button from '@/components/MainTabs/DefaultTabButton.vue'
import Game_MainUpgrades from './Game_MainUpgrades/Game_MainUpgrades.vue'
import Game_OneUpgrades from './Game_OneUpgrades/Game_OneUpgrades.vue'
import { PR2_EFF } from './Game_Main'
import { format } from '@/format'
</script>
<template>
    <div id="generators" v-if="tab.currentTab === 0">
        <div class="flex-horizontal" style="font-size: 1.0vw; margin-bottom: 0.3vw;">
            <Tab_Button @click="switchSubTab(0, 0)" :selected="tab.tabList[tab.currentTab][0] === 0" :name="'Main'" />
            <Tab_Button v-if="Decimal.gte(player.prog.main.pr2.bestEver, 1)" @click="switchSubTab(2, 0)" :selected="tab.tabList[tab.currentTab][0] === 2" :name="'PR2 Effects'" />
            <Tab_Button v-if="Decimal.gte(player.prog.main.pr2.bestEver, 6)" :class="{ alert: tmp.main.canBuyUpg }" @click="switchSubTab(1, 0)" :selected="tab.tabList[tab.currentTab][0] === 1" :name="'One-Upgrades'" />
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 0">
            <Game_MainUpgrades />
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 1">
            <Game_OneUpgrades />
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 2">
            <div class="flex-container" style="flex-direction: column-reverse; margin-top: 0.96vw; margin-left: auto; margin-right: auto; align-items: center;">
                <div v-for="(item, index) in PR2_EFF" :key="index">
                    <div v-if="Decimal.gte(player.prog.main.pr2.amount, item.when) && item.show">
                        <div style="font-size: 0.8vw; text-align: center; border: 0.12vw solid #c0c0c0; height: 4vw; width: 30vw" 
                        class="whiteText largeButton font0 generatorButton">
                            <span style="font-size: 1.1vw">PR2: {{ format(item.when) }}</span><br>
                            {{ item.text }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
