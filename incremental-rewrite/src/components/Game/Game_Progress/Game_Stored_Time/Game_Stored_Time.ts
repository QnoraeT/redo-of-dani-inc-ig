import { player } from "@/main";

export const timeSpeedBoost = (x = player.value.offlineTime) => {
    return Math.pow(1 + (x / 1000), player.value.gameProgress.dilatedTime.speed/2)
}

export const speedToConsume = () => {
    return Math.pow(1 + (player.value.offlineTime / 1000), player.value.gameProgress.dilatedTime.speed) - 1;
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
        player.value.gameProgress.dilatedTime.normalizeTime = numI / 1000;
    }
};
