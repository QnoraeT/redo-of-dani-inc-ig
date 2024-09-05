import { player } from "@/main";

export const NOTATION_LIST = ["Mixed Scientific", "Scientific", "Letters"]

export const switchNotation = () => {
    const i = prompt('What notation would you like to switch to? (Input blank to keep the current notation.)\nList:\nMixed Scientific\nScientific\nLetters'); 
    if (!(i === '' || i === null)) { 
        const notI = NOTATION_LIST.indexOf(i);
        if (notI === -1) {
            alert('Your notation isn\'t included in the list...')
            return;
        }
        player.value.settings.notation = notI;
    }
}

export const setTimeSpeed = () => {
    const i = prompt('What speed would you like to set this game to? (Input blank to keep the current timespeed.)'); 
    if (!(i === '' || i === null)) { 
        const numI = Number(i)

        if (isNaN(numI)) { 
            alert('Your set time speed is not a number...');
            return;
        } 
        player.value.setTimeSpeed = numI;
    }
}