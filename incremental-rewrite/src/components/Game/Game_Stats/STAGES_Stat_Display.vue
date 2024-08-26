<script setup lang="ts">
import Decimal from 'break_eternity.js'
import { tab, player, tmp } from '@/main'
import { format, formatTime } from '@/format'
import { STAGES } from './Game_Stats'
import { MAIN_UPGS } from '../Game_Progress/Game_Main/Game_Main'

defineProps<{
    id: number
}>()
</script>
<template>
    <div v-if="tab.tabList[tab.currentTab][1] === id" :style="{ border: `0.24vw solid ${STAGES[id].colors.border}`, backgroundColor: STAGES[id].colors.name }" style="display: flex; justify-content: center; flex-direction: column; align-items: center; justify-content: center; height: 36.1vw; width: 39.2vw; font-size: 1vw" class="whiteText">
        <div v-if="id === 0" class="statText fontVerdana">
            <span>
                Total Points: {{format(player.gameProgress.main.totals.ever, 2)}}<br>
                {{`<--- Upgrades --- >`}}<br>
            </span>
            <span v-for="(item, index) of MAIN_UPGS" :key='item.id'>
                <span v-if="item.shown">
                    Best Upgrade {{ index + 1 }}: {{format(player.gameProgress.main.upgrades[index].best)}}<br>
                </span>
            </span>
            <span>
                {{`<--- PRai --- >`}}<br>
                Total Points in PRai: {{ format(player.gameProgress.main.totals.prai, 2) }}<br>
                Total PRai: {{ format(player.gameProgress.main.prai.totals.ever, 2) }}<br>
            </span>
            <span v-if="Decimal.gte(player.gameProgress.main.prai.best.ever, 9.5)">
                {{`<--- PRai --- >`}}<br>
                Total PRai in PR2: {{ format(player.gameProgress.main.prai.totals.pr2, 2) }}<br>
                Best PRai in PR2: {{ format(player.gameProgress.main.prai.best.pr2, 2) }}<br>
            </span>
            <span v-if="Decimal.gte(player.gameProgress.main.pr2.best.ever, 10)">
                Effective PRai in Kuaraniai: {{ format(tmp.kua.effectivePrai, 2) }}<br>
            </span>
            <span>
                PRai resets: {{ format(player.gameProgress.main.prai.times, 2) }}<br>
                Time in PRai reset: {{ formatTime(player.gameProgress.main.prai.timeInPRai, 2) }}<br>
            </span>
            <span v-if="Decimal.gte(player.gameProgress.main.prai.best.ever, 9.5)">
                {{`<--- PR2 --- >`}}<br>
                PR2 resets: {{ format(player.gameProgress.main.pr2.amount) }}<br>
                Best PR2: {{ format(player.gameProgress.main.pr2.best.ever) }}<br>
            </span>
        </div>
        <div v-if="id === 1" class="statText fontVerdana">
            <span>
                Effective PRai in Kuaraniai: {{ format(tmp.kua.effectivePrai, 2) }}<br>
                Total Kuaraniai: {{ format(player.gameProgress.kua.totals.ever, 4) }}<br>
                Best Kuaraniai: {{ format(player.gameProgress.kua.best.ever, 4) }}<br>
                Kuaraniai Resets: {{ format(player.gameProgress.kua.times) }}<br>
                Time in Kua reset: {{ format(player.gameProgress.kua.timeInKua) }}<br>
                {{`<--- Kuaraniai Shards --- >`}}<br>
                Total KShards: {{ format(player.gameProgress.kua.kshards.totals.ever, 3)}}<br>
                Best KShards: {{ format(player.gameProgress.kua.kshards.best.ever, 3)}}<br>
                KShard Upgrades: {{ player.gameProgress.kua.kshards.upgrades}}<br>
                {{`<--- Kuaraniai Power --- >`}}<br>
                Total KPower: {{ format(player.gameProgress.kua.kpower.totals.ever, 3)}}<br>
                Best KPower: {{ format(player.gameProgress.kua.kpower.best.ever, 3)}}<br>
                KShard Upgrades: {{ player.gameProgress.kua.kpower.upgrades}}<br>
            </span>
        </div>
        <div v-if="id === 2" class="statText fontVerdana">
            <!-- stuff here -->
        </div>
        <div v-if="id === 3" class="statText fontVerdana">
            <!-- stuff here -->
        </div>
    </div>
</template>
<style scoped>
.statText {
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    text-align: center;
}
</style>