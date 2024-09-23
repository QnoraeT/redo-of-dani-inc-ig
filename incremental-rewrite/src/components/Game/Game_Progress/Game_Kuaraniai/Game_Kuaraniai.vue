<script setup lang="ts">
import Decimal from 'break_eternity.js'
import { gameVars, tab } from '@/main'
import { tmp, player, reset } from '@/main'
import { format, formatPerc } from '@/format'
import { switchSubTab } from '@/components/MainTabs/MainTabs'
import { gRC, colorChange } from '@/calc'
import { KUA_UPGRADES, KUA_ENHANCERS, kuaEnhReset, kuaEnh, buyKShardUpg, buyKPowerUpg, buyKuaEnhSourceUPG } from './Game_Kuaraniai'
import Kua_Upgrade from './KUA_Kua_Upgrades.vue'
</script>
<template>
    <div id="kuaraniai" v-if="tab.currentTab === 4">
        <div class="flex-container" style="flex-direction: row; justify-content: center; font-size: 1.4vw; margin-bottom: 1vw;">
            <button @click="switchSubTab(0, 0)" class="kuaButton2 fontVerdana whiteText normalTabButton">Main</button>
            <button @click="switchSubTab(-1, 0)" style="width: 10vw" class="kuaButton2 fontVerdana whiteText normalTabButton">Bought Upgrades</button>
            <!-- disable this for now, seems unbalanced -->
            <!-- <button @click="switchSubTab(1, 0)" v-if="player.gameProgress.unlocks.kuaEnhancers" class="kuaButton2 fontVerdana whiteText normalTabButton">Enhancers</button> -->
        </div>
        <div class="flex-container" style="margin-left: auto; margin-right: auto; flex-direction: column; justify-content: center;" v-if="tab.tabList[tab.currentTab][0] === -1">
            <div class="flex-container" style="flex-direction: column; justify-content: center;" :style="{ backgroundColor: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8, 0.2, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8, 0.5, 1.0)}` }">
                <div class="flex-container" style="flex-direction: column; align-items: center" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8, 0.5, 1.0)}`  }">
                    <div style="text-align: center; font-size: 1vw;" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime) / 4, 1.0, 1.0) }" class="fontVerdana">
                        You have bought <b>{{format(player.gameProgress.kua.kshards.upgrades)}}</b> Kuaraniai Shard Upgrades.<br>
                    </div>
                    <div class="flex-container" style="flex-direction: row; flex-wrap: wrap; justify-content: center; width: 60vw;">
                        <div v-for="(item, index) in KUA_UPGRADES.KShards" :key="index">
                            <Kua_Upgrade v-if="index < player.gameProgress.kua.kshards.upgrades" :item="item" :index="index" :type="'KShards'" />
                        </div>
                    </div>
                </div>
                <div class="flex-container" style="flex-direction: column; align-items: center" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 8, 0.5, 1.0)}`  }">
                    <div style="text-align: center; font-size: 1vw;" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0) }" class="fontVerdana">
                        You have bought <b>{{format(player.gameProgress.kua.kpower.upgrades)}}</b> Kuaraniai Power Upgrades.<br>
                    </div>
                    <div class="flex-container" style="flex-direction: row; flex-wrap: wrap; justify-content: center; width: 60vw;">
                        <div v-for="(item, index) in KUA_UPGRADES.KPower" :key="index">
                            <Kua_Upgrade v-if="index < player.gameProgress.kua.kpower.upgrades" :item="item" :index="index" :type="'KPower'" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex-container" style="margin-left: auto; margin-right: auto; flex-direction: column; justify-content: center;" v-if="tab.tabList[tab.currentTab][0] === 0">
            <button style="text-align: center; margin-top: 0.48vw; margin-left: auto; margin-right: auto; font-size: 0.8vw" 
            :class="{ nope: !tmp.kua.canDo, ok: tmp.kua.canDo }"
            class="whiteText thinlargeButton fontVerdana kuaButton" id="kuaGain" @click="reset(2)">
                <h3 style="font-size: 1vw">Kuaraniai: {{format(player.gameProgress.kua.amount, 3)}}</h3>
                Convert your {{format(tmp.kua.effectivePrai)}} PRai into {{format(tmp.kua.pending, 4)}} Kuaraniai.
                <br>{{
                    tmp.kua.canDo
                        ? `You can convert PRai to Kuaraniai! (${format(tmp.kua.effectivePrai)} / ${format(tmp.kua.req)} PRai)`
                        : `You need ${format(tmp.kua.effectivePrai)} / ${format(tmp.kua.req)} PRai to convert into Kuaraniai.`
                }}
                <br>You have {{format(player.gameProgress.kua.amount, 3)}} Kuaraniai, which generates {{format(tmp.kua.shardGen, 4)}} Kuaraniai Shards (KShards) per second. It also:
                <div v-if="tmp.kua.active.effects">
                    <li>Reduces Upgrade 1's scaling strength by {{formatPerc(tmp.kua.effects.upg1Scaling, 3)}}</li> 
                    <li v-if="player.gameProgress.kua.kpower.upgrades >= 6">Reduces Upgrade 1's super scaling strength by {{formatPerc(tmp.kua.effects.upg1SuperScaling, 3)}}</li>
                    <li v-if="Decimal.gt(player.gameProgress.kua.amount, 0)">Adds Upgrade 4, and makes it's base ×{{format(tmp.kua.effects.up4, 4)}}/bought. </li>
                    <li v-if="player.gameProgress.kua.kpower.upgrades >= 3">Raises Points gain to ^{{format(tmp.kua.effects.ptPower, 4)}}</li>
                    <li v-if="player.gameProgress.kua.kpower.upgrades >= 6">Delays Upgrade 2's softcap by {{format(tmp.kua.effects.upg2Softcap, 2)}}×</li>
                    <li v-if="player.gameProgress.kua.kshards.upgrades >= 7">Multiplies Point gain by {{format(tmp.kua.effects.pts, 2)}}×</li>
                    <li v-if="player.gameProgress.kua.kshards.upgrades >= 10">Increases KShards' PRai effect boost by ^{{format(tmp.kua.effects.kshardPrai, 4)}}</li>
                    <li v-if="player.gameProgress.kua.kshards.upgrades >= 10">Boosts KPower gain by ×{{format(tmp.kua.effects.kpower, 2)}}</li>
                </div>
            </button>
            <button style="text-align: center; width: 35vw; height: 3vw; font-size: 0.7vw" 
            :class="{ nopeFill: !player.gameProgress.kua.auto, okFill: player.gameProgress.kua.auto }"
            class="whiteText thinMediumButton fontVerdana genAutoButton" id="autoKua" v-if="Decimal.gte(player.gameProgress.main.pr2.amount, 75)" @click="player.gameProgress.kua.auto = !player.gameProgress.kua.auto">
                <b>Kuaraniai Generator: {{player.gameProgress.kua.auto?"On":"Off"}}</b>
            </button>
            <div class="flex-container" style="flex-direction: column; justify-content: center;" :style="{ backgroundColor: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8, 0.2, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8, 0.5, 1.0)}` }">
                <div class="flex-container" style="flex-direction: column" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8, 0.5, 1.0)}`  }">
                    <div style="text-align: center; font-size: 1vw;" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime) / 4, 1.0, 1.0) }" class="fontVerdana">
                        You have <b>{{format(player.gameProgress.kua.kshards.amount, 3)}}</b> Kuaraniai shards.
                        <div v-if="tmp.kua.active.kshards.effects" class="fontVerdana">
                            <li>Boosts PRai gain by {{format(tmp.kua.effects.kshardPassive, 3)}}×.</li>
                            <li>Generate {{format(tmp.kua.powGen, 3)}} Kuaraniai Power (KPower) per second.</li>
                            <li v-if="Decimal.gt(player.gameProgress.kua.kshards.amount, 0)">Adds Upgrade 5, and makes it's base ×{{format(tmp.kua.effects.up5, 4)}}/bought.</li>
                            <li v-if="player.gameProgress.kua.kshards.upgrades >= 2">Multiply PRai's effect by {{format(KUA_UPGRADES.KShards[1].eff!, 2)}}×.</li>
                            <li v-if="player.gameProgress.kua.kshards.upgrades >= 8">Multiply PRai gain by {{format(KUA_UPGRADES.KShards[7].eff!, 2)}}×.</li>
                            <li v-if="player.gameProgress.kua.kshards.upgrades >= 9">Delays Upgrade 2's cost growth (after scaling costs) by +{{format(KUA_UPGRADES.KShards[8].eff!, 2)}} purchases.</li>
                        </div>
                    </div>
                    <div class="flex-container" style="flex-direction: row; justify-content: center;">
                        <div v-for="(item, index) in KUA_UPGRADES.KShards" :key="index">
                            <Kua_Upgrade @click="buyKShardUpg(index)" :style="{ opacity: 0.5 ** (index - player.gameProgress.kua.kshards.upgrades) }" v-if="index >= player.gameProgress.kua.kshards.upgrades && index < player.gameProgress.kua.kshards.upgrades + 5 && item.show" :item="item" :index="index" :type="'KShards'"/>
                        </div>
                    </div>
                </div>
                <div class="flex-container" style="flex-direction: column" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 8, 0.5, 1.0)}`  }">
                    <div style="text-align: center; font-size: 1vw;" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0) }" class="fontVerdana">
                        You have <b>{{format(player.gameProgress.kua.kpower.amount, 3)}}</b> Kuaraniai power.
                        <div v-if="tmp.kua.active.kpower.effects" class="fontVerdana">
                            <li>Boosts Point gain by {{format(tmp.kua.effects.kpowerPassive, 3)}}×.</li>
                            <li v-if="Decimal.gt(player.gameProgress.kua.kpower.amount, 1)">Adds Upgrade 6, and makes it's base +{{format(tmp.kua.effects.up6, 5)}}/bought.</li>
                            <li v-if="player.gameProgress.kua.kpower.upgrades >= 1">Increases Upgrade 2's base by +{{format(KUA_UPGRADES.KPower[0].eff!, 3)}}.</li>
                            <li v-if="player.gameProgress.kua.kpower.upgrades >= 2">Makes Upgrade 3 {{format(KUA_UPGRADES.KPower[1].eff!.sub(1).mul(100), 3)}}% more effective.</li>
                            <li v-if="player.gameProgress.kua.kpower.upgrades >= 4">Delays Upgrade 2's softcap by {{format(KUA_UPGRADES.KPower[3].eff!, 2)}}×.</li>
                            <li v-if="player.gameProgress.kua.kpower.upgrades >= 5">Raises PRai's effect to ^{{format(KUA_UPGRADES.KPower[4].eff!, 4)}}.</li>
                        </div>
                    </div>
                    <div class="flex-container" style="flex-direction: row; justify-content: center;">
                        <div v-for="(item, index) in KUA_UPGRADES.KPower" :key="index">
                            <Kua_Upgrade @click="buyKPowerUpg(index)" :style="{ opacity: 0.5 ** (index - player.gameProgress.kua.kpower.upgrades) }" v-if="index >= player.gameProgress.kua.kpower.upgrades && index < player.gameProgress.kua.kpower.upgrades + 5 && item.show" :item="item" :index="index" :type="'KPower'" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex-container" style="flex-direction: column" v-if="tab.tabList[tab.currentTab][0] === 1">
            <div class="flex-container" style="margin-left: auto; margin-right: auto; flex-direction: row; flex-wrap: wrap; justify-content: center; margin-top: 1vw; margin-bottom: 1vw; width: 50vw; align-content: center;">
                <div v-for="(item, index) in KUA_ENHANCERS.sources" :key="index">
                    <div class="flex-container" style="flex-direction: column; margin: 0.2vw;">
                        <button style="text-align: center; font-size: 0.8vw" 
                        :class="{ nope: !tmp.kua.sourcesCanBuy[index], ok: tmp.kua.sourcesCanBuy[index] }"
                        class="whiteText mediumButton fontVerdana kuaButton" @click="buyKuaEnhSourceUPG(index)">
                            <h3 style="margin-top: 0.5vw; font-size: 1.15vw">Enhancer Source {{index + 1}}: {{format(player.gameProgress.kua.enhancers.sources[index])}}</h3>
                            +1 Enhancer.
                            <br><span>Cost: {{format(KUA_ENHANCERS.sources[index].cost(player.gameProgress.kua.enhancers.sources[index]), 2)}} {{KUA_ENHANCERS.sources[index].sourceName}}</span>
                        </button>
                    </div>
                </div>
                <button style="text-align: center; font-size: 0.8vw" 
                :class="{ nopeFill: !player.gameProgress.kua.enhancers.autoSources, okFill: player.gameProgress.kua.enhancers.autoSources }"
                class="whiteText thinMediumButton fontVerdana kuaButton2" v-if="false" @click="player.gameProgress.kua.enhancers.autoSources = !player.gameProgress.kua.enhancers.autoSources">
                    <b>Enhancer Sources Autobuyer: {{player.gameProgress.kua.enhancers.autoSources?"On":"Off"}}</b>
                </button>
                <div class="flex-container" style="flex-direction: column; align-items: center;">
                    <div class="flex-container" style="flex-direction: column; align-items: center;">
                        <span style="font-size: 1.6vw; text-align: center;" class="whiteText fontVerdana">You have {{format(Decimal.sub(tmp.kua.totalEnhSources, tmp.kua.enhSourcesUsed))}} / {{format(tmp.kua.totalEnhSources)}} Enhancers.</span>
                        <span style="font-size: 1.6vw; text-align: center;" class="whiteText fontVerdana">You may only allocate a total {{format(Decimal.mul(player.gameProgress.kua.enhancers.xpSpread, 100))}}% of power to your enhancers.</span>
                        <span style="font-size: 1.6vw; text-align: center;" class="whiteText fontVerdana" v-if="tmp.kua.enhShowSlow">The enhancer XP is slowing down! (Strength: {{format(tmp.kua.enhSlowdown, 2)}}%)</span>
                    </div>
                    <button style="text-align: center; font-size: 0.8vw" 
                    class="whiteText thinMediumButton fontVerdana kuaButton2" @click="kuaEnhReset()">
                        Unallocate every enhancer.
                    </button>
                </div>
            </div>
            <div class="flex-container" style="flex-direction: column; align-items: center;">
                <div v-for="(item, index) in KUA_ENHANCERS.enhances" :key="index">
                    <div class="flex-container" v-if="Decimal.gte(tmp.kua.totalEnhSources, index * 3)">
                        <div :style="{ color: item.color, border: `0.3vw solid ${item.color}`, backgroundColor: `${colorChange(item.color, 0.25, 1.0)}` }" style="margin-top: -0.3vw; width: 50vw; height: 8vw; text-align: center;">
                            <div class="flex-container" style="flex-direction: column; margin: 0.5vw; margin-top: 0vw">
                                <span style="margin-top: 0.5vw; font-size: 1.4vw"><b>Enhancer {{index + 1}} ×{{format(player.gameProgress.kua.enhancers.enhancers[index])}} (Power: {{format(tmp.kua.trueEnhPower[index].mul(100), 2)}}%)</b></span>
                                <div class="flex-container" style="justify-content: space-between; margin-top: 0.5vw">
                                    <div class="slidecontainer" style="width: 15vw">
                                        <input class="slider" type="range" v-model="player.gameProgress.kua.enhancers.enhancePow[index]" />
                                        <!-- <Tooltip :display="`${value}`" :class="{ fullWidth: !title }" :direction="Direction.Down">
                                            <input type="range" class="slider" v-model="value" :min="min" :max="max"  />
                                        </Tooltip>                                         -->
                                    </div>
                                    <div class="flex-container" style="flex-direction: column;">
                                        <span style="font-size: 1.4vw">XP: {{format(player.gameProgress.kua.enhancers.enhanceXP[index], 2)}} ({{format(tmp.kua.kuaTrueSourceXPGen[index], 2)}}/s)</span>
                                        <span style="font-size: 1vw">{{item.desc}}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button @click="kuaEnh(index, Infinity)" :style="{ color: item.color, border: `0.3vw solid ${item.color}`, backgroundColor: `${colorChange(item.color, 0.25, 1.0)}` }" style="margin-top: -0.3vw; margin-left: -0.3vw; width: 8vw; height: 8.45vw; text-align: center; font-size: 1.4vw" class="fontVerdana whiteText"> 
                            Add All
                        </button>
                        <button @click="kuaEnh(index, 1)" :style="{ color: item.color, border: `0.3vw solid ${item.color}`, backgroundColor: `${colorChange(item.color, 0.25, 1.0)}` }" style="margin-top: -0.3vw; margin-left: -0.3vw; width: 8vw; height: 8.45vw; text-align: center; font-size: 1.4vw" class="fontVerdana whiteText"> 
                            Add 1
                        </button>
                        <button @click="kuaEnh(index, -1)" :style="{ color: item.color, border: `0.3vw solid ${item.color}`, backgroundColor: `${colorChange(item.color, 0.25, 1.0)}` }" style="margin-top: -0.3vw; margin-left: -0.3vw; width: 8vw; height: 8.45vw; text-align: center; font-size: 1.4vw" class="fontVerdana whiteText"> 
                            Remove 1
                        </button>
                        <button @click="kuaEnh(index, -Infinity)" :style="{ color: item.color, border: `0.3vw solid ${item.color}`, backgroundColor: `${colorChange(item.color, 0.25, 1.0)}` }" style="margin-top: -0.3vw; margin-left: -0.3vw; width: 8vw; height: 8.45vw; text-align: center; font-size: 1.4vw" class="fontVerdana whiteText"> 
                            Remove All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
