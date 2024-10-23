<script setup lang="ts">
import Decimal from 'break_eternity.js'
import { tab } from '@/main'
import { tmp, player } from '@/main'
import { format, formatTime } from '@/format'
import { MAIN_ONE_UPGS, MAIN_UPGS, PR2_EFF, buyGenUPG, buyOneMainUpg, getOMUpgrade, maxxedOMUpgrade } from './Game_Main'
import { getKuaUpgrade } from '../Game_Kuaraniai/Game_Kuaraniai'
import { switchSubTab } from '@/components/MainTabs/MainTabs'
import Tab_Button from '@/components/MainTabs/DefaultTabButton.vue'
import { inChallenge } from '../Game_Colosseum/Game_Colosseum'
import { reset } from '@/resets'
</script>
<template>
    <div id="generators" v-if="tab.currentTab === 0">
        <div v-if="Decimal.gte(player.gameProgress.main.pr2.bestEver, 6)" class="flex-container" style="flex-direction: row; justify-content: center; font-size: 1.0vw; margin-bottom: 0.3vw;">
            <Tab_Button @click="switchSubTab(0, 0)" :selected="tab.tabList[tab.currentTab][0] === 0" :name="'Main'" />
            <Tab_Button @click="switchSubTab(1, 0)" :selected="tab.tabList[tab.currentTab][0] === 1" :name="'One-Upgrades'" />
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 1">
            <div class="flex-container" style="flex-wrap: wrap; align-content: flex-start; margin-top: 1vw; margin-left: auto; margin-right: auto; display: flex; justify-content: center; flex-direction: row; padding: 0.6vw; height: 45vw; width: 65vw;">
                <div v-for="(item, index) in MAIN_ONE_UPGS" :key="index">
                    <!-- set padding to 0vw because it auto-inserts padding -->
                    <button @click="buyOneMainUpg(index)" :class="{ nope: !tmp.main.oneUpgrades[index].canBuy && !maxxedOMUpgrade(index), ok: tmp.main.oneUpgrades[index].canBuy && !maxxedOMUpgrade(index), done: maxxedOMUpgrade(index) }" :style="{ backgroundColor: getOMUpgrade(index) ? '#303030' : '#202020' }" v-if="item.show" style="width: 12vw; height: 8vw; margin-left: 0.18vw; margin-right: 0.18vw; margin-bottom: 0.36vw; font-size: 0.65vw;" class="generatorButton fontVerdana whiteText">
                        <span :style="{ color: '#ddd' }" style="font-size: 0.75vw; margin-right: 0.5vw"><b>#{{index + 1}}</b></span><span v-if="inChallenge('im')" class="whiteText">x{{ format(getOMUpgrade(index)) }}</span>
                        <br><span v-if="!item.implemented" style="color: #ff0; font-size: 0.5vw"><b>[ NOT IMPLEMENTED ]</b><br></span>
                        <span class="vertical-align: top;">{{item.desc}}</span>
                        <br><br>
                        <span class="vertical-align: bottom;">Currently: <b><span style="font-size: 0.75vw; color: #fff">{{item.effectDesc}}</span></b></span><br>
                        <span v-if="!maxxedOMUpgrade(index)" class="vertical-align: bottom;">Cost: <b><span style="font-size: 0.75vw; color: #fff">{{format(item.cost.ceil())}}</span></b> PRai.</span>
                        <span v-if="maxxedOMUpgrade(index)" class="vertical-align: bottom;"><b><span style="font-size: 0.75vw; color: #fff">Bought!</span></b></span>
                    </button>
                </div>
            </div>
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 0">
            <div class="flex-container" style="margin-left: auto; margin-right: auto; flex-direction: row; flex-wrap: wrap; justify-content: center; margin-top: 0.5vw; margin-bottom: 0.5vw; width: 80vw; align-content: center;">
                <div v-for="(item, index) in MAIN_UPGS" :key='index'>
                    <div class="flex-container" style="flex-direction: column; margin: 0.2vw;" v-if="tmp.main.upgrades[index].active && item.shown">
                        <button style="text-align: center; font-size: 0.7vw" 
                        :class="{ nope: !tmp.main.upgrades[index].canBuy, ok: tmp.main.upgrades[index].canBuy }"
                        class="whiteText mediumButton fontVerdana generatorButton" @click="buyGenUPG(index)">
                            <h3 style="margin-top: 0.35vw; font-size: 0.9vw">Upgrade {{index + 1}}: {{format(player.gameProgress.main.upgrades[index].bought)}}{{Decimal.gt(tmp.main.upgrades[index].freeExtra, 0) ? ` (+${format(tmp.main.upgrades[index].freeExtra)})`:""}}</h3>
                            {{MAIN_UPGS[index].display}}
                            <br><span :style="{ color: tmp.main.upgrades[index].effectTextColor }">{{MAIN_UPGS[index].totalDisp}}</span>
                            <br><span :style="{ color: tmp.main.upgrades[index].costTextColor }">Cost: {{format(tmp.main.upgrades[index].cost)}} points</span>
                        </button>

                        <button style="text-align: center; font-size: 0.7vw" 
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
                            <button style="text-align: center; font-size: 0.65vw" 
                            :class="{ nope: !tmp.main.prai.canDo, ok: tmp.main.prai.canDo }"
                            class="whiteText largeButton fontVerdana generatorButton" id="prai" @click="reset(0)">
                            <h3 style="font-size: 1vw">PRai: {{format(player.gameProgress.main.prai.amount)}}</h3>
                                Reset your progress to gain {{`${Decimal.gte(player.gameProgress.main.pr2.amount, 1) ? format(tmp.main.prai.pending) + " " : ""}`}}PRai.<br>
                                <span v-if="tmp.main.prai.pending.lt(100)">Gain at least {{ format(tmp.main.prai.req) }} points to do a PRai reset.<br></span>
                                {{
                                    tmp.main.prai.canDo
                                        ? tmp.main.prai.pending.lt(100) && Decimal.gte(player.gameProgress.main.pr2.amount, 1)
                                            ? `Next in ${format(tmp.main.prai.next)} points. (${format(Decimal.div(tmp.main.prai.pending, player.gameProgress.main.prai.timeInPRai), 2)}/s)`
                                            : `(${format(Decimal.div(tmp.main.prai.pending, player.gameProgress.main.prai.timeInPRai), 2)}/s)`
                                        : `You can PRai reset in ${formatTime(tmp.main.prai.next)}`
                                }}<br>
                                <br>You have {{format(player.gameProgress.main.prai.amount)}} PRai, which boosts your points by {{format(tmp.main.prai.effect, 2)}}×.
                                <br>{{tmp.main.prai.canDo ? `Resetting now will boost your points by ${format(Decimal.div(tmp.main.prai.nextEffect, tmp.main.prai.effect), 2)}×` : ""}}
                            </button>
    
                            <button style="text-align: center; width: 18vw; height: 3vw; font-size: 0.65vw" 
                            :class="{ nopeFill: !player.gameProgress.main.prai.auto, okFill: player.gameProgress.main.prai.auto }"
                            class="whiteText thinMediumButton fontVerdana genAutoButton" id="autoPRai" v-if="getKuaUpgrade('s', 1) || inChallenge('df')" @click="player.gameProgress.main.prai.auto = !player.gameProgress.main.prai.auto">
                                <b>PRai Generator: {{player.gameProgress.main.prai.auto?"On":"Off"}}</b>
                            </button>
                        </div>
                    </td>
                    <td>
                        <div class="flex-container" style="flex-direction: column;">
                            <button style="text-align: center; font-size: 0.65vw" 
                            :class="{ nope: !tmp.main.pr2.canDo, ok: tmp.main.pr2.canDo }"
                            class="whiteText largeButton fontVerdana generatorButton" id="pr2" v-if="Decimal.gte(player.gameProgress.main.prai.bestEver, 9.5)" @click="reset(1)">
                                <h3 style="font-size: 1vw">PR2: {{format(player.gameProgress.main.pr2.amount)}}</h3>
                                Reset all of your previous progress to for a PR2 reset.
                                <br><span :style="{ color: tmp.main.pr2.costTextColor }">{{
                                    tmp.main.pr2.canDo
                                        ? false
                                            ? `You can PR2 reset ${format(tmp.main.pr2.target.sub(player.gameProgress.main.pr2.amount).floor())} times!`
                                            : `You can PR2 reset! (${format(player.gameProgress.main.prai.amount)} / ${format(tmp.main.pr2.cost)} PRai)`
                                        : `You need ${format(player.gameProgress.main.prai.amount)} / ${format(tmp.main.pr2.cost)} PRai to PR2 reset.`
                                }}</span><br>
                                <br>You have {{format(player.gameProgress.main.pr2.amount)}} PR2, which boosts your PRai and points by {{format(tmp.main.pr2.effect, 2)}}×.
                                <br>{{tmp.main.pr2.textEffect.txt===""?"":`At ${format(tmp.main.pr2.textEffect.when)} PR2 reset${tmp.main.pr2.textEffect.when.eq(1)?"":"s"}, ${tmp.main.pr2.textEffect.txt}`}}
                            </button>
        
                            <button style="text-align: center; width: 18vw; height: 3vw; font-size: 0.65vw" 
                            :class="{ nopeFill: !player.gameProgress.main.pr2.auto, okFill: player.gameProgress.main.pr2.auto }"
                            class="whiteText thinMediumButton fontVerdana genAutoButton" id="autoPR2" v-if="false" @click="player.gameProgress.main.pr2.auto = !player.gameProgress.main.pr2.auto">
                                <b>PR2 Autobuyer: {{player.gameProgress.main.pr2.auto?"On":"Off"}}</b>
                            </button>
                        </div>
                    </td>
                </tr>
            </table>
            <div class="flex-container" style="flex-direction: column-reverse; margin-top: 0.96vw; margin-left: auto; margin-right: auto; align-items: center;">
                <div v-for="(item, index) in PR2_EFF" :key="index">
                    <div v-if="Decimal.gte(player.gameProgress.main.pr2.amount, item.when) && item.show">
                        <div style="font-size: 0.5vw; text-align: center; border: 0.12vw solid #c0c0c0; height: 2.5vw; width: 20vw" 
                        class="whiteText largeButton fontVerdana generatorButton">
                            <span style="font-size: 0.7vw">PR2: {{ format(item.when) }}</span><br>
                            {{ item.text }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
