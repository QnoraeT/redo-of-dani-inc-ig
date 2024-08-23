<script setup lang="ts">
import Decimal from 'break_eternity.js'
import { tab } from '@/main'
import { tmp, player, NEXT_UNLOCKS, reset } from '@/main'
import { format, formatTime } from '@/format'
import { getSCSLAttribute } from '@/softcapScaling'
import { MAIN_UPGS, buyGenUPG } from './Game_Main'
import { getKuaUpgrade } from '../Game_Kuaraniai/Game_Kuaraniai'
</script>
<template>
    <div id="generators" v-if="tab.currentTab === 0">
        <div class="flex-container" style="flex-direction: column; justify-content: center; margin-top: 1vw; margin-bottom: 1vw;">
            <span v-if="Decimal.gte(player.gameProgress.main.points, getSCSLAttribute('points', false)[0].start)" style="text-align: center; font-size: 1.2vw; color:#f44">
                Your points past {{format(getSCSLAttribute('points', false)[0].start)}} is taxed by {{getSCSLAttribute('points', false)[0].displayedEffect}}!
            </span>
            <!-- <span v-if="player.col.inAChallenge" style="text-align: center; font-size: 1.6vw;" :style="{ color: player.col.completedAll ? '#0080FF' : '#FF4000' }">
                You have <b>{{formatTime(player.col.time, 3)}}</b> left within these challenges:
            </span>
            <div v-for="(item, index) in player.inChallenge" style="text-align: center;" :style="{ color: gRC(2 * COL_CHALLENGES[index].progress.toNumber() + (COL_CHALLENGES[index].canComplete ? 1.5 : 0.0), 1.0, 1.0) }">
                <span v-if="player.inChallenge[index].overall">
                    {{item.name + (player.inChallenge[index].depth.gt(1) ? ` x${format(player.inChallenge[index].depth)}` : '')}}{{player.inChallenge[index].overall ? `: ${COL_CHALLENGES[index].progDisplay}` : ''}}
                </span>
            </div> -->
        </div>
        <div class="flex-container" style="flex-direction: row; justify-content: center; margin-top: 1vw; margin-bottom: 1vw;">
            <div v-for="item in NEXT_UNLOCKS" :key='item.id' style="text-align: center;" :style="{ color: item.color }">
                <span v-if="item.shown && !item.done" style="font-size: 1.6vw;" class="fontVerdana">
                    You must reach <span style="font-size: 2vw;"><b>{{item.dispPart1}}</b></span> {{item.dispPart2}}
                </span>
            </div>
        </div>
        <div class="flex-container" style="margin-left: auto; margin-right: auto; flex-direction: row; flex-wrap: wrap; justify-content: center; margin-top: 1vw; margin-bottom: 1vw; width: 50vw; align-content: center;">
            <div v-for="(item, index) in MAIN_UPGS" :key='item.id'>
                <div class="flex-container" style="flex-direction: column; margin: 0.2vw;" v-if="tmp.main.upgrades[index].active && item.shown">
                    <button style="text-align: center; font-size: 1.0667vw" 
                    :class="{ nope: !tmp.main.upgrades[index].canBuy, ok: tmp.main.upgrades[index].canBuy }"
                    class="whiteText mediumButton fontVerdana generatorButton" @click="buyGenUPG(index)">
                        <h3 style="margin-top: 0.5vw; font-size: 1.25vw">Upgrade {{index + 1}}: {{format(player.gameProgress.main.upgrades[index].bought)}}{{Decimal.gt(tmp.main.upgrades[index].freeExtra, 0) ? ` (+${format(tmp.main.upgrades[index].freeExtra)})`:""}}</h3>
                        {{MAIN_UPGS[index].display}}
                        <br><span :style="{ color: tmp.main.upgrades[index].effectTextColor }">{{MAIN_UPGS[index].totalDisp}}</span>
                        <br><span :style="{ color: tmp.main.upgrades[index].costTextColor }">Cost: {{format(tmp.main.upgrades[index].cost)}} points</span>
                    </button>
    
                    <button style="text-align: center; font-size: 1.0667vw" 
                    :class="{ nopeFill: !player.gameProgress.main.upgrades[index].auto, okFill: player.gameProgress.main.upgrades[index].auto }"
                    class="whiteText thinMediumButton fontVerdana genAutoButton" v-if="item.autoUnlocked" @click="player.gameProgress.main.upgrades[index].auto = !player.gameProgress.main.upgrades[index].auto">
                        <b>Upgrade {{index + 1}} Autobuyer: {{player.gameProgress.main.upgrades[index].auto?"On":"Off"}}</b>
                    </button>
                </div>
            </div>
        </div>
        <table style="margin-top: 0.96vw; margin-left: auto; margin-right: auto;">
            <tr>
                <td> 
                    <div class="flex-container" style="flex-direction: column;">
                        <button style="text-align: center; font-size: 1.0667vw" 
                        :class="{ nope: !tmp.main.prai.canDo, ok: tmp.main.prai.canDo }"
                        class="whiteText largeButton fontVerdana generatorButton" id="prai" @click="reset('prai')">
                        <h3 style="font-size: 1.25vw">PRai: {{format(player.gameProgress.main.prai.amount)}}</h3>
                            {{`Reset your progress to gain ${Decimal.gte(player.gameProgress.main.pr2.amount, 1) ? format(tmp.main.prai.pending) + " " : ""}PRai.`}}
                            <br>{{
                                tmp.main.prai.canDo
                                    ? tmp.main.prai.pending.lt(1e6) && Decimal.gte(player.gameProgress.main.pr2.amount, 1)
                                        ? `Next in ${format(tmp.main.prai.next)} points. (${format(Decimal.div(tmp.main.prai.pending, player.gameProgress.main.prai.timeInPRai), 2)}/s)`
                                        : `(${format(Decimal.div(tmp.main.prai.pending, player.gameProgress.main.prai.timeInPRai), 2)}/s)`
                                    : `You can PRai reset in ${formatTime(tmp.main.prai.next)}`
                            }}
                            <br>You have {{format(player.gameProgress.main.prai.amount)}} PRai, which boosts your points by {{format(tmp.main.prai.effect, 2)}}x.
                            <br>{{tmp.main.prai.canDo ? `Resetting now, PRai will boost your points by ${format(tmp.main.prai.nextEffect, 2)}x` : ""}}
                        </button>

                        <button style="text-align: center; width: 24vw; height: 4vw; font-size: 1.0667vw" 
                        :class="{ nopeFill: !player.gameProgress.main.prai.auto, okFill: player.gameProgress.main.prai.auto }"
                        class="whiteText thinMediumButton fontVerdana genAutoButton" id="autoPRai" v-if="getKuaUpgrade('p', 0)" @click="player.gameProgress.main.prai.auto = !player.gameProgress.main.prai.auto">
                            <b>PRai Generator: {{player.gameProgress.main.prai.auto?"On":"Off"}}</b>
                        </button>
                    </div>
                </td>
                <td>
                    <div class="flex-container" style="flex-direction: column;">
                        <button style="text-align: center; font-size: 1.0667vw" 
                        :class="{ nope: !tmp.main.pr2.canDo, ok: tmp.main.pr2.canDo }"
                        class="whiteText largeButton fontVerdana generatorButton" id="pr2" v-if="Decimal.gte(player.gameProgress.main.prai.best.ever, 9.5)" @click="reset('pr2')">
                            <h3 style="font-size: 1.25vw">PR2: {{format(player.gameProgress.main.pr2.amount)}}</h3>
                            Reset all of your previous progress to for a PR2 reset.
                            <br><span :style="{ color: tmp.main.pr2.costTextColor }">{{
                                tmp.main.pr2.canDo
                                    ? false
                                        ? `You can PR2 reset ${format(tmp.main.pr2.target.sub(player.gameProgress.main.pr2.amount).floor())} times!`
                                        : `You can PR2 reset! (${format(player.gameProgress.main.prai.amount)} / ${format(tmp.main.pr2.cost)} PRai)`
                                    : `You need ${format(player.gameProgress.main.prai.amount)} / ${format(tmp.main.pr2.cost)} PRai to PR2 reset.`
                            }}</span>
                            <br>You have {{format(player.gameProgress.main.pr2.amount)}} PR2, which boosts your PRai and points by {{format(tmp.main.pr2.effect, 2)}}x.
                            <br>{{tmp.main.pr2.textEffect.txt===""?"":`At ${format(tmp.main.pr2.textEffect.when)} PR2 reset${tmp.main.pr2.textEffect.when.eq(1)?"":"s"}, ${tmp.main.pr2.textEffect.txt}`}}
                        </button>
    
                        <button style="text-align: center; width: 24vw; height: 4vw; font-size: 1.0667vw" 
                        :class="{ nopeFill: !player.gameProgress.main.pr2.auto, okFill: player.gameProgress.main.pr2.auto }"
                        class="whiteText thinMediumButton fontVerdana genAutoButton" id="autoPR2" v-if="false" @click="player.gameProgress.main.pr2.auto = !player.gameProgress.main.pr2.auto">
                            <b>PR2 Autobuyer: {{player.gameProgress.main.pr2.auto?"On":"Off"}}</b>
                        </button>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</template>
