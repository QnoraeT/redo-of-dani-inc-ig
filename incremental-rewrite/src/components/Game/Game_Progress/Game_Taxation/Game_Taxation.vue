<script setup lang="ts">
import Decimal from "break_eternity.js";
import { tab } from "@/main";
import { tmp, player } from "@/main";
import { format } from "@/format";
import { getTaxUpgrade, TAX_UPGRADES } from "./Game_Taxation";
</script>
<template>
    <div id="taxation" v-if="tab.currentTab === 6">
        <div
            class="flex-container"
            style="flex-direction: column; justify-content: center; margin-bottom: 1vw"
        >
            <span
                style="
                    text-shadow: #ca0 0vw 0vw 0.8vw;
                    color: #fc0;
                    text-align: center;
                    font-size: 1.2vw;
                "
                class="fontVerdana"
                >You have
                <span style="font-size: 1.5vw"
                    ><b>{{ format(player.gameProgress.tax.amount, 3) }}</b></span
                >
                taxed coins, which boost your points gain by
                <b
                    ><span style="font-size: 1.5vw">{{ format(tmp.tax.ptsEff, 2) }}x.</span></b
                ></span
            >
            <button
                class="whiteText smallTaxBorder taxButton fontVerdana"
                style="
                    height: 4vw;
                    width: 20vw;
                    font-size: 0.8vw;
                    margin-left: auto;
                    margin-right: auto;
                    margin-top: 1.5vw;
                "
            >
                Gain
                <span style="font-size: 1vw"
                    ><b>{{ format(tmp.tax.pending, 3) }}</b></span
                >
                taxed coins upon taxation. <br />You will do a Colosseum reset.
            </button>
            <div
                class="flex-container"
                style="
                    flex-wrap: wrap;
                    align-content: flex-start;
                    margin-top: 0.8vw;
                    background-color: #430;
                    border: 0.24vw solid #ffd000;
                    margin-left: auto;
                    margin-right: auto;
                    display: flex;
                    justify-content: center;
                    flex-direction: row;
                    padding: 0.6vw;
                    box-shadow: 0 0 0.8vw 0.24vw rgb(66, 55, 0);
                    height: 45vw;
                    width: 80vw;
                "
            >
                <div v-for="(item, index) in TAX_UPGRADES" :key="index" class="flex-container">
                    <!-- set padding to 0vw because it auto-inserts padding -->
                    <button
                        v-bind:style="{
                            backgroundColor:
                                item.type === 0
                                    ? Decimal.gte(getTaxUpgrade(index), 1)
                                        ? '#847000'
                                        : '#634c00'
                                    : '#524300'
                        }"
                        v-if="item.show"
                        style="
                            width: 12vw;
                            height: 8vw;
                            margin-left: 0.24vw;
                            margin-right: 0.24vw;
                            font-size: 0.75vw;
                        "
                        class="smallTaxBorder taxButton fontVerdana whiteText"
                    >
                        <span
                            v-bind:style="{ color: item.type === 0 ? '#dd0' : '#ff8' }"
                            style="font-size: 0.75vw; margin-right: 0.5vw"
                            ><b
                                >#{{ index + 1 }} [{{
                                    item.type === 0 ? "One-Time" : "Repeatable"
                                }}]</b
                            ></span
                        ><br />
                        <span v-if="!item.implemented" style="color: #ff0; font-size: 0.5vw"
                            ><b>[ NOT IMPLEMENTED ]</b><br
                        /></span>
                        <span class="vertical-align: top;" style="font-size: 0.6vw">{{
                            item.desc
                        }}</span>
                        <br /><br />
                        <span
                            v-if="
                                (item.type === 0 && Decimal.lt(getTaxUpgrade(index), 1)) ||
                                item.type === 1
                            "
                            class="vertical-align: bottom;"
                            >Cost:
                            <b
                                ><span style="font-size: 0.9vw; color: #ff0">{{
                                    format(item.cost().ceil())
                                }}</span></b
                            >
                            coins.</span
                        >
                        <span
                            v-if="item.type === 0 && Decimal.gte(getTaxUpgrade(index), 1)"
                            class="vertical-align: bottom;"
                            ><b
                                ><span style="font-size: 0.75vw; color: #ff0">Bought!</span></b
                            ></span
                        >
                    </button>
                </div>
            </div>
            <!-- <div class="flex-container" style="flex-wrap: wrap; align-content: flex-start; margin-top: 1vw; margin-left: auto; margin-right: auto; display: flex; justify-content: center; flex-direction: row; padding: 0.6vw; height: 45vw; width: 65vw;">
                <div v-for="(item, index) in MAIN_ONE_UPGS" :key="index">
                    <button @click="buyOneMainUpg(index)" :class="{ nope: !tmp.main.oneUpgrades[index].canBuy && !player.gameProgress.main.oneUpgrades[index], ok: tmp.main.oneUpgrades[index].canBuy && !player.gameProgress.main.oneUpgrades[index], done: player.gameProgress.main.oneUpgrades[index] }" :style="{ backgroundColor: getOMUpgrade(index) ? '#303030' : '#202020' }" v-if="item.show" style="width: 12vw; height: 8vw; margin-left: 0.18vw; margin-right: 0.18vw; margin-bottom: 0.36vw; font-size: 0.65vw;" class="generatorButton fontVerdana whiteText">
                        <span :style="{ color: '#ddd' }" style="font-size: 0.75vw; margin-right: 0.5vw"><b>#{{index + 1}}</b></span>
                        <br><span v-if="!item.implemented" style="color: #ff0; font-size: 0.5vw"><b>[ NOT IMPLEMENTED ]</b><br></span>
                        <span class="vertical-align: top;">{{item.desc}}</span>
                        <br><br>
                        <span class="vertical-align: bottom;">Currently: <b><span style="font-size: 0.75vw; color: #fff">{{item.effectDesc}}</span></b></span><br>
                        <span v-if="!getOMUpgrade(index)" class="vertical-align: bottom;">Cost: <b><span style="font-size: 0.75vw; color: #fff">{{format(item.cost.ceil())}}</span></b> PRai.</span>
                        <span v-if="getOMUpgrade(index)" class="vertical-align: bottom;"><b><span style="font-size: 0.75vw; color: #fff">Bought!</span></b></span>
                    </button>
                </div>
            </div> -->
        </div>
    </div>
</template>
