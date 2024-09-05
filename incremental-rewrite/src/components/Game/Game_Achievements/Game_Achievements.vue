<script setup lang="ts">
import { shiftDown, tab } from '@/main'
import { player } from '@/main'
import { colorChange, mixColor } from '@/calc'
import { ACHIEVEMENT_DATA, ACH_DEF_COLORS, Ach_Types_List, ifAchievement } from './Game_Achievements'
</script>
<template>
    <div id="achievement" v-if="tab.currentTab === 3">
        <div style="display: flex; flex-direction: column; align-items: center;">
            <div v-for="(item, index) in ACHIEVEMENT_DATA" :key="index">
                <div v-if="item.show" style="width: 60vw; height: 20vw; display: flex; flex-direction: column; align-items: center;" :style="{ 
                    border: `0.25vw solid ${player.gameProgress.achievements[index].length >= item.list.length ? ACH_DEF_COLORS[item.type].complete : mixColor(ACH_DEF_COLORS[item.type].unable, ACH_DEF_COLORS[item.type].canComplete, 'Linear', player.gameProgress.achievements[index].length / item.list.length)}`,
                    backgroundColor: colorChange(player.gameProgress.achievements[index].length >= item.list.length ? ACH_DEF_COLORS[item.type].complete : mixColor(ACH_DEF_COLORS[item.type].unable, ACH_DEF_COLORS[item.type].canComplete, 'Linear', player.gameProgress.achievements[index].length / item.list.length), 0.25, 1)
                }">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <span style="font-size: 1.6vw; margin-top: 0.4vw;" class="fontVerdana whiteText">Achievement Tier {{ index + 1 }}: {{ player.gameProgress.achievements[index].length }} / {{ item.list.length }}</span>
                        <span style="font-size: 1.2vw; margin-top: 0.4vw; text-align: center" class="fontVerdana whiteText">{{ item.rewAll }}</span>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; margin-top: 1.0vw; width: 50vw; justify-content: center">
                        <div v-for="(item2, index2) in item.list" :key="index2">
                            <div v-if="item2.show || ifAchievement(index, index2)" v-bind:style="{ 
                                backgroundColor: 
                                    ACH_DEF_COLORS
                                    [Ach_Types_List[index]]
                                    [ifAchievement(index, index2)
                                        ? 'complete'
                                        : (item2.status === true
                                            ? 'canComplete'
                                            : 'unable')],
                                border: `0.24vw solid ${
                                    colorChange(ACH_DEF_COLORS
                                    [Ach_Types_List[index]]
                                    [ifAchievement(index, index2)
                                        ? 'complete'
                                        : (item2.status === true
                                            ? 'canComplete'
                                            : 'unable')], 0.5, 1)}`,
                                marginRight: `0.24vw`, 
                                marginLeft: `0.24vw`, 
                                width: `4vw`,
                                height: `4vw`,
                            }" style="font-size: 1.0vw; height: 4vw; width: 4vw; margin-right: 0.3vw; margin-left: 0.3vw; " class="tooltip fontVerdana">
                                <span class="tooltiptext">
                                    <span v-if="!shiftDown" style="font-size: 0.8vw">#({{ index2 + 1 }}, {{ index + 1 }})  </span>
                                    <span v-if="shiftDown" style="font-size: 0.8vw">ID: ({{ item2.id }}, {{ item.id }})  </span>
                                    <span style="font-size: 1.2vw">{{item2.name}}</span>
                                    <br><br>{{item2.desc}}
                                    <br>{{item2.reward===''?'':`Reward: ${item2.reward}`}}
                                    <span v-if="item2.status !== true && !ifAchievement(index, index2)"><br>{{ item2.status }}</span>
                                    <span style="font-size: 0.8vw; color: #ccc" v-if="item2.extra"><br>{{ item2.extra }}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>