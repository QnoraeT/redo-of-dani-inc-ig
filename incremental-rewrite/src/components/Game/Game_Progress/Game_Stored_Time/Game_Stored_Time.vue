<script setup lang="ts">
import { format, formatTime } from '@/format';
import { player, tab } from '@/main';
import { setNormalizationTime, speedToConsume, timeSpeedBoost } from './Game_Stored_Time';
import Decimal from 'break_eternity.js';
</script>
<template>
    <div id="storedTime" v-if="tab.currentTab === -1">
        <div class="flex-container" style="display: flex; flex-direction: column; align-items: center; margin-top: 0.8vw; background-color: #010; border: 0.24vw solid #00ff00; margin-left: auto; margin-right: auto; padding: 0.6vw; box-shadow: 0 0 0.8vw 0.24vw rgb(0, 75, 0); height: 45vw; width: 80vw;">
            <span class="fontVerdana" style="color: #0f0; font-size: 1.4vw">You have <b>{{ formatTime(player.offlineTime / 1000, 3, 3, 4) }}</b> of Offline Time.</span>
            <div class="flex-container" style="flex-direction: row;">
                <button @click="player.gameProgress.dilatedTime.normalized = !player.gameProgress.dilatedTime.normalized" class="flex-container buttonLol fontVerdana">
                    Normalize time.<br>
                    Currently: {{ player.gameProgress.dilatedTime.normalized ? 'Normalized' : 'Unnormalized' }}
                </button>
                <button @click="setNormalizationTime()" class="flex-container buttonLol fontVerdana">
                    Change normalization time.<br>
                    Any tick that takes longer than this time will be automatically converted to offline time.<br>
                    Currently: {{ formatTime(player.gameProgress.dilatedTime.normalizeTime, 1) }}
                </button>
            </div>
            <div class="flex-container" style="flex-direction: row;">
                <button @click="player.gameProgress.dilatedTime.paused = !player.gameProgress.dilatedTime.paused" class="flex-container buttonLol fontVerdana">
                    Pause time.<br>
                    Currently: {{ player.gameProgress.dilatedTime.paused ? 'Paused' : 'Running' }}
                </button>
                <button class="flex-container buttonLol fontVerdana">
                    Consume offline time to speed up the game!<br>
                    <span style="font-size: 0.55vw">Note: The boost you select will automatically adjust to the amount of Offline Time you have. What you're doing is selecting how much % to use of your current Offline Time every second.</span>
                    <div style="position: relative; width: 100%; margin-bottom: 1.0vw">
                        <div class="slidecontainer" style="position: absolute; left: 3%; width: 94%;">
                            <input class="slider dilTSlider" style="padding: 0vw; margin: 0vw" type="range" v-model="player.gameProgress.dilatedTime.speed" min="0" max="1" step="any" />
                        </div>
                    </div>
                    Currently: {{ format(timeSpeedBoost(), 3) }}x, which is consuming {{ formatTime(speedToConsume(), 3) }} of Offline Time per second.<br>
                    (This boost will last for {{ player.gameProgress.dilatedTime.speed == 0 ? 'Disabled' : formatTime(Decimal.div(player.offlineTime / 1000, speedToConsume())) }}.)
                </button>
                <button @click="player.gameProgress.dilatedTime.speedEnabled = !player.gameProgress.dilatedTime.speedEnabled" class="flex-container buttonLol fontVerdana">
                    Accelerate time!<br>
                    Currently: {{ player.gameProgress.dilatedTime.speedEnabled ? 'Running' : 'Disabled' }}
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