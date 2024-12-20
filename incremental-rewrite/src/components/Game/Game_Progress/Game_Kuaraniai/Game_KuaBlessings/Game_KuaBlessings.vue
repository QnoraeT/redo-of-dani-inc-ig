<script setup lang="ts">
import { format } from "@/format";
import { player, shiftDown, tmp } from "@/main";
import { buyKBUpg, gainKBOnClick, KUA_BLESS_TIER, KUA_BLESS_UPGS } from "./Game_KuaBlessings";
import Decimal from "break_eternity.js";
import { COL_CHALLENGES } from "../../Game_Colosseum/Game_ColChallenges/Game_ColChalData";
</script>
<template>
    <div style="margin-top: 0.2vw; background-color: #021; border: 0.2vw solid #0f4; margin-left: auto; margin-right: auto; display: flex; justify-content: center; flex-direction: row; box-shadow: 0 0 0.8vw 0.24vw rgb(0, 66, 17); height: 40vw; width: 80vw;">
        <div class="fontVerdana" style="display: flex; flex-direction: column; border: 0.24vw solid #0f4; padding: 0.6vw; height: 38.4vw; width: 50%;">
            <span style="color: #0f2; text-align: center; font-size: 1.2vw">
                You have 
                <span style="font-size: 1.4vw"><b>{{ format(player.gameProgress.kua.blessings.amount, 3) }}</b></span> 
                Kuaraniai Blessings. 
                <span style="font-size: 1vw">({{ format(tmp.kua.blessings.perSec, 2) }}/s)</span>
            </span>
            <span style="color: #0f2; text-align: center; font-size: 0.8vw">
                You can hold shift on these upgrades to see what their cost and effect will be next purchase.
            </span><br>
            <span style="color: #0f2; text-align: center; font-size: 0.7vw">
                This boosts Upgrade 1's base by +<span style="font-size: 0.8vw"><b>{{ format(tmp.kua.blessings.upg1Base, 3) }}</b></span><span v-if="COL_CHALLENGES.im.type2ChalEff![1].gt(0)">&nbsp;(×{{ format(tmp.kua.blessings.upg1Base.add(1).pow(COL_CHALLENGES.im.type2ChalEff![1]), 2) }})</span>.<br>
                This boosts Upgrade 2's base by +<span style="font-size: 0.8vw"><b>{{ format(tmp.kua.blessings.upg2Base, 3) }}</b></span><span v-if="COL_CHALLENGES.im.type2ChalEff![1].gt(0)">&nbsp;(×{{ format(tmp.kua.blessings.upg2Base.add(1).pow(COL_CHALLENGES.im.type2ChalEff![1]), 2) }})</span>.<br>
                This boosts Effective Kuaraniai by ×<span style="font-size: 0.8vw"><b>{{ format(tmp.kua.blessings.kuaEff, 2) }}</b></span>.
            </span>
            <button class="whiteText fontVerdana" :class="{ nope: Decimal.gt(player.gameProgress.kua.blessings.clickCooldown, 0), ok: Decimal.lte(player.gameProgress.kua.blessings.clickCooldown, 0) }" style="padding: 0vw; width: 12vw; height: 2vw; background-color: #041; margin-top: 0.5vw; margin-left: auto; margin-right: auto" :style="{ cursor: Decimal.gt(player.gameProgress.kua.blessings.clickCooldown, 0) ? 'not-allowed' : 'pointer' }" @click="gainKBOnClick()">
                <div class="whiteText" style="display: flex; justify-content: center; position: relative; width: 100%; height: 70%; font-size: 0.6vw;">
                    <span class="centered-text" style="height: 100%">
                        Gain {{ format(tmp.kua.blessings.perClick, 1) }} KBlessings.
                    </span>
                </div>
                <div style="height: 30%; width: 100%; position: relative">
                    <!-- does nothing, is actually the base of the bar -->
                    <div style="position: absolute; top: 0; left: 0; background-color: #002000; height: 100%; width: 100%;"></div>
                    <div
                        :style="{
                            width: `${
                                Decimal.sub(1, Decimal.max(player.gameProgress.kua.blessings.clickCooldown, 0).div(0.25)).mul(100).toNumber()
                            }%`
                        }"
                        style="position: absolute; top: 0; left: 0; height: 100%; background-color: #00ff00; "
                    ></div>
                </div>
            </button>
            <div class="flex-container" style="margin-top: 0.4vw; flex-wrap: wrap; justify-content: center;">
                <div v-for="(item, index) in KUA_BLESS_UPGS" :key="index">
                    <!-- set padding to 0vw because it auto-inserts padding -->
                    <button @click="buyKBUpg(index)" :class="{ nope: !tmp.kua.blessings.upgrades[index].canBuy, ok: tmp.kua.blessings.upgrades[index].canBuy}" :style="{ cursor: tmp.kua.blessings.upgrades[index].canBuy ? 'pointer' : 'not-allowed' }" v-if="item.show" style="width: 12vw; height: 8vw; margin-left: 0.15vw; margin-right: 0.15vw; margin-bottom: 0.3vw; font-size: 0.55vw; transition: 0.2s; background-color: #00300a" class="fontVerdana whiteText">
                        <span style="margin-right: 0.5vw; color: #0d3"><b>#{{index + 1}}</b></span><span class="whiteText">×{{ format(player.gameProgress.kua.blessings.upgrades[index]) }}</span><br>
                        <!-- <br><span v-if="!item.implemented" style="color: #ff0; font-size: 0.5vw"><b>[ NOT IMPLEMENTED ]</b><br></span> -->
                        <span v-if="!shiftDown">{{item.desc(player.gameProgress.kua.blessings.upgrades[index])}}</span>
                        <span v-if="shiftDown">{{item.desc(Decimal.add(player.gameProgress.kua.blessings.upgrades[index], 1))}}</span>
                        <br><br>
                        <span v-if="!shiftDown">Currently: <b style="font-size: 0.65vw;">{{item.effDesc(player.gameProgress.kua.blessings.upgrades[index])}}</b><br></span>
                        <span v-if="!shiftDown">Cost: <b style="font-size: 0.65vw;">{{format(item.cost(player.gameProgress.kua.blessings.upgrades[index]).ceil())}}</b> KBlessings.</span>
                        <span v-if="shiftDown">Next: <b style="font-size: 0.65vw;">{{item.effDesc(Decimal.add(player.gameProgress.kua.blessings.upgrades[index], 1))}}</b><br></span>
                        <span v-if="shiftDown">Next Cost: <b style="font-size: 0.65vw;">{{format(item.cost(Decimal.add(player.gameProgress.kua.blessings.upgrades[index], 1)).ceil())}}</b> KBlessings.</span>
                    </button>
                </div>
            </div>
        </div>
        <div class="flex-container" style="flex-direction: column; border: 0.18vw solid #0f4; height: 39.8vw; width: 50%;">
            <div v-if="KUA_BLESS_TIER.rank.show" class="flex-container whiteText fontVerdana" style="justify-content: center; background-color: #004010; position: relative; width: 100%; height: 15%;">
                <div class="flex-container fontVerdana whiteText" style="width: 95%; height: 80%; top: 7.5%; font-size: 0.6vw; position: relative; border: 0.18vw solid #0f4; background-color: #005014; align-items: center">
                    <div style="text-align: center; position: relative; width: 30%; left: 0%">
                        You are in KBlessing Rank <span style="font-size: 0.9vw"><b>{{ format(tmp.kua.blessings.rank) }}</b></span>.<br>
                        Next at: <span style="font-size: 0.9vw"><b>{{ format(KUA_BLESS_TIER.rank.req(tmp.kua.blessings.rank)) }}</b></span> KBlessings.
                    </div>
                    <div style="text-align: center; position: relative; font-size: 0.6vw; width: 70%; right: 0%">
                        Your KBlessing Ranks:
                        <li>{{ KUA_BLESS_TIER.rank.desc.kuaBlessGainActive }}</li>
                        <li>{{ KUA_BLESS_TIER.rank.desc.kuaBlessGainIdle }}</li>
                    </div>
                </div>
            </div>
            <div v-if="KUA_BLESS_TIER.tier.show" class="flex-container whiteText fontVerdana" style="justify-content: center; background-color: #005014; position: relative; width: 100%; height: 15%;">
                <div class="flex-container fontVerdana whiteText" style="width: 95%; height: 80%; top: 7.5%; font-size: 0.6vw; position: relative; border: 0.18vw solid #0f4; background-color: #006018; align-items: center">
                    <div style="text-align: center; position: relative; width: 30%; left: 0%">
                        You are in KBlessing Tier <span style="font-size: 0.9vw"><b>{{ format(tmp.kua.blessings.tier) }}</b></span>.<br>
                        Next at: <span style="font-size: 0.9vw"><b>{{ format(KUA_BLESS_TIER.tier.req(tmp.kua.blessings.tier)) }}</b></span> Ranks.
                    </div>
                    <div style="text-align: center; position: relative; font-size: 0.6vw; width: 70%; right: 0%">
                        Your KBlessing Tiers:
                        <li>{{ KUA_BLESS_TIER.tier.desc.kuaBlessEff }}</li>
                    </div>
                </div>
            </div>
            <div v-if="KUA_BLESS_TIER.tetr.show" class="flex-container whiteText fontVerdana" style="justify-content: center; background-color: #004010; position: relative; width: 100%; height: 15%;">
                <div class="flex-container fontVerdana whiteText" style="width: 95%; height: 80%; top: 7.5%; font-size: 0.6vw; position: relative; border: 0.18vw solid #0f4; background-color: #005014; align-items: center">
                    <div style="text-align: center; position: relative; width: 30%; left: 0%">
                        You are in KBlessing Tetr <span style="font-size: 0.9vw"><b>{{ format(tmp.kua.blessings.tetr) }}</b></span>.<br>
                        Next at: <span style="font-size: 0.9vw"><b>{{ format(KUA_BLESS_TIER.tetr.req(tmp.kua.blessings.tetr)) }}</b></span> Tiers.
                    </div>
                    <div style="text-align: center; position: relative; font-size: 0.6vw; width: 70%; right: 0%">
                        Your KBlessing Tetr:
                        <li>{{ KUA_BLESS_TIER.tetr.desc.kuaRankActive }}</li>
                        <li>{{ KUA_BLESS_TIER.tetr.desc.kuaRankIdle }}</li>
                        <li>{{ KUA_BLESS_TIER.tetr.desc.pr2Eff }}</li>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
