<script setup lang="ts">
import { format } from "@/format";
import { buyKuaEnhSourceUPG, KUA_ENHANCERS, kuaEnh, kuaEnhReset } from "./Game.KuaEnhancers";
import { player, tmp } from "@/main";
import Decimal from "break_eternity.js";
import { colorChange } from "@/calc";
</script>
<template>
    <div class="flex-container" style="margin-left: auto; margin-right: auto; flex-direction: row; flex-wrap: wrap; justify-content: center; margin-top: 1vw; margin-bottom: 1vw; width: 50vw; align-content: center;">
        <div v-for="(item, index) in KUA_ENHANCERS.sources" :key="index">
            <div class="flex-container" style="flex-direction: column; margin: 0.2vw">
                <button style="text-align: center; font-size: 0.6vw" :class="{ nope: !tmp.kua.sourcesCanBuy[index], ok: tmp.kua.sourcesCanBuy[index] }" class="whiteText mediumButton font0 kuaButton" @click="buyKuaEnhSourceUPG(index)">
                    <h3 style="margin-top: 0.5vw; font-size: 0.75vw">
                        Enhancer Source {{ index + 1 }}:
                        {{ format(player.prog.kua.enhancers.sources[index]) }}
                    </h3>
                    +1 Enhancer.
                    <br><span>Cost: {{ format(item.cost(player.prog.kua.enhancers.sources[index]), 2) }} {{ item.sourceName }}</span>
                </button>
            </div>
        </div>
        <button style="text-align: center; font-size: 0.5vw" :class="{ nopeFill: !player.prog.kua.enhancers.autoSources, okFill: player.prog.kua.enhancers.autoSources }" class="whiteText thinMediumButton font0 kuaButton2" v-if="false" @click=" player.prog.kua.enhancers.autoSources = !player.prog.kua.enhancers.autoSources">
            <b>Enhancer Sources Autobuyer:{{ player.prog.kua.enhancers.autoSources ? "On" : "Off" }}</b>
        </button>
        <div class="flex-container" style="flex-direction: column; align-items: center">
            <div class="flex-container" style="flex-direction: column; align-items: center">
                <span style="font-size: 0.75vw; text-align: center" class="whiteText font0">
                    You have {{ format(Decimal.sub(tmp.kua.totalEnhSources, tmp.kua.enhSourcesUsed)) }} / {{ format(tmp.kua.totalEnhSources) }} Enhancers.
                </span>
                <span style="font-size: 0.75vw; text-align: center" class="whiteText font0">
                    You may only allocate a total {{ format(Decimal.mul(player.prog.kua.enhancers.xpSpread, 100)) }}% of power to your enhancers.
                </span>
                <span style="font-size: 0.75vw; text-align: center" class="whiteText font0" v-if="tmp.kua.enhShowSlow">
                    The enhancer XP is slowing down! (Strength: {{ format(tmp.kua.enhSlowdown, 2) }}%)
                </span>
            </div>
            <button style="text-align: center; font-size: 0.55vw" class="whiteText thinMediumButton font0 kuaButton2" @click="kuaEnhReset()">
                Unallocate every enhancer.
            </button>
        </div>
    </div>
    <div class="flex-container" style="flex-direction: column; align-items: center">
        <div v-for="(item, index) in KUA_ENHANCERS.enhances" :key="index">
            <div class="flex-container" v-if="Decimal.gte(tmp.kua.totalEnhSources, index * 3)">
                <div :style="{ color: item.color, border: `0.2vw solid ${item.color}`, backgroundColor: `${colorChange(item.color, 0.25, 1.0)}` }" style="margin-top: -0.3vw; width: 30vw; height: 6vw; text-align: center">
                    <div class="flex-container" style="flex-direction: column; margin: 0.5vw; margin-top: 0vw">
                        <span style="margin-top: 0.3vw; font-size: 1vw">
                            <b>
                                Enhancer {{ index + 1 }} ×{{ format(player.prog.kua.enhancers.enhancers[index]) }} (Power: {{ format(tmp.kua.trueEnhPower[index].mul(100), 2) }}%)
                            </b>
                        </span>
                        <div class="flex-container" style="justify-content: space-between; margin-top: 0.3vw">
                            <div class="slidecontainer" style="width: 12vw">
                                <input class="slider" type="range" v-model="player.prog.kua.enhancers.enhancePow[index]"/>
                                <!-- <Tooltip :display="`${value}`" :class="{ fullWidth: !title }" :direction="Direction.Down">
                                    <input type="range" class="slider" v-model="value" :min="min" :max="max"  />
                                </Tooltip>                                         -->
                            </div>
                            <div class="flex-container" style="flex-direction: column">
                                <span style="font-size: 1vw">XP: {{ format(player.prog.kua.enhancers.enhanceXP[index], 2) }} ({{ format(tmp.kua.kuaTrueSourceXPGen[index], 2) }}/s)</span>
                                <span style="font-size: 0.7vw">{{ item.desc }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button @click="kuaEnh(index, Infinity)" :style="{ color: item.color, border: `0.2vw solid ${item.color}`, backgroundColor: `${colorChange(item.color, 0.25, 1.0)}` }" class="font0 whiteText enhAllocButton" >
                    Add All
                </button>
                <button @click="kuaEnh(index, 1)" :style="{ color: item.color, border: `0.2vw solid ${item.color}`, backgroundColor: `${colorChange(item.color, 0.25, 1.0)}` }" class="font0 whiteText enhAllocButton" >
                    Add 1
                </button>
                <button @click="kuaEnh(index, -1)" :style="{ color: item.color, border: `0.2vw solid ${item.color}`, backgroundColor: `${colorChange(item.color, 0.25, 1.0)}` }" class="font0 whiteText enhAllocButton" >
                    Remove 1
                </button>
                <button @click="kuaEnh(index, -Infinity)" :style="{ color: item.color, border: `0.2vw solid ${item.color}`, backgroundColor: `${colorChange(item.color, 0.25, 1.0)}` }" class="font0 whiteText enhAllocButton" >
                    Remove All
                </button>
            </div>
        </div>
    </div>
</template>
