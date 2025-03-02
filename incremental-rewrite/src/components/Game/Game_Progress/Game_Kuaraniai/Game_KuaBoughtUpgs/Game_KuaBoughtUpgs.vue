<script setup lang="ts">
import { format } from "@/format";
import { KUA_UPGRADES } from "../Game_KuaUpgrades/Game_KuaUpgrades";
import { gameVars, player } from "@/main";
import { gRC } from "@/calc";
import Game_KuaUpgrade from "../Game_KuaUpgrades/Game_KuaUpgrade.vue";
</script>
<template>
    <div
    class="flex-container"
    style="flex-direction: column; justify-content: center"
    :style="{
        backgroundColor: gRC(
            4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8,
            0.2,
            1.0
        ),
        border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8, 0.5, 1.0)}`
    }"
>
    <div class="flex-container" style="flex-direction: column; align-items: center" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8, 0.5, 1.0)}` }">
        <div style="text-align: center; font-size: 1vw" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime) / 4, 1.0, 1.0) }" class="fontVerdana">
            You have bought <b>{{ format(player.gameProgress.kua.upgrades[0]) }}</b> Kuaraniai Shard Upgrades.<br>
        </div>
        <div class="flex-container" style=" flex-direction: row; flex-wrap: wrap; justify-content: center; width: 90vw;">
            <div v-for="(item, index) in KUA_UPGRADES.KShards" :key="index">
                <Game_KuaUpgrade v-if="index < player.gameProgress.kua.upgrades[0]" :item="item" :index="index" :type="'KShards'" />
            </div>
        </div>
    </div>
    <div class="flex-container" style="flex-direction: column; align-items: center" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 8, 0.5, 1.0)}` }">
        <div style="text-align: center; font-size: 1vw" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0) }" class="fontVerdana">
            You have bought <b>{{ format(player.gameProgress.kua.upgrades[1]) }}</b> Kuaraniai Power Upgrades.<br>
        </div>
        <div class="flex-container" style="flex-direction: row; flex-wrap: wrap; justify-content: center; width: 90vw;">
            <div v-for="(item, index) in KUA_UPGRADES.KPower" :key="index">
                <Game_KuaUpgrade v-if="index < player.gameProgress.kua.upgrades[1]" :item="item" :index="index" :type="'KPower'" />
            </div>
        </div>
    </div>
    <div v-if="player.gameProgress.unlocks.kb" class="flex-container" style="flex-direction: column; align-items: center" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI / 2) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI / 3) / 8, 0.5, 1.0)}` }">
        <div style="text-align: center; font-size: 1vw" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0) }" class="fontVerdana">
            You have bought <b>{{ format(player.gameProgress.kua.upgrades[2]) }}</b> Kuaraniai Upgrades.<br>
        </div>
        <div class="flex-container" style="flex-direction: row; flex-wrap: wrap; justify-content: center; width: 90vw;">
            <div v-for="(item, index) in KUA_UPGRADES.Kua" :key="index">
                <Game_KuaUpgrade v-if="index < player.gameProgress.kua.upgrades[2]" :item="item" :index="index" :type="'Kua'" />
            </div>
        </div>
    </div>
</div>
</template>
