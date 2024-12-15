import {
    game,
    initPlayer,
    player,
    tmp,
    setPlayerFromSave,
    setGameFromSave,
    initGameBeforeSave,
    gameVars
} from "./main";
import { spawnPopup } from "./popups";
import { compressToBase64, decompressFromBase64 } from 'lz-string'

export const saveID = "danidanijr_save_revamp_redo";
export const SAVE_MODES = [
    {
        name: "Hard",
        desc: "This mode makes the game harder, meaning there will be more strategizing, and sometimes a longer wait time. Some requirements will also be tougher to satisfy. However, some other requirements have been made slightly easier to somewhat accomodate for this.",
        borderColor: "#ff8000",
        borderSelectedColor: "#ffc080",
        bgColor: "#663300",
        textColor: "#ffc080"
    },
    {
        name: "Extreme",
        desc: "This mode makes the game way more difficult, meaning this does what Hard does, + you might also have to solve puzzles as well. This mode may also add in special layers to compensate.",
        borderColor: "#ff5040",
        borderSelectedColor: "#ffa080",
        bgColor: "#662820",
        textColor: "#ffd0c0"
    },
    {
        name: "Easy",
        desc: "This mode makes the game easier. This increases the pace of the game, and requirements with conditions will be nerfed.",
        borderColor: "#40ff60",
        borderSelectedColor: "#a0ffc0",
        bgColor: "#104018",
        textColor: "#80ffa0"
    },
    {
        name: "Idler's Dream",
        desc: "This mode makes the game more like an idle game instead of the hybrid it is. (At least I hope so... >_>') Many things may become slower, but you will not have to be active as much, and the difficulty will stay roughly the same.",
        borderColor: "#80c0ff",
        borderSelectedColor: "#d0e8ff",
        bgColor: "#203040",
        textColor: "#c0d0e0"
    },
    {
        name: "Softcap Central",
        desc: "This mode adds many, many softcaps into the game. Truly a Jacorbian spectacle! There will be a few added mechanics to help you deal with these softcaps, but overall the game will be harder.",
        borderColor: "#c040ff",
        borderSelectedColor: "#e0a0ff",
        bgColor: "#301a46",
        textColor: "#e0c0ff"
    },
    {
        name: "Scaled Ruins",
        desc: 'This mode adds many, many scaling increases into the game. Is IM:R calling? This also includes scaling increases beyond the legendary "Atomic" scaling. There will be a few added mechanics to help you deal with these softcaps, but overall the game will be harder.',
        borderColor: "#6040ff",
        borderSelectedColor: "#a080ff",
        bgColor: "#1f1a46",
        textColor: "#c8c0ff"
    }
];

export const setTempModes = (id: number): void => {
    tmp.value.saveModes[id] = !tmp.value.saveModes[id];
};

export const resetModes = (): void => {
    for (let i = 0; i < tmp.value.saveModes.length; i++) {
        tmp.value.saveModes[i] = false;
    }
};

export const displayModes = (mode: Array<number>): string => {
    let txt = "";
    if (mode.length === 0) {
        return "Normal";
    }
    if (mode.length === 1) {
        return SAVE_MODES[mode[0]].name;
    }
    for (let i = 0; i < mode.length - 1; i++) {
        txt += `${SAVE_MODES[mode[i]].name}, `;
    }
    txt += SAVE_MODES[mode[mode.length - 1]].name;
    return txt;
};

export const displayModesNonOptArray = (modes: Array<boolean>): string => {
    const mode = [];
    let txt = "";
    for (let i = 0; i < modes.length; i++) {
        if (modes[i]) {
            mode.push(i);
        }
    }
    if (mode.length === 0) {
        return "Normal";
    }
    if (mode.length === 1) {
        return SAVE_MODES[mode[0]].name;
    }
    for (let i = 0; i < mode.length - 1; i++) {
        txt += `${SAVE_MODES[mode[i]].name}, `;
    }
    txt += SAVE_MODES[mode[mode.length - 1]].name;
    return txt;
};

