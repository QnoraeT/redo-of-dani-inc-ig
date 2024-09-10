<script setup lang="ts">
import { tab, tmp, getEndgame } from '@/main'
import { format } from '@/format'
import { STAGES } from './Game_Stats'
import { switchSubTab } from '../../MainTabs/MainTabs'
import { SOFT_ATTR, SCALE_ATTR } from '@/softcapScaling'
import STAGES_StatDisplay from './STAGES_Stat_Display.vue'
</script>
<template>
    <div id="stats" v-if="tab.currentTab === 2">
        <div class="flex-container" style="flex-direction: row; justify-content: center; font-size: 1.0vw; margin-bottom: 0.5vw;">
            <button @click="switchSubTab(0, 0)" style="margin-left: 0.12vw; margin-right: 0.12vw; width: 7.5vw; height: 2vw; font-size: 0.75vw; border: 0.2vw solid #ffffff;" class="whiteText generatorButton fontVerdana">Progress</button>
            <button @click="switchSubTab(1, 0)" style="margin-left: 0.12vw; margin-right: 0.12vw; width: 10vw; height: 2vw; font-size: 0.75vw; border: 0.2vw solid #ffffff;" class="whiteText generatorButton fontVerdana">Scaling / Softcaps</button>
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 0">
            <div class="flex-container" style="flex-direction: column; justify-content: center;">
                <div style="background-color: rgb(31, 31, 31); border: 0.3vw solid #e0e0e0; margin-left: auto; margin-right: auto; display: flex; justify-content: flex-start; flex-direction: column; box-shadow: 0 0 0.6vw 0.18vw rgb(29, 29, 29); height: 30vw; width: 60vw; margin-bottom: 0.8vw;">
                    <div style="display: flex; justify-content: flex-start; flex-flow: wrap; flex-direction: column; align-items: center; flex-wrap: nowrap; width: 100%; height: 2.5vw">
                        <span class="whiteText" style="font-size: 0.9vw">{{format(getEndgame(), 2)}}% to ENDGAME</span>
                        <div style="width: 100%; position: relative; height: 100%;">
                            <div style="background-color: #404040; position: absolute; top: 0; left: 0; height: 100%; width: 100%"></div>
                            <div :style="{ width: `${getEndgame().toNumber()}%` }" style="background-color: #ffffff; position: absolute; top: 0; left: 0; height: 100%;"></div>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: flex-start; flex-direction: row;">
                        <div class="flex-container" style="justify-content: flex-start; flex-flow: wrap; flex-direction: column; align-items: center; flex-wrap: nowrap; width: 50%">
                            <div v-for="(item, index) in STAGES" :key='item.id' class="flex-container" style="padding: 0.4vw; padding-bottom: 0vw; width: 100%">
                                <button v-if="item.show" @click="switchSubTab(index, 1);" :style="{ border: `0.24vw solid ${item.colors.border}` }" style="cursor: pointer; width: 100%; height: 4vw; margin-left: 0.5vw; margin-right: 0.5vw; padding: 0vw;" class="fontVerdana">
                                    <div :style="{ backgroundColor: item.colors.name }" class="whiteText" style="display: flex; justify-content: center; position: relative; width: 100%; height: 42.5%; font-size: 0.8vw;">
                                        <span class="centered-text" style="height: 100%;">{{item.name}}</span>
                                    </div>
                                    <div :style="{ backgroundColor: item.colors.progress }" class="whiteText" style="display: flex; justify-content: center; position: relative; width: 100%; height: 42.5%; font-size: 0.7vw">
                                        <span class="centered-text" style="height: 100%;">~{{format(item.progress.min(1).mul(100), 2)}}% complete</span>
                                    </div>
                                    <div style="height: 15%; width: 100%; position: relative;">
                                        <div :style="{ backgroundColor: item.colors.progressBarBase }" style="position: absolute; top: 0; left: 0; height: 100%; width: 100%"></div>
                                        <div :style="{ backgroundColor: item.colors.progressBarFill, width: `${item.progress.min(1).mul(100).toNumber()}%` }" style="position: absolute; top: 0; left: 0; height: 100%;"></div>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div class="flex-container" style="justify-content: flex-start; flex-flow: wrap; flex-direction: column; align-items: center; flex-wrap: nowrap; width: 50%; padding-top: 0.6vw">
                            <div v-for="(item, index) in STAGES" :key='item.id' class="flex-container" style="width: 100%">
                                <STAGES_StatDisplay :id='index' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 1">
            <div class="flex-container" style="flex-direction: row; justify-content: center;">
                <div v-for="(item, index) in tmp.scaleList" :key="item.id" style="color: #fff">
                    <div :style="{ backgroundColor: SCALE_ATTR[index].color }" v-if="item.list.length > 0" style="
                    border-radius: 6vw;
                    width: 6vw;
                    height: 1.2vw;
                    color: #fff;
                    text-align: center;
                    padding: 2.4vw 0;
                    margin-left: 0.15vw;
                    margin-right: 0.15vw;
                    font-size: 0.8vw;
                    " class="tooltip fontVerdana">
                    {{SCALE_ATTR[index].name}}
                        <span class="tooltiptext">
                            <span v-for="j in item.list" :key="j.id">
                                {{j.txt}}
                                <br>
                            </span>
                        </span>
                    </div>
                </div>
            </div>
            <div class="flex-container" style="flex-direction: row; justify-content: center; margin-top: 0.15vw;">
                <div v-for="(item, index) in tmp.softList" :key="item.id" style="color: #fff">
                    <div :style="{ backgroundColor: SOFT_ATTR[index].color }" v-if="item.list.length > 0" style="
                    border-radius: 6vw;
                    width: 6vw;
                    height: 1.2vw;
                    color: #fff;
                    text-align: center;
                    padding: 2.4vw 0;
                    margin-left: 0.15vw;
                    margin-right: 0.15vw;
                    font-size: 0.8vw;
                    " class="tooltip fontVerdana">
                    {{SOFT_ATTR[index].name}}
                        <span class="tooltiptext">
                            <span v-for="j in item.list" :key="j.id">
                                {{j.txt}}
                                <br>
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

