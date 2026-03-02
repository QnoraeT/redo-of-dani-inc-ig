<script setup lang="ts">
import { tab } from "@/main";
import { tmp, player } from "@/main";
import { format } from "@/format";
import { switchSubTab } from "@/components/MainTabs/MainTabs";
import { buyGroEqu, buyGroEquCancel, buyGroGal, buyGroTick, buyGroUpg, buyMaxAllGroEqu, GROWAN_DATA, GROWAN_MILESTONES, GROWAN_UPGS, hasGrowanMilestone, respecAllGroUpgs } from "./Game_Growan";
import Decimal from "break_eternity.js";
import { resetStage } from "@/resets";
</script>
<template>
    <div id="growan" v-if="tab.currentTab === 7">
        <div class="flex-vertical">
            <div class="flex-horizontal" style="font-size: 1.4vw; margin-bottom: 1vw;"> 
                <button @click="switchSubTab(0, 0)" style="color: #fa8" class="normalTabButton smallGroBorder groButton font0"> 
                    Equations
                </button> 
                <button @click="switchSubTab(1, 0)" style="color: #fa8" class="normalTabButton smallGroBorder groButton font0" > 
                    Upgrades
                </button>
                <button @click="switchSubTab(2, 0)" style="color: #fa8" class="normalTabButton smallGroBorder groButton font0" > 
                    Milestones
                </button>
            </div>
            <span style="text-shadow: #840 0vw 0vw 0.8vw; color: #840; text-align: center; font-size: 1.2vw;" class="font0">
                You have <span style="font-size: 1.5vw" ><b>{{ format(player.prog.layer4.gro.amount, 3) }}</b></span> grōwan.
            </span>
            <span style="text-shadow: #840 0vw 0vw 0.8vw; color: #840; text-align: center; font-size: 0.8vw;" class="font0">
                You have <span style="font-size: 1.0vw" ><b>{{ format(player.prog.layer4.gro.totalAmt, 3) }}</b></span> total grōwan, which is multiplying all Grōwan equations by <b><span style="font-size: 1.0vw">{{ format(tmp.layer4.growan.eff.groMult, 2) }}×</span></b> and multiplying Kuaraniai gain by <b><span style="font-size: 1.0vw">{{ format(tmp.layer4.growan.eff.kuaGain, 2) }}×</span></b>.
            </span>
            <button @click="resetStage('growan')" class="whiteText smallGroBorder groButton font0" style="height: 4vw; width: 30vw; font-size: 0.8vw; margin-left: auto; margin-right: auto; margin-top: 1.5vw;"> 
                <span v-if="tmp.layer4.growan.canDo">Gain <span style="font-size: 1vw"><b>{{ format(tmp.layer4.growan.pending, 3) }}</b></span> grōwan upon grōwanize.<br></span>
                <span v-if="!tmp.layer4.growan.canDo">You need <span style="font-size: 1vw"><b>{{ format(tmp.layer4.growan.nextAt) }}</b></span> Kuaraniai to gain more grōwan.<br></span>
                <span v-if="player.prog.layer4.pickedFirst === 0">Warning: If you grōwan reset, you will be locked out of Taxation!<br></span>
                <span style="font-size: 0.55vw">This is a layer 4 reset, and will reset all prior layers. You can reset even if you won't gain any grōwan.</span>
            </button>
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 0" class="flex-vertical" style="justify-content: center; margin-bottom: 1vw">
            <span style="text-shadow: #840 0vw 0vw 0.8vw; color: #840; text-align: center; font-size: 0.9vw; margin-top: 1vw" class="font0">
                You have <span style="font-size: 1.2vw" ><b>{{ format(player.prog.layer4.gro.gEAmount) }}</b></span> grōwan solutions, which boosts PRai effect by <b><span style="font-size: 1.2vw">^{{ format(tmp.layer4.growan.solEff.prai, 3) }}</span></b>.
            </span>
            <span style="text-shadow: #840 0vw 0vw 0.8vw; color: #840; text-align: center; font-size: 0.8vw; margin-top: 0.2vw" class="font0">
                You have a best grōwan solution amount of <span style="font-size: 0.9vw" ><b>{{ format(player.prog.layer4.gro.bestGEA) }}</b></span>.
            </span>
            <span style="text-shadow: #840 0vw 0vw 0.8vw; color: #840; text-align: center; font-size: 0.8vw; margin-top: 0.2vw" class="font0">
                Mult per bought: {{ format(GROWAN_DATA.equ.multPerBought.value, 2) }}×
            </span>
            <span v-if="Decimal.gte(player.prog.layer4.gro.growanEqu[3].bought, 1) || Decimal.gte(player.prog.layer4.gro.equCancel, 1)" style="text-shadow: #840 0vw 0vw 0.8vw; color: #840; text-align: center; font-size: 0.8vw; margin-top: 0.2vw" class="font0">
                Grōwan Cancellation Effect: -{{ format(GROWAN_DATA.equCancel.eff.value, 2) }} (-{{ format(GROWAN_DATA.equCancel.effPer.value, 2) }} per.)
            </span>
            <div class="flex-vertical" style="margin-left: auto; margin-right: auto; width: 66.7vw; margin-top: 1vw;">
                <button @click="buyMaxAllGroEqu()" class="whiteText smallGroBorder groButton font0" style="font-size: 0.8vw; height: 1.5vw; width: 8vw; margin-left: auto; margin-right: auto; margin-bottom: 1.0vw">
                    Buy Max
                </button>
                <button @click="buyGroTick()" v-if="Decimal.gte(player.prog.layer4.gro.growanEqu[3].bought, 1)" class="whiteText smallGroBorder groButton font0" :class="{ nope: Decimal.lt(player.prog.layer4.gro.gEAmount, GROWAN_DATA.tick.cost.value), ok: Decimal.gte(player.prog.layer4.gro.gEAmount, GROWAN_DATA.tick.cost.value) }" style="font-size: 0.8vw; height: 3vw; margin-left: auto; margin-right: auto; text-align: center; margin-bottom: 1.0vw">
                    Multiply all equations by {{ format(GROWAN_DATA.tick.eff.value, 3) }}×. ({{ format(GROWAN_DATA.tick.effPer.value, 3) }}× per.)<br>
                    Cost: {{ format(GROWAN_DATA.tick.cost.value) }} Grōwan Solutions
                </button>
                <div v-for="index in GROWAN_DATA.equ.list.length" :key="index" style="width: 100%">
                    <div v-if="index === 1 ? true : Decimal.gte(player.prog.layer4.gro.growanEqu[index - 2].bought, 1)" class="flex-horizontal" style="margin: 0.2vw">
                        <span class="font0" style="font-size: 1.0vw; color: #fa8; flex-grow: 1; flex-basis: 0; text-align: left;">
                            Grōwan Equation {{ index }}: {{ format(Decimal.add(player.prog.layer4.gro.growanEqu[index - 1].bought, player.prog.layer4.gro.growanEqu[index - 1].accumulated)) }} ( {{ format(player.prog.layer4.gro.growanEqu[index - 1].bought) }} )
                        </span>
                        <span class="font0" style="font-size: 1.0vw; color: #fa8; flex-grow: 1; flex-basis: 0; text-align: center;">
                            ×{{ format(GROWAN_DATA.equ.list[index - 1].mult.value, 2) }}
                        </span>
                        <button @click="buyGroEqu(index - 1)" :class="{ nope: Decimal.lt(player.prog.layer4.gro.gEAmount, GROWAN_DATA.equ.list[index - 1].cost.value), ok: Decimal.gte(player.prog.layer4.gro.gEAmount, GROWAN_DATA.equ.list[index - 1].cost.value) }" class="whiteText smallGroBorder groButton font0" style="font-size: 0.8vw; height: 1.5vw; flex-grow: 1; flex-basis: 0; text-align: right; margin-left: auto;">
                            Cost: {{ format(GROWAN_DATA.equ.list[index - 1].cost.value) }} Grōwan Solutions
                        </button>
                    </div>
                </div>
                <button @click="buyGroEquCancel()" v-if="Decimal.gte(player.prog.layer4.gro.growanEqu[3].bought, 1) || Decimal.gte(player.prog.layer4.gro.equCancel, 1)" class="whiteText smallGroBorder groButton font0" :class="{ nope: Decimal.lt(player.prog.layer4.gro.growanEqu[Decimal.add(player.prog.layer4.gro.equCancel, 3).min(7).toNumber()].bought, GROWAN_DATA.equCancel.cost.value), ok: Decimal.gte(player.prog.layer4.gro.growanEqu[Decimal.add(player.prog.layer4.gro.equCancel, 3).min(7).toNumber()].bought, GROWAN_DATA.equCancel.cost.value) }" style="font-size: 0.8vw; height: 3vw; margin-left: auto; margin-right: auto; text-align: center; margin-top: 1.0vw">
                    Decrease Grōwan Equation {{ Decimal.gt(player.prog.layer4.gro.equCancel, 0) ? `1-${new Decimal(player.prog.layer4.gro.equCancel).min(7).toNumber() + 1}` : '1' }} costs<span v-if="Decimal.lt(player.prog.layer4.gro.equCancel, 4)">, and decrease Grōwan Equation {{ format(Decimal.add(player.prog.layer4.gro.equCancel, 5)) }}'s cost greatly</span>.<br>
                    Cost: {{ format(GROWAN_DATA.equCancel.cost.value) }} Grōwan Equation {{ format(Decimal.add(player.prog.layer4.gro.equCancel, 4).min(8)) }}
                </button>
                <button @click="buyGroGal()" v-if="Decimal.gte(player.prog.layer4.gro.growanEqu[7].bought, 1) || Decimal.gte(player.prog.layer4.gro.gal, 1)" class="whiteText smallGroBorder groButton font0" :class="{ nope: Decimal.lt(player.prog.layer4.gro.growanEqu[7].bought, GROWAN_DATA.gal.cost.value), ok: Decimal.gte(player.prog.layer4.gro.growanEqu[7].bought, GROWAN_DATA.gal.cost.value) }" style="font-size: 0.8vw; height: 3vw; margin-left: auto; margin-right: auto; text-align: center; margin-top: 0.5vw">
                    Increase the 'Multiply all equations' multiplier by ^{{ format(GROWAN_DATA.gal.eff.value, 3) }}. (+^{{ format(GROWAN_DATA.gal.effPer.value, 3) }} per.)<br>
                    Cost: {{ format(GROWAN_DATA.gal.cost.value) }} Grōwan Equation 8
                </button>
            </div>
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 1" class="flex-vertical" style="margin-bottom: 1vw">
            <!-- <span style="text-shadow: #840 0vw 0vw 0.8vw; color: #c60; text-align: center; font-size: 0.9vw; margin-top: 0.2vw" class="font0">
                Idle and Active upgrades increase the other's cost by +{{ format(1) }} each and both increase Normal Upgrade costs by +{{ format(2) }} each!
            </span> -->
            <button @click="respecAllGroUpgs()" v-if="player.prog.layer4.gro.upgrades.active.length > 0 || player.prog.layer4.gro.upgrades.overall.length > 0 || player.prog.layer4.gro.upgrades.idle.length > 0" class="whiteText smallGroBorder groButton font0" style="margin-top: 1vw; margin-bottom: 1vw; margin-left: auto; margin-right: auto; border: 0.24vw solid #840; width: 27.5vw; text-align: center; background-color: #210; font-size: 0.75vw">
                Respec all Grōwan upgrades.<br>
                Warning: This will cause a grōwan reset!
            </button>
            <div class="flex-horizontal">
                <div class="flex-vertical" style="background-color: #300; border: 0.24vw solid #c00; width: 30vw; margin: 0.25vw">
                    <span class="whiteText font0" style="font-size: 1.0vw">You have bought {{ player.prog.layer4.gro.upgrades.active.length }} active upgrades.</span>
                    <div v-for="(item, index) in GROWAN_UPGS.active" :key="index">
                        <button
                            v-if="item.cost.sub(tmp.layer4.growan.pending).lt(player.prog.layer4.gro.totalAmt)"
                            @click="buyGroUpg('active', index)"
                            style="border: 0.24vw solid #c00; width: 27.5vw; margin: 0.25vw; text-align: center;" 
                            :style="{
                                cursor: Decimal.gte(player.prog.layer4.gro.amount, item.cost.add(GROWAN_DATA.upgCostModif.active.value)) && !player.prog.layer4.gro.upgrades.active.includes(index)
                                    ? 'pointer'
                                    : 'not-allowed',
                                backgroundColor: 
                                    player.prog.layer4.gro.upgrades.active.includes(index) 
                                        ? '#600' 
                                        : Decimal.gte(player.prog.layer4.gro.amount, item.cost.add(GROWAN_DATA.upgCostModif.active.value)) 
                                            ? '#400' 
                                            : '#200' 
                            }">
                            <span class="font0 whiteText" style="font-size: 0.75vw">{{ item.desc.value }}<br><br></span>
                            <span class="font0 whiteText" style="font-size: 1.0vw">Cost: {{ format(item.cost.add(GROWAN_DATA.upgCostModif.active.value)) }} Grōwan</span>
                        </button>
                    </div>
                </div>
                <div class="flex-vertical" style="background-color: #210; border: 0.24vw solid #840; width: 30vw; margin: 0.25vw">
                    <span class="whiteText font0" style="font-size: 1.0vw">You have bought {{ player.prog.layer4.gro.upgrades.overall.length }} normal upgrades.</span>
                    <div v-for="(item, index) in GROWAN_UPGS.overall" :key="index">
                        <button
                            v-if="item.cost.sub(tmp.layer4.growan.pending).lt(player.prog.layer4.gro.totalAmt)"
                            @click="buyGroUpg('overall', index)"
                            style="border: 0.24vw solid #840; width: 27.5vw; margin: 0.25vw; text-align: center;" 
                            :style="{
                                cursor: Decimal.gte(player.prog.layer4.gro.amount, item.cost.add(GROWAN_DATA.upgCostModif.overall.value)) && !player.prog.layer4.gro.upgrades.overall.includes(index)
                                    ? 'pointer'
                                    : 'not-allowed',
                                backgroundColor: 
                                    player.prog.layer4.gro.upgrades.overall.includes(index) 
                                        ? '#630' 
                                        : Decimal.gte(player.prog.layer4.gro.amount, item.cost.add(GROWAN_DATA.upgCostModif.overall.value)) 
                                            ? '#420' 
                                            : '#210' 
                            }">
                            <span class="font0 whiteText" style="font-size: 0.75vw">{{ item.desc.value }}<br><br></span>
                            <span class="font0 whiteText" style="font-size: 1.0vw">Cost: {{ format(item.cost.add(GROWAN_DATA.upgCostModif.overall.value)) }} Grōwan</span>
                        </button>
                    </div>
                </div>
                <div class="flex-vertical" style="background-color: #023; border: 0.24vw solid #06c; width: 30vw; margin: 0.25vw">
                    <span class="whiteText font0" style="font-size: 1.0vw">You have bought {{ player.prog.layer4.gro.upgrades.idle.length }} idle upgrades.</span>
                    <div v-for="(item, index) in GROWAN_UPGS.idle" :key="index">
                        <button
                            v-if="item.cost.sub(tmp.layer4.growan.pending).lt(player.prog.layer4.gro.totalAmt)"
                            @click="buyGroUpg('idle', index)"
                            style="border: 0.24vw solid #08c; width: 27.5vw; margin: 0.25vw; text-align: center;" 
                            :style="{
                                cursor: Decimal.gte(player.prog.layer4.gro.amount, item.cost.add(GROWAN_DATA.upgCostModif.idle.value)) && !player.prog.layer4.gro.upgrades.idle.includes(index)
                                    ? 'pointer'
                                    : 'not-allowed',
                                backgroundColor: 
                                    player.prog.layer4.gro.upgrades.idle.includes(index) 
                                        ? '#036' 
                                        : Decimal.gte(player.prog.layer4.gro.amount, item.cost.add(GROWAN_DATA.upgCostModif.idle.value)) 
                                            ? '#024' 
                                            : '#012' 
                            }">
                            <span class="font0 whiteText" style="font-size: 0.75vw">{{ item.desc.value }}<br><br></span>
                            <span class="font0 whiteText" style="font-size: 1.0vw">Cost: {{ format(item.cost.add(GROWAN_DATA.upgCostModif.idle.value)) }} Grōwan</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 2" class="flex-horizontal" style="flex-wrap: wrap; margin-bottom: 1vw">
            <div v-for="(item, index) in GROWAN_MILESTONES" :key="index">
                <div v-if="index === 0 || hasGrowanMilestone(index - 1)" class="whiteText font0 flex-vertical" :style="{ backgroundColor: hasGrowanMilestone(index) ? '#632f00' : '#422000' }" style="width: 20vw; height: 4.5vw; font-size: 0.65vw; margin: 0.24vw; border: 0.18vw solid #c36100;">
                    <span class="font0 whiteText" style="text-align: center">{{ item.desc }}<br><br></span>
                    <span class="font0 whiteText" style="text-align: center; font-size: 0.8vw;">Requirement: <b>{{ format(item.req) }}</b> total grōwan</span>
                    <!-- <span v-if="tmp.layer4.growan.canDo">Gain <span style="font-size: 1vw"><b>{{ format(tmp.layer4.growan.pending, 3) }}</b></span> grōwan upon grōwanize.<br></span>
                    <span v-if="!tmp.layer4.growan.canDo">You need <span style="font-size: 1vw"><b>{{ format(tmp.layer4.growan.nextAt) }}</b></span> Kuaraniai to gain more grōwan.<br></span>
                    <span v-if="player.gameProgress.layer4.pickedFirst === 0">Warning: If you grōwan reset, you will be locked out of Taxation!<br></span>
                    <span style="font-size: 0.55vw">This is a layer 4 reset, and will reset all prior layers. You can reset even if you won't gain any grōwan.</span> -->
                </div>
            </div>
        </div>
    </div>
</template>