export const saveTheFrickingGame = (clicked = false): void => {
    localStorage.setItem(saveID, compressSave(game.value));
    if (clicked) {
        spawnPopup(0, `The game has been saved!`, `Save`, 3, `#00FF00`);
    }
};

export const resetTheWholeGame = (prompt: boolean): void => {
    if (prompt) {
        if (!confirm("Are you sure you want to delete EVERY save?")) {
            return;
        }
        if (!confirm("You cannot recover ANY of your save files unless if you have an exported backup! Are you still sure? [Final Warning]")) {
            return;
        }
    }

    game.value = initGameBeforeSave();
    initPlayer(true);
    saveTheFrickingGame();
    tmp.value.gameIsRunning = false;
};

export const resetThisSave = (prompt: boolean): void => {
    if (prompt) {
        if (!confirm("Are you sure you want to delete this save?")) {
            return;
        }
        if (
            !confirm(
                "You cannot recover this save unless if you have an exported backup! Are you still sure? [Final Warning]"
            )
        ) {
            return;
        }
    }
    initPlayer(true);
    saveTheFrickingGame();
    tmp.value.gameIsRunning = false;
};

export const importSFIntoNew = (): void => {
    if (!confirm("Are you sure you want to do this? This will overwrite this save file!")) {
        return;
    }
    const save = prompt("Paste your save file here.");

    if (save === "" || save === null) {
        return;
    }

    const convertedSave = JSON.parse(decompressSave(save));

    let isSaveList = true;
    let error;
    try {
        convertedSave.list[0].id;
    } catch(e) {
        isSaveList = false;
        error = e;
    }

    if (isSaveList) {
        alert("Importing save file failed because this is an export of a save list, and not a save file, or the save file is corrupted.");
        spawnPopup(0, error as string, "Something went wrong!", 5, `#FF0000`);
        return;
    }

    game.value.list.push({
        name: convertedSave.name,
        modes: convertedSave.modes,
        data: convertedSave.data
    });

    saveTheFrickingGame();
    tmp.value.gameIsRunning = false;

    spawnPopup(0, "Successfully created and imported save file!", "Imported Save File to New", 3, `#00FF00`);
}

export const createNewSave = (modes: Array<boolean>): void => {
    const mode = [];
    for (let i = 0; i < modes.length; i++) {
        if (modes[i]) {
            mode.push(i);
        }
    }
    game.value.list.push({
        name: `Save #${game.value.list.length + 1}`,
        modes: mode,
        data: player.value
    });
    game.value.currentSave = game.value.list.length - 1;
    game.value.list[game.value.currentSave].data = initPlayer();
    saveTheFrickingGame();
    tmp.value.gameIsRunning = false;
};

export const switchToSave = (id: number): void => {
    game.value.currentSave = id;
    player.value = game.value.list[game.value.currentSave].data;
    saveTheFrickingGame();
    gameVars.value.lastSave = gameVars.value.sessionTime;
    tmp.value.gameIsRunning = false;
};

export const renameSave = (id: number): void => {
    const i = prompt("What name would you like to give this save? (Input blank to keep the name.)");
    if (!(i === "" || i === null)) {
        game.value.list[id].name = i;
    }
};

export const duplicateSave = (id: number): void => {
    if (!confirm("Are you sure you want to duplicate this save?")) {
        return;
    }
    if (id < game.value.currentSave) {
        game.value.currentSave++;
    }
    // i don't know how this doesn't bug out, this also copied the id for the save
    game.value.list.splice(id + 1, 0, game.value.list[id]);
    saveTheFrickingGame();
    tmp.value.gameIsRunning = false;
};

export const deleteSave = (id: number): void => {
    if (!confirm("Are you sure you want to delete this save?")) {
        return;
    }
    if (!confirm("You cannot recover this save unless if you have an exported backup! Are you still sure? [Final Warning]")) {
        return;
    }
    if (game.value.list.length === 1) {
        initPlayer(true);
        return;
    }
    game.value.list.splice(id, 1);
    if (game.value.currentSave === id) {
        if (id === 0) {
            switchToSave(id);
            return;
        }
        switchToSave(id - 1);
    }
    if (id < game.value.currentSave) {
        game.value.currentSave--;
    }
};

