<script setup lang="ts">
import { shiftDown, tab, tmp } from "@/main";
import { player } from "@/main";
import { colorChange, mixColor } from "@/calc";
import {
    ACHIEVEMENT_DATA,
    ACH_DEF_COLORS,
    Ach_Types_List,
    ifAchievement
} from "./Game_Achievements";
</script>
<template>
    <div id="achievement" v-if="tab.currentTab === 3">
        <div style="display: flex; flex-direction: column; align-items: center">
            <div v-for="(item, index) in ACHIEVEMENT_DATA" :key="index">
                <div
                    v-if="item.show.value"
                    style="
                        width: 42.5vw;
                        padding-bottom: 2vw;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    "
                    :style="{
                        border: `0.2vw solid ${player.gameProgress.achievements[index].length >= item.list.length ? ACH_DEF_COLORS[item.type].complete.value : mixColor(ACH_DEF_COLORS[item.type].unable.value, ACH_DEF_COLORS[item.type].canComplete.value, 'Linear', player.gameProgress.achievements[index].length / item.list.length)}`,
                        backgroundColor: colorChange(
                            player.gameProgress.achievements[index].length >= item.list.length
                                ? ACH_DEF_COLORS[item.type].complete.value
                                : mixColor(
                                        ACH_DEF_COLORS[item.type].unable.value,
                                        ACH_DEF_COLORS[item.type].canComplete.value,
                                        'Linear',
                                        player.gameProgress.achievements[index].length / item.list.length
                                    ),
                            0.25,
                            1
                        )
                    }"
                >
                    <div style="display: flex; flex-direction: column; align-items: center">
                        <span style="font-size: 1.2vw; margin-top: 0.3vw" class="fontVerdana whiteText">
                            Achievement Tier {{ index + 1 }}:
                            {{ player.gameProgress.achievements[index].length }} /
                            {{ item.list.length }}
                        </span>
                        <span style="font-size: 0.9vw; margin-top: 0.3vw; text-align: center" class="fontVerdana whiteText">
                            {{ item.rewardDescription.value }}
                        </span>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; margin-top: 0.75vw; width: 40vw; justify-content: center;">
                        <div v-for="(item2, index2) in tmp.achievementList[index]" :key="index2">
                            <div
                                v-if="item.list[item2].show.value || ifAchievement(index, item2)"
                                :style="{
                                    backgroundColor:
                                        ACH_DEF_COLORS[Ach_Types_List[index]][
                                            ifAchievement(index, item2)
                                                ? 'complete'
                                                : item.list[item2].status.value === true
                                                    ? 'canComplete'
                                                    : 'unable'
                                        ].value,
                                    border: `0.18vw solid ${colorChange(
                                        ACH_DEF_COLORS[Ach_Types_List[index]][
                                            ifAchievement(index, item2)
                                                ? 'complete'
                                                : item.list[item2].status.value === true
                                                    ? 'canComplete'
                                                    : 'unable'
                                        ].value,
                                        0.5,
                                        1
                                    )}`,
                                    marginRight: `0.18vw`,
                                    marginLeft: `0.18vw`,
                                    width: `3vw`,
                                    height: `3vw`
                                }"
                                style="justify-content: space-around; align-items: center; font-size: 0.75vw; height: 3vw; width: 3vw; margin-right: 0.2vw; margin-left: 0.2vw;"
                                class="tooltip fontVerdana whiteText flex-container"
                            >
                                <div
                                    class="flex-container"
                                    style="justify-content: space-around; align-items: center"
                                >
                                    <span
                                        style="text-align: center"
                                        :style="{
                                            color: colorChange(
                                                ACH_DEF_COLORS[Ach_Types_List[index]][
                                                    ifAchievement(index, item2)
                                                        ? 'complete'
                                                        : item.list[item2].status.value === true
                                                            ? 'canComplete'
                                                            : 'unable'
                                                ].value,
                                                0.25,
                                                1
                                            )
                                        }"
                                    >
                                        <b>#{{ index2 + 1 }}</b>
                                    </span>
                                </div>
                                <span class="tooltiptext">
                                    <span v-if="!shiftDown" style="font-size: 0.6vw"
                                        >#({{ index2 + 1 }}, {{ index + 1 }})
                                    </span>
                                    <span v-if="shiftDown" style="font-size: 0.6vw"
                                        >ID: ({{ index }}, {{ item2 }})
                                    </span>
                                    <span style="font-size: 1vw">{{ item.list[item2].name.value }}</span>
                                    <br><br>{{ item.list[item2].description.value }} <br>{{
                                        item.list[item2].reward.value === ""
                                            ? ""
                                            : `Reward: ${item.list[item2].reward.value}`
                                    }}
                                    <span :style="{ color: colorChange(ACH_DEF_COLORS[Ach_Types_List[index]].unable.value, 1.0, 0.5) }"  v-if="item.list[item2].status.value !== true && !ifAchievement(index, item2)"><br>{{ item.list[item2].status }}</span >
                                    <span style="font-size: 0.6vw; color: #ccc" v-if="item.list[item2].extra" ><br>{{ item.list[item2].extra }}</span >
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
