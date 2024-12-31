<script setup lang="ts">
import { tab } from '@/main'
import Game_Taxation from './Game_Taxation/Game_Taxation.vue';
import Game_Growan from './Game_Growan/Game_Growan.vue';
</script>
<template>
    <div v-if="tab.currentTab === 6">
        <Game_Taxation />
    </div>
    <div v-if="tab.currentTab === 7">
        <Game_Growan />
    </div>
</template>
