<script setup lang="ts">
import { tab } from "@/main";
import { tmp, player } from "@/main";
import { format } from "@/format";
import { switchSubTab } from "@/components/MainTabs/MainTabs";
import { GROWAN_DATA } from "./Game_Growan";
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
                You have <span style="font-size: 1.5vw" ><b>{{ format(player.gameProgress.layer4.gro.amount, 3) }}</b></span> grōwan, which is multiplying all Grōwan equations by <b><span style="font-size: 1.5vw">{{ format(tmp.layer4.growan.eff.groMult, 2) }}×</span></b>.
            </span>
            <button @click="resetStage('growan')" class="whiteText smallGroBorder groButton fontVerdana" style="height: 4vw; width: 30vw; font-size: 0.8vw; margin-left: auto; margin-right: auto; margin-top: 1.5vw;"> 
                <span v-if="tmp.layer4.growan.canDo">Gain <span style="font-size: 1vw" ><b>{{ format(tmp.layer4.growan.pending, 3) }}</b></span> grōwan upon grōwanize.<br></span>
                <span v-if="!tmp.layer4.growan.canDo">You need <span style="font-size: 1vw" ><b>{{ format(tmp.layer4.growan.nextAt, 3) }}</b></span> Kuaraniai to preform a grōwanization!<br></span>
                <span v-if="player.gameProgress.layer4.pickedFirst === 0">Warning: If you grōwan reset, you will be locked out of Taxation!<br></span>
                This is a layer 4 reset, and will reset all prior layers.
            </button>
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 0" class="flex-container" style="flex-direction: column; justify-content: center; margin-bottom: 1vw">
            <span style="text-shadow: #840 0vw 0vw 0.8vw; color: #840; text-align: center; font-size: 0.9vw; margin-top: 1vw" class="fontVerdana">
                You have <span style="font-size: 1.2vw" ><b>{{ format(player.gameProgress.layer4.gro.gEAmount, 3) }}</b></span> grōwan solutions, which boosts PRai effect by <b><span style="font-size: 1.2vw">^{{ format(tmp.layer4.growan.solEff.prai, 3) }}</span></b>.
            </span>
            <div class="flex-container" style="margin-left: auto; margin-right: auto; flex-direction: column; width: 60vw; margin-top: 1vw">
                <div v-for="index in GROWAN_DATA.equ.list.length" :key="index">
                    <div v-if="index === 1 ? true : Decimal.gte(player.gameProgress.layer4.gro.growanEqu[index - 2].bought, 1)" class="flex-container" style="margin: 0.2vw">
                        <span class="fontVerdana" style="font-size: 1.0vw; color: #fa8; flex-grow: 1; flex-basis: 0; text-align: left;">
                            Grōwan Equation {{ index }}: {{ format(player.gameProgress.layer4.gro.growanEqu[index - 1].accumulated) }}
                        </span>
                        <span class="fontVerdana" style="font-size: 1.0vw; color: #fa8; flex-grow: 1; flex-basis: 0; text-align: center;">
                            ×{{ format(GROWAN_DATA.equ.list[index - 1].mult.value, 2) }}
                        </span>
                        <button class="whiteText smallGroBorder groButton fontVerdana" style="font-size: 0.8vw; height: 1.5vw; width: 30%; flex-grow: 1; flex-basis: 0; text-align: right; margin-left: auto;">
                            Cost: {{ format(GROWAN_DATA.equ.list[index - 1].cost.value) }} Grōwan Solutions
                        </button>
                    </div>
                </div>
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
    </div>
</template>
