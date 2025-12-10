import Decimal, { type DecimalSource } from "break_eternity.js";
import { format } from "@/format";
import { player, tmp } from "@/main";
import { D } from "@/calc";
import { setFactor } from "../../Game_Stats/Game_Stats";
import { completedChallenge, exitChallenge, getColChalRewEffects, timesCompleted } from "./Game_ColChallenges/Game_ColChalHandler";
import { challengeIDListArr, COL_CHALLENGES } from "./Game_ColChallenges/Game_ColChalData";
import { COL_RESEARCH, getColResEffect } from "./Game_ColResearches/Game_ColResearches";

export const updateAllCol = (delta: DecimalSource) => {
    updateColResearch(delta);
    updateColChallenges(delta);
};

export const updateColResearch = (delta: DecimalSource) => {
    let generate;
    // no reason for this to be a Decimal, there should not be >1.797e308 researches
    tmp.value.col.researchesAtOnce = 1;
    tmp.value.col.researchesAllocated = 0;
    tmp.value.col.researchSpeed = D(1);
    setFactor(0, [5, 1], "Base", `${format(1, 2)}`, `${format(tmp.value.col.researchSpeed, 2)}`, true);
    tmp.value.col.researchSpeed = tmp.value.col.researchSpeed.mul(tmp.value.col.effects.res);
    setFactor(1, [5, 1], `Decaying Feeling Completion ×${format(timesCompleted('df'))}`, `×${format(tmp.value.col.effects.res, 2)}`, `${format(tmp.value.col.researchSpeed, 2)}`, Decimal.gte(timesCompleted("df"), 1), "col");
    tmp.value.col.researchSpeed = tmp.value.col.researchSpeed.mul(COL_CHALLENGES.im.type2ChalEff!.value[0]);
    setFactor(2, [5, 1], `I. Mechanics PB: ${format(timesCompleted('im'))}`, `×${format(COL_CHALLENGES.im.type2ChalEff!.value[0], 2)}`, `${format(tmp.value.col.researchSpeed, 2)}`, Decimal.gt(COL_CHALLENGES.im.type2ChalEff!.value[0], 1), "col");
    tmp.value.col.researchSpeed = tmp.value.col.researchSpeed.mul(getColResEffect(3));
    setFactor(3, [5, 1], `Coliescence`, `×${format(getColResEffect(3), 2)}`, `${format(tmp.value.col.researchSpeed, 2)}`, Decimal.gte(timesCompleted("im"), 1e20), "col");

    for (let i = 0; i < COL_RESEARCH.length; i++) {
        if (player.value.prog.col.research.enabled[i] === undefined) {
            player.value.prog.col.research.enabled[i] = false;
        }
        if (player.value.prog.col.research.xpTotal[i] === undefined) {
            player.value.prog.col.research.xpTotal[i] = 0;
        }

        if (player.value.prog.col.research.enabled[i]) {
            tmp.value.col.researchesAllocated++;
            generate = tmp.value.col.researchSpeed.mul(delta);
            player.value.prog.col.research.xpTotal[i] = Decimal.add(
                player.value.prog.col.research.xpTotal[i],
                generate
            );
        }
    }
}

