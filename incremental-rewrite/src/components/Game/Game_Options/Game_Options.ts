import { player } from "@/main";

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