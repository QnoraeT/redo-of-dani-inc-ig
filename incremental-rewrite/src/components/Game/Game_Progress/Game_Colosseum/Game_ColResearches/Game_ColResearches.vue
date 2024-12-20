<script setup lang="ts">
import Decimal from "break_eternity.js";
import { player, tab, tmp } from "@/main";
import { format, formatTime } from "@/format";
import { allocColResearch, COL_RESEARCH, getColResLevel } from "./Game_ColResearches";
import { switchSubTab } from "@/components/MainTabs/MainTabs";
</script>
<template>
    <div class="flex-container" style="justify-content: center; align-content: flex-start; flex-direction: row; flex-wrap: wrap; border: 0.24vw solid #ff4000; padding: 0.6vw; height: 38.4vw; width: 50%;">
        <div v-for="(item, index) in COL_RESEARCH" class="flex-container" :key="item.name">
            <!-- set padding to 0vw because it auto-inserts padding -->
            <button v-if="item.unlocked" @click="switchSubTab(index, 1)" style="width: 9vw; height: 3.5vw; margin-left: 0.18vw; margin-right: 0.18vw; margin-top: 0.36vw; padding: 0vw;" class="smallColBorder colButton fontVerdana">
                <div class="whiteText" style="display: flex; justify-content: center; background-color: #631900; position: relative; width: 100%; height: 42.5%; font-size: 0.75vw;">
                    <span class="centered-text" style="height: 100%">{{ item.name }}</span>
                </div>
                <div class="whiteText" style="display: flex; justify-content: center; background-color: #7a1f00; position: relative; width: 100%; height: 42.5%; font-size: 0.75vw;">
                    <span class="centered-text" style="height: 100%">
                        Level: {{ format(item.scoreToLevel(player.gameProgress.col.research.xpTotal[index]).floor(), 0) }}
                    </span>
                </div>
                <div style="height: 15%; width: 100%; position: relative">
                    <!-- does nothing, is actually the base of the bar -->
                    <div style="position: absolute; top: 0; left: 0; background-color: #521400; height: 100%; width: 100%;"></div>
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
    <div style="display: flex; justify-content: center; flex-direction: row; border: 0.18vw solid #ff4000; height: 39.8vw; width: 50%;">
        <div style="width: 100%; height: 100%">
            <div class="whiteText fontVerdana" style="display: flex; justify-content: center; background-color: #461100; position: relative; width: 100%; height: 15%; font-size: 1.6vw;">
                <span class="centered-text" style="height: 100%">
                    {{ COL_RESEARCH[tab.tabList[tab.currentTab][1]].name }}
                </span>
            </div>
            <div class="whiteText fontVerdana" style="display: flex; justify-content: center; background-color: #521400; position: relative; width: 100%; height: 12%; font-size: 1.2vw;">
                <span class="centered-text" style="top: 4%">
                    Level: {{format(getColResLevel(tab.tabList[tab.currentTab][1]).floor(), 0)}}
                </span>
                <span v-if="getColResLevel(tab.tabList[tab.currentTab][1]).lt(1e12)" class="centered-text" style="top: 33.333%">
                    <!-- these are the worst formulas i've ever done lmfao -->
                    <!-- basically, just try to estimate levels only using the XP amounts because trying to use levels at high enough numbers will just simply not work -->
                    XP: {{ 
                        format(
                            Decimal.sub(
                                player.gameProgress.col.research.xpTotal[tab.tabList[tab.currentTab][1]], 
                                COL_RESEARCH[tab.tabList[tab.currentTab][1]].levelToScore(
                                    getColResLevel(tab.tabList[tab.currentTab][1]).floor()
                                    )
                                )
                                , 0) }} 
                                / {{ 
                                format(
                                    COL_RESEARCH[tab.tabList[tab.currentTab][1]].levelToScore(
                                        getColResLevel(
                                            tab.tabList[tab.currentTab][1]
                                        ).floor().add(1)
                                    ).sub(
                                        COL_RESEARCH[tab.tabList[tab.currentTab][1]].levelToScore(
                                            getColResLevel(tab.tabList[tab.currentTab][1]).floor()
                                        )
                                    ), 0) }} 
                                ({{ formatTime(COL_RESEARCH[tab.tabList[tab.currentTab][1]].levelToScore(
                                    getColResLevel(tab.tabList[tab.currentTab][1]).floor().add(1)
                                    )
                                .sub(
                                    COL_RESEARCH[tab.tabList[tab.currentTab][1]].levelToScore(
                                        getColResLevel(tab.tabList[tab.currentTab][1]).floor()
                                    )
                                ).sub(
                                    Decimal.sub(
                                        player.gameProgress.col.research.xpTotal[tab.tabList[tab.currentTab][1]], 
                                        COL_RESEARCH[tab.tabList[tab.currentTab][1]].levelToScore(
                                            getColResLevel(tab.tabList[tab.currentTab][1]).floor()
                                        )
                                    )
                                ).div(tmp.col.researchSpeed)) }})
                </span>
                <span v-if="getColResLevel(tab.tabList[tab.currentTab][1]).gte(1e12)" class="centered-text" style="top: 33.333%" >
                    Total XP: {{ format(player.gameProgress.col.research.xpTotal[tab.tabList[tab.currentTab][1]], 0) }}
                </span>
                <div style="top: 68.5%; height: 0.75vw; width: 27.5vw; position: relative">
                    <div style="position: absolute; top: 0; left: 0; border: 0.18vw solid #882200; background-color: #521400; height: 100%; width: 100%;"></div>
                    <div
                        :style="{
                            backgroundColor: player.gameProgress.col.research.enabled[tab.tabList[tab.currentTab][1]]
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
                        style="position: absolute; top: 0; left: 0; border: 0.18vw solid #882200; height: 100%;"
                    ></div>
                </div>
            </div>
            <div class="flex-container whiteText fontVerdana" style="justify-content: center; background-color: #461100; position: relative; width: 100%; height: 59%; font-size: 0.9vw;">
                <span class="centered-text" style="top: 0.4vw">
                    {{COL_RESEARCH[tab.tabList[tab.currentTab][1]].effectDesc(getColResLevel(tab.tabList[tab.currentTab][1]).floor())}}
                </span>
                <span class="centered-text" style="top: 1.6vw">
                    {{COL_RESEARCH[tab.tabList[tab.currentTab][1]].effectDescLevel(getColResLevel(tab.tabList[tab.currentTab][1]).floor())}}
                </span>
            </div>
            <div class="flex-container whiteText fontVerdana" style="justify-content: center; background-color: #521400; position: relative; width: 100%; height: 4.5%; font-size: 1.1vw;">
                <span class="centered-text" style="top: 10%">
                    You currently have allocated {{ tmp.col.researchesAllocated }} / {{ tmp.col.researchesAtOnce }} researches.
                </span>
            </div>
            <div class="flex-container whiteText fontVerdana" style="justify-content: center; background-color: #461100; position: relative; width: 100%; height: 9.5%;">
                <button @click="allocColResearch(tab.tabList[tab.currentTab][1])" class="smallColBorder colButton fontVerdana whiteText" style="width: 50%; height: 80%; top: 10%; font-size: 0.75vw; position: relative;">
                    {{
                        player.gameProgress.col.research.enabled[tab.tabList[tab.currentTab][1]]
                            ? "Stop"
                            : "Start"
                    }}
                    researching {{ COL_RESEARCH[tab.tabList[tab.currentTab][1]].name }}.
                    <br>{{
                        tmp.col.researchesAtOnce - tmp.col.researchesAllocated <= 0
                            ? `You can't allocate anymore researches.`
                            : `You can allocate ${tmp.col.researchesAtOnce - tmp.col.researchesAllocated} more ${tmp.col.researchesAtOnce - tmp.col.researchesAllocated === 1 ? "research" : "researches"}.`
                    }}
                </button>
            </div>
        </div>
    </div>
</template>
