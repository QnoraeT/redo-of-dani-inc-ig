<script setup lang="ts">
import { format } from './format'
import { player, tmp, gameVars } from './main'
import GameTabs from './components/MainTabs/MainTabs.vue'
import Game_Main from './components/Game/Game_Progress/Game_Main/Game_Main.vue'
import Game_Options from './components/Game/Game_Options/Game_Options.vue'
import Game_Stats from './components/Game/Game_Stats/Game_Stats.vue';
import Game_Achievements from './components/Game/Game_Achievements/Game_Achievements.vue'
import Game_Kuaraniai from './components/Game/Game_Progress/Game_Kuaraniai/Game_Kuaraniai.vue'
import Game_Colosseum from './components/Game/Game_Progress/Game_Colosseum/Game_Colosseum.vue'
import Game_Taxation from './components/Game/Game_Progress/Game_Taxation/Game_Taxation.vue'
import { popupList } from './popups'
import { colorChange } from './calc'
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
    <div>
      <div class="popup-container">
        <div>
          <div v-for="item in popupList" class="popup fontVerdana" style="display: flex; flex-direction: column; justify-content: space-evenly; align-items: center; align-content: center"
            :key="item.id" v-on:click="() => {item.life = 0.2}" :style="{ 'background-color': item.color, 'opacity': item.opacity, color: colorChange(item.color, 0.5, 1.0) }">
            <span style="font-size: 0.5vw; font-weight: bold; text-align: center">{{item.title}}</span>
            <span style="font-size: 0.75vw; text-align: center" v-html="item.message"></span>
          </div>
        </div>
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

