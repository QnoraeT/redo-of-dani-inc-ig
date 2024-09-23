<script setup lang="ts">
defineProps<{
    name: string
    width?: number
    selected: boolean
}>()
</script>
<template>
    <button style="border: 0.2vw solid #ffffff;" :style="{ width: `${width === undefined ? 7.5 : width}vw` }" :class="{ generatorButton: !selected, generatorButtonSelected: selected }" class="whiteText fontVerdana normalTabButton">
        {{ name }}
    </button>
</template>

