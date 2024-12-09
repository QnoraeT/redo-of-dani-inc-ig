import { gameVars } from "./main";

export let popupID = 0;
export const popupList: Array<Popup> = [];

type Popup = {
    id: number;
    maxlife: number;
    life: number;
    type: number;
    title: string;
    message: string;
    color: string;
    opacity: number;
};

export const spawnPopup = (type = 0, text: string, title: string, timer: number, color: string) => {
    popupList.push({
        id: popupID,
        maxlife: timer,
        life: timer,
        type: type,
        title: title,
        message: text,
        color: color,
        opacity: 0
    });
    popupID++;
};

export const diePopupsDie = () => {
    for (let i = 0; i < popupList.length; i++) {
        popupList[i].life -= gameVars.value.trueDelta;
        popupList[i].opacity = 1;
        if (popupList[i].maxlife - popupList[i].life < 0.2) {
            popupList[i].opacity = (popupList[i].maxlife - popupList[i].life) / 0.2;
        }
        if (popupList[i].life < 0.2) {
            popupList[i].opacity = popupList[i].life / 0.2;
        }
        if (popupList[i].life < 0) {
            popupList.splice(i, 1);
        }
    }
};
