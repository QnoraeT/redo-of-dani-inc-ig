import { game, initPlayer, player, tmp, setPlayerFromSave, setGameFromSave } from './main'

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
        desc: "This mode adds many, many scaling increases into the game. Is IM:R calling? This also includes scaling increases beyond the legendary \"Atomic\" scaling. There will be a few added mechanics to help you deal with these softcaps, but overall the game will be harder.",
        borderColor: "#6040ff",
        borderSelectedColor: "#a080ff",
        bgColor: "#1f1a46",
        textColor: "#c8c0ff"
    },
]

function setTempModes(id: number) {
    tmp.saveModes[id] = !tmp.saveModes[id];
}

function resetModes() {
    for (let i = 0; i < tmp.saveModes.length; i++) {
        tmp.saveModes[i] = false;
    }
}

function displayModes(mode: Array<number>) {
    let txt = "";
    if (mode.length === 0) { return "Normal"; }
    if (mode.length === 1) { return SAVE_MODES[mode[0]].name; }
    for (let i = 0; i < mode.length - 1; i++) {
        txt += `${SAVE_MODES[mode[i]].name}, `;
    }
    txt += SAVE_MODES[mode[mode.length - 1]].name;
    return txt;
}

function displayModesNonOptArray(modes: Array<boolean>) {
    const mode = [];
    let txt = "";
    for (let i = 0; i < modes.length; i++) {
        if (modes[i]) {
            mode.push(i);
        }
    }
    if (mode.length === 0) { return "Normal"; }
    if (mode.length === 1) { return SAVE_MODES[mode[0]].name; }
    for (let i = 0; i < mode.length - 1; i++) {
        txt += `${SAVE_MODES[mode[i]].name}, `;
    }
    txt += SAVE_MODES[mode[mode.length - 1]].name;
    return txt;
}

export const saveTheFrickingGame = () => {
    try {
        localStorage.setItem(saveID, btoa(JSON.stringify(game)));
        return "Game was saved!";
    } catch (e) {
        console.warn("Something went wrong while trying to save the game!!");
        throw e;
    }
}

function resetTheWholeGame() {
    if (!confirm("Are you sure you want to delete EVERY save?")) {
        return;
    }
    if (!confirm("You cannot recover ANY of your save files unless if you have an exported backup! Are you still sure? [Final Warning]")) {
        return;
    }
    localStorage.setItem(saveID, 'null');
    tmp.gameIsRunning = false;
}

function resetThisSave(prompt: boolean) {
    if (prompt) {
        if (!confirm("Are you sure you want to delete this save?")) {
            return;
        }
        if (!confirm("You cannot recover this save unless if you have an exported backup! Are you still sure? [Final Warning]")) {
            return;
        }
    }
    initPlayer(true);
    saveTheFrickingGame();
    tmp.gameIsRunning = false;
}

function createNewSave(modes: Array<boolean>) {
    const mode = [];
    for (let i = 0; i < modes.length; i++) {
        if (modes[i]) {
            mode.push(i);
        }
    }
    game.list.push({
        name: `Save #${game.list.length + 1}`,
        modes: mode,
        data: player
    })
    switchToSave(game.list.length - 1);
    initPlayer(true);
    saveTheFrickingGame();
}

function switchToSave(id: number) {
    try {
        game.currentSave = id;
        localStorage.setItem(saveID, btoa(JSON.stringify(game)));
        tmp.gameIsRunning = false;
    } catch (e) {
        console.warn("Something went wrong while trying to switch save files!!");
        throw e;
    }
}

function renameSave(id: number) {
    const i = prompt('What name would you like to give this save? (Input blank to keep the name.)'); 
    if (!(i === '' || i === null)) { 
        game.list[id].name = i;
    }
}

function duplicateSave(id: number) {
    if (!confirm("Are you sure you want to duplicate this save?")) {
        return;
    }
    if (id < game.currentSave) {
        game.currentSave++
    }
    game.list.splice(id+1, 0, game.list[id]);
    saveTheFrickingGame();
    tmp.gameIsRunning = false;
}

function deleteSave(id: number) {
    if (!confirm("Are you sure you want to delete this save?")) {
        return;
    }
    if (!confirm("You cannot recover this save unless if you have an exported backup! Are you still sure? [Final Warning]")) {
        return;
    }
    if (game.list.length === 1) {
        initPlayer(true);
        return;
    }
    game.list.splice(id, 1);
    if (game.currentSave === id) {
        switchToSave(id - 1);
    }
    if (id < game.currentSave) {
        game.currentSave--;
    }
}

function importSave(id: number) {
    if (!confirm("Are you sure you want to do this? This will overwrite this save file!")) {
        return;
    }
    const save = prompt('Paste your save file here.');

    if (save === '' || save === null) {
        return;
    }

    try {
        JSON.parse(atob(save));
    } catch(e) {
        alert(`Importing save file failed! ${e}`);
        return;
    }

    let isSaveList = true
    try {
        JSON.parse(atob(save)).list
        JSON.parse(atob(save)).currentGame
    } catch {
        isSaveList = false;
    }
    
    if (isSaveList) {
        alert("Importing save file failed because this is an export of a save list, and not a save file.");
        return;
    }

    setPlayerFromSave(save, id)
    saveTheFrickingGame();
    tmp.gameIsRunning = false;
}

function exportSave(id: number) {
    const str = btoa(JSON.stringify(game.list[id]));
	const el = document.createElement("textarea");
	el.value = str;
	document.body.appendChild(el);
	el.select();
    el.setSelectionRange(0, 99999);
	document.execCommand("copy");
	document.body.removeChild(el);
}

function importSaveList() {
    if (!confirm("Are you sure you want to do this? This will overwrite EVERY save file in your save list!")) {
        return;
    }

    const save = prompt('Paste your save list here.');

    if (save === '' || save === null) {
        return;
    }

    try {
        JSON.parse(atob(save));
    } catch(e) {
        alert(`Importing save list failed! ${e}`);
        return;
    }

    let isSaveFile = true
    try {
        JSON.parse(atob(save)).gameProgress
        JSON.parse(atob(save)).offlineTime
    } catch {
        isSaveFile = false;
    }

    if (isSaveFile) {
        alert("Importing save list failed because this is an export of a save file, and not a save list.");
        return
    }

    setGameFromSave(save)
    saveTheFrickingGame();
    tmp.gameIsRunning = false;
}

function exportSaveList() {
	const str = btoa(JSON.stringify(game));
	const el = document.createElement("textarea");
	el.value = str;
	document.body.appendChild(el);
	el.select();
    el.setSelectionRange(0, 99999);
	document.execCommand("copy");
	document.body.removeChild(el);
}

function setAutosaveInterval() {
    const i = window.prompt('Set your new auto-saving interval in seconds. Set it to Infinity if you want to disable auto-saving.'); 

    if (i === '') {
        alert('Your set autosave interval is empty...');
        return;
    }

    let numI = Number(i)

    if (isNaN(numI)) { 
        alert('Your set autosave interval is not a number...');
        return;
    } 

    if (numI < 1) { 
        alert('Your set autosave interval is way too fast or negative...'); 
        return;
    }

    // saving sets Infinity to null for some reason, so i have to cap it
    if (numI >= 1e100) {
        numI = 1e100;
    }

    player.settings.autoSaveInterval = numI * 1000; 
}

