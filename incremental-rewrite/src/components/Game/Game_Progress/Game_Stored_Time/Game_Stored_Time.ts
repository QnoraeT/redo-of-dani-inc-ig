import { player } from "@/main";
import Decimal from "break_eternity.js";

export const timeSpeedBoost = (x = player.value.offlineTime) => {
    return Decimal.div(x, 1000).add(1).root(1.5).pow(player.value.prog.dilatedTime.speed)
}

export const speedToConsume = () => {
    return Decimal.div(player.value.offlineTime, 1000).add(1).pow(player.value.prog.dilatedTime.speed).sub(1);
}

export const setNormalizationTime = () => {
    const i = prompt(
        "How much to limit tick lengths (in ms)? (Input blank to keep the normalization time.)"
    );
    if (!(i === "" || i === null)) {
        const numI = Number(i);

        if (isNaN(numI)) {
            alert("Your set normalization time is not a number...");
            return;
        }

        if (numI < 0) {
            alert("Your set normalization time is negative...");
            return;
        }
        player.value.prog.dilatedTime.normalizeTime = numI / 1000;
    }
};
