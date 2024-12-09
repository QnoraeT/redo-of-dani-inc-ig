import { player } from "@/main";
import Decimal from "break_eternity.js";

export const NOTATION_LIST = ["Mixed Scientific", "Scientific", "Letters", "Antimatter Dimensions Resources", "Distance Incremental Rank"];

export const switchNotation = () => {
    let txt = `What notation would you like to switch to? (Input a number to switch notations, or blank to keep the current notation.)\nList:`;
    for (let i = 0; i < NOTATION_LIST.length; i++) {
        txt += `\n${i+1}: ${NOTATION_LIST[i]}`;
    }

    const i = prompt(txt);
    if (!(i === "" || i === null)) {
        const numI = Number(i) - 1;
        if (isNaN(numI)) {
            alert("Your input is not a number...");
            return;
        }

        if (numI > NOTATION_LIST.length) {
            alert("Your input is out of range...");
            return;
        }

        if (numI < 0) {
            alert("Your input is not a positive number...");
            return;
        }

        if (Math.floor(numI) !== numI) {
            alert("Your input is not an integer...");
            return;
        }
        player.value.settings.notation = numI;
    }
};

export const setTimeSpeed = () => {
    const i = prompt(
        "What speed would you like to set this game to? (Input blank to keep the current timespeed.)"
    );
    if (!(i === "" || i === null)) {
        const numI = new Decimal(i);

        if (Decimal.isNaN(numI)) {
            alert("Your set time speed is not a number...");
            return;
        }
        player.value.setTimeSpeed = numI;
    }
};

export const makeColor = (text: string, color: string) => {
    return `<span style='color: ${color}'>${text}</span>`
}

export const UPDATE_LOG = [
    {
        name: `v1.1.0 - Dec-07-2024`,
        desc: `
        <span style='font-size: 1.2vw'><b>< --- Features --- ></b></span><br>
        Made new unlocks.<br>
        Added highlights for when an upgrade is available.<br>
        Added achievements ${makeColor('Achievement #1, 21-24', '#ff0')}.<br>
        Added achievements ${makeColor('Achievement #2, 18-19', '#ff0')}.<br>
        Made a highlight for ${makeColor('Kuaraniai', '#a4f')} upgrades when they are able to be bought.<br>
        Added ${makeColor('Colosseum Challenge #5', '#f62')}.<br>
        Added 3 ${makeColor('Colosseum Researches', '#f62')}.<br>
        <br>
        <span style='font-size: 1.2vw'><b>< --- Changes --- ></b></span><br>
        Changed PR2 descriptions.<br>
        Nerfed ${makeColor('KShard', '#a4f')} and ${makeColor('KPower', '#a4f')}'s effect on PRai and Points.<br>
        Nerfed ${makeColor('KShard', '#a4f')} Upgrade 10.<br>
        Buffed ${makeColor('KBlessings', '#0f0')} generation.<br>
        ${makeColor('KBlessings', '#0f0')} in ${makeColor('Colosseum', '#f62')} challenges now deduct time in the challenge.<br>
        Decreased ${makeColor('Inverted Mechanics', '#f62')}'s requirement.<br>
        <br>
        <span style='font-size: 1.2vw'><b>< --- Bug Fixes --- ></b></span><br>
        Fixed point softcap display.<br>
        Fixed ${makeColor('Achievement #20, 1', '#ff0')}.<br>
        ${makeColor('Achievement #4, 3', '#ff0')} should now be achievable.<br>
        Fixed ${makeColor('KBlessings', '#0f0')} upgrades not being purchasable.<br>
        Fixed ${makeColor('Colosseum', '#f62')} resets not working properly.<br>
        `
    },
    {
        name: `v1.0.0.2 - Nov-06-2024`,
        desc: `
        Published game.
        `
    },
]