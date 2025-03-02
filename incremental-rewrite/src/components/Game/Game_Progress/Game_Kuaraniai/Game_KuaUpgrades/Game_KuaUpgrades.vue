<script setup lang="ts">
import Decimal from "break_eternity.js";
import { format, formatPerc } from "@/format";
import { buyKMainUpg, buyKPowerUpg, buyKShardUpg, KUA_UPGRADES } from "./Game_KuaUpgrades";
import { gameVars, player, tmp } from "@/main";
import { colorChange, gRC } from "@/calc";
import { resetStage } from "@/resets";;
import { hasGrowanMilestone } from "../../Game_Layer4/Game_Growan/Game_Growan";
import Game_KuaUpgrade from "./Game_KuaUpgrade.vue";

</script>
<template>
    <button
        style="text-align: center; margin-top: 0.48vw; margin-left: auto; margin-right: auto; font-size: 0.8vw;"
        :class="{ nope: !tmp.kua.canDo, ok: tmp.kua.canDo }"
        class="whiteText thinlargeButton fontVerdana kuaButton"
        id="kuaGain"
        @click="resetStage('kua')"
    >
    <h3 style="font-size: 1vw">
        Kuaraniai: {{ format(player.gameProgress.kua.amount, 3) }}
    </h3>
    {{
        tmp.kua.canDo
            ? `You can convert ${format(tmp.kua.effectivePrai)} PRai to ${format(tmp.kua.pending, 4)} Kuaraniai!`
            : `You need ${format(tmp.kua.effectivePrai)} / ${format(tmp.kua.req)} PRai to convert into Kuaraniai.`
    }}
    <br>You have {{ format(player.gameProgress.kua.amount, 3) }} Kuaraniai, which generates {{ format(tmp.kua.shardGen, 4) }} Kuaraniai Shards (KShards) per second. It also:
    <div v-if="tmp.kua.active.effects">
        <li>Reduces Upgrade 1's scaling strength by {{ formatPerc(tmp.kua.effects.upg1Scaling, 3) }}</li>
        <li v-if="player.gameProgress.kua.kpower.upgrades >= 6">Reduces Upgrade 1's super scaling strength by {{ formatPerc(tmp.kua.effects.upg1SuperScaling, 3) }}</li>
        <li v-if="Decimal.gt(player.gameProgress.kua.amount, 0)">Adds Upgrade 4, and makes it's base ×{{format(tmp.kua.effects.upg4, 4)}}/bought.</li>
        <li v-if="player.gameProgress.kua.kpower.upgrades >= 3">Raises Points gain to ^{{ format(tmp.kua.effects.ptPower, 4) }}</li>
        <li v-if="player.gameProgress.kua.kpower.upgrades >= 6">Delays Upgrade 2's softcap by {{ format(tmp.kua.effects.upg2Softcap, 2) }}×</li>
        <li v-if="player.gameProgress.kua.kshards.upgrades >= 7">Multiplies Point gain by {{ format(tmp.kua.effects.pts, 2) }}×</li>
        <li v-if="player.gameProgress.kua.kshards.upgrades >= 10">Increases KShards' PRai effect boost by ^{{format(tmp.kua.effects.kshardPrai, 4)}}</li>
        <li v-if="player.gameProgress.kua.kshards.upgrades >= 10">Boosts KPower gain by ×{{ format(tmp.kua.effects.kpower, 2) }}</li>
        <li v-if="player.gameProgress.kua.upgrades >= 2">Boosts KBlessing gain by ×{{ format(tmp.kua.effects.bless, 2) }}</li>
    </div>
</button>
<button
    style="text-align: center; width: 35vw; height: 3vw; font-size: 0.7vw; margin-left: auto; margin-right: auto;"
    :class="{
        nopeFill: !player.gameProgress.kua.auto,
        okFill: player.gameProgress.kua.auto
    }"
    class="whiteText thinMediumButton fontVerdana genAutoButton"
    id="autoKua"
    v-if="Decimal.gte(player.gameProgress.main.pr2.amount, 75) || (Decimal.gte(player.gameProgress.main.pr2.best[4]!, 75) && hasGrowanMilestone(3))"
    @click="player.gameProgress.kua.auto = !player.gameProgress.kua.auto"
>
    <b>Kuaraniai Generator: {{ player.gameProgress.kua.auto ? "On" : "Off" }}</b>
