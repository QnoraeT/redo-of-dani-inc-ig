<script setup lang="ts">
import { format, formatTime } from "./format";
import { player, game, tmp, gameVars, NEXT_UNLOCKS } from "./main";
import GameTabs from "./components/MainTabs/MainTabs.vue";
import Game_Main from "./components/Game/Game_Progress/Game_Main/Game_Main.vue";
import Game_Options from "./components/Game/Game_Options/Game_Options.vue";
import Game_Stats from "./components/Game/Game_Stats/Game_Stats.vue";
import Game_Achievements from "./components/Game/Game_Achievements/Game_Achievements.vue";
import Game_Kuaraniai from "./components/Game/Game_Progress/Game_Kuaraniai/Game_Kuaraniai.vue";
import Game_Colosseum from "./components/Game/Game_Progress/Game_Colosseum/Game_Colosseum.vue";
import Game_Layer4 from "./components/Game/Game_Progress/Game_Layer4/Game_Layer4.vue";
import { popupList } from "./popups";
import { colorChange, gRC } from "./calc";
import { getSCSLAttribute } from "./softcapScaling";
import Decimal from "break_eternity.js";
import Game_Stored_Time from "./components/Game/Game_Progress/Game_Stored_Time/Game_Stored_Time.vue";
import { COL_CHALLENGES } from "./components/Game/Game_Progress/Game_Colosseum/Game_ColChallenges/Game_ColChalData";
</script>
<template>
    <div>
        <canvas ref="canvas" id="canvas" style="height: 100vh; width: 100vw; position: absolute; top: 0vw; left: 0vw; z-index: -2;"></canvas>
        <div id="offlineTime" v-if="tmp.offlineTime.active">
            <div class="flex-vertical" style="font-size: 12px">
                <span class="whiteText font0">{{gameVars.offlineTimeFailed ? "Executing offline time failed!" : "You are in offline time."}}</span>
                <span class="whiteText font0">Ticks: {{ format(tmp.offlineTime.tickRemaining) }} / {{format(tmp.offlineTime.tickMax)}} ({{formatTime(tmp.offlineTime.tickRemaining * tmp.offlineTime.tickLength)}} / {{formatTime(tmp.offlineTime.tickMax * tmp.offlineTime.tickLength)}})</span>
                <div id="offlineTimeProgress" style="height: 20px; width: 800px; position: relative; margin: 2px">
                    <div id="offlineTimeProgressBarBase" style="background-color: #808080; position: absolute; top: 0; left: 0; height: 100%; width: 100%;"></div>
                    <div id="offlineTimeProgressBar" :style="{
                        width: `${100 * (1 - (tmp.offlineTime.tickRemaining / tmp.offlineTime.tickMax))}%`
                    }" style="background-color: #ffffff; position: absolute; top: 0; left: 0; height: 100%"></div>
                </div>
                <br>
                <span style="color: #00ff00" class="font0">You have {{ formatTime(Decimal.div(player.offlineTime, 1000)) }} offline time in your reserve.</span>
                <span v-if="player.prog.dilatedTime.normalized && !player.prog.dilatedTime.paused" style="color: #00ff00" class="font0">You have set your time to be normalized, therefore all ticks will only be a maximum of 50ms. The leftover time will spill over into your offline time reserve.</span>
                <span v-if="player.prog.dilatedTime.paused" style="color: #00ff00" class="font0">You have paused the game. All the time will be sent into your offline time reserve.</span>
                <br>
                <span class="whiteText font0">You have {{ format(player.prog.main.points) }} points.</span>
                <span class="whiteText font0">You have {{ format(player.prog.main.prai.amount) }} PRai. (+{{ format(tmp.main.prai.pending) }})</span>
                <span v-if="Decimal.gte(player.prog.main.pr2.amount, 1)" class="whiteText font0">You have {{ format(player.prog.main.pr2.amount) }} PR2.</span>
                <span v-if="Decimal.gte(player.prog.main.pr2.amount, 10)" style="color: #c080ff" class="font0">You have {{ format(player.prog.kua.amount, 3) }} Kuaraniai. (+{{ format(tmp.kua.pending, 3) }})</span>
                <span v-if="Decimal.gte(player.prog.main.pr2.amount, 10)" style="color: #c080ff" class="font0">You have {{ format(player.prog.kua.kshards.amount, 3) }} Kuaraniai Shards. (+{{ format(tmp.kua.shardGen, 3) }}/s)</span>
                <span v-if="Decimal.gte(player.prog.main.pr2.amount, 10)" style="color: #c080ff" class="font0">You have {{ format(player.prog.kua.kpower.amount, 3) }} Kuaraniai Power. (+{{ format(tmp.kua.powGen, 3) }}/s)</span>
                <span v-if="Decimal.gte(player.prog.kua.amount, 100)" style="color: #ff4000" class="font0">You have {{ format(player.prog.col.power) }} Colosseum Power. (+{{ format(tmp.col.truePowGen) }}/s), ({{ formatTime(player.prog.col.maxTime) }})</span>
                <span v-if="Decimal.gte(player.prog.kua.amount, 1e6)" style="color: #80ff80" class="font0">You have {{ format(player.prog.kua.blessings.amount) }} Kuaraniai Blessings. (+{{ format(tmp.kua.blessings.perSec) }}/s)</span>
                <span v-if="Decimal.gte(player.prog.kua.proofs.amount, 1)" style="color: #00ffff" class="font0">You have {{ format(player.prog.kua.proofs.amount) }} Kuaraniai Proofs. (×{{ format(tmp.kua.proofs.expPerSec, 3) }}/s)</span>
                <span v-if="Decimal.gte(player.prog.kua.proofs.strange.amount, 1)" style="color: #ffff00" class="font0">You have {{ format(player.prog.kua.proofs.strange.amount) }} Strange KProofs. (×{{ format(tmp.kua.proofs.skpPerSecCur, 3) }})</span>
            </div>
        </div>
        <div class="popup-container">
            <div>
                <div v-for="item in popupList" class="popup font0" style="display: flex; flex-direction: column; justify-content: space-evenly; align-items: center; align-content: center; " :key="item.id" v-on:click=" () => { item.life = 0.2; } " :style="{ 'background-color': item.color, opacity: item.opacity, color: colorChange(item.color, 0.5, 1.0) }" >
                    <span style="font-size: 0.85vw; font-weight: bold; text-align: center; margin-bottom: 0.24vw;">{{ item.title }}</span>
                    <span style="font-size: 0.7vw; text-align: center" v-html="item.message"></span>
                </div>
            </div>
        </div>
        <div v-if="!tmp.offlineTime.active">
            <div class="flex-container" style="background-color: #ffffff20" v-if="tmp.gameIsRunning && !tmp.offlineTime.active">
                <div style="flex-grow: 1; flex-basis: 0; text-align: left; text-shadow: #ffffff 0vw 0vw 0.3vw;" class="bigText whiteText grayShadow font0">
                    {{ format(player.prog.main.points) }} Points
                </div>
                <div style="flex-grow: 0.5; flex-basis: 0; text-align: center; text-shadow: #ffff00 0vw 0vw 0.18vw;" class="mediumBigText yellowText font0">
                    FPS: {{ gameVars.displayedFPS }}
                </div>
                <div style="flex-grow: 1; flex-basis: 0; text-align: right; text-shadow: #ffffff 0vw 0vw 0.3vw;" class="bigText whiteText grayShadow font0">
                    {{ `${tmp.main.ppsNullified ? '~' : ''}${format(tmp.main.pps, 1)}` }}/s
                </div>
            </div>
            <div class="flex-container" v-if="tmp.gameIsRunning">
                <div style="font-size: 1.0vw" class="whiteText grayShadow font0">
                    Time since last save: {{ formatTime(gameVars.sessionTime - gameVars.lastSave) }}/{{ formatTime(game.autoSaveInterval) }}
                </div>
            </div>

            <div class="flex-container" style="background-color: #ffffff20" v-if="!tmp.gameIsRunning">
                <div style="flex-grow: 1; flex-basis: 0; text-align: left; text-shadow: #ffffff 0vw 0vw 0.3vw;" class="bigText whiteText grayShadow font0">
                    Loading...
                </div>
            </div>
            <div class="flex-container font0" style="flex-direction: column; justify-content: center; margin-top: 0.75vw; margin-bottom: 0.75vw;">
                <span v-if="Decimal.gte(player.prog.main.bestInLayer4, getSCSLAttribute('points', false)[0].start)" style="text-align: center; font-size: 0.8vw; color: #f44">
                    Your points past {{ format(getSCSLAttribute("points", false)[0].start) }} is taxed
                    by {{ getSCSLAttribute("points", false)[0].displayedEffect }}!
                </span>
                <span v-if="player.prog.col.inAChallenge" style="text-align: center; font-size: 1.6vw" :style="{ color: player.prog.col.completedAll ? '#0080FF' : '#FF4000' }">
                    You have <b>{{ formatTime(player.prog.col.time, 3) }}</b> left within these
                    challenges:
                </span>
                <div v-if="player.prog.col.inAChallenge" style="height: 1.0vw; width: 40vw; position: relative; margin-left: auto; margin-right: auto; margin-bottom: 1vw;">
                    <!-- does nothing, is actually the base of the bar -->
                    <div style="position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
                    :style="{
                        backgroundColor: player.prog.col.completedAll ? '#001452' : '#521400'
                    }"></div>
                    <div
                        :style="{
                            backgroundColor: player.prog.col.completedAll ? '#0080FF' : '#FF4000',
                            width: `${
                                100 * Decimal.sub(1, Decimal.div(player.prog.col.time, player.prog.col.maxTime)).toNumber()
                            }%`
                        }"
                        style="position: absolute; top: 0; left: 0; height: 100%">
                    </div>
                </div>
                <div
                    v-for="(item, index) in player.prog.inChallenge"
                    :key="index"
                    class="flex-container"
                    style="align-items: center; flex-direction: column; text-align: center"
                    :style="{
                        color: gRC(
                            2 * COL_CHALLENGES[index].progress.value.toNumber() +
                                (COL_CHALLENGES[index].canComplete.value ? 1.5 : 0.0),
                            1.0,
                            1.0
                        )
                    }"
                >
                    <span v-if="item.overall" class="font0" style="font-size: 1.07vw; margin: 0vw">
                        {{
                            item.name +
                            (Decimal.gt(item.depths, 1)
                                ? ` ×${format(item.depths)}`
                                : "")
                        }}{{
                            item.overall
                                ? `: ${COL_CHALLENGES[index].progDisplay.value}`
                                : ""
                        }}
                    </span>
                    <div v-if="item.overall" style="height: 0.6vw; width: 25vw; position: relative">
                        <!-- does nothing, is actually the base of the bar -->
                        <div style="position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
                        :style="{
                                backgroundColor: gRC(
                                    2 * COL_CHALLENGES[index].progress.value.toNumber() +
                                        (COL_CHALLENGES[index].canComplete.value ? 1.5 : 0.0),
                                    0.35,
                                    1.0
                                )
                                }"
                        ></div>
                        <div
                            :style="{
                                backgroundColor: gRC(
                                    2 * COL_CHALLENGES[index].progress.value.toNumber() +
                                        (COL_CHALLENGES[index].canComplete.value ? 1.5 : 0.0),
                                    1.0,
                                    1.0
                                ),
                                width: `${
                                    100 * COL_CHALLENGES[index].progress.value.toNumber()
                                }%`
                            }"
                            style="position: absolute; top: 0; left: 0; height: 100%"
                        ></div>
                    </div>
                </div>
            </div>
            <div class="flex-container" style="flex-direction: column; align-items: center; margin-top: 0.5vw; margin-bottom: 0.5vw;">
                <div v-for="(item, index) in NEXT_UNLOCKS" :key="index" :style="{ color: item.color.value }">
                    <span v-if="item.shown.value && !item.done.value" style="font-size: 1.2vw; text-align: center" class="font0">
                        You must reach <span style="font-size: 1.6vw" ><b>{{ item.dispPart1 }}</b></span> {{ item.dispPart2 }}
                    </span>
                </div>
            </div>
            <GameTabs />
            <Game_Stored_Time />
            <Game_Main />
            <Game_Options />
            <Game_Stats />
            <Game_Achievements />
            <Game_Kuaraniai />
            <Game_Colosseum />
            <Game_Layer4 />
        </div>
    </div>
</template>
