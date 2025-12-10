<script setup lang="ts">
import { format, formatTime } from '@/format';
import { player, tab } from '@/main';
import { speedToConsume, timeSpeedBoost } from './Game_Stored_Time';
import Decimal from 'break_eternity.js';
</script>
<template>
    <div id="storedTime" v-if="tab.currentTab === -1">
        <div class="flex-container" style="display: flex; flex-direction: column; align-items: center; margin-top: 0.8vw; background-color: #010; border: 0.24vw solid #00ff00; margin-left: auto; margin-right: auto; padding: 0.6vw; box-shadow: 0 0 0.8vw 0.24vw rgb(0, 75, 0); height: 45vw; width: 80vw;">
            <span class="font0" style="color: #0f0; font-size: 1.4vw">You have <b>{{ formatTime(Decimal.div(player.offlineTime, 1000), 2, 3, 4) }}</b> of offline time reserve.</span>
            <div class="flex-container" style="flex-direction: row;">
                <button @click="player.prog.dilatedTime.normalized = !player.prog.dilatedTime.normalized" class="flex-container buttonLol font0">
                    Normalize time.<br>
                    Currently: {{ player.prog.dilatedTime.normalized ? 'Normalized' : 'Unnormalized' }}
                </button>
                <!-- ! theres an exploit here lmao ! -->
                <!-- <button @click="setNormalizationTime()" class="flex-container buttonLol font0">
                    Change normalization time.<br>
                    Any tick that takes longer than this time will be automatically converted to offline time.<br>
                    Currently: {{ formatTime(player.gameProgress.dilatedTime.normalizeTime, 1) }}
                </button> -->
            </div>
            <div class="flex-container" style="flex-direction: row;">
                <button @click="player.prog.dilatedTime.paused = !player.prog.dilatedTime.paused" class="flex-container buttonLol font0">
                    Pause time.<br>
                    Currently: {{ player.prog.dilatedTime.paused ? 'Paused' : 'Running' }}
                </button>
                <button class="flex-container buttonLol font0">
                    Consume offline time to speed up the game!<br>
                    <span style="font-size: 0.55vw">Note: The boost you select will automatically adjust to the amount of offline time reserve you have. What you're doing is selecting how much % to use of your current offline time reserve every second.</span>
                    <div style="position: relative; width: 100%; margin-bottom: 1.0vw">
                        <div class="slidecontainer" style="position: absolute; left: 3%; width: 94%;">
                            <input class="slider dilTSlider" style="padding: 0vw; margin: 0vw" type="range" v-model="player.prog.dilatedTime.speed" min="0" max="1" step="any" />
                        </div>
                    </div>
                    Currently: {{ format(timeSpeedBoost(), 2) }}x, which is consuming {{ formatTime(speedToConsume(), 1) }} of offline time reserve per second.<br>
                    (This boost will last for {{ player.prog.dilatedTime.speed == 0 ? 'Disabled' : formatTime(Decimal.div(player.offlineTime, 1000).div(speedToConsume())) }}.)
                </button>
                <button @click="player.prog.dilatedTime.speedEnabled = !player.prog.dilatedTime.speedEnabled" class="flex-container buttonLol font0">
                    Accelerate time!<br>
                    Currently: {{ player.prog.dilatedTime.speedEnabled ? 'Running' : 'Disabled' }}
                </button>
            </div>
        </div>
    </div>
</template>
<style scoped>
.buttonLol {
    cursor: pointer; 
    margin-top: 0.4vw; 
    font-size: 0.75vw; 
    text-align: center; 
    color: #0f0; 
    background-color: #040; 
    border: 0.24vw solid #0c0; 
    height: 8vw; 
    width: 20vw;
    justify-content: center; 
    align-items: center; 
    flex-direction: column
}
</style>