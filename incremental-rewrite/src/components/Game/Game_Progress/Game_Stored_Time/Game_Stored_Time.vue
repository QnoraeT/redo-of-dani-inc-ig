<script setup lang="ts">
import { formatTime } from '@/format';
import { player, tab } from '@/main';
import { setNormalizationTime } from './Game_Stored_Time';
</script>
<template>
    <div id="storedTime" v-if="tab.currentTab === -1">
        <div class="flex-container" style="display: flex; flex-direction: column; align-items: center; margin-top: 0.8vw; background-color: #010; border: 0.24vw solid #00ff00; margin-left: auto; margin-right: auto; padding: 0.6vw; box-shadow: 0 0 0.8vw 0.24vw rgb(0, 75, 0); height: 45vw; width: 80vw;">
            <span class="fontVerdana" style="color: #0f0; font-size: 1.4vw">You have <b>{{ formatTime(player.offlineTime / 1000, 3, 3, 4) }}</b> of Offline Time.</span>
            <div class="flex-container" style="flex-direction: row;">
                <button @click="player.gameProgress.dilatedTime.normalized = !player.gameProgress.dilatedTime.normalized" class="flex-container fontVerdana" style="cursor: pointer; margin-top: 0.4vw; font-size: 1.2vw; text-align: center; color: #0f0; background-color: #040; border: 0.24vw solid #0c0; height: 8vw; width: 20vw; justify-content: center; align-items: center">
                    Normalize time.<br>
                    Currently: {{ player.gameProgress.dilatedTime.normalized ? 'Normalized' : 'Unnormalized' }}
                </button>
                <button @click="setNormalizationTime()" class="flex-container fontVerdana" style="cursor: pointer; margin-top: 0.4vw; font-size: 1.0vw; text-align: center; color: #0f0; background-color: #040; border: 0.24vw solid #0c0; height: 8vw; width: 20vw; justify-content: center; align-items: center">
                    Change normalization time.<br>
                    Any tick that takes longer than this time will be automatically converted to offline time.<br>
                    Currently: {{ formatTime(player.gameProgress.dilatedTime.normalizeTime, 1) }}
                </button>
            </div>
            <div class="flex-container" style="flex-direction: row;">
                <button @click="player.gameProgress.dilatedTime.paused = !player.gameProgress.dilatedTime.paused" class="flex-container fontVerdana" style="cursor: pointer; margin-top: 0.4vw; font-size: 1.2vw; text-align: center; color: #0f0; background-color: #040; border: 0.24vw solid #0c0; height: 8vw; width: 20vw; justify-content: center; align-items: center">
                    Pause time.<br>
                    Currently: {{ player.gameProgress.dilatedTime.paused ? 'Paused' : 'Running' }}
                </button>
                <!-- <button class="flex-container fontVerdana" style="cursor: pointer; margin-top: 0.4vw; font-size: 1.2vw; text-align: center; color: #0f0; background-color: #040; border: 0.24vw solid #0c0; height: 8vw; width: 20vw; justify-content: center; align-items: center">
                    Pause time.<br>
                    Currently: {{ player.gameProgress.dilatedTime.paused ? 'Paused' : 'Running' }}
                </button> -->
            </div>
        </div>
    </div>
</template>
