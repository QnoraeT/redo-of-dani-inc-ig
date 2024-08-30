import { gameVars } from "./main"

export let popupID = 0;
export const popupList: Array<Popup> = [];

type Popup = {
    id: number
    life: number
    type: number
    title: string
    message: string
    color: string
}

export const spawnPopup = (type = 0, text: string, title: string, timer: number, color: string) => {
    popupList.push({
        id: popupID,
        life: timer,
        type: type,
        title: title,
        message: text,
        color: color
    });
    popupID++;
}

export const diePopupsDie = () => {
    for (let i = 0; i < popupList.length; i++) {
        popupList[i].life -= gameVars.value.delta;
        if (popupList[i].life < 0) {
            popupList.splice(i, 1);
        }
    }
}