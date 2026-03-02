<script setup lang="ts">
import { format, formatTime } from '@/format';
import { player, shiftDown, tmp } from '@/main';
import { getPR2Cost } from '../Game_Main';
import Decimal from 'break_eternity.js';
import { getKuaUpgrade } from '../../Game_Kuaraniai/Game_KuaUpgrades/Game_KuaUpgrades';
import { challengeDepth, getColChalRewEffects, inChallenge, timesCompleted } from '../../Game_Colosseum/Game_ColChallenges/Game_ColChalHandler';
import { resetStage } from '@/resets';
import { buyGenUPG, MAIN_UPG_DATA } from './Game_MainUpgrades';
import { COL_CHALLENGES } from '../../Game_Colosseum/Game_ColChallenges/Game_ColChalData';


</script>
<template>
    <div class="flex-vertical">
        <span class="whiteText font0" style="text-align: center; font-size: 0.9vw" >You can hold shift and click to buy max an upgrade.</span>
        <span class="whiteText font0" style="text-align: center; font-size: 0.9vw" v-if="inChallenge('dc') || Decimal.gte(timesCompleted('dc'), 11)">Every bought upgrade boosts their multiplier by {{ format(inChallenge('dc') ? COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[0] : getColChalRewEffects("dc")[3], 2) }}×!</span>
    </div>
    <div class="flex-container" style="margin-left: auto; margin-right: auto; flex-direction: row; flex-wrap: wrap; justify-content: center; margin-top: 0.5vw; margin-bottom: 0.5vw; width: 80vw; align-content: center;">
        <div v-for="(item, index) in MAIN_UPG_DATA" :key='index'>
            <div class="flex-container" style="flex-direction: column; margin: 0.2vw;" v-if="tmp.main.upgrades[index].active && tmp.main.upgrades[index].shown">
                <button style="text-align: center; font-size: 0.7vw" 
                :class="{ nope: !tmp.main.upgrades[index].canBuy, ok: tmp.main.upgrades[index].canBuy }"
                class="whiteText mediumButton font0 generatorButton" @click="buyGenUPG(index)">
                    <h3 style="margin-top: 0.35vw; font-size: 0.9vw">Upgrade {{index + 1}}: {{format(player.prog.main.upgrades[index].bought)}}<span style="font-size: 0.55vw" v-if="Decimal.neq(tmp.main.upgrades[index].effective.div(2).round(), Decimal.div(player.prog.main.upgrades[index].bought, 2).round())">&nbsp;(+{{format(Decimal.sub(tmp.main.upgrades[index].effective, player.prog.main.upgrades[index].bought))}})</span><span style="font-size: 0.55vw; color: #fa8" v-if="Decimal.gt(player.prog.main.upgrades[index].accumulated, 0) && (inChallenge('dc') || Decimal.gte(timesCompleted('dc'), 11))">&nbsp;(+{{format(player.prog.main.upgrades[index].accumulated)}})</span></h3>
                    <span v-if="!inChallenge('dc')">{{tmp.main.upgrades[index].display}}</span>
                    <br v-if="!inChallenge('dc') && Decimal.gte(timesCompleted('dc'), 11)">
                    <span v-if="inChallenge('dc') || Decimal.gte(timesCompleted('dc'), 11)">Multiplier: {{ format(tmp.main.upgrades[index].multiplier, 2) }}×</span>
                    <br><span :style="{ color: tmp.main.upgrades[index].effectTextColor }">{{tmp.main.upgrades[index].totalDisp}}</span>
                    <br><span :style="{ color: tmp.main.upgrades[index].costTextColor }">Cost: {{format(tmp.main.upgrades[index].cost)}} points</span>
                </button>

                <button style="text-align: center; font-size: 0.7vw" 
                :class="{ nopeFill: !player.prog.main.upgrades[index].auto, okFill: player.prog.main.upgrades[index].auto }"
                class="whiteText thinMediumButton font0 genAutoButton" v-if="tmp.main.upgrades[index].autoUnlocked" @click="player.prog.main.upgrades[index].auto = !player.prog.main.upgrades[index].auto">
                    <b>Upgrade {{index + 1}} Autobuyer: {{player.prog.main.upgrades[index].auto?"On":"Off"}}</b>
                </button>
            </div>
        </div>
    </div>
    <div class="flex-container" style="justify-content: center; margin-top: 0.96vw; margin-left: auto; margin-right: auto;">
        <div class="flex-container" style="flex-direction: column;">
            <button style="text-align: center; font-size: 0.65vw" 
            :class="{ nope: !tmp.main.prai.canDo, ok: tmp.main.prai.canDo }"
            class="whiteText largeButton font0 generatorButton" id="prai" @click="resetStage('prai')">
            <h3 style="font-size: 1vw">PRai: {{format(player.prog.main.prai.amount)}}</h3>
                Reset your progress to gain {{`${Decimal.gte(player.prog.main.pr2.amount, 1) ? format(tmp.main.prai.pending) + " " : ""}`}}PRai.<br>
                <span v-if="tmp.main.prai.pending.lt(100)">Gain at least {{ format(tmp.main.prai.req) }} points to do a PRai reset.<br></span>
                {{
                    tmp.main.prai.canDo
                        ? tmp.main.prai.pending.lt(100) && Decimal.gte(player.prog.main.pr2.amount, 1)
                            ? `Next in ${format(tmp.main.prai.next)} points. (${format(Decimal.div(tmp.main.prai.pending, player.prog.main.prai.timeInPRai), 2)}/s)`
                            : `(${format(Decimal.div(tmp.main.prai.pending, player.prog.main.prai.timeInPRai), 2)}/s)`
                        : `You can PRai reset in ${formatTime(tmp.main.prai.next)}`
                }}<br>
                <br>You have {{format(player.prog.main.prai.amount)}} PRai, which boosts your points by {{format(tmp.main.prai.effect, 2)}}×.
                <br>{{tmp.main.prai.canDo ? `Resetting now will boost your points by ${format(Decimal.div(tmp.main.prai.nextEffect, tmp.main.prai.effect), 2)}×` : ""}}
            </button>

            <button style="text-align: center; width: 18vw; height: 3vw; font-size: 0.65vw" 
            :class="{ nopeFill: !player.prog.main.prai.auto, okFill: player.prog.main.prai.auto }"
            class="whiteText thinMediumButton font0 genAutoButton" id="autoPRai" v-if="getKuaUpgrade('s', 1) || inChallenge('df')" @click="player.prog.main.prai.auto = !player.prog.main.prai.auto">
                <b>PRai Generator: {{player.prog.main.prai.auto?"On":"Off"}}</b>
            </button>
        </div>
        <div class="flex-container" style="flex-direction: column;">
            <button style="text-align: center; font-size: 0.65vw" 
            :class="{ nope: !tmp.main.pr2.canDo, ok: tmp.main.pr2.canDo }"
            class="whiteText largeButton font0 generatorButton" id="pr2" v-if="Decimal.gte(player.prog.main.prai.bestEver, 9.5)" @click="resetStage('pr2')">
                <h3 style="font-size: 1vw">PR2: {{format(player.prog.main.pr2.amount)}}</h3>
                Reset all of your previous progress to for a PR2 reset.
                <br><span :style="{ color: tmp.main.pr2.costTextColor }">{{
                    shiftDown
                        ? `The next PR2 will require ${format(getPR2Cost(Decimal.add(player.prog.main.pr2.amount, 1), false, false).div(getPR2Cost(player.prog.main.pr2.amount, false, false)), 1)}× more PRai!`
                        : tmp.main.pr2.canDo
                            ? false
                                ? `You can PR2 reset ${format(tmp.main.pr2.target.sub(player.prog.main.pr2.amount).floor())} times!`
                                : `You can PR2 reset! (${format(player.prog.main.prai.amount)} / ${format(tmp.main.pr2.cost)} PRai)`
                            : `You need ${format(player.prog.main.prai.amount)} / ${format(tmp.main.pr2.cost)} PRai to PR2 reset.`
                }}</span><br>
                <br>You have {{format(player.prog.main.pr2.amount)}} PR2, which boosts your PRai and points by {{format(tmp.main.pr2.effect, 2)}}{{shiftDown ? ' → ' + format(tmp.main.pr2.nextEffect, 2) : ''}}×.
                <br>{{tmp.main.pr2.textEffect.txt===""?"":`At ${format(tmp.main.pr2.textEffect.when)} PR2 reset${tmp.main.pr2.textEffect.when.eq(1)?"":"s"}, ${tmp.main.pr2.textEffect.txt}`}}
            </button>

            <button style="text-align: center; width: 18vw; height: 3vw; font-size: 0.65vw" 
            :class="{ nopeFill: !player.prog.main.pr2.auto, okFill: player.prog.main.pr2.auto }"
            class="whiteText thinMediumButton font0 genAutoButton" id="autoPR2" v-if="false" @click="player.prog.main.pr2.auto = !player.prog.main.pr2.auto">
                <b>PR2 Autobuyer: {{player.prog.main.pr2.auto?"On":"Off"}}</b>
            </button>
        </div>
    </div>
</template>