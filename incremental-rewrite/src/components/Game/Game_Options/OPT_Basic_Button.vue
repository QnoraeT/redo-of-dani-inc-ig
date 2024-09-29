<script setup lang="ts">
defineProps<{
    html: string;
}>();
</script>
<template> 
    <button class="whiteText fontVerdana generatorButton" style="margin: 0.25vw; border: 0.2vw solid #ffffff; height: 5vw; width: 12vw; font-size: 0.75vw;">
        <span v-html="html"></span>
    </button>
</template>
