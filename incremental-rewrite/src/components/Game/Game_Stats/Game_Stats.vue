<script setup lang="ts">
import { tab, tmp, getEndgame } from "@/main";
import { format } from "@/format";
import { ALL_FACTORS, STAGES } from "./Game_Stats";
import { switchSubTab } from "../../MainTabs/MainTabs";
import { SOFT_ATTR, SCALE_ATTR } from "@/softcapScaling";
import STAGES_StatDisplay from "./STAGES_Stat_Display.vue";
import Tab_Button from "@/components/MainTabs/DefaultTabButton.vue";
</script>
<template>
    <div id="stats" v-if="tab.currentTab === 2">
        <div
            class="flex-container"
            style="
                flex-direction: row;
                justify-content: center;
                font-size: 1vw;
                margin-bottom: 0.5vw;
            "
        >
            <Tab_Button
                @click="switchSubTab(0, 0)"
                :selected="tab.tabList[tab.currentTab][0] === 0"
                :name="'Progress'"
            />
            <Tab_Button
                @click="switchSubTab(1, 0)"
                :selected="tab.tabList[tab.currentTab][0] === 1"
                :width="10"
                :name="'Scaling / Softcaps'"
            />
            <Tab_Button
                @click="switchSubTab(2, 0)"
                :selected="tab.tabList[tab.currentTab][0] === 2"
                :name="'All Factors'"
            />
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 0">
            <div class="flex-container" style="flex-direction: column; justify-content: center">
                <div
                    style="
                        background-color: rgb(31, 31, 31);
                        border: 0.3vw solid #e0e0e0;
                        margin-left: auto;
                        margin-right: auto;
                        display: flex;
                        justify-content: flex-start;
                        flex-direction: column;
                        box-shadow: 0 0 0.6vw 0.18vw rgb(29, 29, 29);
                        height: 30vw;
                        width: 60vw;
                        margin-bottom: 0.8vw;
                    "
                >
                    <div
                        style="
                            display: flex;
                            justify-content: flex-start;
                            flex-flow: wrap;
                            flex-direction: column;
                            align-items: center;
                            flex-wrap: nowrap;
                            width: 100%;
                            height: 2.5vw;
                        "
                    >
                        <span class="whiteText" style="font-size: 0.9vw"
                            >{{ format(getEndgame(), 2) }}% to ENDGAME</span
                        >
                        <div style="width: 100%; position: relative; height: 100%">
                            <div
                                style="
                                    background-color: #404040;
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    height: 100%;
                                    width: 100%;
                                "
                            ></div>
                            <div
                                :style="{ width: `${getEndgame().toNumber()}%` }"
                                style="
                                    background-color: #ffffff;
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    height: 100%;
                                "
                            ></div>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: flex-start; flex-direction: row">
                        <div
                            class="flex-container"
                            style="
                                justify-content: flex-start;
                                flex-flow: wrap;
                                flex-direction: column;
                                align-items: center;
                                flex-wrap: nowrap;
                                width: 50%;
                            "
                        >
                            <div
                                v-for="(item, index) in STAGES"
                                :key="item.id"
                                class="flex-container"
                                style="padding: 0.4vw; padding-bottom: 0vw; width: 100%"
                            >
                                <button
                                    v-if="item.show"
                                    @click="switchSubTab(index, 1)"
                                    :style="{ border: `0.24vw solid ${item.colors.border}` }"
                                    style="
                                        cursor: pointer;
                                        width: 100%;
                                        height: 4vw;
                                        margin-left: 0.5vw;
                                        margin-right: 0.5vw;
                                        padding: 0vw;
                                    "
                                    class="fontVerdana"
                                >
                                    <div
                                        :style="{ backgroundColor: item.colors.name }"
                                        class="whiteText"
                                        style="
                                            display: flex;
                                            justify-content: center;
                                            position: relative;
                                            width: 100%;
                                            height: 42.5%;
                                            font-size: 0.8vw;
                                        "
                                    >
                                        <span class="centered-text" style="height: 100%">{{
                                            item.name
                                        }}</span>
                                    </div>
                                    <div
                                        :style="{ backgroundColor: item.colors.progress }"
                                        class="whiteText"
                                        style="
                                            display: flex;
                                            justify-content: center;
                                            position: relative;
                                            width: 100%;
                                            height: 42.5%;
                                            font-size: 0.7vw;
                                        "
                                    >
                                        <span class="centered-text" style="height: 100%"
                                            >~{{ format(item.progress.min(1).mul(100), 2) }}%
                                            complete</span
                                        >
                                    </div>
                                    <div style="height: 15%; width: 100%; position: relative">
                                        <div
                                            :style="{
                                                backgroundColor: item.colors.progressBarBase
                                            }"
                                            style="
                                                position: absolute;
                                                top: 0;
                                                left: 0;
                                                height: 100%;
                                                width: 100%;
                                            "
                                        ></div>
                                        <div
                                            :style="{
                                                backgroundColor: item.colors.progressBarFill,
                                                width: `${item.progress.min(1).mul(100).toNumber()}%`
                                            }"
                                            style="
                                                position: absolute;
                                                top: 0;
                                                left: 0;
                                                height: 100%;
                                            "
                                        ></div>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div
                            class="flex-container"
                            style="
                                justify-content: flex-start;
                                flex-flow: wrap;
                                flex-direction: column;
                                align-items: center;
                                flex-wrap: nowrap;
                                width: 50%;
                                padding-top: 0.6vw;
                            "
                        >
                            <div
                                v-for="(item, index) in STAGES"
                                :key="item.id"
                                class="flex-container"
                                style="width: 100%"
                            >
                                <STAGES_StatDisplay :id="index" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 1">
            <div class="flex-container" style="flex-direction: row; justify-content: center">
                <div v-for="(item, index) in tmp.scaleList" :key="item.id" style="color: #fff">
                    <div
                        :style="{ backgroundColor: SCALE_ATTR[index].color }"
                        v-if="item.list.length > 0"
                        style="
                            border-radius: 6vw;
                            width: 6vw;
                            height: 1.2vw;
                            color: #fff;
                            text-align: center;
                            padding: 2.4vw 0;
                            margin-left: 0.15vw;
                            margin-right: 0.15vw;
                            font-size: 0.8vw;
                        "
                        class="tooltip fontVerdana"
                    >
                        {{ SCALE_ATTR[index].name }}
                        <span class="tooltiptext">
                            <span v-for="j in item.list" :key="j.id">
                                {{ j.txt }}
                                <br />
                            </span>
                        </span>
                    </div>
                </div>
            </div>
            <div
                class="flex-container"
                style="flex-direction: row; justify-content: center; margin-top: 0.15vw"
            >
                <div v-for="(item, index) in tmp.softList" :key="item.id" style="color: #fff">
                    <div
                        :style="{ backgroundColor: SOFT_ATTR[index].color }"
                        v-if="item.list.length > 0"
                        style="
                            border-radius: 6vw;
                            width: 6vw;
                            height: 1.2vw;
                            color: #fff;
                            text-align: center;
                            padding: 2.4vw 0;
                            margin-left: 0.15vw;
                            margin-right: 0.15vw;
                            font-size: 0.8vw;
                        "
                        class="tooltip fontVerdana"
                    >
                        {{ SOFT_ATTR[index].name }}
                        <span class="tooltiptext">
                            <span v-for="j in item.list" :key="j.id">
                                {{ j.txt }}
                                <br />
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <!-- ! i'm pretty sure there is a much better way to do this but this is what i can think of so oh well -->
        <div v-if="tab.tabList[tab.currentTab][0] === 2">
            <div
                class="flex-container"
                style="
                    flex-direction: row;
                    justify-content: center;
                    font-size: 1vw;
                    margin-bottom: 0.5vw;
                "
            >
                <div v-for="(item, index) in ALL_FACTORS" :key="item.name">
                    <Tab_Button
                        v-if="item.show"
                        @click="switchSubTab(index, 1)"
                        :selected="tab.tabList[tab.currentTab][1] === index"
                        :name="item.name"
                    />
                </div>
            </div>
            <div v-for="(item, index) in ALL_FACTORS" :key="item.name">
                <!-- ! factors === null and subTabs === null should be mutually exclusive ! -->
                <div v-if="tab.tabList[tab.currentTab][1] === index && item.factors !== null">
                    <div
                        class="flex-container"
                        style="
                            align-items: center;
                            flex-direction: column;
                            margin-left: auto;
                            margin-right: auto;
                            border: 0.24vw solid #788088;
                            background-color: #101418;
                            width: 60vw;
                            height: 40vw;
                        "
                    >
                        <div
                            class="flex-container"
                            style="
                                overflow: auto;
                                overflow-y: scroll;
                                align-items: center;
                                flex-direction: column;
                                border: 0.18vw solid #788088;
                                height: 96%;
                                width: 98%;
                                margin-bottom: auto;
                                margin-top: 1%;
                            "
                        >
                            <div
                                v-for="(item2, index2) in item.factors"
                                :key="index2"
                                style="display: contents; margin-top: 0.4vw"
                            >
                                <div
                                    v-if="item2 !== undefined"
                                    class="flex-container fontVerdana"
                                    style="
                                        background-color: #ffffff20;
                                        height: 3%;
                                        width: 98%;
                                        font-size: 0.85vw;
                                    "
                                    :style="{ color: item2.color }"
                                >
                                    <span style="flex-grow: 0.5; flex-basis: 0; text-align: left">{{
                                        item2.name
                                    }}</span>
                                    <span style="flex-grow: 1; flex-basis: 0; text-align: center">{{
                                        item2.effect
                                    }}</span>
                                    <span
                                        style="flex-grow: 0.5; flex-basis: 0; text-align: right"
                                        >{{ item2.now }}</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="tab.tabList[tab.currentTab][1] === index && item.subTabs !== null">
                    <div
                        class="flex-container"
                        style="
                            flex-direction: row;
                            justify-content: center;
                            font-size: 1vw;
                            margin-bottom: 0.5vw;
                        "
                    >
                        <div v-for="(item2, index2) in item.subTabs" :key="item2.name">
                            <Tab_Button
                                v-if="item2.show"
                                @click="switchSubTab(index2, 2)"
                                :selected="tab.tabList[tab.currentTab][2] === index2"
                                :name="item2.name"
                            />
                        </div>
                    </div>
                    <div v-for="(item2, index2) in item.subTabs" :key="item2.name">
                        <div
                            v-if="
                                tab.tabList[tab.currentTab][2] === index2 && item2.factors !== null
                            "
                        >
                            <div
                                class="flex-container"
                                style="
                                    align-items: center;
                                    flex-direction: column;
                                    margin-left: auto;
                                    margin-right: auto;
                                    border: 0.24vw solid #788088;
                                    background-color: #101418;
                                    width: 60vw;
                                    height: 40vw;
                                "
                            >
                                <div
                                    class="flex-container"
                                    style="
                                        overflow: auto;
                                        overflow-y: scroll;
                                        align-items: center;
                                        flex-direction: column;
                                        border: 0.18vw solid #788088;
                                        height: 96%;
                                        width: 98%;
                                        margin-bottom: auto;
                                        margin-top: 1%;
                                    "
                                >
                                    <div
                                        v-for="(item3, index3) in item2.factors"
                                        :key="index3"
                                        style="display: contents; margin-top: 0.4vw"
                                    >
                                        <div
                                            v-if="item3 !== undefined"
                                            class="flex-container fontVerdana"
                                            style="
                                                background-color: #ffffff20;
                                                height: 3%;
                                                width: 98%;
                                                font-size: 0.85vw;
                                            "
                                            :style="{ color: item3.color }"
                                        >
                                            <span
                                                style="
                                                    flex-grow: 0.5;
                                                    flex-basis: 0;
                                                    text-align: left;
                                                "
                                                >{{ item3.name }}</span
                                            >
                                            <span
                                                style="
                                                    flex-grow: 1;
                                                    flex-basis: 0;
                                                    text-align: center;
                                                "
                                                >{{ item3.effect }}</span
                                            >
                                            <span
                                                style="
                                                    flex-grow: 0.5;
                                                    flex-basis: 0;
                                                    text-align: right;
                                                "
                                                >{{ item3.now }}</span
                                            >
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            v-if="
                                tab.tabList[tab.currentTab][2] === index2 && item2.subTabs !== null
                            "
                        >
                            <div
                                class="flex-container"
                                style="
                                    flex-direction: row;
                                    justify-content: center;
                                    font-size: 1vw;
                                    margin-bottom: 0.5vw;
                                "
                            >
                                <div v-for="(item3, index3) in item2.subTabs" :key="item3.name">
                                    <Tab_Button
                                        v-if="item3.show"
                                        @click="switchSubTab(index3, 3)"
                                        :selected="tab.tabList[tab.currentTab][3] === index3"
                                        :name="item3.name"
                                    />
                                </div>
                            </div>
                            <div v-for="(item3, index3) in item2.subTabs" :key="item3.name">
                                <div
                                    v-if="
                                        tab.tabList[tab.currentTab][3] === index3 &&
                                        item3.factors !== null
                                    "
                                >
                                    <div
                                        class="flex-container"
                                        style="
                                            align-items: center;
                                            flex-direction: column;
                                            margin-left: auto;
                                            margin-right: auto;
                                            border: 0.24vw solid #788088;
                                            background-color: #101418;
                                            width: 60vw;
                                            height: 40vw;
                                        "
                                    >
                                        <div
                                            class="flex-container"
                                            style="
                                                overflow: auto;
                                                overflow-y: scroll;
                                                align-items: center;
                                                flex-direction: column;
                                                border: 0.18vw solid #788088;
                                                height: 96%;
                                                width: 98%;
                                                margin-bottom: auto;
                                                margin-top: 1%;
                                            "
                                        >
                                            <div
                                                v-for="(item4, index4) in item3.factors"
                                                :key="index4"
                                                style="display: contents; margin-top: 0.4vw"
                                            >
                                                <div
                                                    v-if="item4 !== undefined"
                                                    class="flex-container fontVerdana"
                                                    style="
                                                        background-color: #ffffff20;
                                                        height: 3%;
                                                        width: 98%;
                                                        font-size: 0.85vw;
                                                    "
                                                    :style="{ color: item4.color }"
                                                >
                                                    <span
                                                        style="
                                                            flex-grow: 0.5;
                                                            flex-basis: 0;
                                                            text-align: left;
                                                        "
                                                        >{{ item4.name }}</span
                                                    >
                                                    <span
                                                        style="
                                                            flex-grow: 1;
                                                            flex-basis: 0;
                                                            text-align: center;
                                                        "
                                                        >{{ item4.effect }}</span
                                                    >
                                                    <span
                                                        style="
                                                            flex-grow: 0.5;
                                                            flex-basis: 0;
                                                            text-align: right;
                                                        "
                                                        >{{ item4.now }}</span
                                                    >
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- <div v-if="tab.tabList[tab.currentTab][3] === index3 && item3.subTabs !== null">
                                    <div class="flex-container" style="flex-direction: row; justify-content: center; font-size: 1.0vw; margin-bottom: 0.5vw;">
                                        <div v-for="(item4, index4) in item3.subTabs" :key="item4.name">
                                            <Tab_Button v-if="item4.show" @click="switchSubTab(index4, 4)" :selected="tab.tabList[tab.currentTab][3] === index4" :name="item4.name" />
                                        </div>
                                    </div>
                                </div> -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
