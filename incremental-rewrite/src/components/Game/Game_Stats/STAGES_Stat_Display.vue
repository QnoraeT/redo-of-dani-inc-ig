<script setup lang="ts">
import Decimal from "break_eternity.js";
import { tab, player, tmp } from "@/main";
import { format, formatTime } from "@/format";
import { STAGES } from "./Game_Stats";
import { MAIN_UPG_DATA } from "../Game_Progress/Game_Main/Game_MainUpgrades/Game_MainUpgrades";

defineProps<{
    id: number;
}>();
</script>
<template>
    <div
        v-if="tab.tabList[tab.currentTab][1] === id"
        :style="{
            border: `0.18vw solid ${STAGES[id].colors.border}`,
            backgroundColor: STAGES[id].colors.name
        }"
        style="
            display: flex;
            justify-content: center;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 26vw;
            width: 29vw;
            font-size: 0.75vw;
        "
        class="whiteText"
    >
        <!-- <div v-if="id === 0" class="statText font0">
            <span>
                Best Points in PRai: {{ format(player.prog.main.bestInPrai, 2) }}<br>
                {{ `<--- Upgrades --- >` }}<br>
            </span>
            <span v-for="(item, index) of MAIN_UPG_DATA" :key="index">
                <span v-if="tmp.main.upgrades[index].shown">
                    Best Upgrade {{ index + 1 }}:
                    {{ format(player.prog.main.upgrades[index].best) }}<br>
                </span>
            </span>
            <span>
                {{ `<--- PRai --- >` }}<br>
                Best Points in PRai: {{ format(player.prog.main.totals[0]!, 2) }}<br>
                Total PRai: {{ format(player.prog.main.prai.totalEver, 2) }}<br>
            </span>
            <span v-if="Decimal.gte(player.prog.main.prai.bestEver, 9.5)">
                {{ `<--- PRai --- >` }}<br>
                Total PRai in PR2: {{ format(player.prog.main.prai.totals[1]!, 2) }}<br>
                Best PRai in PR2: {{ format(player.prog.main.prai.best[1]!, 2) }}<br>
            </span>
            <span v-if="Decimal.gte(player.prog.main.pr2.bestEver, 10)">
                Effective PRai in Kuaraniai: {{ format(tmp.kua.effectivePrai, 2) }}<br>
            </span>
            <span>
                PRai resets: {{ format(player.prog.main.prai.times, 2) }}<br>
                Time in PRai reset: {{ formatTime(player.prog.main.prai.timeInPRai, 2)
                }}<br>
            </span>
            <span v-if="Decimal.gte(player.prog.main.prai.bestEver, 9.5)">
                {{ `<--- PR2 --- >` }}<br>
                PR2 resets: {{ format(player.prog.main.pr2.amount) }}<br>
                Best PR2: {{ format(player.prog.main.pr2.bestEver) }}<br>
            </span>
        </div>
        <div v-if="id === 1" class="statText font0">
            <span>
                Effective PRai in Kuaraniai: {{ format(tmp.kua.effectivePrai, 2) }}<br>
                Total Kuaraniai: {{ format(player.prog.kua.totalEver, 4) }}<br>
                Best Kuaraniai: {{ format(player.prog.kua.bestEver, 4) }}<br>
                Kuaraniai Resets: {{ format(player.prog.kua.times) }}<br>
                Time in Kua reset: {{ formatTime(player.prog.kua.timeInKua, 2) }}<br>
                {{ `<--- Kuaraniai Shards --- >` }}<br>
                Total KShards: {{ format(player.prog.kua.kshards.totalEver, 3) }}<br>
                Best KShards: {{ format(player.prog.kua.kshards.bestEver, 3) }}<br>
                KShard Upgrades: {{ player.prog.kua.kshards.upgrades }}<br>
                {{ `<--- Kuaraniai Power --- >` }}<br>
                Total KPower: {{ format(player.prog.kua.kpower.totalEver, 3) }}<br>
                Best KPower: {{ format(player.prog.kua.kpower.bestEver, 3) }}<br>
                KShard Upgrades: {{ player.prog.kua.kpower.upgrades }}<br>
            </span>
        </div>
        <div v-if="id === 2" class="statText font0">
            <span>
                Total Colosseum Power: {{ format(player.prog.col.totalEver, 2) }}<br>
                Best Colosseum Power: {{ format(player.prog.col.bestEver, 2) }}<br>
                Total Challenge Completions: {{ format(tmp.col.totalColChalComp) }}<br>
            </span>
        </div>
        <div v-if="id === 3" class="statText font0">
            <span>
                Total Grōwan: {{ format(player.prog.layer4.gro.totalAmt, 2) }}<br>
                Equation Cancellations: {{ format(player.prog.layer4.gro.equCancel) }}<br>
                Grōwan Equation Mult Increases: {{ format(player.prog.layer4.gro.gal) }}<br>
            </span>
        </div>
        <div v-if="id === 4" class="statText font0">
            <span>
                Total Taxed Coins: {{ format(player.prog.layer4.tax.totalEver, 2) }}<br>
                Best Taxed Coins: {{ format(player.prog.layer4.tax.bestEver, 2) }}<br>
                Taxation Resets: {{ format(player.prog.layer4.tax.times) }}<br>
            </span>
        </div> -->
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