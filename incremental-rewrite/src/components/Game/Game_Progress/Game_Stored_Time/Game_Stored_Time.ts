import { player } from "@/main";

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
