<script setup lang="ts">
import { TABS_LIST, switchTab } from '@/components/MainTabs/MainTabs'
import { tab } from '@/main'
</script>
<template>
    <div id="tabs">
        <div class="flex-container" style="justify-content: center; margin-bottom: 0.96vw; margin-top: 0.96vw;">
            <div v-for="item in TABS_LIST" :key='item.staticName'>
                <button :style="{
                    color: item.textColor, 
                    marginRight: `0.24vw`, 
                    marginLeft: `0.24vw`, 
                    backgroundColor: item.backgroundColor, 
                    border: `0.24vw solid ${tab.currentTab === item.staticName ? item.highlightColor : item.outlineColor}` 
                }"
                v-if="item.if" class="mediumText fontTrebuchetMS" @click="switchTab(item.staticName)">{{item.name}}</button>
            </div>
        </div>
    </div>
</template>

