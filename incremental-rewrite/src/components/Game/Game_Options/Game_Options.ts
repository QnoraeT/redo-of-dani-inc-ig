import { player } from "@/main";
import Decimal from "break_eternity.js";

export const NOTATION_LIST = ["Mixed Scientific", "Scientific", "Letters"];

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
