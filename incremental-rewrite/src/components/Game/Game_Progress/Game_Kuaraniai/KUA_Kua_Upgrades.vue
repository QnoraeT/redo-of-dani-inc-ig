<script setup lang="ts">
import { format } from "@/format";
import type { Kua_Upgrade } from "./Game_Kuaraniai";

defineProps<{
    item: Kua_Upgrade;
    index: number;
    type: "KPower" | "KShards";
}>();
</script>
<template>
    <button
        style="
            margin-left: 0.16vw;
            margin-right: 0.16vw;
            width: 10vw;
            height: 10vw;
            font-size: 0.72vw;
        "
        class="whiteText kuaButton2 fontVerdana"
    >
        <!-- <span style="color: #ff0; font-size: 0.8vw; margin-right: 0.5vw"><b>#{{index + 1}}</b></span><span v-if="item.eh" style="color: #ff0; font-size: 0.8vw"><b>[ NOT IMPLEMENTED ]</b><br></span> -->
        <span style="vertical-align: top">{{ item.desc }}</span>
        <br /><br />
        <span style="vertical-align: bottom"
            ><b>Cost:</b><br />{{ format(item.cost, 1) }} {{ type }}</span
        >
    </button>
</template>
