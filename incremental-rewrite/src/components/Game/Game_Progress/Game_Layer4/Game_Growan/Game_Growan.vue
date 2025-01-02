<script setup lang="ts">
import { tab } from "@/main";
import { tmp, player } from "@/main";
import { format } from "@/format";
import { switchSubTab } from "@/components/MainTabs/MainTabs";
import { buyGroEqu, buyGroEquCancel, buyGroTick, buyMaxAllGroEqu, GROWAN_DATA, GROWAN_UPGS } from "./Game_Growan";
import Decimal from "break_eternity.js";
import { resetStage } from "@/resets";
</script>
<template>
    <div id="growan" v-if="tab.currentTab === 7">
        <div class="flex-container" style="flex-direction: column">
            <div class="flex-container" style="flex-direction: row; justify-content: center; font-size: 1.4vw; margin-bottom: 1vw;"> 
                <button @click="switchSubTab(0, 0)" style="color: #fa8" class="normalTabButton smallGroBorder groButton fontVerdana"> 
                    Equations
                </button> 
                <button @click="switchSubTab(1, 0)" style="color: #fa8" class="normalTabButton smallGroBorder groButton fontVerdana" > 
                    Upgrades
                </button>
            </div>
            <span style="text-shadow: #840 0vw 0vw 0.8vw; color: #840; text-align: center; font-size: 1.2vw;" class="fontVerdana">
                You have <span style="font-size: 1.5vw" ><b>{{ format(player.gameProgress.layer4.gro.amount, 3) }}</b></span> grōwan, which is multiplying all Grōwan equations by <b><span style="font-size: 1.5vw">{{ format(tmp.layer4.growan.eff.groMult, 2) }}×</span></b> and multiplying Kuaraniai gain by <b><span style="font-size: 1.5vw">{{ format(tmp.layer4.growan.eff.kuaGain, 2) }}×</span></b>.
            </span>
            <button @click="resetStage('growan')" class="whiteText smallGroBorder groButton fontVerdana" style="height: 4vw; width: 30vw; font-size: 0.8vw; margin-left: auto; margin-right: auto; margin-top: 1.5vw;"> 
                <span v-if="tmp.layer4.growan.canDo">Gain <span style="font-size: 1vw" ><b>{{ format(tmp.layer4.growan.pending, 3) }}</b></span> grōwan upon grōwanize.<br></span>
                <span v-if="!tmp.layer4.growan.canDo">You need <span style="font-size: 1vw" ><b>{{ format(tmp.layer4.growan.nextAt) }}</b></span> Kuaraniai to preform a grōwanization!<br></span>
                <span v-if="player.gameProgress.layer4.pickedFirst === 0">Warning: If you grōwan reset, you will be locked out of Taxation!<br></span>
                This is a layer 4 reset, and will reset all prior layers.
            </button>
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 0" class="flex-container" style="flex-direction: column; justify-content: center; margin-bottom: 1vw">
            <span style="text-shadow: #840 0vw 0vw 0.8vw; color: #840; text-align: center; font-size: 0.9vw; margin-top: 1vw" class="fontVerdana">
                You have <span style="font-size: 1.2vw" ><b>{{ format(player.gameProgress.layer4.gro.gEAmount) }}</b></span> grōwan solutions, which boosts PRai effect by <b><span style="font-size: 1.2vw">^{{ format(tmp.layer4.growan.solEff.prai, 3) }}</span></b>.
            </span>
            <span style="text-shadow: #840 0vw 0vw 0.8vw; color: #840; text-align: center; font-size: 0.9vw; margin-top: 0.3vw" class="fontVerdana">
                Mult per bought: {{ format(GROWAN_DATA.equ.multPerBought.value, 2) }}×
            </span>
            <span style="text-shadow: #840 0vw 0vw 0.8vw; color: #840; text-align: center; font-size: 0.9vw; margin-top: 0.3vw" class="fontVerdana">
                Grōwan Cancellation Effect: -{{ format(GROWAN_DATA.equCancel.eff.value, 2) }} (-{{ format(GROWAN_DATA.equCancel.effPer.value, 2) }} per.)
            </span>
            <div class="flex-container" style="margin-left: auto; margin-right: auto; flex-direction: column; width: 66.7vw; margin-top: 1vw;">
                <button @click="buyMaxAllGroEqu()" class="whiteText smallGroBorder groButton fontVerdana" style="font-size: 0.8vw; height: 1.5vw; width: 8vw; margin-left: auto; margin-right: auto; margin-bottom: 1.0vw">
                    Buy Max
                </button>
                <button @click="buyGroTick()" v-if="Decimal.gte(player.gameProgress.layer4.gro.growanEqu[3].bought, 1)" class="whiteText smallGroBorder groButton fontVerdana" :class="{ nope: Decimal.lt(player.gameProgress.layer4.gro.gEAmount, GROWAN_DATA.tick.cost.value), ok: Decimal.gte(player.gameProgress.layer4.gro.gEAmount, GROWAN_DATA.tick.cost.value) }" style="font-size: 0.8vw; height: 3vw; margin-left: auto; margin-right: auto; text-align: center; margin-bottom: 1.0vw">
                    Multiply all equations by {{ format(GROWAN_DATA.tick.eff.value, 3) }}×. ({{ format(GROWAN_DATA.tick.effPer.value, 3) }}× per.)<br>
                    Cost: {{ format(GROWAN_DATA.tick.cost.value) }} Grōwan Solutions
                </button>
                <div v-for="index in GROWAN_DATA.equ.list.length" :key="index">
                    <div v-if="index === 1 ? true : Decimal.gte(player.gameProgress.layer4.gro.growanEqu[index - 2].bought, 1)" class="flex-container" style="margin: 0.2vw">
                        <span class="fontVerdana" style="font-size: 1.0vw; color: #fa8; flex-grow: 1; flex-basis: 0; text-align: left;">
                            Grōwan Equation {{ index }}: {{ format(Decimal.add(player.gameProgress.layer4.gro.growanEqu[index - 1].bought, player.gameProgress.layer4.gro.growanEqu[index - 1].accumulated)) }} ( {{ format(player.gameProgress.layer4.gro.growanEqu[index - 1].bought) }} )
                        </span>
                        <span class="fontVerdana" style="font-size: 1.0vw; color: #fa8; flex-grow: 1; flex-basis: 0; text-align: center;">
                            ×{{ format(GROWAN_DATA.equ.list[index - 1].mult.value, 2) }}
                        </span>
                        <button @click="buyGroEqu(index - 1)" :class="{ nope: Decimal.lt(player.gameProgress.layer4.gro.gEAmount, GROWAN_DATA.equ.list[index - 1].cost.value), ok: Decimal.gte(player.gameProgress.layer4.gro.gEAmount, GROWAN_DATA.equ.list[index - 1].cost.value) }" class="whiteText smallGroBorder groButton fontVerdana" style="font-size: 0.8vw; height: 1.5vw; flex-grow: 1; flex-basis: 0; text-align: right; margin-left: auto;">
                            Cost: {{ format(GROWAN_DATA.equ.list[index - 1].cost.value) }} Grōwan Solutions
                        </button>
                    </div>
                </div>
                <button @click="buyGroEquCancel()" v-if="Decimal.gte(player.gameProgress.layer4.gro.growanEqu[3].bought, 1) || Decimal.gte(player.gameProgress.layer4.gro.equCancel, 1)" class="whiteText smallGroBorder groButton fontVerdana" :class="{ nope: Decimal.lt(player.gameProgress.layer4.gro.growanEqu[Decimal.add(player.gameProgress.layer4.gro.equCancel, 3).min(7).toNumber()].bought, GROWAN_DATA.equCancel.cost.value), ok: Decimal.gte(player.gameProgress.layer4.gro.growanEqu[Decimal.add(player.gameProgress.layer4.gro.equCancel, 3).min(7).toNumber()].bought, GROWAN_DATA.equCancel.cost.value) }" style="font-size: 0.8vw; height: 3vw; margin-left: auto; margin-right: auto; text-align: center; margin-top: 1.0vw">
                    Decrease Grōwan Equation {{ Decimal.gt(player.gameProgress.layer4.gro.equCancel, 0) ? `1-${new Decimal(player.gameProgress.layer4.gro.equCancel).min(7).toNumber() + 1}` : '1' }} costs<span v-if="Decimal.lt(player.gameProgress.layer4.gro.equCancel, 4)">, and decrease Grōwan Equation {{ format(Decimal.add(player.gameProgress.layer4.gro.equCancel, 5)) }}'s cost greatly</span>.<br>
                    Cost: {{ format(GROWAN_DATA.equCancel.cost.value) }} Grōwan Equation {{ format(Decimal.add(player.gameProgress.layer4.gro.equCancel, 4).min(8)) }}
                </button>
                <button v-if="Decimal.gte(player.gameProgress.layer4.gro.growanEqu[7].bought, 1) || Decimal.gte(player.gameProgress.layer4.gro.equCancel, 1)" class="whiteText smallGroBorder groButton fontVerdana" :class="{ nope: Decimal.lt(player.gameProgress.layer4.gro.growanEqu[7].bought, GROWAN_DATA.gal.cost.value), ok: Decimal.gte(player.gameProgress.layer4.gro.growanEqu[7].bought, GROWAN_DATA.gal.cost.value) }" style="font-size: 0.8vw; height: 3vw; margin-left: auto; margin-right: auto; text-align: center; margin-top: 0.5vw">
                    Increase the 'Multiply all equations' multiplier by ^{{ format(GROWAN_DATA.gal.eff.value, 3) }}.<br>
                    Cost: {{ format(GROWAN_DATA.gal.cost.value) }} Grōwan Equation 8
                </button>
            </div>
            <!-- <div
                class="flex-container"
                style="
                    flex-wrap: wrap;
                    align-content: flex-start;
                    margin-top: 0.8vw;
                    background-color: #420;
                    border: 0.24vw solid #804000;
                    margin-left: auto;
                    margin-right: auto;
                    display: flex;
                    justify-content: center;
                    flex-direction: row;
                    padding: 0.6vw;
                    box-shadow: 0 0 0.8vw 0.24vw rgb(66, 25, 0);
                    height: 45vw;
                    width: 80vw;
                "
            >

            </div> -->
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 1" class="flex-container" style="flex-direction: column; justify-content: center; margin-bottom: 1vw">
            <div class="flex-container" style="justify-content: center">
                <div class="flex-container" style="justify-content: center; background-color: #300; border: 0.24vw solid #c00; width: 30vw; margin: 0.25vw">
                    <span class="whiteText fontVerdana" style="font-size: 1.0vw">You have bought {{ player.gameProgress.layer4.gro.upgrades[0] }} active upgrades.</span>
                    <div v-for="(item, index) in GROWAN_UPGS.active" :key="index">
                        
                    </div>
                </div>
                <div class="flex-container" style="justify-content: center; background-color: #210; border: 0.24vw solid #840; width: 30vw; margin: 0.25vw">
                    <span class="whiteText fontVerdana" style="font-size: 1.0vw">You have bought {{ player.gameProgress.layer4.gro.upgrades[1] }} normal upgrades.</span>
                </div>
                <div class="flex-container" style="justify-content: center; background-color: #023; border: 0.24vw solid #06c; width: 30vw; margin: 0.25vw">
                    <span class="whiteText fontVerdana" style="font-size: 1.0vw">You have bought {{ player.gameProgress.layer4.gro.upgrades[2] }} idle upgrades.</span>
                </div>
            </div>
        </div>
    </div>
</template>