export const compressSave = (save: any): string => {
    return compressToBase64(JSON.stringify(save));
}

export const decompressSave = (save: string): string => {
    let type;
    try {
        JSON.parse(atob(save));
        type = 0;
    } catch {
        try {
            JSON.parse(decompressFromBase64(save));
            type = 1;
        } catch (e) {
            alert(`Importing and decompressing save failed! ${e}`);
            spawnPopup(0, e as string, "Something went wrong!", 5, `#FF0000`);
            throw new Error(`Importing and decompressing save failed! ${e}`);
        }
    }

    let convertedSave;
    if (type === 0) {
        convertedSave = atob(save);
    } else {
        convertedSave = decompressFromBase64(save);
    }
    return convertedSave;
}

export const importSave = (id: number): void => {
    if (!confirm("Are you sure you want to do this? This will overwrite this save file!")) {
        return;
    }
    const save = prompt("Paste your save file here.");

    if (save === "" || save === null) {
        return;
    }

    const convertedSave = JSON.parse(decompressSave(save));

    let isSaveList = true;
    let error;
    try {
        convertedSave.list[0].id;
    } catch(e) {
        isSaveList = false;
        error = e;
    }

    if (isSaveList) {
        alert("Importing save file failed because this is an export of a save list, and not a save file, or the save file is corrupted.");
        spawnPopup(0, error as string, "Something went wrong!", 5, `#FF0000`);
        return;
    }

    setPlayerFromSave(convertedSave, id);
    saveTheFrickingGame();
    tmp.value.gameIsRunning = false;

    spawnPopup(0, "Successfully imported save file!", "Imported Save File", 3, `#00FF00`);
};

export const exportSave = (id: number): void => {
    const str = compressSave(game.value.list[id]);
    const el = document.createElement("textarea");
    el.value = str;
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 999999);
    document.execCommand("copy");
    document.body.removeChild(el);

    spawnPopup(0, "Successfully exported save file to clipboard!", "Exported Save File", 3, `#00FF00`);
};

export const importSaveList = (): void => {
    if (!confirm("Are you sure you want to do this? This will overwrite EVERY save file in your save list!")) {
        return;
    }

    const save = prompt("Paste your save list here.");

    if (save === "" || save === null) {
        return;
    }

    const convertedSave = JSON.parse(decompressSave(save));

    let isSaveFile = true;
    let error;
    try {
        convertedSave.data.lastUpdated;
        convertedSave.data.offlineTime;
    } catch(e) {
        isSaveFile = false;
        error = e;
    }

    if (isSaveFile) {
        alert("Importing save list failed because either this is an export of a save file, and not a save list, or this save file is corrupted.");
        spawnPopup(0, error as string, "Something went wrong!", 5, `#FF0000`);
        return;
    }

    setGameFromSave(convertedSave);
    saveTheFrickingGame();
    tmp.value.gameIsRunning = false;

    spawnPopup(0, "Successfully imported save list!", "Imported Save List", 3, `#00FF00`);
};

export const exportSaveList = (): void => {
    const str = compressSave(game.value);
    const el = document.createElement("textarea");
    el.value = str;
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 999999);
    document.execCommand("copy");
    document.body.removeChild(el);

    spawnPopup(0, "Successfully exported save list to clipboard!", "Exported Save List", 3, `#00FF00`);
};

export const setAutosaveInterval = (): void => {
    const i = window.prompt(
        "Set your new auto-saving interval in seconds. Set it to Infinity if you want to disable auto-saving."
    );

    if (i === "") {
        alert("Your set autosave interval is empty...");
        return;
    }

    let numI = Number(i);

    if (isNaN(numI)) {
        alert("Your set autosave interval is not a number...");
        return;
    }

    if (numI < 1) {
        alert("Your set autosave interval is way too fast or negative...");
        return;
    }

    // saving sets Infinity to null for some reason, so i have to cap it
    if (numI >= 1e100) {
        numI = 1e100;
    }

    game.value.autoSaveInterval = numI;
};
