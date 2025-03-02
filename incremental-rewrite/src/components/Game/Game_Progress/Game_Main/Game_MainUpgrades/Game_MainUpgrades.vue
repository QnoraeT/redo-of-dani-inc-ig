<script setup lang="ts">
import { format, formatTime } from '@/format';
import { player, shiftDown, tmp } from '@/main';
import { getPR2Cost, PR2_EFF } from '../Game_Main';
import Decimal from 'break_eternity.js';
import { getKuaUpgrade } from '../../Game_Kuaraniai/Game_KuaUpgrades/Game_KuaUpgrades';
import { resetStage } from '@/resets';
import { buyGenUPG, MAIN_UPG_DATA } from './Game_MainUpgrades';


</script>
<template>
    <div class="flex-container" style="margin-left: auto; margin-right: auto; justify-content: center;">
        <!-- <span class="whiteText fontVerdana" style="text-align: center; font-size: 0.9vw" v-if="inChallenge('dc') || Decimal.gte(timesCompleted('dc'), 11)">Every bought upgrade boosts their multiplier by {{ format(inChallenge('dc') ? COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[0] : getColChalRewEffects("dc")[3], 2) }}×!</span> -->
    </div>
    <div class="flex-container" style="margin-left: auto; margin-right: auto; flex-direction: row; flex-wrap: wrap; justify-content: center; margin-top: 0.5vw; margin-bottom: 0.5vw; width: 80vw; align-content: center;">
        <div v-for="(item, index) in MAIN_UPG_DATA" :key='index'>
            <div class="flex-container" style="flex-direction: column; margin: 0.2vw;" v-if="tmp.main.upgrades[index].active && tmp.main.upgrades[index].shown">
                <button
                :class="{ nope: !tmp.main.upgrades[index].canBuy, ok: tmp.main.upgrades[index].canBuy }"
                class="mediumButton generatorButton" @click="buyGenUPG(index)">
                    <div style="text-align: center; font-size: 0.7vw" class="whiteText fontVerdana tooltip">
                        <span v-if="MAIN_UPG_DATA[index].tooltipText.value !== ''" class="tooltiptext" v-html="MAIN_UPG_DATA[index].tooltipText.value"></span>
                        <h3 style="margin-top: 0.35vw; font-size: 0.9vw">Upgrade {{index + 1}}: {{format(player.gameProgress.upgrades[index].bought)}}<span style="font-size: 0.55vw" v-if="Decimal.gt(MAIN_UPG_DATA[index].freeExtra.value, 0)">&nbsp;(+{{format(MAIN_UPG_DATA[index].freeExtra.value)}})</span><!-- <span style="font-size: 0.55vw; color: #fa8" v-if="Decimal.gt(player.gameProgress.upgrades[index].accumulated, 0) && (inChallenge('dc') || Decimal.gte(timesCompleted('dc'), 11))">&nbsp;(+{{format(player.gameProgress.upgrades[index].accumulated)}})</span> --></h3>
                        <span>{{tmp.main.upgrades[index].display}}</span>
                        <br>
                        <!-- <span>Multiplier: {{ format(tmp.main.upgrades[index].multiplier, 2) }}×</span> -->
                        <br><span>{{tmp.main.upgrades[index].totalDisp}}</span>
                        <br><span>Cost: {{format(MAIN_UPG_DATA[index].cost(player.gameProgress.upgrades[index].bought))}} points</span>
                    </div>
                </button>

                <button style="text-align: center; font-size: 0.7vw" 
                :class="{ nopeFill: !player.gameProgress.upgrades[index].auto, okFill: player.gameProgress.upgrades[index].auto }"
                class="whiteText thinMediumButton fontVerdana genAutoButton" v-if="tmp.main.upgrades[index].autoUnlocked" @click="player.gameProgress.upgrades[index].auto = !player.gameProgress.upgrades[index].auto">
                    <b>Upgrade {{index + 1}} Autobuyer: {{player.gameProgress.upgrades[index].auto?"On":"Off"}}</b>
                </button>
            </div>
        </div>
    </div>
    <div class="flex-container" style="justify-content: center; margin-top: 0.96vw; margin-left: auto; margin-right: auto;">
        <div class="flex-container" style="flex-direction: column;">
            <button style="text-align: center; font-size: 0.65vw" 
            :class="{ nope: !tmp.main.prai.canDo, ok: tmp.main.prai.canDo }"
            class="whiteText largeButton fontVerdana generatorButton" id="prai" @click="resetStage('prai')">
            <h3 style="font-size: 1vw">PRai: {{format(player.gameProgress.prai.amount)}}</h3>
                Reset your progress to gain {{`${Decimal.gte(player.gameProgress.pr2.amount, 1) ? format(tmp.main.prai.pending) + " " : ""}`}}PRai.<br>
                <span v-if="tmp.main.prai.pending.lt(100)">Gain at least {{ format(tmp.main.prai.req) }} points to do a PRai reset.<br></span>
                {{
                    tmp.main.prai.canDo
                        ? tmp.main.prai.pending.lt(100) && Decimal.gte(player.gameProgress.pr2.amount, 1)
                            ? `Next in ${format(tmp.main.prai.next)} points. (${format(Decimal.div(tmp.main.prai.pending, player.gameProgress.prai.timeInPRai), 2)}/s)`
                            : `(${format(Decimal.div(tmp.main.prai.pending, player.gameProgress.prai.timeInPRai), 2)}/s)`
                        : `You can PRai reset in ${formatTime(tmp.main.prai.next)}`
                }}<br>
                <br>You have {{format(player.gameProgress.prai.amount)}} PRai, which boosts your points by {{format(tmp.main.prai.effect, 2)}}×.
                <br>{{tmp.main.prai.canDo ? `Resetting now will boost your points by ${format(Decimal.div(tmp.main.prai.nextEffect, tmp.main.prai.effect), 2)}×` : ""}}
            </button>

            <button style="text-align: center; width: 18vw; height: 3vw; font-size: 0.65vw" 
            :class="{ nopeFill: !player.gameProgress.prai.auto, okFill: player.gameProgress.prai.auto }"
            class="whiteText thinMediumButton fontVerdana genAutoButton" id="autoPRai" v-if="getKuaUpgrade('s', 1)" @click="player.gameProgress.prai.auto = !player.gameProgress.prai.auto">
                <b>PRai Generator: {{player.gameProgress.prai.auto?"On":"Off"}}</b>
            </button>
        </div>
        <div class="flex-container" style="flex-direction: column;">
            <button style="text-align: center; font-size: 0.65vw" 
            :class="{ nope: !tmp.main.pr2.canDo, ok: tmp.main.pr2.canDo }"
            class="whiteText largeButton fontVerdana generatorButton" id="pr2" v-if="player.gameProgress.unlocks.pr2" @click="resetStage('pr2')">
                <h3 style="font-size: 1vw">PR2: {{format(player.gameProgress.pr2.amount)}}</h3>
                Reset all of your previous progress to for a PR2 reset.
                <br><span>{{
                    shiftDown
                        ? `The next PR2 will require ${format(getPR2Cost(Decimal.add(player.gameProgress.pr2.amount, 1), false, false).div(getPR2Cost(player.gameProgress.pr2.amount, false, false)), 1)}× more PRai!`
                        : tmp.main.pr2.canDo
                            ? false
                                ? `You can PR2 reset ${format(tmp.main.pr2.target.sub(player.gameProgress.pr2.amount).floor())} times!`
                                : `You can PR2 reset! (${format(player.gameProgress.prai.amount)} / ${format(tmp.main.pr2.cost)} PRai)`
                            : `You need ${format(player.gameProgress.prai.amount)} / ${format(tmp.main.pr2.cost)} PRai to PR2 reset.`
                }}</span><br>
                <br>You have {{format(player.gameProgress.pr2.amount)}} PR2, which boosts your PRai and points by {{format(tmp.main.pr2.effect, 2)}}×.
                <br>{{tmp.main.pr2.textEffect.txt===""?"":`At ${format(tmp.main.pr2.textEffect.when)} PR2 reset${tmp.main.pr2.textEffect.when.eq(1)?"":"s"}, ${tmp.main.pr2.textEffect.txt}`}}
            </button>

            <button style="text-align: center; width: 18vw; height: 3vw; font-size: 0.65vw" 
            :class="{ nopeFill: !player.gameProgress.pr2.auto, okFill: player.gameProgress.pr2.auto }"
            class="whiteText thinMediumButton fontVerdana genAutoButton" id="autoPR2" v-if="false" @click="player.gameProgress.pr2.auto = !player.gameProgress.pr2.auto">
                <b>PR2 Autobuyer: {{player.gameProgress.pr2.auto?"On":"Off"}}</b>
            </button>
        </div>
    </div>
    <div class="flex-container" style="flex-direction: column-reverse; margin-top: 0.96vw; margin-left: auto; margin-right: auto; align-items: center;">
        <div v-for="(item, index) in PR2_EFF" :key="index">
            <div v-if="Decimal.gte(player.gameProgress.pr2.amount, item.when) && item.show">
                <div style="font-size: 0.5vw; text-align: center; border: 0.12vw solid #c0c0c0; height: 2.5vw; width: 20vw" 
                class="whiteText largeButton fontVerdana generatorButton">
                    <span style="font-size: 0.7vw">PR2: {{ format(item.when) }}</span><br>
                    {{ item.text }}
                </div>
            </div>
        </div>
    </div>
</template>