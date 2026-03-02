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
        class="whiteText thinlargeButton font0 kuaButton"
        id="kuaGain"
        @click="resetStage('kua')"
    >
        <h3 style="font-size: 1vw">
            Kuaraniai: {{ format(player.prog.kua.amount, 3) }}
        </h3>
        {{
            tmp.kua.canDo
                ? `You can convert ${format(tmp.kua.effectivePrai)} PRai to ${format(tmp.kua.pending, 4)} Kuaraniai!`
                : `You need ${format(tmp.kua.effectivePrai)} / ${format(tmp.kua.req)} PRai to convert into Kuaraniai.`
        }}
        <br>You have {{ format(player.prog.kua.amount, 3) }} Kuaraniai, which generates {{ format(tmp.kua.shardGen, 4) }} Kuaraniai Shards (KShards) per second. It also:
        <div class="flex-vertical" v-if="tmp.kua.active.effects">
            <span>Reduces Upgrade 1's scaling strength by {{ formatPerc(tmp.kua.effects.upg1Scaling, 3) }}</span>
            <span v-if="player.prog.kua.kpower.upgrades >= 6">Reduces Upgrade 1's super scaling strength by {{ formatPerc(tmp.kua.effects.upg1SuperScaling, 3) }}</span>
            <span v-if="Decimal.gt(player.prog.kua.amount, 0)">Adds Upgrade 4, and makes it's base ×{{format(tmp.kua.effects.upg4, 4)}}/bought.</span>
            <span v-if="player.prog.kua.kpower.upgrades >= 3">Raises Points gain to ^{{ format(tmp.kua.effects.ptPower, 4) }}</span>
            <span v-if="player.prog.kua.kpower.upgrades >= 6">Delays Upgrade 2's softcap by {{ format(tmp.kua.effects.upg2Softcap, 2) }}×</span>
            <span v-if="player.prog.kua.kshards.upgrades >= 7">Multiplies Point gain by {{ format(tmp.kua.effects.pts, 2) }}×</span>
            <span v-if="player.prog.kua.kshards.upgrades >= 10">Increases KShards' PRai effect boost by ^{{format(tmp.kua.effects.kshardPrai, 4)}}</span>
            <span v-if="player.prog.kua.kshards.upgrades >= 10">Boosts KPower gain by ×{{ format(tmp.kua.effects.kpower, 2) }}</span>
            <span v-if="player.prog.kua.upgrades >= 2">Boosts KBlessing gain by ×{{ format(tmp.kua.effects.bless, 2) }}</span>
        </div>
    </button>
    <button
        style="text-align: center; width: 35vw; height: 3vw; font-size: 0.7vw; margin-left: auto; margin-right: auto;"
        :class="{
            nopeFill: !player.prog.kua.auto,
            okFill: player.prog.kua.auto
        }"
        class="whiteText thinMediumButton font0 genAutoButton"
        id="autoKua"
        v-if="Decimal.gte(player.prog.main.pr2.amount, 75) || hasGrowanMilestone(3)"
        @click="player.prog.kua.auto = !player.prog.kua.auto"
    >
        <b>Kuaraniai Generator: {{ player.prog.kua.auto ? "On" : "Off" }}</b>
    </button>
    <div
        class="flex-vertical"
        
        :style="{
            backgroundColor: gRC(
                4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8,
                0.2,
                1.0
            ),
            border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8, 0.5, 1.0)}`
        }"
    >
        <div class="flex-vertical" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8, 0.5, 1.0)}` }">
            <div style="text-align: center; font-size: 1vw" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime) / 4, 1.0, 1.0) }" class="font0">
                You have <b>{{ format(player.prog.kua.kshards.amount, 3) }}</b> Kuaraniai shards.
                <div v-if="tmp.kua.active.kshards.effects" class="font0 flex-vertical">
                    <span>Boosts PRai gain by {{ format(tmp.kua.effects.kshardPassive, 3) }}×.</span>
                    <span>Generate {{ format(tmp.kua.powGen, 3) }} Kuaraniai Power (KPower) per second.</span>
                    <span v-if="Decimal.gt(player.prog.kua.kshards.amount, 0)">Adds Upgrade 5, and makes it's base ×{{format(tmp.kua.effects.upg5, 4)}}/bought.</span>
                    <span v-if="player.prog.kua.kshards.upgrades >= 2">Multiply PRai's effect by {{ format(KUA_UPGRADES.KShards[1].eff!.value, 2) }}×.</span>
                    <span v-if="player.prog.kua.kshards.upgrades >= 8">Multiply PRai gain by {{ format(KUA_UPGRADES.KShards[7].eff!.value, 2) }}×.</span>
                    <span v-if="player.prog.kua.kshards.upgrades >= 9">Delays Upgrade 2's cost growth (after scaling costs) by +{{format(KUA_UPGRADES.KShards[8].eff!.value, 2)}} purchases.</span>
                </div>
            </div>
            <div class="flex-horizontal" style="padding: 0.5vw">
                <div v-for="(item, index) in KUA_UPGRADES.KShards" :key="index">
                    <Game_KuaUpgrade
                        @click="buyKShardUpg(index)"
                        :style="{
                            opacity: 0.5 ** (index - player.prog.kua.kshards.upgrades),
                            border: `0.24vw solid ${Decimal.lt(item.cost, player.prog.kua.kshards.amount) ? colorChange('#FF00FF', 1.0, 0.5 + 0.5 * Math.sin(2 * Math.PI * gameVars.sessionTime)) : '#8000c0'}`
                        }"
                        v-if="
                            index >= player.prog.kua.kshards.upgrades &&
                            index < player.prog.kua.kshards.upgrades + 5 &&
                            item.show
                        "
                        :item="item"
                        :index="index"
                        :type="'KShards'"
                    />
                </div>
            </div>
        </div>
        <div class="flex-vertical" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 8, 0.5, 1.0)}` }">
            <div style="text-align: center; font-size: 1vw" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0) }" class="font0">
                You have <b>{{ format(player.prog.kua.kpower.amount, 3) }}</b> Kuaraniai power.
                <div v-if="tmp.kua.active.kpower.effects" class="font0 flex-vertical">
                    <span>Boosts Point gain by {{ format(tmp.kua.effects.kpowerPassive, 3) }}×.</span>
                    <span v-if="Decimal.gt(player.prog.kua.kpower.amount, 1)">Adds Upgrade 6, and makes it's base +{{format(tmp.kua.effects.upg6, 5)}}/bought.</span>
                    <span v-if="player.prog.kua.kpower.upgrades >= 1">Increases Upgrade 2's base by +{{format(KUA_UPGRADES.KPower[0].eff!.value, 3)}}.</span>
                    <span v-if="player.prog.kua.kpower.upgrades >= 2">Adds +{{ format(Decimal.sub(KUA_UPGRADES.KPower[1].eff!.value, 1).mul(player.prog.main.upgrades[2].bought), 2) }} free levels to Upgrade 3.</span>
                    <span v-if="player.prog.kua.kpower.upgrades >= 4">Delays Upgrade 2's softcap by {{ format(KUA_UPGRADES.KPower[3].eff!.value, 2) }}×.</span>
                    <span v-if="player.prog.kua.kpower.upgrades >= 5">Raises PRai's effect to ^{{format(KUA_UPGRADES.KPower[4].eff!.value, 4)}}.</span>
                </div>
            </div>
            <div class="flex-horizontal" style="padding: 0.5vw">
                <div v-for="(item, index) in KUA_UPGRADES.KPower" :key="index">
                    <Game_KuaUpgrade
                        @click="buyKPowerUpg(index)"
                        :style="{
                            opacity: 0.5 ** (index - player.prog.kua.kpower.upgrades),
                            border: `0.24vw solid ${Decimal.lt(item.cost, player.prog.kua.kpower.amount) ? colorChange('#FF00FF', 1.0, 0.5 + 0.5 * Math.sin(2 * Math.PI * gameVars.sessionTime)) : '#8000c0'}`
                        }"
                        v-if="
                            index >= player.prog.kua.kpower.upgrades &&
                            index < player.prog.kua.kpower.upgrades + 5 &&
                            item.show
                        "
                        :item="item"
                        :index="index"
                        :type="'KPower'"
                    />
                </div>
            </div>
        </div>
        <div v-if="player.prog.unlocks.kblessings" class="flex-vertical" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 8, 0.5, 1.0)}` }">
            <div style="text-align: center; font-size: 1vw" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0) }" class="font0">
                You have <b>{{ format(player.prog.kua.amount, 3) }}</b> Kuaraniai.
            </div>
            <div class="flex-horizontal" style="padding: 0.5vw">
                <div v-for="(item, index) in KUA_UPGRADES.Kua" :key="index">
                    <Game_KuaUpgrade
                        @click="buyKMainUpg(index)"
                        :style="{
                            opacity: 0.5 ** (index - player.prog.kua.upgrades),
                            border: `0.24vw solid ${Decimal.lt(item.cost, player.prog.kua.amount) ? colorChange('#FF00FF', 1.0, 0.5 + 0.5 * Math.sin(2 * Math.PI * gameVars.sessionTime)) : '#8000c0'}`
                        }"
                        v-if="
                            index >= player.prog.kua.upgrades &&
                            index < player.prog.kua.upgrades + 5 &&
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