</button>
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
    <div class="flex-container" style="flex-direction: column" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8, 0.5, 1.0)}` }">
        <div style="text-align: center; font-size: 1vw" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime) / 4, 1.0, 1.0) }" class="fontVerdana">
            You have <b>{{ format(player.gameProgress.kua.kshards.amount, 3) }}</b> Kuaraniai shards.
            <div v-if="tmp.kua.active.kshards.effects" class="fontVerdana">
                <li>Boosts PRai gain by {{ format(tmp.kua.effects.kshardPassive, 3) }}×.</li>
                <li>Generate {{ format(tmp.kua.powGen, 3) }} Kuaraniai Power (KPower) per second.</li>
                <li v-if="Decimal.gt(player.gameProgress.kua.kshards.amount, 0)">Adds Upgrade 5, and makes it's base ×{{format(tmp.kua.effects.upg5, 4)}}/bought.</li>
                <li v-if="player.gameProgress.kua.kshards.upgrades >= 2">Multiply PRai's effect by {{ format(KUA_UPGRADES.KShards[1].eff!.value, 2) }}×.</li>
                <li v-if="player.gameProgress.kua.kshards.upgrades >= 8">Multiply PRai gain by {{ format(KUA_UPGRADES.KShards[7].eff!.value, 2) }}×.</li>
                <li v-if="player.gameProgress.kua.kshards.upgrades >= 9">Delays Upgrade 2's cost growth (after scaling costs) by +{{format(KUA_UPGRADES.KShards[8].eff!.value, 2)}} purchases.</li>
            </div>
        </div>
        <div class="flex-container" style="flex-direction: row; justify-content: center">
            <div v-for="(item, index) in KUA_UPGRADES.KShards" :key="index">
                <Game_KuaUpgrade
                    @click="buyKShardUpg(index)"
                    :style="{
                        opacity: 0.5 ** (index - player.gameProgress.kua.kshards.upgrades),
                        border: `0.24vw solid ${Decimal.lt(item.cost, player.gameProgress.kua.kshards.amount) ? colorChange('#FF00FF', 1.0, 0.5 + 0.5 * Math.sin(Math.PI * gameVars.sessionTime)) : '#b900ff'}`
                    }"
                    v-if="
                        index >= player.gameProgress.kua.kshards.upgrades &&
                        index < player.gameProgress.kua.kshards.upgrades + 5 &&
                        item.show
                    "
                    :item="item"
                    :index="index"
                    :type="'KShards'"
                />
            </div>
        </div>
    </div>
    <div class="flex-container" style="flex-direction: column" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 8, 0.5, 1.0)}` }">
        <div style="text-align: center; font-size: 1vw" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0) }" class="fontVerdana">
            You have <b>{{ format(player.gameProgress.kua.kpower.amount, 3) }}</b> Kuaraniai power.
            <div v-if="tmp.kua.active.kpower.effects" class="fontVerdana">
                <li>Boosts Point gain by {{ format(tmp.kua.effects.kpowerPassive, 3) }}×.</li>
                <li v-if="Decimal.gt(player.gameProgress.kua.kpower.amount, 1)">Adds Upgrade 6, and makes it's base +{{format(tmp.kua.effects.upg6, 5)}}/bought.</li>
                <li v-if="player.gameProgress.kua.kpower.upgrades >= 1">Increases Upgrade 2's base by +{{format(KUA_UPGRADES.KPower[0].eff!.value, 3)}}.</li>
                <li v-if="player.gameProgress.kua.kpower.upgrades >= 2">Makes Upgrade 3 {{ format(KUA_UPGRADES.KPower[1].eff!.value.sub(1).mul(100), 3) }}% more effective.</li>
                <li v-if="player.gameProgress.kua.kpower.upgrades >= 4">Delays Upgrade 2's softcap by {{ format(KUA_UPGRADES.KPower[3].eff!.value, 2) }}×.</li>
                <li v-if="player.gameProgress.kua.kpower.upgrades >= 5">Raises PRai's effect to ^{{format(KUA_UPGRADES.KPower[4].eff!.value, 4)}}.</li>
            </div>
        </div>
        <div class="flex-container" style="flex-direction: row; justify-content: center">
            <div v-for="(item, index) in KUA_UPGRADES.KPower" :key="index">
                <Game_KuaUpgrade
                    @click="buyKPowerUpg(index)"
                    :style="{
                        opacity: 0.5 ** (index - player.gameProgress.kua.kpower.upgrades),
                        border: `0.24vw solid ${Decimal.lt(item.cost, player.gameProgress.kua.kpower.amount) ? colorChange('#FF00FF', 1.0, 0.5 + 0.5 * Math.sin(Math.PI * gameVars.sessionTime)) : '#b900ff'}`
                    }"
                    v-if="
                        index >= player.gameProgress.kua.kpower.upgrades &&
                        index < player.gameProgress.kua.kpower.upgrades + 5 &&
                        item.show
                    "
                    :item="item"
                    :index="index"
                    :type="'KPower'"
                />
            </div>
        </div>
    </div>
    <div v-if="player.gameProgress.unlocks.kblessings" class="flex-container" style="flex-direction: column" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 8, 0.5, 1.0)}` }">
        <div style="text-align: center; font-size: 1vw" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0) }" class="fontVerdana">
            You have <b>{{ format(player.gameProgress.kua.amount, 3) }}</b> Kuaraniai.
        </div>
        <div class="flex-container" style="flex-direction: row; justify-content: center">
            <div v-for="(item, index) in KUA_UPGRADES.Kua" :key="index">
                <Game_KuaUpgrade
                    @click="buyKMainUpg(index)"
                    :style="{
                        opacity: 0.5 ** (index - player.gameProgress.kua.upgrades),
                        border: `0.24vw solid ${Decimal.lt(item.cost, player.gameProgress.kua.amount) ? colorChange('#FF00FF', 1.0, 0.5 + 0.5 * Math.sin(Math.PI * gameVars.sessionTime)) : '#b900ff'}`
                    }"
                    v-if="
                        index >= player.gameProgress.kua.upgrades &&
                        index < player.gameProgress.kua.upgrades + 5 &&
                        item.show
                    "
                    :item="item"
                    :index="index"
                    :type="'Kua'"
                />
            </div>
        </div>
    </div>
</div>
</template>
