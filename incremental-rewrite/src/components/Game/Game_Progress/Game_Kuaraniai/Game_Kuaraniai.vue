<script setup lang="ts">
import Decimal from "break_eternity.js";
import { gameVars, shiftDown, tab } from "@/main";
import { tmp, player } from "@/main";
import { format, formatPerc, formatTime } from "@/format";
import { switchSubTab } from "@/components/MainTabs/MainTabs";
import { gRC, colorChange } from "@/calc";
import {
    KUA_UPGRADES,
    KUA_ENHANCERS,
    kuaEnhReset,
    kuaEnh,
    buyKShardUpg,
    buyKPowerUpg,
    buyKuaEnhSourceUPG,
    KUA_BLESS_UPGS,
    gainKPOnClick,
    KUA_BLESS_TIER,
    buyKPUpg,
    buyKMainUpg,
    KUA_PROOF_UPGS,
    buyKProofUpg,
    getStrangeKPExp,
    buyKProofAuto,
    KUA_PROOF_AUTO,
    KuaProofAutoTypeList,
    getFinickyKPExp,
    getFinickySeconds,
    getFinickyKPExpGain
} from "./Game_Kuaraniai";
import Kua_Upgrade from "./KUA_Kua_Upgrades.vue";
import { resetFromFKP, resetFromSKP, resetStage } from "@/resets";
import { getSCSLAttribute } from "@/softcapScaling";
import { COL_CHALLENGES } from "../Game_Colosseum/Game_Colosseum";
</script>
<template>
    <div id="kuaraniai" v-if="tab.currentTab === 4">
        <div class="flex-container" style=" flex-direction: row; justify-content: center; font-size: 1.4vw; margin-bottom: 1vw;">
            <button @click="switchSubTab(-1, 0)" style="width: 10vw" class="kuaButton2 fontVerdana whiteText normalTabButton">Bought Upgrades</button>
            <button :class="{ alert: tmp.kua.upgCanBuyUpg }" @click="switchSubTab(0, 0)" class="kuaButton2 fontVerdana whiteText normalTabButton">Main</button>
            <button :class="{ alert: tmp.kua.blessings.canBuyUpg }" v-if="player.gameProgress.unlocks.kblessings" @click="switchSubTab(1, 0)" class="kuaButton2 fontVerdana whiteText normalTabButton">Blessings</button>
            <button :class="{ alert: tmp.kua.proofs.canBuyUpg }" v-if="player.gameProgress.unlocks.kproofs.main" @click="switchSubTab(2, 0)" class="kuaButton2 fontVerdana whiteText normalTabButton">Proof</button>
            <!-- disable this for now, seems unbalanced -->
            <!-- <button @click="switchSubTab(1, 0)" v-if="player.gameProgress.unlocks.kuaEnhancers" class="kuaButton2 fontVerdana whiteText normalTabButton">Enhancers</button> -->
        </div>
        <div class="flex-container" style="margin-left: auto; margin-right: auto; flex-direction: column; justify-content: center;" v-if="tab.tabList[tab.currentTab][0] === -1">
            <div
                class="flex-container"
                style="flex-direction: column; justify-content: center"
                :style="{
                    backgroundColor: gRC(
                        4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8,
                        0.2,
                        1.0
                    ),
                    border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8, 0.5, 1.0)}`
                }"
            >
                <div class="flex-container" style="flex-direction: column; align-items: center" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8, 0.5, 1.0)}` }">
                    <div style="text-align: center; font-size: 1vw" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime) / 4, 1.0, 1.0) }" class="fontVerdana">
                        You have bought <b>{{ format(player.gameProgress.kua.kshards.upgrades) }}</b> Kuaraniai Shard Upgrades.<br>
                    </div>
                    <div class="flex-container" style=" flex-direction: row; flex-wrap: wrap; justify-content: center; width: 90vw;">
                        <div v-for="(item, index) in KUA_UPGRADES.KShards" :key="index">
                            <Kua_Upgrade v-if="index < player.gameProgress.kua.kshards.upgrades" :item="item" :index="index" :type="'KShards'" />
                        </div>
                    </div>
                </div>
                <div class="flex-container" style="flex-direction: column; align-items: center" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 8, 0.5, 1.0)}` }">
                    <div style="text-align: center; font-size: 1vw" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0) }" class="fontVerdana">
                        You have bought <b>{{ format(player.gameProgress.kua.kpower.upgrades) }}</b> Kuaraniai Power Upgrades.<br>
                    </div>
                    <div class="flex-container" style="flex-direction: row; flex-wrap: wrap; justify-content: center; width: 90vw;">
                        <div v-for="(item, index) in KUA_UPGRADES.KPower" :key="index">
                            <Kua_Upgrade v-if="index < player.gameProgress.kua.kpower.upgrades" :item="item" :index="index" :type="'KPower'" />
                        </div>
                    </div>
                </div>
                <div v-if="player.gameProgress.unlocks.kblessings" class="flex-container" style="flex-direction: column; align-items: center" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI / 2) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI / 3) / 8, 0.5, 1.0)}` }">
                    <div style="text-align: center; font-size: 1vw" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0) }" class="fontVerdana">
                        You have bought <b>{{ format(player.gameProgress.kua.upgrades) }}</b> Kuaraniai Upgrades.<br>
                    </div>
                    <div class="flex-container" style="flex-direction: row; flex-wrap: wrap; justify-content: center; width: 90vw;">
                        <div v-for="(item, index) in KUA_UPGRADES.Kua" :key="index">
                            <Kua_Upgrade v-if="index < player.gameProgress.kua.upgrades" :item="item" :index="index" :type="'Kua'" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex-container" style=" margin-left: auto; margin-right: auto; flex-direction: column; justify-content: center;" v-if="tab.tabList[tab.currentTab][0] === 0">
            <button
                style="text-align: center; margin-top: 0.48vw; margin-left: auto; margin-right: auto; font-size: 0.8vw;"
                :class="{ nope: !tmp.kua.canDo, ok: tmp.kua.canDo }"
                class="whiteText thinlargeButton fontVerdana kuaButton"
                id="kuaGain"
                @click="resetStage('kua')"
            >
                <h3 style="font-size: 1vw">
                    Kuaraniai: {{ format(player.gameProgress.kua.amount, 3) }}
                </h3>
                {{
                    tmp.kua.canDo
                        ? `You can convert ${format(tmp.kua.effectivePrai)} PRai to ${format(tmp.kua.pending, 4)} Kuaraniai!`
                        : `You need ${format(tmp.kua.effectivePrai)} / ${format(tmp.kua.req)} PRai to convert into Kuaraniai.`
                }}
                <br>You have {{ format(player.gameProgress.kua.amount, 3) }} Kuaraniai, which generates {{ format(tmp.kua.shardGen, 4) }} Kuaraniai Shards (KShards) per second. It also:
                <div v-if="tmp.kua.active.effects">
                    <li>Reduces Upgrade 1's scaling strength by {{ formatPerc(tmp.kua.effects.upg1Scaling, 3) }}</li>
                    <li v-if="player.gameProgress.kua.kpower.upgrades >= 6">Reduces Upgrade 1's super scaling strength by {{ formatPerc(tmp.kua.effects.upg1SuperScaling, 3) }}</li>
                    <li v-if="Decimal.gt(player.gameProgress.kua.amount, 0)">Adds Upgrade 4, and makes it's base ×{{format(tmp.kua.effects.upg4, 4)}}/bought.</li>
                    <li v-if="player.gameProgress.kua.kpower.upgrades >= 3">Raises Points gain to ^{{ format(tmp.kua.effects.ptPower, 4) }}</li>
                    <li v-if="player.gameProgress.kua.kpower.upgrades >= 6">Delays Upgrade 2's softcap by {{ format(tmp.kua.effects.upg2Softcap, 2) }}×</li>
                    <li v-if="player.gameProgress.kua.kshards.upgrades >= 7">Multiplies Point gain by {{ format(tmp.kua.effects.pts, 2) }}×</li>
                    <li v-if="player.gameProgress.kua.kshards.upgrades >= 10">Increases KShards' PRai effect boost by ^{{format(tmp.kua.effects.kshardPrai, 4)}}</li>
                    <li v-if="player.gameProgress.kua.kshards.upgrades >= 10">Boosts KPower gain by ×{{ format(tmp.kua.effects.kpower, 2) }}</li>
                    <li v-if="player.gameProgress.kua.upgrades >= 2">Boosts KBlessing gain by ×{{ format(tmp.kua.effects.bless, 2) }}</li>
                </div>
            </button>
            <button
                style="text-align: center; width: 35vw; height: 3vw; font-size: 0.7vw; margin-left: auto; margin-right: auto;"
                :class="{
                    nopeFill: !player.gameProgress.kua.auto,
                    okFill: player.gameProgress.kua.auto
                }"
                class="whiteText thinMediumButton fontVerdana genAutoButton"
                id="autoKua"
                v-if="Decimal.gte(player.gameProgress.main.pr2.amount, 75)"
                @click="player.gameProgress.kua.auto = !player.gameProgress.kua.auto"
            >
                <b>Kuaraniai Generator: {{ player.gameProgress.kua.auto ? "On" : "Off" }}</b>
            </button>
            <div
                class="flex-container"
                style="flex-direction: column; justify-content: center"
                :style="{
                    backgroundColor: gRC(
                        4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8,
                        0.2,
                        1.0
                    ),
                    border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8, 0.5, 1.0)}`
                }"
            >
                <div class="flex-container" style="flex-direction: column" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI * 0.5) / 8, 0.5, 1.0)}` }">
                    <div style="text-align: center; font-size: 1vw" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime) / 4, 1.0, 1.0) }" class="fontVerdana">
                        You have <b>{{ format(player.gameProgress.kua.kshards.amount, 3) }}</b> Kuaraniai shards.
                        <div v-if="tmp.kua.active.kshards.effects" class="fontVerdana">
                            <li>Boosts PRai gain by {{ format(tmp.kua.effects.kshardPassive, 3) }}×.</li>
                            <li>Generate {{ format(tmp.kua.powGen, 3) }} Kuaraniai Power (KPower) per second.</li>
                            <li v-if="Decimal.gt(player.gameProgress.kua.kshards.amount, 0)">Adds Upgrade 5, and makes it's base ×{{format(tmp.kua.effects.upg5, 4)}}/bought.</li>
                            <li v-if="player.gameProgress.kua.kshards.upgrades >= 2">Multiply PRai's effect by {{ format(KUA_UPGRADES.KShards[1].eff!, 2) }}×.</li>
                            <li v-if="player.gameProgress.kua.kshards.upgrades >= 8">Multiply PRai gain by {{ format(KUA_UPGRADES.KShards[7].eff!, 2) }}×.</li>
                            <li v-if="player.gameProgress.kua.kshards.upgrades >= 9">Delays Upgrade 2's cost growth (after scaling costs) by +{{format(KUA_UPGRADES.KShards[8].eff!, 2)}} purchases.</li>
                        </div>
                    </div>
                    <div class="flex-container" style="flex-direction: row; justify-content: center">
                        <div v-for="(item, index) in KUA_UPGRADES.KShards" :key="index">
                            <Kua_Upgrade
                                @click="buyKShardUpg(index)"
                                :style="{
                                    opacity: 0.5 ** (index - player.gameProgress.kua.kshards.upgrades),
                                    border: `0.24vw solid ${Decimal.lt(item.cost, player.gameProgress.kua.kshards.amount) ? colorChange('#FF00FF', 1.0, 0.5 + 0.5 * Math.sin(Math.PI * gameVars.sessionTime)) : '#b900ff'}`
                                }"
                                v-if="
                                    index >= player.gameProgress.kua.kshards.upgrades &&
                                    index < player.gameProgress.kua.kshards.upgrades + 5 &&
                                    item.show
                                "
                                :item="item"
                                :index="index"
                                :type="'KShards'"
                            />
                        </div>
                    </div>
                </div>
                <div class="flex-container" style="flex-direction: column" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 8, 0.5, 1.0)}` }">
                    <div style="text-align: center; font-size: 1vw" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0) }" class="fontVerdana">
                        You have <b>{{ format(player.gameProgress.kua.kpower.amount, 3) }}</b> Kuaraniai power.
                        <div v-if="tmp.kua.active.kpower.effects" class="fontVerdana">
                            <li>Boosts Point gain by {{ format(tmp.kua.effects.kpowerPassive, 3) }}×.</li>
                            <li v-if="Decimal.gt(player.gameProgress.kua.kpower.amount, 1)">Adds Upgrade 6, and makes it's base +{{format(tmp.kua.effects.upg6, 5)}}/bought.</li>
                            <li v-if="player.gameProgress.kua.kpower.upgrades >= 1">Increases Upgrade 2's base by +{{format(KUA_UPGRADES.KPower[0].eff!, 3)}}.</li>
                            <li v-if="player.gameProgress.kua.kpower.upgrades >= 2">Makes Upgrade 3 {{ format(KUA_UPGRADES.KPower[1].eff!.sub(1).mul(100), 3) }}% more effective.</li>
                            <li v-if="player.gameProgress.kua.kpower.upgrades >= 4">Delays Upgrade 2's softcap by {{ format(KUA_UPGRADES.KPower[3].eff!, 2) }}×.</li>
                            <li v-if="player.gameProgress.kua.kpower.upgrades >= 5">Raises PRai's effect to ^{{format(KUA_UPGRADES.KPower[4].eff!, 4)}}.</li>
                        </div>
                    </div>
                    <div class="flex-container" style="flex-direction: row; justify-content: center">
                        <div v-for="(item, index) in KUA_UPGRADES.KPower" :key="index">
                            <Kua_Upgrade
                                @click="buyKPowerUpg(index)"
                                :style="{
                                    opacity: 0.5 ** (index - player.gameProgress.kua.kpower.upgrades),
                                    border: `0.24vw solid ${Decimal.lt(item.cost, player.gameProgress.kua.kpower.amount) ? colorChange('#FF00FF', 1.0, 0.5 + 0.5 * Math.sin(Math.PI * gameVars.sessionTime)) : '#b900ff'}`
                                }"
                                v-if="
                                    index >= player.gameProgress.kua.kpower.upgrades &&
                                    index < player.gameProgress.kua.kpower.upgrades + 5 &&
                                    item.show
                                "
                                :item="item"
                                :index="index"
                                :type="'KPower'"
                            />
                        </div>
                    </div>
                </div>
                <div v-if="player.gameProgress.unlocks.kblessings" class="flex-container" style="flex-direction: column" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0), border: `0.18vw solid ${gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 8, 0.5, 1.0)}` }">
                    <div style="text-align: center; font-size: 1vw" :style="{ color: gRC(4.5 + Math.sin(gameVars.sessionTime + Math.PI) / 4, 1.0, 1.0) }" class="fontVerdana">
                        You have <b>{{ format(player.gameProgress.kua.amount, 3) }}</b> Kuaraniai.
                    </div>
                    <div class="flex-container" style="flex-direction: row; justify-content: center">
                        <div v-for="(item, index) in KUA_UPGRADES.Kua" :key="index">
                            <Kua_Upgrade
                                @click="buyKMainUpg(index)"
                                :style="{
                                    opacity: 0.5 ** (index - player.gameProgress.kua.upgrades),
                                    border: `0.24vw solid ${Decimal.lt(item.cost, player.gameProgress.kua.amount) ? colorChange('#FF00FF', 1.0, 0.5 + 0.5 * Math.sin(Math.PI * gameVars.sessionTime)) : '#b900ff'}`
                                }"
                                v-if="
                                    index >= player.gameProgress.kua.upgrades &&
                                    index < player.gameProgress.kua.upgrades + 5 &&
                                    item.show
                                "
                                :item="item"
                                :index="index"
                                :type="'Kua'"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex-container" style="flex-direction: column" v-if="tab.tabList[tab.currentTab][0] === 1">
            <div style="margin-top: 0.2vw; background-color: #021; border: 0.2vw solid #0f4; margin-left: auto; margin-right: auto; display: flex; justify-content: center; flex-direction: row; box-shadow: 0 0 0.8vw 0.24vw rgb(0, 66, 17); height: 40vw; width: 80vw;">
                <div class="fontVerdana" style="display: flex; flex-direction: column; border: 0.24vw solid #0f4; padding: 0.6vw; height: 38.4vw; width: 50%;">
                    <span style="color: #0f2; text-align: center; font-size: 1.2vw">
                        You have 
                        <span style="font-size: 1.4vw"><b>{{ format(player.gameProgress.kua.blessings.amount, 3) }}</b></span> 
                        Kuaraniai Blessings. 
                        <span style="font-size: 1vw">({{ format(tmp.kua.blessings.perSec, 2) }}/s)</span>
                    </span>
                    <span style="color: #0f2; text-align: center; font-size: 0.8vw">
                        You can hold shift on these upgrades to see what their cost and effect will be next purchase.
                    </span><br>
                    <span style="color: #0f2; text-align: center; font-size: 0.7vw">
                        This boosts Upgrade 1's base by +<span style="font-size: 0.8vw"><b>{{ format(tmp.kua.blessings.upg1Base, 3) }}</b></span><span v-if="COL_CHALLENGES.im.type2ChalEff![1].gt(0)">&nbsp;(×{{ format(tmp.kua.blessings.upg1Base.add(1).pow(COL_CHALLENGES.im.type2ChalEff![1])) }})</span>.<br>
                        This boosts Upgrade 2's base by +<span style="font-size: 0.8vw"><b>{{ format(tmp.kua.blessings.upg2Base, 3) }}</b></span><span v-if="COL_CHALLENGES.im.type2ChalEff![1].gt(0)">&nbsp;(×{{ format(tmp.kua.blessings.upg2Base.add(1).pow(COL_CHALLENGES.im.type2ChalEff![1])) }})</span>.<br>
                        This boosts Effective Kuaraniai by ×<span style="font-size: 0.8vw"><b>{{ format(tmp.kua.blessings.kuaEff, 2) }}</b></span>.
                    </span>
                    <button class="whiteText fontVerdana kuaBlessingActiveButton" @click="gainKPOnClick()">
                        Gain {{ format(tmp.kua.blessings.perClick, 3) }} KBlessings<span v-if="player.gameProgress.col.inAChallenge">, but lose {{ formatTime(0.05) }} of challenge time</span>.
                    </button>
                    <div class="flex-container" style="margin-top: 0.4vw; flex-wrap: wrap; justify-content: center;">
                        <div v-for="(item, index) in KUA_BLESS_UPGS" :key="index">
                            <!-- set padding to 0vw because it auto-inserts padding -->
                            <button @click="buyKPUpg(index)" :class="{ nope: !tmp.kua.blessings.upgrades[index].canBuy, ok: tmp.kua.blessings.upgrades[index].canBuy}" :style="{ cursor: tmp.kua.blessings.upgrades[index].canBuy ? 'pointer' : 'not-allowed' }" v-if="item.show" style="width: 12vw; height: 8vw; margin-left: 0.15vw; margin-right: 0.15vw; margin-bottom: 0.3vw; font-size: 0.55vw; transition: 0.2s; background-color: #00300a" class="fontVerdana whiteText">
                                <span style="margin-right: 0.5vw; color: #0d3"><b>#{{index + 1}}</b></span><span class="whiteText">×{{ format(player.gameProgress.kua.blessings.upgrades[index]) }}</span><br>
                                <!-- <br><span v-if="!item.implemented" style="color: #ff0; font-size: 0.5vw"><b>[ NOT IMPLEMENTED ]</b><br></span> -->
                                <span v-if="!shiftDown">{{item.desc(player.gameProgress.kua.blessings.upgrades[index])}}</span>
                                <span v-if="shiftDown">{{item.desc(Decimal.add(player.gameProgress.kua.blessings.upgrades[index], 1))}}</span>
                                <br><br>
                                <span v-if="!shiftDown">Currently: <b style="font-size: 0.65vw;">{{item.effDesc(player.gameProgress.kua.blessings.upgrades[index])}}</b><br></span>
                                <span v-if="!shiftDown">Cost: <b style="font-size: 0.65vw;">{{format(item.cost(player.gameProgress.kua.blessings.upgrades[index]).ceil())}}</b> KBlessings.</span>
                                <span v-if="shiftDown">Next: <b style="font-size: 0.65vw;">{{item.effDesc(Decimal.add(player.gameProgress.kua.blessings.upgrades[index], 1))}}</b><br></span>
                                <span v-if="shiftDown">Next Cost: <b style="font-size: 0.65vw;">{{format(item.cost(Decimal.add(player.gameProgress.kua.blessings.upgrades[index], 1)).ceil())}}</b> KBlessings.</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="flex-container" style="flex-direction: column; border: 0.18vw solid #0f4; height: 39.8vw; width: 50%;">
                    <div v-if="KUA_BLESS_TIER.rank.show" class="flex-container whiteText fontVerdana" style="justify-content: center; background-color: #004010; position: relative; width: 100%; height: 15%;">
                        <div class="flex-container fontVerdana whiteText" style="width: 95%; height: 80%; top: 7.5%; font-size: 0.6vw; position: relative; border: 0.18vw solid #0f4; background-color: #005014; align-items: center">
                            <div style="text-align: center; position: relative; width: 30%; left: 0%">
                                You are in KBlessing Rank <span style="font-size: 0.9vw"><b>{{ format(tmp.kua.blessings.rank) }}</b></span>.<br>
                                Next at: <span style="font-size: 0.9vw"><b>{{ format(KUA_BLESS_TIER.rank.req(tmp.kua.blessings.rank)) }}</b></span> KBlessings.
                            </div>
                            <div style="text-align: center; position: relative; font-size: 0.6vw; width: 70%; right: 0%">
                                Your KBlessing Ranks:
                                <li>{{ KUA_BLESS_TIER.rank.desc.kuaBlessGainActive }}</li>
                                <li>{{ KUA_BLESS_TIER.rank.desc.kuaBlessGainIdle }}</li>
                            </div>
                        </div>
                    </div>
                    <div v-if="KUA_BLESS_TIER.tier.show" class="flex-container whiteText fontVerdana" style="justify-content: center; background-color: #005014; position: relative; width: 100%; height: 15%;">
                        <div class="flex-container fontVerdana whiteText" style="width: 95%; height: 80%; top: 7.5%; font-size: 0.6vw; position: relative; border: 0.18vw solid #0f4; background-color: #006018; align-items: center">
                            <div style="text-align: center; position: relative; width: 30%; left: 0%">
                                You are in KBlessing Tier <span style="font-size: 0.9vw"><b>{{ format(tmp.kua.blessings.tier) }}</b></span>.<br>
                                Next at: <span style="font-size: 0.9vw"><b>{{ format(KUA_BLESS_TIER.tier.req(tmp.kua.blessings.tier)) }}</b></span> Ranks.
                            </div>
                            <div style="text-align: center; position: relative; font-size: 0.6vw; width: 70%; right: 0%">
                                Your KBlessing Tiers:
                                <li>{{ KUA_BLESS_TIER.tier.desc.kuaBlessEff }}</li>
                            </div>
                        </div>
                    </div>
                    <div v-if="KUA_BLESS_TIER.tetr.show" class="flex-container whiteText fontVerdana" style="justify-content: center; background-color: #004010; position: relative; width: 100%; height: 15%;">
                        <div class="flex-container fontVerdana whiteText" style="width: 95%; height: 80%; top: 7.5%; font-size: 0.6vw; position: relative; border: 0.18vw solid #0f4; background-color: #005014; align-items: center">
                            <div style="text-align: center; position: relative; width: 30%; left: 0%">
                                You are in KBlessing Tetr <span style="font-size: 0.9vw"><b>{{ format(tmp.kua.blessings.tetr) }}</b></span>.<br>
                                Next at: <span style="font-size: 0.9vw"><b>{{ format(KUA_BLESS_TIER.tetr.req(tmp.kua.blessings.tetr)) }}</b></span> Tiers.
                            </div>
                            <div style="text-align: center; position: relative; font-size: 0.6vw; width: 70%; right: 0%">
                                Your KBlessing Tetr:
                                <li>{{ KUA_BLESS_TIER.tetr.desc.kuaRankActive }}</li>
                                <li>{{ KUA_BLESS_TIER.tetr.desc.kuaRankIdle }}</li>
                                <li>{{ KUA_BLESS_TIER.tetr.desc.pr2Eff }}</li>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex-container" style="flex-direction: column" v-if="tab.tabList[tab.currentTab][0] === 2">
            <div class="flex-container" style="flex-direction: row; justify-content: center; font-size: 1.4vw; margin-bottom: 1vw;">
                <button :class="{ alert: tmp.kua.proofs.canBuyUpgs.auto }" v-if="Decimal.gte(player.gameProgress.kua.proofs.strange.amount, 250) || player.gameProgress.unlocks.kproofs.finicky" @click="switchSubTab(-2, 1)" class="kuaButton2 fontVerdana whiteText normalTabButton">Automation</button>
                <button :class="{ alert: tmp.kua.proofs.canBuyUpgs.effect }" @click="switchSubTab(-1, 1)" class="kuaButton2 fontVerdana whiteText normalTabButton">Effects</button>
                <button :class="{ alert: tmp.kua.proofs.canBuyUpgs.kp }" @click="switchSubTab(0, 1)" class="kuaButton2 fontVerdana whiteText normalTabButton">KProof</button>
                <button :class="{ alert: tmp.kua.proofs.canBuyUpgs.skp }" v-if="player.gameProgress.unlocks.kproofs.strange" @click="switchSubTab(1, 1)" class="kuaButton2 fontVerdana whiteText normalTabButton">Strange KP</button>
                <button :class="{ alert: tmp.kua.proofs.canBuyUpgs.fkp }" v-if="player.gameProgress.unlocks.kproofs.finicky" @click="switchSubTab(2, 1)" class="kuaButton2 fontVerdana whiteText normalTabButton">Finicky KP</button>
            </div>
            <div class="flex-container" style="flex-direction: column" v-if="tab.tabList[tab.currentTab][1] === -2">
                <div class="flex-container" style="flex-direction: row; justify-content: center; font-size: 1.4vw; margin-bottom: 1vw;">
                    <button @click="switchSubTab(0, 2)" class="kuaButton2 fontVerdana whiteText normalTabButton">Other</button>
                    <button @click="switchSubTab(1, 2)" class="kuaButton2 fontVerdana whiteText normalTabButton">Effects</button>
                    <button @click="switchSubTab(2, 2)" class="kuaButton2 fontVerdana whiteText normalTabButton">KProof</button>
                    <button @click="switchSubTab(3, 2)" class="kuaButton2 fontVerdana whiteText normalTabButton">Strange KP</button>
                    <button v-if="player.gameProgress.unlocks.kproofs.finicky" @click="switchSubTab(4, 2)" class="kuaButton2 fontVerdana whiteText normalTabButton">Finicky KP</button>
                </div>
                <div class="flex-container fontVerdana" style="background-color: #222; margin-left: auto; margin-right: auto; flex-direction: column; border: 0.24vw solid #fff; padding: 0.6vw; height: 32vw; width: 40%;">
                    <span style="color: #ff0; text-align: center; font-size: 1.2vw">
                        You have 
                        <span style="font-size: 1.4vw"><b>{{ format(player.gameProgress.kua.proofs.strange.amount, 2) }}</b></span> 
                        Strange KProofs<sup>{{ format(tmp.kua.proofs.skpExp, 2) }}</sup>.
                    </span>
                    <div class="flex-container" style="margin-top: 0.4vw; flex-wrap: wrap; justify-content: center;">
                        <div v-for="(item, index) in KUA_PROOF_AUTO[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]]" :key="index">
                            <!-- set padding to 0vw because it auto-inserts padding -->
                            <button @click="buyKProofAuto(index, KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]])" :class="{ 
                                nope: !(
                                    Decimal.gte(player.gameProgress.kua.proofs.strange.amount, item.cost) || 
                                    player.gameProgress.kua.proofs.automationBought[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index]
                                    ) || (
                                        player.gameProgress.kua.proofs.automationBought[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index] && 
                                        !player.gameProgress.kua.proofs.automationEnabled[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index]
                                    ), 
                                ok: 
                                    Decimal.gte(player.gameProgress.kua.proofs.strange.amount, item.cost) && 
                                    !player.gameProgress.kua.proofs.automationBought[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index], 
                                done: 
                                    player.gameProgress.kua.proofs.automationBought[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index] && player.gameProgress.kua.proofs.automationEnabled[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index] }" 
                                :style="{ 
                                    backgroundColor: player.gameProgress.kua.proofs.automationBought[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index] 
                                        ? player.gameProgress.kua.proofs.automationEnabled[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index] 
                                            ? '#444' 
                                            : '#333'
                                        : '#222'
                                }" 
                                style="width: 12vw; height: 8vw; margin-left: 0.15vw; margin-right: 0.15vw; margin-bottom: 0.3vw; font-size: 0.7vw; transition: 0.2s;" class="fontVerdana whiteText">
                                <span class="vertical-align: top;">{{KUA_PROOF_AUTO[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index].desc}}</span>
                                <br><br>
                                <span v-if="!player.gameProgress.kua.proofs.automationBought[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index]" class="vertical-align: bottom;">Cost: <b><span style="font-size: 0.8vw; color: #fff">{{format(item.cost)}}</span></b> Strange KP.</span>
                                <span v-if="player.gameProgress.kua.proofs.automationBought[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index]" class="vertical-align: bottom;">Currently: <b><span style="font-size: 0.8vw; color: #fff">{{ player.gameProgress.kua.proofs.automationEnabled[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index] ? 'Enabled' : 'Disabled' }}</span></b><br></span>
                                <span v-if="player.gameProgress.kua.proofs.automationBought[KuaProofAutoTypeList[tab.tabList[tab.currentTab][2]]][index]" class="vertical-align: bottom;"><b><span style="font-size: 0.8vw; color: #fff">Bought!</span></b></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex-container" style="flex-direction: row; justify-content: center" v-if="tab.tabList[tab.currentTab][1] === -1">
                <div class="flex-container fontVerdana" style="background-color: #222; flex-direction: column; border: 0.24vw solid #fff; padding: 0.6vw; height: 32vw; width: 40%;">
                    <span style="color: #0ff; text-align: center; font-size: 1.2vw">
                        You have 
                        <span style="font-size: 1.4vw"><b>{{ format(player.gameProgress.kua.proofs.amount) }}</b></span> 
                        Kuaraniai Proofs<sup>{{ format(tmp.kua.proofs.exp, 2) }}</sup>.
                    </span>
                    <div class="flex-container" style="margin-top: 0.4vw; flex-wrap: wrap; justify-content: center;">
                        <div v-for="(item, index) in KUA_PROOF_UPGS.effect" :key="index">
                            <!-- set padding to 0vw because it auto-inserts padding -->
                            <button @click="buyKProofUpg(index, 'effect')" :class="{ nope: !tmp.kua.proofs.upgrades.effect[index].canBuy, ok: tmp.kua.proofs.upgrades.effect[index].canBuy}" :style="{ cursor: tmp.kua.proofs.upgrades.effect[index].canBuy ? 'pointer' : 'not-allowed' }" v-if="item.show" style="width: 12vw; height: 8vw; margin-left: 0.15vw; margin-right: 0.15vw; margin-bottom: 0.3vw; font-size: 0.55vw; transition: 0.2s; background-color: #303030" class="fontVerdana whiteText">
                                <span style="margin-right: 0.5vw; color: #fff; font-size: 0.65vw"><b>{{item.title}}</b></span><span class="whiteText">×{{ format(player.gameProgress.kua.proofs.upgrades.effect[index]) }}</span><span v-if="Decimal.gt(tmp.kua.proofs.upgrades.effect[index].freeExtra, 0)">+{{ format(tmp.kua.proofs.upgrades.effect[index].freeExtra, 2) }}</span><br>
                                <span>{{item.perDesc}}</span>
                                <br><br>
                                <span>Currently: <b style="font-size: 0.65vw;">{{item.desc}}</b></span><br>
                                <span>Cost: <b style="font-size: 0.65vw;">{{format(tmp.kua.proofs.upgrades.effect[index].cost)}}</b> KProofs.</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex-container" style="flex-direction: row; justify-content: center" v-if="tab.tabList[tab.currentTab][1] === 0">
                <div class="flex-container fontVerdana" style="background-color: #022; flex-direction: column; border: 0.24vw solid #0ff; padding: 0.6vw; height: 32vw; width: 40%;">
                    <span style="color: #0ff; text-align: center; font-size: 1.2vw">
                        You have 
                        <span style="font-size: 1.4vw"><b>{{ format(player.gameProgress.kua.proofs.amount) }}</b></span> 
                        Kuaraniai Proofs<sup>{{ format(tmp.kua.proofs.exp, 2) }}</sup>.
                    </span>
                    <span v-if="Decimal.gte(player.gameProgress.kua.proofs.amount, getSCSLAttribute('kp', false)[0].start)" style="color: #ff0; text-align: center; font-size: 0.7vw">
                        Your KProofs are getting stale at <span style="font-size: 0.8vw"><b>{{ format(getSCSLAttribute("kp", false)[0].start) }}</b></span>, which is dividing your KProof gain by <span style="font-size: 0.8vw"><b>{{ getSCSLAttribute("kp", false)[0].displayedEffect }}</b></span>!
                    </span>
                    <span v-if="Decimal.gte(player.gameProgress.kua.proofs.amount, getSCSLAttribute('kp', false)[1].start)" style="color: #f80; text-align: center; font-size: 0.7vw">
                        Your KProofs are getting outdated at <span style="font-size: 0.8vw"><b>{{ format(getSCSLAttribute("kp", false)[1].start) }}</b></span>, which is rooting your KProof gain by <span style="font-size: 0.8vw"><b>{{ getSCSLAttribute("kp", false)[1].displayedEffect }}</b></span>!
                    </span>
                    <span class="fontVerdana whiteText" style="font-size: 0.7vw; text-align: center">KProofs are being multiplied by {{ format(tmp.kua.proofs.expPerSec, 2) }}× every second.</span>
                    <div class="flex-container" style="margin-top: 0.4vw; flex-wrap: wrap; justify-content: center;">
                        <div v-for="(item, index) in KUA_PROOF_UPGS.kp" :key="index">
                            <!-- set padding to 0vw because it auto-inserts padding -->
                            <button @click="buyKProofUpg(index, 'kp')" :class="{ nope: !tmp.kua.proofs.upgrades.kp[index].canBuy, ok: tmp.kua.proofs.upgrades.kp[index].canBuy}" :style="{ cursor: tmp.kua.proofs.upgrades.kp[index].canBuy ? 'pointer' : 'not-allowed' }" v-if="item.show" style="width: 12vw; height: 8vw; margin-left: 0.15vw; margin-right: 0.15vw; margin-bottom: 0.3vw; font-size: 0.55vw; transition: 0.2s; background-color: #003030" class="fontVerdana whiteText">
                                <span style="margin-right: 0.5vw; color: #0ff; font-size: 0.65vw"><b>{{item.title}}</b></span><span class="whiteText">×{{ format(player.gameProgress.kua.proofs.upgrades.kp[index]) }}</span><span v-if="Decimal.gt(tmp.kua.proofs.upgrades.kp[index].freeExtra, 0)">+{{ format(tmp.kua.proofs.upgrades.kp[index].freeExtra, 2) }}</span><br>
                                <span>{{item.perDesc}}</span>
                                <br><br>
                                <span>Currently: <b style="font-size: 0.65vw;">{{item.desc}}</b></span><br>
                                <span>Cost: <b style="font-size: 0.65vw;">{{format(tmp.kua.proofs.upgrades.kp[index].cost)}}</b> KProofs.</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex-container" style="flex-direction: row; justify-content: center" v-if="tab.tabList[tab.currentTab][1] === 1">
                <div class="flex-container fontVerdana" style="background-color: #220; flex-direction: column; border: 0.24vw solid #ff0; padding: 0.6vw; height: 38vw; width: 40%;">
                    <span style="color: #ff0; text-align: center; font-size: 1.2vw">
                        You have 
                        <span style="font-size: 1.4vw"><b>{{ format(player.gameProgress.kua.proofs.strange.amount, 2) }}</b></span> 
                        Strange KProofs<sup>{{ format(tmp.kua.proofs.skpExp, 2) }}</sup>, which adds <span style="font-size: 1.4vw"><b>{{ format(tmp.kua.proofs.skpEff, 2) }}</b></span> free levels to the first 3 KProof upgrades.
                    </span>
                    <span v-if="Decimal.gte(player.gameProgress.kua.proofs.strange.amount, getSCSLAttribute('skp', false)[0].start)" style="color: #ff0; text-align: center; font-size: 0.7vw">
                        Your Strange KProofs are getting odd at <span style="font-size: 0.8vw"><b>{{ format(getSCSLAttribute("skp", false)[0].start) }}</b></span>, which is dividing your Strange KProof gain by <span style="font-size: 0.8vw"><b>{{ getSCSLAttribute("skp", false)[0].displayedEffect }}</b></span>!
                    </span>
                    <span v-if="Decimal.gte(player.gameProgress.kua.proofs.strange.amount, getSCSLAttribute('skp', false)[1].start)" style="color: #f80; text-align: center; font-size: 0.7vw">
                        Your Strange KProofs are getting unstable at <span style="font-size: 0.8vw"><b>{{ format(getSCSLAttribute("skp", false)[1].start) }}</b></span>, which is rooting your Strange KProof gain by <span style="font-size: 0.8vw"><b>{{ getSCSLAttribute("skp", false)[1].displayedEffect }}</b></span>!
                    </span>
                    <span style="color: #ff0; text-align: center; font-size: 0.75vw">
                        You have SKP reset
                        <span style="font-size: 0.85vw"><b>{{ format(player.gameProgress.kua.proofs.strange.times) }}</b></span> 
                        times.
                    </span>
                    <button @click="resetFromSKP(true, true, true, 1)" class="whiteText fontVerdana" style="border: 0.18vw solid #ff0; background-color: #440; font-size: 0.8vw; margin-left: auto; margin-right: auto; margin-top: 1.2vw; padding-top: 0.75vw; padding-bottom: 0.75vw; padding-right: 1.5vw; padding-left: 1.5vw;"> 
                        Add <span style="font-size: 1vw"><b>{{ format(getStrangeKPExp(tmp.kua.proofs.exp.add(player.gameProgress.kua.proofs.strange.hiddenExp), false).sub(getStrangeKPExp(player.gameProgress.kua.proofs.strange.hiddenExp, false)), 2) }}</b></span> to Strange KProof's exponent and add 1 second of it.<br>
                        <span v-if="Decimal.lte(player.gameProgress.kua.proofs.strange.cooldown, 0) && Decimal.gte(tmp.kua.proofs.exp, 12)">This will reset KProof progress, but will not reset Effects progress.<br></span>
                        <span v-if="Decimal.lt(tmp.kua.proofs.exp, 12)">You cannot SKP reset until you get {{ format(12) }} KP exponent!<br></span>
                        <span v-if="Decimal.gt(player.gameProgress.kua.proofs.strange.cooldown, 0)">You cannot SKP reset for {{ formatTime(player.gameProgress.kua.proofs.strange.cooldown) }}!<br></span>
                    </button>
                    <div class="flex-container" style="margin-top: 0.4vw; flex-wrap: wrap; justify-content: center;">
                        <div v-for="(item, index) in KUA_PROOF_UPGS.skp" :key="index">
                            <!-- set padding to 0vw because it auto-inserts padding -->
                            <button @click="buyKProofUpg(index, 'skp')" :class="{ nope: !tmp.kua.proofs.upgrades.skp[index].canBuy, ok: tmp.kua.proofs.upgrades.skp[index].canBuy}" :style="{ cursor: tmp.kua.proofs.upgrades.skp[index].canBuy ? 'pointer' : 'not-allowed' }" v-if="item.show" style="width: 12vw; height: 8vw; margin-left: 0.15vw; margin-right: 0.15vw; margin-bottom: 0.3vw; font-size: 0.55vw; transition: 0.2s; background-color: #303000" class="fontVerdana whiteText">
                                <span style="margin-right: 0.5vw; color: #ff0; font-size: 0.65vw"><b>{{item.title}}</b></span><span class="whiteText">×{{ format(player.gameProgress.kua.proofs.upgrades.skp[index]) }}</span><span v-if="Decimal.gt(tmp.kua.proofs.upgrades.skp[index].freeExtra, 0)">+{{ format(tmp.kua.proofs.upgrades.skp[index].freeExtra, 2) }}</span><br>
                                <span>{{item.perDesc}}</span>
                                <br><br>
                                <span>Currently: <b style="font-size: 0.65vw;">{{item.desc}}</b></span><br>
                                <span>Cost: <b style="font-size: 0.65vw;">{{format(tmp.kua.proofs.upgrades.skp[index].cost)}}</b> Strange KProofs.</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex-container" style="flex-direction: row; justify-content: center" v-if="tab.tabList[tab.currentTab][1] === 2">
                <div class="flex-container fontVerdana" style="background-color: #020; flex-direction: column; border: 0.24vw solid #0f0; padding: 0.6vw; height: 38vw; width: 40%;">
                    <span style="color: #0f0; text-align: center; font-size: 1.2vw">
                        You have 
                        <span style="font-size: 1.4vw"><b>{{ format(player.gameProgress.kua.proofs.finicky.amount, 2) }}</b></span> 
                        Finicky KProofs<sup>{{ format(tmp.kua.proofs.fkpExp, 2) }}</sup>, which adds <span style="font-size: 1.4vw"><b>{{ format(tmp.kua.proofs.fkpEff, 2) }}</b></span> to KP and SKP's exponents.
                    </span>
                    <span style="color: #0f0; text-align: center; font-size: 0.75vw">
                        You have FKP reset
                        <span style="font-size: 0.85vw"><b>{{ format(player.gameProgress.kua.proofs.finicky.times) }}</b></span> 
                        times.
                    </span>
                    <button @click="resetFromFKP(true, true, true, 1)" class="whiteText fontVerdana" style="border: 0.18vw solid #0f0; background-color: #040; font-size: 0.8vw; margin-left: auto; margin-right: auto; margin-top: 1.2vw; padding-top: 0.75vw; padding-bottom: 0.75vw; padding-right: 1.5vw; padding-left: 1.5vw;"> 
                        Add <span style="font-size: 1vw"><b>{{ format(getFinickyKPExp(Decimal.add(getFinickyKPExpGain(player.gameProgress.kua.proofs.strange.amount), player.gameProgress.kua.proofs.finicky.hiddenExp), false).sub(getFinickyKPExp(player.gameProgress.kua.proofs.finicky.hiddenExp, false)), 2) }}</b></span> to Finicky KProof's exponent and add <span style="font-size: 1vw"><b>{{ formatTime(getFinickySeconds(player.gameProgress.kua.proofs.strange.amount), 3) }}</b></span> of it.<br>
                        <span v-if="Decimal.lte(player.gameProgress.kua.proofs.finicky.cooldown, 0) && Decimal.gte(player.gameProgress.kua.proofs.strange.amount, 1e10)">This will reset SKP and KProof progress, but will not reset Effects progress.<br></span>
                        <span v-if="Decimal.lt(player.gameProgress.kua.proofs.strange.amount, 1e10)">You cannot FKP reset until you get {{ format(1e10) }} SKP!<br></span>
                        <span v-if="Decimal.gt(player.gameProgress.kua.proofs.finicky.cooldown, 0)">You cannot FKP reset for {{ formatTime(player.gameProgress.kua.proofs.finicky.cooldown) }}!<br></span>
                    </button>
                    <div class="flex-container" style="margin-top: 0.4vw; flex-wrap: wrap; justify-content: center;">
                        <div v-for="(item, index) in KUA_PROOF_UPGS.fkp" :key="index">
                            <!-- set padding to 0vw because it auto-inserts padding -->
                            <button @click="buyKProofUpg(index, 'fkp')" :class="{ nope: !tmp.kua.proofs.upgrades.fkp[index].canBuy, ok: tmp.kua.proofs.upgrades.fkp[index].canBuy}" :style="{ cursor: tmp.kua.proofs.upgrades.fkp[index].canBuy ? 'pointer' : 'not-allowed' }" v-if="item.show" style="width: 12vw; height: 8vw; margin-left: 0.15vw; margin-right: 0.15vw; margin-bottom: 0.3vw; font-size: 0.55vw; transition: 0.2s; background-color: #003000" class="fontVerdana whiteText">
                                <span style="margin-right: 0.5vw; color: #0f0; font-size: 0.65vw"><b>{{item.title}}</b></span><span class="whiteText">×{{ format(player.gameProgress.kua.proofs.upgrades.fkp[index]) }}</span><span v-if="Decimal.gt(tmp.kua.proofs.upgrades.fkp[index].freeExtra, 0)">+{{ format(tmp.kua.proofs.upgrades.fkp[index].freeExtra, 2) }}</span><br>
                                <span>{{item.perDesc}}</span>
                                <br><br>
                                <span>Currently: <b style="font-size: 0.65vw;">{{item.desc}}</b></span><br>
                                <span>Cost: <b style="font-size: 0.65vw;">{{format(tmp.kua.proofs.upgrades.fkp[index].cost)}}</b> Finicky KProofs.</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div v-if="tmp.kua.proofs.upgrades.fkp[0].trueLevel.gt(0)" class="flex-container fontVerdana" style="background-color: #020; flex-direction: column; border: 0.24vw solid #0f0; padding: 0.6vw; height: 40vw; width: 40%;">

                </div>
            </div>
        </div>
        <div class="flex-container" style="flex-direction: row" v-if="tab.tabList[tab.currentTab][0] === 99">
            <div class="flex-container" style="margin-left: auto; margin-right: auto; flex-direction: row; flex-wrap: wrap; justify-content: center; margin-top: 1vw; margin-bottom: 1vw; width: 50vw; align-content: center;">
                <div v-for="(item, index) in KUA_ENHANCERS.sources" :key="index">
                    <div class="flex-container" style="flex-direction: column; margin: 0.2vw">
                        <button style="text-align: center; font-size: 0.6vw" :class="{ nope: !tmp.kua.sourcesCanBuy[index], ok: tmp.kua.sourcesCanBuy[index] }" class="whiteText mediumButton fontVerdana kuaButton" @click="buyKuaEnhSourceUPG(index)">
                            <h3 style="margin-top: 0.5vw; font-size: 0.75vw">
                                Enhancer Source {{ index + 1 }}:
                                {{ format(player.gameProgress.kua.enhancers.sources[index]) }}
                            </h3>
                            +1 Enhancer.
                            <br><span>Cost: {{ format(item.cost(player.gameProgress.kua.enhancers.sources[index]), 2) }} {{ item.sourceName }}</span>
                        </button>
                    </div>
                </div>
                <button style="text-align: center; font-size: 0.5vw" :class="{ nopeFill: !player.gameProgress.kua.enhancers.autoSources, okFill: player.gameProgress.kua.enhancers.autoSources }" class="whiteText thinMediumButton fontVerdana kuaButton2" v-if="false" @click=" player.gameProgress.kua.enhancers.autoSources = !player.gameProgress.kua.enhancers.autoSources">
                    <b>Enhancer Sources Autobuyer:{{ player.gameProgress.kua.enhancers.autoSources ? "On" : "Off" }}</b>
                </button>
                <div class="flex-container" style="flex-direction: column; align-items: center">
                    <div class="flex-container" style="flex-direction: column; align-items: center">
                        <span style="font-size: 0.75vw; text-align: center" class="whiteText fontVerdana">
                            You have {{ format(Decimal.sub(tmp.kua.totalEnhSources, tmp.kua.enhSourcesUsed)) }} / {{ format(tmp.kua.totalEnhSources) }} Enhancers.
                        </span>
                        <span style="font-size: 0.75vw; text-align: center" class="whiteText fontVerdana">
                            You may only allocate a total {{ format(Decimal.mul(player.gameProgress.kua.enhancers.xpSpread, 100)) }}% of power to your enhancers.
                        </span>
                        <span style="font-size: 0.75vw; text-align: center" class="whiteText fontVerdana" v-if="tmp.kua.enhShowSlow">
                            The enhancer XP is slowing down! (Strength: {{ format(tmp.kua.enhSlowdown, 2) }}%)
                        </span>
                    </div>
                    <button style="text-align: center; font-size: 0.55vw" class="whiteText thinMediumButton fontVerdana kuaButton2" @click="kuaEnhReset()">
                        Unallocate every enhancer.
                    </button>
                </div>
            </div>
            <div class="flex-container" style="flex-direction: column; align-items: center">
                <div v-for="(item, index) in KUA_ENHANCERS.enhances" :key="index">
                    <div class="flex-container" v-if="Decimal.gte(tmp.kua.totalEnhSources, index * 3)">
                        <div :style="{ color: item.color, border: `0.2vw solid ${item.color}`, backgroundColor: `${colorChange(item.color, 0.25, 1.0)}` }" style="margin-top: -0.3vw; width: 30vw; height: 6vw; text-align: center">
                            <div class="flex-container" style="flex-direction: column; margin: 0.5vw; margin-top: 0vw">
                                <span style="margin-top: 0.3vw; font-size: 1vw">
                                    <b>
                                        Enhancer {{ index + 1 }} ×{{ format(player.gameProgress.kua.enhancers.enhancers[index]) }} (Power: {{ format(tmp.kua.trueEnhPower[index].mul(100), 2) }}%)
                                    </b>
                                </span>
                                <div class="flex-container" style="justify-content: space-between; margin-top: 0.3vw">
                                    <div class="slidecontainer" style="width: 12vw">
                                        <input class="slider" type="range" v-model="player.gameProgress.kua.enhancers.enhancePow[index]"/>
                                        <!-- <Tooltip :display="`${value}`" :class="{ fullWidth: !title }" :direction="Direction.Down">
                                            <input type="range" class="slider" v-model="value" :min="min" :max="max"  />
                                        </Tooltip>                                         -->
                                    </div>
                                    <div class="flex-container" style="flex-direction: column">
                                        <span style="font-size: 1vw">XP: {{ format(player.gameProgress.kua.enhancers.enhanceXP[index], 2) }} ({{ format(tmp.kua.kuaTrueSourceXPGen[index], 2) }}/s)</span>
                                        <span style="font-size: 0.7vw">{{ item.desc }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button @click="kuaEnh(index, Infinity)" :style="{ color: item.color, border: `0.2vw solid ${item.color}`, backgroundColor: `${colorChange(item.color, 0.25, 1.0)}` }" class="fontVerdana whiteText enhAllocButton" >
                            Add All
                        </button>
                        <button @click="kuaEnh(index, 1)" :style="{ color: item.color, border: `0.2vw solid ${item.color}`, backgroundColor: `${colorChange(item.color, 0.25, 1.0)}` }" class="fontVerdana whiteText enhAllocButton" >
                            Add 1
                        </button>
                        <button @click="kuaEnh(index, -1)" :style="{ color: item.color, border: `0.2vw solid ${item.color}`, backgroundColor: `${colorChange(item.color, 0.25, 1.0)}` }" class="fontVerdana whiteText enhAllocButton" >
                            Remove 1
                        </button>
                        <button @click="kuaEnh(index, -Infinity)" :style="{ color: item.color, border: `0.2vw solid ${item.color}`, backgroundColor: `${colorChange(item.color, 0.25, 1.0)}` }" class="fontVerdana whiteText enhAllocButton" >
                            Remove All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.enhAllocButton {
    margin-top: -0.3vw;
    margin-left: -0.3vw;
    width: 6vw;
    height: 6.35vw;
    text-align: center;
    font-size: 1vw;
}
.kuaBlessingActiveButton {
    margin-top: 0.4vw; 
    margin-left: auto; 
    margin-right: auto; 
    text-align: center; 
    font-size: 0.65vw; 
    border: 0.18vw solid #0f4; 
    background-color: #041; 
    width: 12vw; 
    height: 2vw;
    transition: 0.2s;
}
.kuaBlessingActiveButton:hover {
    background-color: #082;
    cursor: pointer;
}
</style>