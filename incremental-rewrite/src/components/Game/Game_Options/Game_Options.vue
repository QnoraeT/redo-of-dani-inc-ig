<script setup lang="ts">
import Decimal from "break_eternity.js";
import { colorChange, gRC } from "@/calc";
import { tab, game, player, tmp, gameVars } from "@/main";
import { format, formatTime } from "@/format";
import { switchSubTab } from "../../MainTabs/MainTabs";
import {
    saveTheFrickingGame,
    setAutosaveInterval,
    exportSaveList,
    exportSave,
    importSave,
    importSaveList,
    resetTheWholeGame,
    switchToSave,
    duplicateSave,
    deleteSave,
    renameSave,
    createNewSave,
    SAVE_MODES,
    setTempModes,
    resetModes,
    displayModesNonOptArray,
    displayModes
} from "@/saving";
import { NOTATION_LIST, setTimeSpeed, switchNotation } from "./Game_Options";
import Tab_Button from "@/components/MainTabs/DefaultTabButton.vue";
</script>
<template>
    <div id="options" v-if="tab.currentTab === 1">
        <div
            class="flex-container"
            style="
                flex-direction: row;
                justify-content: center;
                font-size: 1vw;
                margin-bottom: 0.3vw;
            "
        >
            <Tab_Button
                @click="switchSubTab(0, 0)"
                :selected="tab.tabList[tab.currentTab][0] === 0"
                :name="'Saving'"
            />
            <Tab_Button
                @click="switchSubTab(1, 0)"
                :selected="tab.tabList[tab.currentTab][0] === 1"
                :name="'Other Options'"
            />
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 0">
            <div
                class="flex-container"
                style="
                    flex-direction: row;
                    justify-content: center;
                    font-size: 1vw;
                    margin-bottom: 0.3vw;
                "
            >
                <Tab_Button
                    @click="switchSubTab(0, 1)"
                    :selected="tab.tabList[tab.currentTab][1] === 0"
                    :name="'Save List'"
                />
                <Tab_Button
                    @click="switchSubTab(1, 1)"
                    :selected="tab.tabList[tab.currentTab][1] === 1"
                    :name="'Creating Saves'"
                />
            </div>
            <div v-if="tab.tabList[tab.currentTab][1] === 0">
                <div class="flex-container" style="flex-direction: row; justify-content: center">
                    <button
                        @click="saveTheFrickingGame()"
                        class="whiteText fontVerdana generatorButton"
                        style="
                            margin: 0.25vw;
                            border: 0.2vw solid #ffffff;
                            height: 5vw;
                            width: 12vw;
                            font-size: 0.75vw;
                        "
                    >
                        Save manually.
                    </button>
                    <button
                        @click="setAutosaveInterval()"
                        :class="{
                            nope: game.autoSaveInterval >= 1e10,
                            ok: game.autoSaveInterval < 1e10
                        }"
                        class="whiteText fontVerdana generatorButton"
                        style="
                            margin: 0.25vw;
                            height: 5vw;
                            width: 12vw;
                            font-size: 0.75vw;
                            cursor: pointer;
                        "
                    >
                        Autosave Interval:
                        {{
                            formatTime(
                                game.autoSaveInterval >= 1e10 ? Infinity : game.autoSaveInterval,
                                3
                            )
                        }}
                    </button>
                    <button
                        @click="exportSaveList()"
                        class="whiteText fontVerdana generatorButton"
                        style="
                            margin: 0.25vw;
                            border: 0.2vw solid #ffffff;
                            height: 5vw;
                            width: 12vw;
                            font-size: 0.75vw;
                        "
                    >
                        Export save list to clipboard.
                    </button>
                    <button
                        @click="importSaveList()"
                        class="whiteText fontVerdana generatorButton"
                        style="
                            margin: 0.25vw;
                            border: 0.2vw solid #ffffff;
                            height: 5vw;
                            width: 12vw;
                            font-size: 0.75vw;
                        "
                    >
                        Import save list.
                    </button>
                    <button
                        @click="resetTheWholeGame(true)"
                        class="whiteText fontVerdana generatorButton"
                        style="
                            margin: 0.25vw;
                            border: 0.2vw solid #ff0000;
                            height: 5vw;
                            width: 12vw;
                            font-size: 0.75vw;
                            color: #ff0000;
                        "
                    >
                        Delete save list.
                    </button>
                </div>
                <div
                    class="flex-container"
                    style="
                        align-items: center;
                        flex-direction: column;
                        margin-left: auto;
                        margin-right: auto;
                        border: 0.36vw solid #788088;
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
                            border: 0.24vw solid #788088;
                            height: 78%;
                            width: 98%;
                            margin-bottom: auto;
                            margin-top: 1%;
                        "
                    >
                        <div
                            v-for="(item, index) in game.list"
                            :key="item.id"
                            :style="{
                                border: `0.24vw solid ${gRC(game.currentSave === index ? gameVars.sessionTime : 4.0, game.currentSave === index ? 1 : 0.5, game.currentSave === index ? 1 : 0.125)}`
                            }"
                            style="
                                position: relative;
                                min-height: 19%;
                                height: 19%;
                                width: 98%;
                                margin-top: 1%;
                            "
                        >
                            <div
                                v-if="item !== undefined && item !== null"
                                style="height: 100%; width: 100%"
                            >
                                <div style="height: 100%; width: 100%; position: relative">
                                    <div
                                        :style="{
                                            backgroundColor: gRC(
                                                game.currentSave === index
                                                    ? gameVars.sessionTime
                                                    : 4.0,
                                                0.1,
                                                game.currentSave === index ? 1 : 0.125
                                            )
                                        }"
                                        style="
                                            position: absolute;
                                            top: 0;
                                            left: 0;
                                            height: 100%;
                                            width: 100%;
                                        "
                                    ></div>
                                    <!-- <div :style="{ backgroundColor: gRC(game.currentSave === index ? gameVars.sessionTime : 4.0, 0.25, game.currentSave === index ? 1 : 0.125), width: `${getEndgame(item.data.gameProgress.main.points).toNumber()}%` }" style="position: absolute; top: 0; left: 0; height: 100%;"></div> -->
                                </div>
                                <div
                                    style="
                                        position: absolute;
                                        top: 0;
                                        left: 0;
                                        height: 100%;
                                        width: 100%;
                                    "
                                >
                                    <div style="margin: 0.3vw; margin-top: 0.15vw">
                                        <div style="position: relative; width: 100%; height: 25%">
                                            <div
                                                class="flex-container fontVerdana"
                                                style="
                                                    margin: 0.3vw;
                                                    margin-top: 0.15vw;
                                                    height: 20%;
                                                "
                                            >
                                                <div
                                                    style="
                                                        flex-grow: 1;
                                                        flex-basis: 0;
                                                        text-align: left;
                                                        font-size: 1.2vw;
                                                    "
                                                    class="whiteText"
                                                >
                                                    {{ item.name }}
                                                </div>
                                                <div
                                                    style="
                                                        flex-grow: 1;
                                                        flex-basis: 0;
                                                        text-align: center;
                                                        font-size: 1.2vw;
                                                    "
                                                    class="whiteText"
                                                >
                                                    {{ item.data.displayVersion }}
                                                </div>
                                                <div
                                                    style="
                                                        flex-grow: 1;
                                                        flex-basis: 0;
                                                        text-align: right;
                                                        font-size: 1.2vw;
                                                    "
                                                    class="whiteText"
                                                >
                                                    {{ displayModes(item.modes) }}
                                                </div>
                                            </div>
                                        </div>
                                        <div style="position: relative; width: 100%; height: 50%">
                                            <div
                                                style="
                                                    display: flex;
                                                    justify-content: center;
                                                    height: 100%;
                                                "
                                                class="fontVerdana"
                                            >
                                                <!-- <span style="text-align: center; font-size: 0.75vw;" class="whiteText"><b>Endgame: {{format(getEndgame(item.data.gameProgress.main.points), 2)}}%</b></span> -->
                                                <span
                                                    style="text-align: center; font-size: 0.75vw"
                                                    class="whiteText"
                                                    >Points:
                                                    {{
                                                        format(
                                                            item.data.gameProgress.main.points,
                                                            2
                                                        )
                                                    }}</span
                                                >
                                                <span
                                                    style="text-align: center; font-size: 0.75vw"
                                                    class="whiteText"
                                                    >, PRai:
                                                    {{
                                                        format(
                                                            item.data.gameProgress.main.prai.amount
                                                        )
                                                    }}</span
                                                >
                                                <span
                                                    v-if="
                                                        Decimal.gte(
                                                            item.data.gameProgress.main.prai
                                                                .totalEver,
                                                            10
                                                        )
                                                    "
                                                    style="text-align: center; font-size: 0.75vw"
                                                    class="whiteText"
                                                    >, PR2:
                                                    {{
                                                        format(
                                                            item.data.gameProgress.main.pr2.amount
                                                        )
                                                    }}</span
                                                >
                                                <span
                                                    v-if="
                                                        Decimal.gte(
                                                            item.data.gameProgress.main.pr2
                                                                .bestEver,
                                                            10
                                                        )
                                                    "
                                                    style="text-align: center; font-size: 0.75vw"
                                                    class="whiteText"
                                                    >, Kuaraniai:
                                                    {{
                                                        format(item.data.gameProgress.kua.amount)
                                                    }}</span
                                                >
                                            </div>
                                        </div>
                                        <div
                                            style="
                                                position: relative;
                                                width: 100%;
                                                height: 25%;
                                                display: flex;
                                                align-items: flex-end;
                                            "
                                        >
                                            <div
                                                style="
                                                    flex-grow: 0.3333;
                                                    flex-basis: 0;
                                                    text-align: left;
                                                    display: flex;
                                                    flex-direction: column;
                                                "
                                                class="fontVerdana"
                                            >
                                                <span style="font-size: 0.9vw" class="whiteText">{{
                                                    formatTime(item.data.totalRealTime, 0, 3, 4)
                                                }}</span>
                                                <span
                                                    v-if="game.currentSave != index"
                                                    style="font-size: 0.75vw"
                                                    class="whiteText"
                                                    >Offline for
                                                    {{
                                                        formatTime(
                                                            (Date.now() - item.data.lastUpdated) /
                                                                1000,
                                                            0,
                                                            3,
                                                            4
                                                        )
                                                    }}</span
                                                >
                                                <span style="font-size: 0.75vw" class="whiteText"
                                                    >Offline Time:
                                                    {{
                                                        formatTime(
                                                            item.data.offlineTime / 1000,
                                                            0,
                                                            3,
                                                            4
                                                        )
                                                    }}</span
                                                >
                                            </div>
                                            <div
                                                style="
                                                    flex-grow: 1;
                                                    flex-basis: 0;
                                                    text-align: right;
                                                    font-size: 1.2vw;
                                                "
                                                class="whiteText"
                                            >
                                                <button
                                                    @click="switchToSave(index)"
                                                    class="whiteText fontVerdana generatorButton"
                                                    :style="{
                                                        cursor:
                                                            game.currentSave !== index
                                                                ? 'pointer'
                                                                : 'not-allowed',
                                                        border: `0.12vw solid ${gRC(game.currentSave !== index ? gameVars.sessionTime : 4.0, game.currentSave !== index ? 1 : 0.5, game.currentSave !== index ? 1 : 0.125)}`
                                                    }"
                                                    style="
                                                        padding-left: 0.18vw;
                                                        padding-right: 0.18vw;
                                                        padding-top: 0.03vw;
                                                        padding-bottom: 0.03vw;
                                                        font-size: 0.75vw;
                                                        margin: 0.24vw;
                                                    "
                                                >
                                                    Load Save
                                                </button>
                                                <button
                                                    @click="duplicateSave(index)"
                                                    class="whiteText fontVerdana generatorButton"
                                                    :style="{
                                                        border: `0.12vw solid ${gRC(gameVars.sessionTime, 1, 1)}`
                                                    }"
                                                    style="
                                                        padding-left: 0.18vw;
                                                        padding-right: 0.18vw;
                                                        padding-top: 0.03vw;
                                                        padding-bottom: 0.03vw;
                                                        font-size: 0.75vw;
                                                        margin: 0.24vw;
                                                    "
                                                >
                                                    Duplicate Save
                                                </button>
                                                <button
                                                    @click="deleteSave(index)"
                                                    class="whiteText fontVerdana generatorButton"
                                                    :style="{
                                                        border: `0.12vw solid ${gRC(gameVars.sessionTime, 1, 1)}`
                                                    }"
                                                    style="
                                                        padding-left: 0.18vw;
                                                        padding-right: 0.18vw;
                                                        padding-top: 0.03vw;
                                                        padding-bottom: 0.03vw;
                                                        font-size: 0.75vw;
                                                        margin: 0.24vw;
                                                    "
                                                >
                                                    Delete Save
                                                </button>
                                                <button
                                                    @click="renameSave(index)"
                                                    class="whiteText fontVerdana generatorButton"
                                                    :style="{
                                                        border: `0.12vw solid ${gRC(gameVars.sessionTime, 1, 1)}`
                                                    }"
                                                    style="
                                                        padding-left: 0.18vw;
                                                        padding-right: 0.18vw;
                                                        padding-top: 0.03vw;
                                                        padding-bottom: 0.03vw;
                                                        font-size: 0.75vw;
                                                        margin: 0.24vw;
                                                    "
                                                >
                                                    Rename Save
                                                </button>
                                                <button
                                                    @click="importSave(index)"
                                                    class="whiteText fontVerdana generatorButton"
                                                    :style="{
                                                        border: `0.12vw solid ${gRC(gameVars.sessionTime, 1, 1)}`
                                                    }"
                                                    style="
                                                        padding-left: 0.18vw;
                                                        padding-right: 0.18vw;
                                                        padding-top: 0.03vw;
                                                        padding-bottom: 0.03vw;
                                                        font-size: 0.75vw;
                                                        margin: 0.24vw;
                                                    "
                                                >
                                                    Import Save
                                                </button>
                                                <button
                                                    @click="exportSave(index)"
                                                    class="whiteText fontVerdana generatorButton"
                                                    :style="{
                                                        border: `0.12vw solid ${gRC(gameVars.sessionTime, 1, 1)}`
                                                    }"
                                                    style="
                                                        padding-left: 0.18vw;
                                                        padding-right: 0.18vw;
                                                        padding-top: 0.03vw;
                                                        padding-bottom: 0.03vw;
                                                        font-size: 0.75vw;
                                                        margin: 0.24vw;
                                                    "
                                                >
                                                    Export Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="tab.tabList[tab.currentTab][1] === 1">
                <div
                    class="flex-container"
                    style="flex-direction: column; justify-content: center; align-items: center"
                >
                    <span style="font-size: 1.1vw" class="fontVerdana whiteText"
                        >Your mode selection is currently:
                        {{ displayModesNonOptArray(tmp.saveModes) }}</span
                    >
                    <div
                        class="flex-container"
                        style="flex-direction: row; justify-content: center"
                    >
                        <button
                            @click="createNewSave(tmp.saveModes)"
                            class="whiteText fontVerdana generatorButton"
                            style="
                                margin: 0.25vw;
                                border: 0.2vw solid #ffffff;
                                height: 5vw;
                                width: 12vw;
                                font-size: 0.75vw;
                            "
                        >
                            Add new save.
                            <span style="color: #ffff00"
                                >WARNING: None of the modes are implemented yet!</span
                            >
                        </button>
                        <button
                            @click="resetModes()"
                            class="whiteText fontVerdana generatorButton"
                            style="
                                margin: 0.25vw;
                                border: 0.2vw solid #ffffff;
                                height: 5vw;
                                width: 12vw;
                                font-size: 0.75vw;
                            "
                        >
                            Reset Mode Selection
                        </button>
                    </div>
                    <div
                        class="flex-container"
                        style="flex-direction: row; justify-content: center"
                    >
                        <div
                            style="
                                display: flex;
                                width: 60vw;
                                flex-wrap: wrap;
                                justify-content: center;
                            "
                        >
                            <div
                                v-for="(item, index) in SAVE_MODES"
                                :key="item.id"
                                class="flex-container"
                            >
                                <button
                                    @click="setTempModes(index)"
                                    class="whiteText fontVerdana tooltip"
                                    :style="{
                                        color: item.textColor,
                                        border: `0.12vw solid ${tmp.saveModes[index] ? item.borderSelectedColor : item.borderColor}`,
                                        backgroundColor: colorChange(
                                            item.bgColor,
                                            tmp.saveModes[index] ? 2.0 : 1.0,
                                            1.0
                                        )
                                    }"
                                    style="
                                        margin: 0.2vw;
                                        height: 2.5vw;
                                        width: 8vw;
                                        font-size: 0.8vw;
                                    "
                                >
                                    {{ item.name }}
                                    <span class="tooltiptext">
                                        <span style="font-size: 0.6vw">{{ item.desc }}</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="tab.tabList[tab.currentTab][0] === 1">
            <div class="flex-container" style="flex-direction: row; justify-content: center">
                <button
                    @click="setTimeSpeed()"
                    class="whiteText fontVerdana generatorButton"
                    style="
                        margin: 0.25vw;
                        border: 0.2vw solid #ff0000;
                        height: 5vw;
                        width: 12vw;
                        font-size: 0.75vw;
                        color: #ff0000;
                    "
                >
                    Set Time Speed. Currently: {{ format(player.setTimeSpeed, 2) }}
                </button>
                <button
                    @click="switchNotation()"
                    class="whiteText fontVerdana generatorButton"
                    style="
                        margin: 0.25vw;
                        border: 0.2vw solid #ffffff;
                        height: 5vw;
                        width: 12vw;
                        font-size: 0.75vw;
                    "
                >
                    Switch notation. Currently: {{ NOTATION_LIST[player.settings.notation] }}
                </button>
                <button
                    @click="player.settings.scaleSoftColors = !player.settings.scaleSoftColors"
                    class="whiteText fontVerdana generatorButton"
                    style="
                        margin: 0.25vw;
                        border: 0.2vw solid #ffffff;
                        height: 5vw;
                        width: 12vw;
                        font-size: 0.75vw;
                    "
                >
                    Show scaling/softcap colors. Currently: {{ player.settings.scaleSoftColors }}
                </button>
            </div>
        </div>
    </div>
</template>
