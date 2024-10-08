<script setup lang="ts">
import Decimal from "break_eternity.js";
import { tab } from "@/main";
import { tmp, player } from "@/main";
import { format, formatPerc, formatTime } from "@/format";
import { switchSubTab } from "@/components/MainTabs/MainTabs";
import {
    allocColResearch,
    challengeToggle,
    COL_CHALLENGES,
    COL_RESEARCH,
    completedChallenge,
    getColResLevel,
    inChallenge,
    timesCompleted
} from "./Game_Colosseum";
</script>
<template>
    <div id="colosseum" v-if="tab.currentTab === 5">
        <div
            class="flex-container"
            style="
                flex-direction: row;
                justify-content: center;
                font-size: 1.4vw;
                margin-bottom: 1vw;
            "
            v-if="Decimal.gte(timesCompleted('nk'), 1)"
        >
            <button
                @click="switchSubTab(0, 0)"
                style="color: #f40"
                class="normalTabButton smallColBorder colButton fontVerdana"
            >
                Challenges
            </button>
            <button
                @click="switchSubTab(1, 0)"
                style="color: #f40"
                class="normalTabButton smallColBorder colButton fontVerdana"
            >
                Research
            </button>
        </div>
        <div
            class="flex-container fontVerdana"
            style="flex-direction: column; justify-content: center; margin-bottom: 1vw"
        >
            <span style="color: #f40; text-align: center; font-size: 1.2vw" >
                You have 
                <span style="font-size: 1.4vw"><b>{{ format(player.gameProgress.col.power, 2) }}</b></span> 
                Colosseum Power. 
                <span style="font-size: 1vw">({{ format(tmp.col.truePowGen, 2) }}/s)</span>
            </span>
            <span style="text-align: center; font-size: 1.2vw" :style="{ color: player.gameProgress.col.completedAll ? '#0080FF' : '#FF4000' }">
                This will give you about 
                <span style="font-size: 1.4vw" ><b>{{ formatTime(player.gameProgress.col.maxTime, 3) }}</b></span>
                within challenges.
            </span>
            <span v-if="Decimal.gte(timesCompleted('su'), 1)" style="color: #f40; text-align: center; font-size: 0.7vw" >
                This also weakens Upgrade 1 and 2's softcaps by 
                <span style="font-size: 0.8vw"><b>{{ formatPerc(tmp.col.effects.upg1a2sc, 3) }}</b></span>.
            </span>
            <span v-if="Decimal.gte(timesCompleted('df'), 1)" style="color: #f40; text-align: center; font-size: 0.7vw" >
                This also boosts research speed by 
                <span style="font-size: 0.8vw"><b>{{ format(tmp.col.effects.res, 3) }}</b></span>×.
            </span>

            <span v-if="Decimal.gte(timesCompleted('su'), 1)" class="whiteText" style="font-size: 0.65vw; text-align: center; margin-top: 0.5vw">You may change the difficulty to get achievements, or other challenges may force you into certain difficulties! Changing the difficulty will not change the rewards you already have.</span>
        </div>
        <div
            class="flex-container"
            style="flex-direction: row; justify-content: center; margin-top: 1.2vw"
            v-if="tab.tabList[tab.currentTab][0] === 0"
        >
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
                            <span class="generic-text" style="left: 0.3vw; top: 0.3vw; font-size: 0.65vw" >{{ [ "One-Time", `Multiple (${format(timesCompleted(item.id))} / ${format(item.cap)})`, "Continuous"][item.type] }}</span>
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
                            style="height: 33.333%; font-size: 0.6vw"
                        >
                            <span class="centered-text" style="top: 0.5vw">{{ item.goalDesc }}</span>
                            <span class="centered-text" style="top: 2.0vw">{{ item.desc }}</span>
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
                            style="height: 50%; font-size: 0.65vw"
                        >
                            <span class="centered-text" style="top: 1.6vw">{{ item.type === 1 ? Decimal.eq(player.gameProgress.inChallenge[item.id].optionalDiff, timesCompleted(item.id)) ? ' - Next REWARD - ' : (Decimal.lt(player.gameProgress.inChallenge[item.id].optionalDiff, Decimal.sub(timesCompleted(item.id), 1)) ? ' - Previous REWARD - ' : ' - Current REWARD - ') : ' - REWARD - ' }}</span>
                            <span class="centered-text" style="top: 4vw">{{ item.reward }}</span>
                        </div>
                    </button>
                    <!-- TODO: replace the slider with text input after cap > 20 or something -->
                    <div v-if="item.type === 1 && Decimal.gte(timesCompleted(item.id), 1)" 
                    class="whiteText fontVerdana generatorButton"
                    style="padding: 0%; margin-left: 0.2vw; margin-right: 0.2vw; width: 14.28vw; height: 3vw; display: flex; flex-direction: column; border: 0.24vw solid #fff;">
                        <div class="first-cont" style="height: 40%">
                            <span class="generic-text" style="left: 0.3vw; top: 0.3vw; font-size: 0.65vw" >Select Difficulty</span>
                            <span class="generic-text" style="right: 0.3vw; top: 0.3vw; font-size: 0.65vw" >{{ format(Decimal.add(player.gameProgress.inChallenge[item.id].optionalDiff, 1)) }} / {{ format(Decimal.add(timesCompleted(item.id), 1)) }}</span>
                        </div>
                        <div class="second-cont" style="height: 60%">
                            <div class="slidecontainer" style="position: absolute; left: 3%; width: 94%;">
                                <input class="slider colSlider" style="padding: 0vw; margin: 0vw" type="range" v-model="player.gameProgress.inChallenge[item.id].optionalDiff" :min="0" :max="new Decimal(timesCompleted(item.id)).toNumber()"/>
                                <!-- <Tooltip :display="`${value}`" :class="{ fullWidth: !title }" :direction="Direction.Down">
                                    <input type="range" class="slider" v-model="value" :min="min" :max="max"  />
                                </Tooltip>                                         -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div
            style="
                background-color: #410;
                border: 0.2vw solid #ff4000;
                margin-left: auto;
                margin-right: auto;
                display: flex;
                justify-content: center;
                flex-direction: row;
                box-shadow: 0 0 0.8vw 0.24vw rgb(66, 17, 0);
                height: 40vw;
                width: 80vw;
            "
            v-if="tab.tabList[tab.currentTab][0] === 1"
        >
            <div
                style="
                    display: flex;
                    justify-content: center;
                    flex-direction: row;
                    flex-wrap: wrap;
                    border: 0.24vw solid #ff4000;
                    padding: 0.6vw;
                    height: 38.4vw;
                    width: 50%;
                "
            >
                <div v-for="(item, index) in COL_RESEARCH" class="flex-container" :key="item.name">
                    <!-- set padding to 0vw because it auto-inserts padding -->
                    <button
                        v-if="item.unlocked"
                        @click="switchSubTab(index, 1)"
                        style="
                            width: 9vw;
                            height: 3.5vw;
                            margin-left: 0.18vw;
                            margin-right: 0.18vw;
                            padding: 0vw;
                        "
                        class="smallColBorder colButton fontVerdana"
                    >
                        <div
                            class="whiteText"
                            style="
                                display: flex;
                                justify-content: center;
                                background-color: #631900;
                                position: relative;
                                width: 100%;
                                height: 42.5%;
                                font-size: 0.75vw;
                            "
                        >
                            <span class="centered-text" style="height: 100%">{{ item.name }}</span>
                        </div>
                        <div
                            class="whiteText"
                            style="
                                display: flex;
                                justify-content: center;
                                background-color: #7a1f00;
                                position: relative;
                                width: 100%;
                                height: 42.5%;
                                font-size: 0.75vw;
                            "
                        >
                        <span class="centered-text" style="height: 100%">
                            Level: {{ 
                                format(item.scoreToLevel(player.gameProgress.col.research.xpTotal[index]) .floor(), 0) 
                            }}
                        </span>
                        </div>
                        <div style="height: 15%; width: 100%; position: relative">
                            <div
                                style="
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    background-color: #521400;
                                    height: 100%;
                                    width: 100%;
                                "
                            ></div>
                            <div
                                :style="{
                                    backgroundColor: player.gameProgress.col.research.enabled[index]
                                        ? '#ffc000'
                                        : '#ff4000',
                                    width: `${
                                        getColResLevel(index).gte(1e12)
                                            ? 100
                                            : Decimal.div(
                                                    Decimal.sub(
                                                        player.gameProgress.col.research.xpTotal[
                                                            index
                                                        ],
                                                        item.levelToScore(
                                                            getColResLevel(index).floor()
                                                        )
                                                    ),
                                                    item
                                                        .levelToScore(
                                                            getColResLevel(index).floor().add(1)
                                                        )
                                                        .sub(
                                                            item.levelToScore(
                                                                getColResLevel(index).floor()
                                                            )
                                                        )
                                                )
                                                    .min(1)
                                                    .mul(100)
                                                    .toNumber()
                                    }%`
                                }"
                                style="position: absolute; top: 0; left: 0; height: 100%"
                            ></div>
                        </div>
                    </button>
                </div>
            </div>
            <div
                style="
                    display: flex;
                    justify-content: center;
                    flex-direction: row;
                    border: 0.18vw solid #ff4000;
                    height: 39.8vw;
                    width: 50%;
                "
            >
                <div style="width: 100%; height: 100%">
                    <div
                        class="whiteText fontVerdana"
                        style="
                            display: flex;
                            justify-content: center;
                            background-color: #461100;
                            position: relative;
                            width: 100%;
                            height: 15%;
                            font-size: 1.6vw;
                        "
                    >
                        <span class="centered-text" style="height: 100%">{{
                            COL_RESEARCH[tab.tabList[tab.currentTab][1]].name
                        }}</span>
                    </div>
                    <div
                        class="whiteText fontVerdana"
                        style="
                            display: flex;
                            justify-content: center;
                            background-color: #521400;
                            position: relative;
                            width: 100%;
                            height: 12%;
                            font-size: 1.2vw;
                        "
                    >
                        <span class="centered-text" style="top: 4%"
                            >Level:
                            {{
                                format(getColResLevel(tab.tabList[tab.currentTab][1]).floor(), 0)
                            }}</span
                        >
                        <!-- i wish i made this better instead of having to do an extremely long formula T_T -->
                        <span v-if="getColResLevel(tab.tabList[tab.currentTab][1]).lt(1e12)" class="centered-text" style="top: 33.333%">
                            XP: {{ 
                                format(Decimal.sub(
                                    player.gameProgress.col.research.xpTotal[tab.tabList[tab.currentTab][1]], 
                                    COL_RESEARCH[tab.tabList[tab.currentTab][1]].levelToScore(getColResLevel(tab.tabList[tab.currentTab][1]).floor())
                                    )
                                    , 0) }} 
                            / {{ 
                                format(
                                    COL_RESEARCH[tab.tabList[tab.currentTab][1]].levelToScore(
                                        getColResLevel(tab.tabList[tab.currentTab][1]).floor().add(1)
                                    ).sub(
                                        COL_RESEARCH[tab.tabList[tab.currentTab][1]].levelToScore(
                                            getColResLevel(tab.tabList[tab.currentTab][1]).floor()
                                            )
                                        )
                                    , 0) }}
                        </span>
                        <span v-if="getColResLevel(tab.tabList[tab.currentTab][1]).gte(1e12)" class="centered-text" style="top: 33.333%" >
                            Total XP: {{ format(player.gameProgress.col.research.xpTotal[tab.tabList[tab.currentTab][1]], 0) }}
                        </span>
                        <div style="top: 68.5%; height: 0.75vw; width: 27.5vw; position: relative">
                            <div
                                style="
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    border: 0.18vw solid #882200;
                                    background-color: #521400;
                                    height: 100%;
                                    width: 100%;
                                "
                            ></div>
                            <div
                                :style="{
                                    backgroundColor: player.gameProgress.col.research.enabled[
                                        tab.tabList[tab.currentTab][1]
                                    ]
                                        ? '#ffc000'
                                        : '#ff4000',
                                    width: `${
                                        getColResLevel(tab.tabList[tab.currentTab][1]).gte(1e12)
                                            ? 100
                                            : Decimal.div(
                                                    Decimal.sub(
                                                        player.gameProgress.col.research.xpTotal[
                                                            tab.tabList[tab.currentTab][1]
                                                        ],
                                                        COL_RESEARCH[
                                                            tab.tabList[tab.currentTab][1]
                                                        ].levelToScore(
                                                            getColResLevel(
                                                                tab.tabList[tab.currentTab][1]
                                                            ).floor()
                                                        )
                                                    ),
                                                    COL_RESEARCH[tab.tabList[tab.currentTab][1]]
                                                        .levelToScore(
                                                            getColResLevel(
                                                                tab.tabList[tab.currentTab][1]
                                                            )
                                                                .floor()
                                                                .add(1)
                                                        )
                                                        .sub(
                                                            COL_RESEARCH[
                                                                tab.tabList[tab.currentTab][1]
                                                            ].levelToScore(
                                                                getColResLevel(
                                                                    tab.tabList[tab.currentTab][1]
                                                                ).floor()
                                                            )
                                                        )
                                                )
                                                    .min(1)
                                                    .mul(100)
                                                    .toNumber()
                                    }%`
                                }"
                                style="
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    border: 0.18vw solid #882200;
                                    height: 100%;
                                "
                            ></div>
                        </div>
                    </div>
                    <div
                        class="whiteText fontVerdana"
                        style="
                            display: flex;
                            justify-content: center;
                            background-color: #461100;
                            position: relative;
                            width: 100%;
                            height: 58%;
                            font-size: 0.9vw;
                        "
                    >
                        <span class="centered-text" style="top: 0.4vw">{{
                            COL_RESEARCH[tab.tabList[tab.currentTab][1]].effectDesc(
                                getColResLevel(tab.tabList[tab.currentTab][1]).floor()
                            )
                        }}</span>
                        <span class="centered-text" style="top: 1.6vw">{{
                            COL_RESEARCH[tab.tabList[tab.currentTab][1]].effectDescLevel(
                                getColResLevel(tab.tabList[tab.currentTab][1]).floor()
                            )
                        }}</span>
                    </div>
                    <div
                        class="whiteText fontVerdana"
                        style="
                            display: flex;
                            justify-content: center;
                            background-color: #521400;
                            position: relative;
                            width: 100%;
                            height: 5%;
                            font-size: 1.1vw;
                        "
                    >
                        <span class="centered-text" style="top: 10%"
                            >You currently have allocated {{ tmp.col.researchesAllocated }} /
                            {{ tmp.col.researchesAtOnce }} researches.</span
                        >
                    </div>
                    <div
                        class="whiteText fontVerdana"
                        style="
                            display: flex;
                            justify-content: center;
                            background-color: #461100;
                            position: relative;
                            width: 100%;
                            height: 10%;
                        "
                    >
                        <button
                            @click="allocColResearch(tab.tabList[tab.currentTab][1])"
                            class="smallColBorder colButton fontVerdana whiteText"
                            style="
                                width: 50%;
                                height: 80%;
                                top: 10%;
                                font-size: 0.75vw;
                                position: relative;
                            "
                        >
                            {{
                                player.gameProgress.col.research.enabled[
                                    tab.tabList[tab.currentTab][1]
                                ]
                                    ? "Stop"
                                    : "Start"
                            }}
                            researching {{ COL_RESEARCH[tab.tabList[tab.currentTab][1]].name }}.
                            <br />{{
                                tmp.col.researchesAtOnce - tmp.col.researchesAllocated <= 0
                                    ? `You can't allocate anymore researches.`
                                    : `You can allocate ${tmp.col.researchesAtOnce - tmp.col.researchesAllocated} more ${tmp.col.researchesAtOnce - tmp.col.researchesAllocated === 1 ? "research" : "researches"}.`
                            }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
