<script setup lang="ts">
import { format } from './format'
import { player, tmp, gameVars } from './main'
import GameTabs from './components/MainTabs/MainTabs.vue'
import Game_Main from './components/Game/Game_Progress/Game_Main/Game_Main.vue'
import Game_Options from './components/Game/Game_Options/Game_Options.vue'
import Game_Stats from './components/Game/Game_Stats/Game_Stats.vue';
import Game_Achievements from './components/Game/Game_Achievements/Game_Achievements.vue'
import Game_Kuaraniai from './components/Game/Game_Progress/Game_Kuaraniai/Game_Kuaraniai.vue'
import { popupList } from './popups'
</script>

<template>
  <div>
    <canvas ref="canvas" id="canvas" style="height: 100vh; width: 100vw; position: absolute; top: 0vw; left: 0vw; z-index: -2;"></canvas>
    <div class="flex-container" style="background-color: #ffffff20;">
      <div style="flex-grow: 1; flex-basis: 0; text-align: left; text-shadow: #ffffff 0vw 0vw 0.4vw;" class="bigText whiteText grayShadow fontVerdana"> {{format(player.gameProgress.main.points, 3)}}</div>
      <div style="flex-grow: 1; flex-basis: 0; text-align: center; text-shadow: #ffff00 0vw 0vw 0.24vw;" class="mediumBigText yellowText fontVerdana">FPS: {{gameVars.displayedFPS}}</div>
      <div style="flex-grow: 1; flex-basis: 0; text-align: right; text-shadow: #ffffff 0vw 0vw 0.4vw;" class="bigText whiteText grayShadow fontVerdana">{{format(tmp.main.pps, 3)}}/s </div>
    </div>
    <GameTabs />
    <Game_Main />
    <Game_Options />
    <Game_Stats />
    <Game_Achievements />
    <Game_Kuaraniai />
    <!-- taken from TMT :3 -->
    <div>
      <div class="popup-container">
        <transition-group name="fade">
          <div v-for="(item, index) in popupList" :key="item.id" style="background-color: #ffffff; width: 300px; min-height: 60px; color: #000000; display: block;">
            {{ index }} lmao
          </div>
          <!-- <div v-for="(item, index) in popupList" class="popup" style="color: #fff;" :class="popup.type"
            :key="item.id" v-on:click="() => {popupList.splice(index, 1)}" :style="{ 'background-color': item.color }">
            <h3>{{item.title}}</h3><br>
            <h2 v-html="item.message"></h2>
          </div> -->
        </transition-group>
      </div>
    </div>
  </div>
</template>