export const updateColChallenges = (delta: DecimalSource) => {
    let i, j, k, l, chalID, generate;
    if (Decimal.lte(player.value.prog.col.time, 0) && player.value.prog.col.inAChallenge) {
        for (let i = player.value.prog.col.challengeOrder.chalID.length - 1; i >= 0; i--) {
            // this is to avoid infinite loop, because exitChallenge calls reset, which calls updateCol, which calls exitChallenge again, and etc etc
            player.value.prog.col.time = new Decimal(1);
            exitChallenge(player.value.prog.col.challengeOrder.chalID[i]);
        }
    }

    if (player.value.prog.unlocks.col) {
        i = Decimal.max(player.value.prog.kua.amount, 100).div(100);
        setFactor(0, [5, 0], "Base", `${format(Decimal.max(player.value.prog.kua.amount, 100), 2)} / ${format(100)}`, `${format(i, 2)}`, true);
        tmp.value.col.powGen = i;
        i = Decimal.cbrt(player.value.prog.col.power).mul(0.6).pow10().add(tmp.value.col.powGen).log10().div(0.6).pow(3).sub(player.value.prog.col.power);
        setFactor(1, [5, 0], "Decay", `/${format(tmp.value.col.powGen.div(i), 2)}`, `${format(i, 2)}`, true);

        generate = tmp.value.col.powGen.mul(delta);
        i = player.value.prog.col.power;
        player.value.prog.col.power = Decimal.cbrt(player.value.prog.col.power).mul(0.6).pow10().add(generate).log10().div(0.6).pow(3);
        tmp.value.col.truePowGen = Decimal.sub(player.value.prog.col.power, i).eq(0) ? D(0) : Decimal.sub(player.value.prog.col.power, i).div(delta);

        i = Decimal.max(player.value.prog.col.power, 1).cbrt().mul(5).add(40);
        player.value.prog.col.maxTime = i;

        tmp.value.col.effects = {
            upg1a2sc: D(1),
            res: D(1)
        }

        tmp.value.col.effects.upg1a2sc = Decimal.gte(timesCompleted("su"), 1)
            ? Decimal.max(player.value.prog.col.power, 1).log10().mul(getColChalRewEffects("su")[0]).add(1)
            : D(1)

        tmp.value.col.effects.res = Decimal.gte(timesCompleted("df"), 1)
            ? Decimal.max(player.value.prog.col.power, 0).div(1000).add(1).pow(0.75).max(Decimal.max(player.value.prog.col.power, 10).log10())
            : D(1)
    }

    k = 0;
    l = 0;
    player.value.prog.col.inAChallenge = false;
    tmp.value.col.totalColChalComp = D(0);
    for (let i = 0; i < challengeIDListArr.length; i++) {
        chalID = challengeIDListArr[i];

        j = false;
        player.value.prog.inChallenge[chalID].trapped = j;

        j = false;
        if ( player.value.prog.inChallenge[chalID].entered || player.value.prog.inChallenge[chalID].trapped) {
            j = true;
        }

        if (j) {
            if (COL_CHALLENGES[chalID].canComplete.value) {
                k++;
            }
            l++;
            player.value.prog.col.inAChallenge = true;
        }
        player.value.prog.inChallenge[chalID].overall = j;

        j = D(0);
        if (player.value.prog.inChallenge[chalID].entered || player.value.prog.inChallenge[chalID].trapped) {
            j = D(1);
        }
        if (COL_CHALLENGES[chalID].type === 1 || COL_CHALLENGES[chalID].type === 3) {
            j = Decimal.add(player.value.prog.inChallenge[chalID].enteredDiff, 1);
        }
        // anything after this replaces the selected value; as if a challenge sent you into another challenge with a set difficulty
        player.value.prog.inChallenge[chalID].depths = j;

        if (COL_CHALLENGES[chalID].type === 2 && player.value.prog.inChallenge[chalID].entered) {
            player.value.prog.col.completed[chalID] = Decimal.max(player.value.prog.col.completed[chalID], COL_CHALLENGES[chalID].resourceReq!.value);
        }

        if (COL_CHALLENGES[chalID].type === 2) {
            tmp.value.col.totalColChalComp = tmp.value.col.totalColChalComp.add(completedChallenge(chalID) ? 1 : 0);
        } else {
            tmp.value.col.totalColChalComp = tmp.value.col.totalColChalComp.add(timesCompleted(chalID));
        }
    }

    player.value.prog.col.completedAll = k === l && player.value.prog.col.inAChallenge;

    if (player.value.prog.col.inAChallenge) {
        if (!player.value.prog.col.completedAll) {
            player.value.prog.col.time = Decimal.sub(player.value.prog.col.time, delta);
        }
    } else {
        player.value.prog.col.time = player.value.prog.col.maxTime;
    }
    player.value.prog.col.timeInCol = Decimal.add(player.value.prog.col.timeInCol, delta);
};