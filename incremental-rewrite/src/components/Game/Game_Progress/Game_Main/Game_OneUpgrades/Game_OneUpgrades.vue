<script setup lang="ts">
import { format } from '@/format';
import { inChallenge } from '../../Game_Colosseum/Game_ColChallenges/Game_ColChalHandler';
import { buyOneMainUpg, getOMUpgrade, MAIN_ONE_UPGS, maxxedOMUpgrade } from './Game_OneUpgrades';
import { tmp } from '@/main';


</script>
<template>
    <div class="flex-container" style="flex-wrap: wrap; align-content: flex-start; margin-top: 1vw; margin-left: auto; margin-right: auto; display: flex; justify-content: center; flex-direction: row; padding: 0.6vw; height: 45vw; width: 65vw;">
        <div v-for="(item, index) in MAIN_ONE_UPGS" :key="index">
            <!-- set padding to 0vw because it auto-inserts padding -->
            <button @click="buyOneMainUpg(index)" :class="{ nope: !tmp.main.oneUpgrades[index].canBuy && !maxxedOMUpgrade(index), ok: tmp.main.oneUpgrades[index].canBuy && !maxxedOMUpgrade(index), done: maxxedOMUpgrade(index) }" :style="{ backgroundColor: maxxedOMUpgrade(index) ? '#303030' : '#202020' }" v-if="item.show.value" style="width: 12vw; height: 8vw; margin-left: 0.18vw; margin-right: 0.18vw; margin-bottom: 0.36vw; font-size: 0.65vw;" class="generatorButton fontVerdana whiteText">
                <span style="font-size: 0.75vw; margin-right: 0.5vw; color: #ddd"><b>#{{index + 1}}</b></span><span v-if="inChallenge('im')" class="whiteText">×{{ format(getOMUpgrade(index)) }}</span>
                <br><span v-if="(item.implemented !== undefined) && (item.implemented === false)" style="color: #ff0; font-size: 0.5vw"><b>[ NOT IMPLEMENTED ]</b><br></span>
                <span class="vertical-align: top;">{{item.desc}}</span>
                <br><br>
                <span class="vertical-align: bottom;">Currently: <b><span style="font-size: 0.75vw; color: #fff">{{item.effectDesc}}</span></b></span><br>
                <span v-if="!maxxedOMUpgrade(index)" class="vertical-align: bottom;">Cost: <b><span style="font-size: 0.75vw; color: #fff">{{format(item.cost.value.ceil())}}</span></b> PRai.</span>
                <span v-if="maxxedOMUpgrade(index)" class="vertical-align: bottom;"><b><span style="font-size: 0.75vw; color: #fff">Bought!</span></b></span>
            </button>
        </div>
    </div>
</template>