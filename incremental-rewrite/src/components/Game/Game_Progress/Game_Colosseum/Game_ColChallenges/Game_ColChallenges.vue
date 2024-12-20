<script setup lang="ts">
import Decimal from "break_eternity.js";
import { player } from "@/main";
import { format } from "@/format";
import { COL_CHALLENGES } from "./Game_ColChalData";
import { completedChallenge, inChallenge, timesCompleted } from "./Game_ColChalHandler";
import { challengeToggle } from "../Game_Colosseum";
</script>
<template>
    <div v-for="item in COL_CHALLENGES" class="flex-container" :key="item.id">
        <div v-if="item.show" class="flex-container" style="flex-direction: column">
            <button
                v-if="item.show"
                :class="{
                    colButton: !completedChallenge(item.id) && !inChallenge(item.id),
                    colButtonProg: completedChallenge(item.id) ? false : inChallenge(item.id),
                    colButtonComp: completedChallenge(item.id),

                    normColBorder: !completedChallenge(item.id) && !inChallenge(item.id),
                    normColBorderProg: completedChallenge(item.id)
                        ? false
                        : inChallenge(item.id),
                    normColBorderComp: completedChallenge(item.id)
                }"
                class="whiteText fontVerdana main-container"
                style="padding: 0%; margin-left: 0.2vw; margin-right: 0.2vw"
                @click="challengeToggle(item.id)"
            >
                <div
                    :class="{
                        colButtonHeader: !completedChallenge(item.id) && !inChallenge(item.id),
                        colButtonHeaderProg: completedChallenge(item.id)
                            ? false
                            : inChallenge(item.id),
                        colButtonHeaderComp: completedChallenge(item.id)
                    }"
                    class="first-cont"
                    style="height: 16.667%"
                >
                    <span class="generic-text" style="left: 0.3vw; top: 0.3vw; font-size: 0.65vw" >{{ [ "One-Time", `Multiple (${format(timesCompleted(item.id))} / ${format(item.cap)})`, "Continuous", `Multiple (${format(timesCompleted(item.id))} / ${format(item.cap)})`][item.type] }}</span>
                    <span class="generic-text" style="right: 0.3vw; top: 0.3vw; font-size: 0.65vw" >#{{ item.num }}</span>
                    <span class="centered-text" style="top: 1.2vw; font-size: 1vw"><b>{{ item.name }}</b></span>
                    <span class="centered-text" style="top: 2.5vw; font-size: 0.6vw">Layer:&nbsp; <span :style="{ color: ['#FF8060', '#FFE000'][item.layer] }" >{{ ['Colosseum', 'Taxation'][item.layer] }}</span></span>
                </div>
                <div
                    :class="{
                        colButtonDesc: !completedChallenge(item.id) && !inChallenge(item.id),
                        colButtonDescProg: completedChallenge(item.id)
                            ? false
                            : inChallenge(item.id),
                        colButtonDescComp: completedChallenge(item.id)
                    }"
                    class="second-cont"
                    style="height: 33.333%; font-size: 0.55vw"
                >
                    <span class="centered-text" style="top: 0.5vw">{{ item.goalDesc }}</span>
                    <div class="centered-text flex-container" style="top: 2.0vw; flex-direction: column" v-html="item.desc"></div>
                </div>
                <div
                    :class="{
                        colButtonRew: !completedChallenge(item.id) && !inChallenge(item.id),
                        colButtonRewProg: completedChallenge(item.id)
                            ? false
                            : inChallenge(item.id),
                        colButtonRewComp: completedChallenge(item.id)
                    }"
                    class="third-cont"
                    style="height: 50%; font-size: 0.55vw"
                >
                    <span class="centered-text" style="top: 1.2vw">{{ 
                        item.type === 1 || item.type === 3 
                        ? Decimal.eq(player.gameProgress.inChallenge[item.id].optionalDiff, timesCompleted(item.id)) 
                            ? ' - Next REWARD - ' 
                            : (Decimal.lt(player.gameProgress.inChallenge[item.id].optionalDiff, Decimal.sub(timesCompleted(item.id), 1)) 
                                ? ' - Previous REWARD - ' 
                                : ' - Current REWARD - ') 
                        : ' - REWARD - '
                    }}
                    </span>
                    <div class="centered-text flex-container" style="top: 3vw; flex-direction: column" v-html="item.reward"></div>
                </div>
            </button>
            <!-- TODO: replace the slider with text input after cap > 20 or something -->
            <div v-if="(item.type === 1 || item.type === 3) && Decimal.gte(timesCompleted(item.id), 1)" 
            class="whiteText fontVerdana generatorButton"
            style="padding: 0%; margin-left: 0.2vw; margin-right: 0.2vw; width: 14.28vw; height: 3vw; display: flex; flex-direction: column; border: 0.24vw solid #fff;">
                <div class="first-cont" style="height: 40%">
                    <span class="generic-text" style="left: 0.3vw; top: 0.3vw; font-size: 0.65vw" >Select Difficulty</span>
                    <span class="generic-text" style="right: 0.3vw; top: 0.3vw; font-size: 0.65vw" >{{ format(Decimal.add(player.gameProgress.inChallenge[item.id].optionalDiff, 1)) }} / {{ format(Decimal.add(timesCompleted(item.id), 1)) }}</span>
                </div>
                <div class="second-cont" style="height: 60%">
                    <div class="slidecontainer" style="position: absolute; left: 3%; width: 94%;">
                        <input class="slider colSlider" style="padding: 0vw; margin: 0vw" type="range" v-model="player.gameProgress.inChallenge[item.id].optionalDiff" min="0" :max="new Decimal(timesCompleted(item.id)).toNumber()"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
