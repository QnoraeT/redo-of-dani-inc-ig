import Decimal, { type DecimalSource } from "break_eternity.js";
import { format } from "@/format";
import { player, tmp, updateAllBest, updateAllTotal } from "@/main";
import { D } from "@/calc";
import { setFactor } from "../../Game_Stats/Game_Stats";
import { completedChallenge, exitChallenge, getColChalRewEffects, timesCompleted } from "./Game_ColChallenges/Game_ColChalHandler";
import { challengeIDListArr, COL_CHALLENGES } from "./Game_ColChallenges/Game_ColChalData";
import { COL_RESEARCH, getColResEffect } from "./Game_ColResearches/Game_ColResearches";

export const updateAllCol = (delta: DecimalSource) => {
    updateCol(1, delta);
    updateCol(0, delta);
};

export const updateCol = (type: number, delta: DecimalSource) => {
    let i, j, k, l, chalID, generate;
    switch (type) {
        case 1:
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
                if (player.value.gameProgress.col.research.enabled[i] === undefined) {
                    player.value.gameProgress.col.research.enabled[i] = false;
                }
                if (player.value.gameProgress.col.research.xpTotal[i] === undefined) {
                    player.value.gameProgress.col.research.xpTotal[i] = 0;
                }

                if (player.value.gameProgress.col.research.enabled[i]) {
                    tmp.value.col.researchesAllocated++;
                    generate = tmp.value.col.researchSpeed.mul(delta);
                    player.value.gameProgress.col.research.xpTotal[i] = Decimal.add(
                        player.value.gameProgress.col.research.xpTotal[i],
                        generate
                    );
                }
            }
            break;
        case 0:
            if (Decimal.lte(player.value.gameProgress.col.time, 0) && player.value.gameProgress.col.inAChallenge) {
                for (let i = player.value.gameProgress.col.challengeOrder.chalID.length - 1; i >= 0; i--) {
                    // this is to avoid infinite loop, because exitChallenge calls reset, which calls updateCol, which calls exitChallenge again, and etc etc
                    player.value.gameProgress.col.time = new Decimal(1);
                    exitChallenge(player.value.gameProgress.col.challengeOrder.chalID[i]);
                }
            }

            if (player.value.gameProgress.unlocks.col) {
                i = Decimal.max(player.value.gameProgress.kua.best[4]!, 100).div(100);
                setFactor(0, [5, 0], "Base", `${format(Decimal.max(player.value.gameProgress.kua.best[4]!, 100), 2)} / ${format(100)}`, `${format(i, 2)}`, true);
                tmp.value.col.powGen = i;
                i = Decimal.cbrt(player.value.gameProgress.col.power).mul(0.6).pow10().add(tmp.value.col.powGen).log10().div(0.6).pow(3).sub(player.value.gameProgress.col.power);
                setFactor(1, [5, 0], "Decay", `/${format(tmp.value.col.powGen.div(i), 2)}`, `${format(i, 2)}`, true);

                generate = tmp.value.col.powGen.mul(delta);
                i = player.value.gameProgress.col.power;
                player.value.gameProgress.col.power = Decimal.cbrt(player.value.gameProgress.col.power).mul(0.6).pow10().add(generate).log10().div(0.6).pow(3);
                tmp.value.col.truePowGen = Decimal.sub(player.value.gameProgress.col.power, i).eq(0) ? D(0) : Decimal.sub(player.value.gameProgress.col.power, i).div(delta);

                updateAllTotal(player.value.gameProgress.col.totals, generate);
                player.value.gameProgress.col.totalEver = Decimal.add(player.value.gameProgress.col.totalEver, tmp.value.col.truePowGen);
                updateAllBest(player.value.gameProgress.col.best, player.value.gameProgress.col.power);
                player.value.gameProgress.col.bestEver = Decimal.max(player.value.gameProgress.col.bestEver, player.value.gameProgress.col.power);

                i = Decimal.max(player.value.gameProgress.col.power, 1).cbrt().mul(5).add(40);
                player.value.gameProgress.col.maxTime = i;

                tmp.value.col.effects = {
                    upg1a2sc: D(1),
                    res: D(1)
                }

                tmp.value.col.effects.upg1a2sc = Decimal.gte(timesCompleted("su"), 1)
                    ? Decimal.max(player.value.gameProgress.col.power, 1).log10().mul(getColChalRewEffects("su")[0]).add(1)
                    : D(1)

                tmp.value.col.effects.res = Decimal.gte(timesCompleted("df"), 1)
                    ? Decimal.max(player.value.gameProgress.col.power, 0).div(1000).add(1).pow(0.75).max(Decimal.max(player.value.gameProgress.col.power, 10).log10())
                    : D(1)
            }

            k = 0;
            l = 0;
            player.value.gameProgress.col.inAChallenge = false;
            tmp.value.col.totalColChalComp = D(0);
            for (let i = 0; i < challengeIDListArr.length; i++) {
                chalID = challengeIDListArr[i];

                j = false;
                player.value.gameProgress.inChallenge[chalID].trapped = j;

                j = false;
                if ( player.value.gameProgress.inChallenge[chalID].entered || player.value.gameProgress.inChallenge[chalID].trapped) {
                    j = true;
                }

                if (j) {
                    if (COL_CHALLENGES[chalID].canComplete.value) {
                        k++;
                    }
                    l++;
                    player.value.gameProgress.col.inAChallenge = true;
                }
                player.value.gameProgress.inChallenge[chalID].overall = j;

                j = D(0);
                if (player.value.gameProgress.inChallenge[chalID].entered || player.value.gameProgress.inChallenge[chalID].trapped) {
                    j = D(1);
                }
                if (COL_CHALLENGES[chalID].type === 1 || COL_CHALLENGES[chalID].type === 3) {
                    j = Decimal.add(player.value.gameProgress.inChallenge[chalID].enteredDiff, 1);
                }
                // anything after this replaces the selected value; as if a challenge sent you into another challenge with a set difficulty
                player.value.gameProgress.inChallenge[chalID].depths = j;

                if (COL_CHALLENGES[chalID].type === 2 && player.value.gameProgress.inChallenge[chalID].entered) {
                    player.value.gameProgress.col.completed[chalID] = Decimal.max(player.value.gameProgress.col.completed[chalID], COL_CHALLENGES[chalID].resourceReq!.value);
                }

                if (COL_CHALLENGES[chalID].type === 2) {
                    tmp.value.col.totalColChalComp = tmp.value.col.totalColChalComp.add(completedChallenge(chalID) ? 1 : 0);
                } else {
                    tmp.value.col.totalColChalComp = tmp.value.col.totalColChalComp.add(timesCompleted(chalID));
                }
            }

            player.value.gameProgress.col.completedAll = k === l && player.value.gameProgress.col.inAChallenge;

            if (player.value.gameProgress.col.inAChallenge) {
                if (!player.value.gameProgress.col.completedAll) {
                    player.value.gameProgress.col.time = Decimal.sub(player.value.gameProgress.col.time, delta);
                }
            } else {
                player.value.gameProgress.col.time = player.value.gameProgress.col.maxTime;
            }
            player.value.gameProgress.col.timeInCol = Decimal.add(player.value.gameProgress.col.timeInCol, delta);
            break;
        default:
            throw new Error(`Colosseum area of the game does not contain ${type}`);
    }
};