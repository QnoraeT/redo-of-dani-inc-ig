<script setup lang="ts">
import { format, formatTime } from './format'
import { player, tmp, gameVars, NEXT_UNLOCKS } from './main'
import GameTabs from './components/MainTabs/MainTabs.vue'
import Game_Main from './components/Game/Game_Progress/Game_Main/Game_Main.vue'
import Game_Options from './components/Game/Game_Options/Game_Options.vue'
import Game_Stats from './components/Game/Game_Stats/Game_Stats.vue';
import Game_Achievements from './components/Game/Game_Achievements/Game_Achievements.vue'
import Game_Kuaraniai from './components/Game/Game_Progress/Game_Kuaraniai/Game_Kuaraniai.vue'
import Game_Colosseum from './components/Game/Game_Progress/Game_Colosseum/Game_Colosseum.vue'
import Game_Taxation from './components/Game/Game_Progress/Game_Taxation/Game_Taxation.vue'
import { popupList } from './popups'
import { colorChange, gRC } from './calc'
import { getSCSLAttribute } from './softcapScaling'
import Decimal from 'break_eternity.js'
import { COL_CHALLENGES } from './components/Game/Game_Progress/Game_Colosseum/Game_Colosseum'
</script>

<template>
    <div>
        <canvas ref="canvas" id="canvas" style="height: 100vh; width: 100vw; position: absolute; top: 0vw; left: 0vw; z-index: -2;"></canvas>
        <div class="flex-container" style="background-color: #ffffff20;" v-if="tmp.gameIsRunning">
            <div style="flex-grow: 1; flex-basis: 0; text-align: left; text-shadow: #ffffff 0vw 0vw 0.3vw;" class="bigText whiteText grayShadow fontVerdana"> {{format(player.gameProgress.main.points)}} Points</div>
            <div style="flex-grow: 1; flex-basis: 0; text-align: center; text-shadow: #ffff00 0vw 0vw 0.18vw;" class="mediumBigText yellowText fontVerdana">FPS: {{gameVars.displayedFPS}}</div>
            <div style="flex-grow: 1; flex-basis: 0; text-align: right; text-shadow: #ffffff 0vw 0vw 0.3vw;" class="bigText whiteText grayShadow fontVerdana">{{format(tmp.main.pps, 1)}}/s </div>
        </div>
            <div class="flex-container" style="background-color: #ffffff20;" v-if="!tmp.gameIsRunning">
            <div style="flex-grow: 1; flex-basis: 0; text-align: left; text-shadow: #ffffff 0vw 0vw 0.3vw;" class="bigText whiteText grayShadow fontVerdana">Loading...</div>
        </div>
        <div class="popup-container">
            <div>
                <div v-for="item in popupList" class="popup fontVerdana" style="display: flex; flex-direction: column; justify-content: space-evenly; align-items: center; align-content: center"
                    :key="item.id" v-on:click="() => {item.life = 0.2}" :style="{ 'background-color': item.color, 'opacity': item.opacity, color: colorChange(item.color, 0.5, 1.0) }">
                    <span style="font-size: 0.85vw; font-weight: bold; text-align: center; margin-bottom: 0.24vw">{{item.title}}</span>
                    <span style="font-size: 0.7vw; text-align: center" v-html="item.message"></span>
                </div>
            </div>
        </div>
        <div class="flex-container fontVerdana" style="flex-direction: column; justify-content: center; margin-top: 0.75vw; margin-bottom: 0.75vw;">
            <span v-if="Decimal.gte(player.gameProgress.main.totals[3]!, getSCSLAttribute('points', false)[0].start)" style="text-align: center; font-size: 0.8vw; color:#f44">
                Your points past {{format(getSCSLAttribute('points', false)[0].start)}} is taxed by {{getSCSLAttribute('points', false)[0].displayedEffect}}!
            </span>
            <span v-if="player.gameProgress.col.inAChallenge" style="text-align: center; font-size: 1.6vw;" :style="{ color: player.gameProgress.col.completedAll ? '#0080FF' : '#FF4000' }">
                You have <b>{{formatTime(player.gameProgress.col.time, 3)}}</b> left within these challenges:
            </span>
            <div v-for="(item, index) in player.gameProgress.inChallenge" :key='item.id' style="text-align: center;" :style="{ color: gRC(2 * COL_CHALLENGES[index].progress.toNumber() + (COL_CHALLENGES[index].canComplete ? 1.5 : 0.0), 1.0, 1.0) }">
                <span v-if="player.gameProgress.inChallenge[index].overall" class="fontVerdana">
                    {{item.name + (Decimal.gt(player.gameProgress.inChallenge[index].depths, 1) ? ` x${format(player.gameProgress.inChallenge[index].depths)}` : '')}}{{player.gameProgress.inChallenge[index].overall ? `: ${COL_CHALLENGES[index].progDisplay}` : ''}}
                </span>
            </div>
        </div>
        <div class="flex-container" style="flex-direction: column; align-items: center; margin-top: 0.5vw; margin-bottom: 0.5vw;">
            <div v-for="(item, index) in NEXT_UNLOCKS" :key='index' :style="{ color: item.color }">
                <span v-if="item.shown && !item.done" style="font-size: 1.2vw; text-align: center;" class="fontVerdana">
                    You must reach <span style="font-size: 1.6vw;"><b>{{item.dispPart1}}</b></span> {{item.dispPart2}}
                </span>
            </div>
        </div>
        <GameTabs />
        <Game_Main />
        <Game_Options />
        <Game_Stats />
        <Game_Achievements />
        <Game_Kuaraniai />
        <Game_Colosseum />
        <Game_Taxation />
    </div>
</template>

